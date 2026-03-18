import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Globe,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import CVUploadWidget from '../components/CVUploadWidget';
import { JobCard } from '../components/JobCard';
import {
  formatSearchDate,
  normalizeJobResult,
  type AnalyzeCvSuccessResponse,
  type CandidateProfile,
  type JobResult,
} from '../lib/jobs';
import { useUserJobs } from '../hooks/useUserJobs';
import { saveUserJobs } from '../services/jobService';

type DashboardState = 'PRE_UPLOAD' | 'ANALYZING' | 'RESULTS';

const filterJobs = (
  jobs: JobResult[],
  locationFilter: string,
  typeFilter: string,
  remoteFilter: string
) =>
  jobs.filter((job) => {
    const matchesLocation =
      locationFilter.trim() === '' ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'All Types' || job.type === typeFilter;
    const matchesRemote =
      remoteFilter === 'All Settings' || job.remoteOption === remoteFilter;

    return matchesLocation && matchesType && matchesRemote;
  });

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { jobs: savedJobs, loading: savedJobsLoading } = useUserJobs(user?.uid);

  const [currentState, setCurrentState] = useState<DashboardState>('PRE_UPLOAD');
  const [results, setResults] = useState<JobResult[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedJobsInitialized, setSavedJobsInitialized] = useState(false);

  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [remoteFilter, setRemoteFilter] = useState('All Settings');

  useEffect(() => {
    if (savedJobsLoading || savedJobsInitialized) {
      return;
    }

    if (savedJobs.length > 0) {
      setResults(savedJobs);
      setCurrentState('RESULTS');
    }

    setSavedJobsInitialized(true);
  }, [savedJobs, savedJobsInitialized, savedJobsLoading]);

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

    setCurrentState('ANALYZING');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

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
      setCurrentState('RESULTS');

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
      setCurrentState(results.length > 0 ? 'RESULTS' : 'PRE_UPLOAD');
    }
  };

  const handleReset = () => {
    setCandidateInfo(null);
    setError(null);
    setCurrentState('PRE_UPLOAD');
  };

  const handleShowSavedJobs = () => {
    setResults(savedJobs);
    setCandidateInfo(null);
    setError(null);
    setCurrentState('RESULTS');
  };

  const visibleResults = filterJobs(results, locationFilter, typeFilter, remoteFilter);
  const latestSearch = results[0];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <nav className="border-b border-background-elevated bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span
              className="text-xl font-heading font-bold text-text-primary cursor-pointer"
              onClick={handleReset}
            >
              QuickHire
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm border border-background-elevated px-3 py-1.5 rounded-full text-text-secondary hidden sm:inline-block">
              {user?.email}
            </span>
            <button
              onClick={() => logout()}
              className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg bg-background-surface/50 border border-background-elevated"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {currentState === 'PRE_UPLOAD' && (
            <motion.div
              key="pre-upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-12"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                  Welcome back,{' '}
                  <span className="text-primary-400">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                </h1>
                <p className="text-text-secondary text-lg">
                  Set your preferences and upload your latest resume to discover matches.
                </p>
                {savedJobsLoading && (
                  <p className="text-sm text-text-muted">
                    Loading your saved job matches from Firestore...
                  </p>
                )}
              </div>

              <div className="bg-background-surface border border-background-elevated p-6 rounded-3xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <h3 className="text-lg font-heading font-bold mb-6 flex items-center">
                  <SlidersHorizontal className="w-5 h-5 mr-2 text-text-secondary" />
                  Job Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5" /> Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco or Remote"
                      value={locationFilter}
                      onChange={(event) => setLocationFilter(event.target.value)}
                      className="w-full bg-background border border-background-elevated rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary flex items-center">
                      <Briefcase className="w-4 h-4 mr-1.5" /> Job Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value)}
                      className="w-full bg-background border border-background-elevated rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option>All Types</option>
                      <option>Full-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Part-time</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary flex items-center">
                      <Globe className="w-4 h-4 mr-1.5" /> Environment
                    </label>
                    <select
                      value={remoteFilter}
                      onChange={(event) => setRemoteFilter(event.target.value)}
                      className="w-full bg-background border border-background-elevated rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option>All Settings</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-primary-500/5 border border-primary-500/10 p-8 rounded-3xl max-w-4xl mx-auto shadow-ai-glow">
                <CVUploadWidget onUpload={handleUpload} />
                {savedJobs.length > 0 && (
                  <div className="mt-5 text-center">
                    <button
                      onClick={handleShowSavedJobs}
                      className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View {savedJobs.length} saved matches from Firestore
                    </button>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentState === 'ANALYZING' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="p-6 bg-background-surface border border-primary-500/20 rounded-full relative z-10 animate-[spin_3s_linear_infinite]">
                  <Sparkles className="w-12 h-12 text-primary-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Extracting Experience...
                </h3>
                <p className="text-text-secondary flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running semantic gap analysis and fetching jobs from multiple APIs
                </p>
              </div>
            </motion.div>
          )}

          {currentState === 'RESULTS' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-background-elevated pb-6">
                <div>
                  <h2 className="text-3xl font-heading font-bold text-text-primary">
                    Your Top Matches
                  </h2>
                  {candidateInfo ? (
                    <p className="text-primary-400 font-medium mt-2">
                      Parsed Profile: {candidateInfo.primary_role} •{' '}
                      {candidateInfo.years_of_experience} YOE • {candidateInfo.location}
                    </p>
                  ) : latestSearch ? (
                    <p className="text-primary-400 font-medium mt-2">
                      Saved Search: {latestSearch.searchQuery} •{' '}
                      {formatSearchDate(latestSearch.searchDate)}
                    </p>
                  ) : null}
                  <p className="text-text-secondary mt-1">
                    Aggregated from RapidAPI sources and synced to Firestore.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-background-surface border border-background-elevated rounded-xl text-sm font-medium hover:bg-background-elevated transition-colors shadow-sm"
                >
                  Upload New CV
                </button>
              </div>

              {error && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm">
                  {error}
                </div>
              )}

              {visibleResults.length === 0 ? (
                <div className="text-center py-20 bg-background-surface/50 border border-background-elevated border-dashed rounded-3xl">
                  <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No matches found</h3>
                  <p className="text-text-secondary max-w-sm mx-auto">
                    None of the available jobs align with your current filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-6 font-medium text-primary-400 hover:text-primary-300"
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
