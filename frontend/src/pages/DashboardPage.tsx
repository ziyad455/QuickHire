import React, { useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import {
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Globe,
  Loader2,
  LogOut,
  Bookmark,
  Upload,
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import CVUploadWidget from '../components/CVUploadWidget';
import { JobCard } from '../components/JobCard';
import {
  DEFAULT_JOB_FILTERS,
  formatSearchDate,
  getActiveJobFilters,
  normalizeJobResult,
  type AnalyzeCvSuccessResponse,
  type CandidateProfile,
  type JobFilters,
  type JobResult,
  type SalaryInsight,
} from '../lib/jobs';
import { useUserJobs } from '../hooks/useUserJobs';
import { saveUserJobs } from '../services/jobService';

type DashboardState = 'PRE_UPLOAD' | 'ANALYZING' | 'RESULTS';
type DashboardSection = 'UPLOAD' | 'SAVED';

const filterJobs = (
  jobs: JobResult[],
  filters: JobFilters
) => {
  const activeFilters = getActiveJobFilters(filters);

  return jobs.filter((job) => {
    const matchesLocation =
      activeFilters.location === '' ||
      job.location.toLowerCase().includes(activeFilters.location.toLowerCase());
    const matchesType = activeFilters.type === '' || job.type === activeFilters.type;
    const matchesRemote =
      activeFilters.remoteOption === '' || job.remoteOption === activeFilters.remoteOption;

    return matchesLocation && matchesType && matchesRemote;
  });
};

const formatSalaryValue = (value?: number, currency = 'USD') => {
  if (typeof value !== 'number') {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatSalaryTimestamp = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { jobs: savedJobs, loading: savedJobsLoading } = useUserJobs(user?.uid);

  const [activeSection, setActiveSection] = useState<DashboardSection>('UPLOAD');
  const [currentState, setCurrentState] = useState<DashboardState>('PRE_UPLOAD');
  const [results, setResults] = useState<JobResult[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<CandidateProfile | null>(null);
  const [salaryInsight, setSalaryInsight] = useState<SalaryInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locationFilter, setLocationFilter] = useState(DEFAULT_JOB_FILTERS.location);
  const [typeFilter, setTypeFilter] = useState(DEFAULT_JOB_FILTERS.type);
  const [remoteFilter, setRemoteFilter] = useState(DEFAULT_JOB_FILTERS.remoteOption);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle GSAP intro animations based on current state
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.anim-in', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }, containerRef);
    return () => ctx.revert();
  }, [activeSection, currentState]);

  const transitionDashboard = (
    nextSection: DashboardSection,
    nextState?: DashboardState
  ) => {
    const targetState = nextState ?? currentState;
    if (nextSection === activeSection && targetState === currentState) {
      return;
    }

    if (!containerRef.current) {
      setActiveSection(nextSection);
      if (nextState) {
        setCurrentState(nextState);
      }
      return;
    }

    gsap.to(containerRef.current.children, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        setActiveSection(nextSection);
        if (nextState) {
          setCurrentState(nextState);
        }
      },
    });
  };

  const handleUpload = async (
    _event: React.MouseEvent | React.DragEvent,
    file?: File
  ) => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!user) {
      setError('You must be logged in to analyze and save jobs.');
      return;
    }

    transitionDashboard('UPLOAD', 'ANALYZING');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const activeFilters = getActiveJobFilters({
      location: locationFilter,
      type: typeFilter,
      remoteOption: remoteFilter,
    });

    if (activeFilters.location) {
      formData.append('job_location', activeFilters.location);
    }

    if (activeFilters.type) {
      formData.append('job_type', activeFilters.type);
    }

    if (activeFilters.remoteOption) {
      formData.append('job_remote_option', activeFilters.remoteOption);
    }

    try {
      const headers: HeadersInit = {};
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5555';
      const response = await fetch(`${apiUrl}/analyze-cv?page=1`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = (await response.json()) as
        | AnalyzeCvSuccessResponse
        | { error?: string; status?: string };

      if (!response.ok || data.status !== 'success') {
        const message =
          'error' in data && data.error ? data.error : 'Failed to analyze CV';
        throw new Error(message);
      }

      const searchDate = new Date().toISOString();
      const successData = data as AnalyzeCvSuccessResponse;
      const normalizedJobs = successData.matches.map((job) =>
        normalizeJobResult(job, successData.search_query, successData.search_queries, searchDate)
      );

      setResults(normalizedJobs);
      setCandidateInfo(successData.candidate);
      setSalaryInsight(successData.salary_insight ?? null);
      transitionDashboard('UPLOAD', 'RESULTS');

      try {
        await saveUserJobs(user.uid, normalizedJobs);
      } catch (saveError) {
        console.error(saveError);
        setError('Jobs were fetched, but saving them to Firestore failed.');
      }
    } catch (uploadError) {
      console.error(uploadError);
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : 'An unexpected error occurred during analysis.';
      setError(message);
      transitionDashboard('UPLOAD', results.length > 0 ? 'RESULTS' : 'PRE_UPLOAD');
    }
  };

  const handleReset = () => {
    setCandidateInfo(null);
    setSalaryInsight(null);
    setError(null);
    transitionDashboard('UPLOAD', 'PRE_UPLOAD');
  };

  const handleShowSavedJobs = () => {
    setError(null);
    transitionDashboard('SAVED');
  };

  const visibleResults = filterJobs(results, {
    location: locationFilter,
    type: typeFilter,
    remoteOption: remoteFilter,
  });
  const latestSearch = results[0];
  const latestSavedSearch = savedJobs[0];
  const isAnalyzing = currentState === 'ANALYZING';
  const getSectionButtonClasses = (isActive: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-300',
      isActive
        ? 'bg-on_surface text-inverse_on_surface border-on_surface shadow-ambient-sm'
        : 'bg-surface_container_lowest text-on_surface border-outline_variant/40 hover:-translate-y-0.5 hover:border-outline/60 hover:bg-surface_container_low hover:shadow-ambient-sm',
      isAnalyzing ? 'cursor-not-allowed opacity-70' : '',
    ].join(' ');

  return (
    <div className="min-h-screen bg-background text-on_surface flex flex-col font-body selection:bg-primary/20">
      <nav className="border-b border-outline_variant/15 bg-surface/60 backdrop-blur-[20px] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span
                className="text-xl font-heading font-bold text-on_surface cursor-pointer tracking-tight"
                onClick={handleReset}
              >
                Luminal Talent
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm border border-outline_variant/30 px-3 py-1.5 rounded-full text-on_surface_variant hidden sm:inline-block font-medium">
                {user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="p-2 text-outline hover:text-error transition-colors rounded-[12px] bg-surface_container_lowest border border-outline_variant/15 hover:border-error/30"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isAnalyzing}
              aria-pressed={activeSection === 'UPLOAD'}
              className={getSectionButtonClasses(activeSection === 'UPLOAD')}
            >
              <Upload className="w-4 h-4" />
              <span>Upload New CV</span>
            </button>
            <button
              onClick={handleShowSavedJobs}
              disabled={isAnalyzing}
              aria-pressed={activeSection === 'SAVED'}
              className={getSectionButtonClasses(activeSection === 'SAVED')}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Jobs</span>
              <span
                className={[
                  'inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-black',
                  activeSection === 'SAVED'
                    ? 'bg-inverse_on_surface/15 text-inverse_on_surface'
                    : 'bg-primary/10 text-primary',
                ].join(' ')}
              >
                {savedJobsLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  savedJobs.length
                )}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col items-center">
        <div ref={containerRef} className="w-full">
          {activeSection === 'SAVED' && (
            <div className="w-full space-y-8 anim-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline_variant/15 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-outline font-extrabold">
                    Workspace Library
                  </p>
                  <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-on_surface tracking-tight mt-2">
                    Saved Jobs
                  </h2>
                  {savedJobsLoading ? (
                    <p className="text-on_surface_variant mt-2 text-sm font-semibold">
                      Syncing your saved matches...
                    </p>
                  ) : savedJobs.length > 0 ? (
                    <p className="text-primary font-bold mt-2">
                      {savedJobs.length} saved matches
                      {latestSavedSearch
                        ? ` • Last synced ${formatSearchDate(latestSavedSearch.searchDate)}`
                        : ''}
                    </p>
                  ) : (
                    <p className="text-on_surface_variant mt-2 text-sm font-semibold">
                      Save interesting matches here, then come back whenever you want to review them.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-surface_container_lowest border border-outline_variant/30 rounded-[12px] text-sm font-bold hover:bg-surface_container_low hover:border-outline_variant/50 transition-all shadow-ambient-sm text-on_surface hover:-translate-y-0.5"
                >
                  Upload New CV
                </button>
              </div>

              {savedJobsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-surface_container_lowest border border-outline_variant/20 rounded-[32px] shadow-ambient-sm">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-semibold text-on_surface_variant">
                    Loading your saved jobs...
                  </p>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="text-center py-24 bg-surface_container_lowest border border-outline_variant/30 border-dashed rounded-[32px] shadow-ambient-sm">
                  <Bookmark className="w-12 h-12 text-outline mx-auto mb-4 opacity-60" />
                  <h3 className="text-2xl font-heading font-extrabold mb-2 text-on_surface">
                    No saved jobs yet
                  </h3>
                  <p className="text-on_surface_variant max-w-sm mx-auto text-sm font-medium">
                    Upload a fresh CV to generate matches, then your saved opportunities will appear here.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-6 font-bold text-primary hover:text-primary_container px-6 py-2 rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    Upload a CV
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedJobs.map((job, index) => (
                    <JobCard key={job.id} job={job} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'UPLOAD' && currentState === 'PRE_UPLOAD' && (
            <div className="w-full space-y-12 anim-in">
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-[-0.04em] text-on_surface">
                  Welcome back,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                </h1>
                <p className="text-on_surface_variant text-lg font-medium">
                  Choose between a fresh CV upload or your saved jobs, then continue from the path you need.
                </p>
                {savedJobsLoading && (
                  <p className="text-sm text-outline font-semibold">
                    Syncing your saved job library...
                  </p>
                )}
              </div>

              <div className="bg-surface_container_lowest border border-outline_variant/15 p-8 rounded-[32px] max-w-4xl mx-auto shadow-ambient-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

                <h3 className="text-xl font-heading font-extrabold mb-6 flex items-center text-on_surface relative z-10">
                  <SlidersHorizontal className="w-5 h-5 mr-3 text-primary" />
                  Job Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-outline flex items-center uppercase tracking-widest pl-1">
                      <MapPin className="w-4 h-4 mr-1.5" /> Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco or Remote"
                      value={locationFilter}
                      onChange={(event) => setLocationFilter(event.target.value)}
                      className="w-full bg-surface_container_low border border-outline_variant/30 rounded-[16px] px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on_surface placeholder:text-outline font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-outline flex items-center uppercase tracking-widest pl-1">
                      <Briefcase className="w-4 h-4 mr-1.5" /> Job Type
                    </label>
                    <div className="relative">
                      <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        className="w-full bg-surface_container_low border border-outline_variant/30 rounded-[16px] px-4 py-3.5 text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on_surface font-semibold outline-none"
                      >
                        <option>All Types</option>
                        <option>Full-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                        <option>Part-time</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-outline flex items-center uppercase tracking-widest pl-1">
                      <Globe className="w-4 h-4 mr-1.5" /> Environment
                    </label>
                    <div className="relative">
                      <select
                        value={remoteFilter}
                        onChange={(event) => setRemoteFilter(event.target.value)}
                        className="w-full bg-surface_container_low border border-outline_variant/30 rounded-[16px] px-4 py-3.5 text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on_surface font-semibold outline-none"
                      >
                        <option>All Settings</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>On-site</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface_container_lowest border border-outline_variant/25 p-8 rounded-[32px] max-w-4xl mx-auto flex flex-col items-center shadow-ambient-sm relative overflow-hidden">
                <div className="relative z-10 w-full">
                  <CVUploadWidget onUpload={handleUpload} />
                </div>
                {savedJobs.length > 0 && !savedJobsLoading && (
                  <p className="mt-6 text-center text-sm font-semibold text-on_surface_variant relative z-10">
                    {savedJobs.length} saved matches are waiting in the navigation above.
                  </p>
                )}
                {error && (
                  <div className="mt-4 p-4 w-full bg-error/10 border border-error/20 rounded-xl text-error text-center text-sm font-bold relative z-10">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'UPLOAD' && currentState === 'ANALYZING' && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6 anim-in">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                <div className="p-6 bg-surface_container_lowest border border-primary/20 rounded-full relative z-10 animate-[spin_3s_linear_infinite]">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Extracting Experience...
                </h3>
                <p className="text-on_surface_variant flex items-center justify-center font-bold">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running semantic gap analysis
                </p>
              </div>
            </div>
          )}

          {activeSection === 'UPLOAD' && currentState === 'RESULTS' && (
            <div className="w-full space-y-8 anim-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline_variant/15 pb-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-on_surface tracking-tight">
                    Your Top Matches
                  </h2>
                  {candidateInfo ? (
                    <p className="text-primary font-bold mt-2">
                      Parsed Profile: {candidateInfo.primary_role} •{' '}
                      {candidateInfo.years_of_experience} YOE • {candidateInfo.location}
                    </p>
                  ) : latestSearch ? (
                    <p className="text-primary font-bold mt-2">
                      Latest Search: {latestSearch.searchQuery} •{' '}
                      {formatSearchDate(latestSearch.searchDate)}
                    </p>
                  ) : null}
                  <p className="text-on_surface_variant mt-1 text-sm font-semibold">
                    Aggregated from job sources and synced.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-surface_container_lowest border border-outline_variant/30 rounded-[12px] text-sm font-bold hover:bg-surface_container_low hover:border-outline_variant/50 transition-all shadow-ambient-sm text-on_surface hover:-translate-y-0.5"
                >
                  Upload New CV
                </button>
              </div>

              {salaryInsight && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300">
                    <p className="text-xs uppercase tracking-widest text-outline font-extrabold mb-2">
                      Market Median
                    </p>
                    <p className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">
                      {formatSalaryValue(
                        salaryInsight.median_salary,
                        salaryInsight.salary_currency || 'USD'
                      )}
                    </p>
                    <p className="text-sm text-on_surface_variant mt-2 font-bold">
                      {salaryInsight.job_title} in {salaryInsight.location}
                    </p>
                  </div>

                  <div className="bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300">
                    <p className="text-xs uppercase tracking-widest text-outline font-extrabold mb-2">
                      Estimated Range
                    </p>
                    <p className="text-xl font-heading font-extrabold text-on_surface">
                      {formatSalaryValue(
                        salaryInsight.min_salary,
                        salaryInsight.salary_currency || 'USD'
                      )}{' '}
                      -{' '}
                      {formatSalaryValue(
                        salaryInsight.max_salary,
                        salaryInsight.salary_currency || 'USD'
                      )}
                    </p>
                    <p className="text-sm text-on_surface_variant mt-2 font-semibold">
                      Base median{' '}
                      {formatSalaryValue(
                        salaryInsight.median_base_salary,
                        salaryInsight.salary_currency || 'USD'
                      )}
                    </p>
                  </div>

                  <div className="bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300">
                    <p className="text-xs uppercase tracking-widest text-outline font-extrabold mb-2">
                      Source
                    </p>
                    <p className="text-xl font-heading font-extrabold text-on_surface">
                      {salaryInsight.publisher_name || 'Salary API'}
                    </p>
                    <p className="text-sm text-on_surface_variant mt-2 font-semibold flex items-center">
                      Confidence {salaryInsight.confidence || 'Unknown'} • Updated{' '}
                      {formatSalaryTimestamp(salaryInsight.salaries_updated_at)}
                    </p>
                    {salaryInsight.publisher_link && (
                      <a
                        href={salaryInsight.publisher_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-3 text-sm font-bold text-primary hover:text-primary_container transition-colors"
                      >
                        View salary source
                      </a>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-[16px] text-error text-sm font-bold">
                  {error}
                </div>
              )}

              {visibleResults.length === 0 ? (
                <div className="text-center py-24 bg-surface_container_lowest border border-outline_variant/30 border-dashed rounded-[32px] shadow-ambient-sm">
                  <Briefcase className="w-12 h-12 text-outline mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-heading font-extrabold mb-2 text-on_surface">No matches found</h3>
                  <p className="text-on_surface_variant max-w-sm mx-auto text-sm font-medium">
                    None of the available jobs align with your current filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-6 font-bold text-primary hover:text-primary_container px-6 py-2 rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    Adjust Filters & Try Again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {visibleResults.map((job, index) => (
                    <JobCard key={job.id} job={job} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
