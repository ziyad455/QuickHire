import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Sparkles,
  MapPin,
  Building,
  Briefcase,
  Globe,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { getUserJobById } from '../services/jobService';
import { formatSearchDate, type JobResult } from '../lib/jobs';

type JobRouteState = {
  job?: JobResult;
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as JobRouteState | null) ?? null;
  const { user, logout } = useAuth();

  const [job, setJob] = useState<JobResult | null>(routeState?.job ?? null);
  const [loading, setLoading] = useState(!routeState?.job);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;

    if (!id || !user?.uid) {
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }
        setLoading(false);
      });
      return () => {
        isActive = false;
      };
    }

    if (routeState?.job?.id === id) {
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }
        setJob(routeState.job ?? null);
        setLoading(false);
      });
      return () => {
        isActive = false;
      };
    }

    const loadJob = async () => {
      try {
        setLoading(true);
        const storedJob = await getUserJobById(user.uid, id);

        if (!isActive) {
          return;
        }

        if (!storedJob) {
          setError('Job not found in your saved matches.');
          setJob(null);
          setLoading(false);
          return;
        }

        setJob(storedJob);
        setLoading(false);
      } catch (loadError) {
        console.error(loadError);
        if (!isActive) {
          return;
        }
        setError('Unable to load the selected job.');
        setLoading(false);
      }
    };

    void loadJob();

    return () => {
      isActive = false;
    };
  }, [id, routeState?.job, user?.uid]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (!loading && job && containerRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from('.anim-fade-up', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-body selection:bg-primary/20">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-extrabold text-on_surface mb-4">
            Loading Job Details
          </h2>
          <p className="text-on_surface_variant">Pulling the saved document...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-body selection:bg-primary/20">
        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-heading font-extrabold text-on_surface mb-4">
            Job Not Found
          </h2>
          <p className="text-on_surface_variant mb-6">
            {error || 'The selected job no longer exists in your saved results.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary_container font-bold border border-primary/30 px-6 py-2.5 rounded-xl transition-colors hover:bg-primary/5"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const matchedSkills = job.skills.filter((skill) => skill.status === 'matched');
  const missingSkills = job.skills.filter((skill) => skill.status === 'missing');

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-on_surface flex flex-col font-body selection:bg-primary/20">
      <nav className="border-b border-outline_variant/15 bg-surface/60 backdrop-blur-[20px] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-heading font-bold text-on_surface tracking-tight">Luminal Talent</span>
          </Link>
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
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="anim-fade-up inline-flex items-center text-sm font-bold text-outline hover:text-on_surface transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Matches
        </button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="anim-fade-up bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 md:p-8 shadow-ambient-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-on_surface mb-4 tracking-tight">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-on_surface_variant text-sm md:text-base font-semibold">
                    <div className="flex items-center bg-surface border border-outline_variant/30 py-1.5 px-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <Building className="w-4 h-4 mr-2 opacity-70" />
                      <span className="text-on_surface">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 opacity-70" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 opacity-70" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 opacity-70" />
                      {job.remoteOption}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-outline font-semibold">
                    <span className="px-3 py-1.5 rounded-xl border border-outline_variant/15 bg-surface_container_low">
                      {job.source}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl border border-outline_variant/15 bg-surface_container_low">
                      Posted {job.datePosted}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl border border-outline_variant/15 bg-surface_container_low">
                      Search: {job.searchQuery}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl border border-outline_variant/15 bg-surface_container_low">
                      Saved {formatSearchDate(job.searchDate)}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-[24px] bg-primary/5 border border-primary/20 shadow-ambient relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full blur-2xl pointer-events-none" />
                  <span className="font-heading font-black text-5xl text-primary leading-none relative z-10">
                    {job.matchScore}%
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold mt-2 text-primary/80 relative z-10">
                    Match Score
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-outline_variant/15">
                <h2 className="text-xl font-heading font-extrabold text-on_surface mb-4">
                  About the Role
                </h2>
                <div className="text-on_surface_variant pr-4">
                  <p className="leading-relaxed text-lg whitespace-pre-line bg-surface_container_low p-6 rounded-[24px] border border-outline_variant/15 shadow-inner">
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <a
                  href={job.applyUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary_container text-on_primary font-bold rounded-[16px] shadow-ambient hover:shadow-ambient-sm transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center group overflow-hidden relative border-t border-primary_fixed_dim"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  <span className="relative z-10">Apply Now</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform relative z-10" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="anim-fade-up bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 shadow-ambient-sm">
              <h3 className="text-lg font-heading font-bold text-on_surface mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-primary" />
                Skill Gap Analysis
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3 flex items-center justify-between">
                    Matched Skills
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-lg text-[10px]">
                      {matchedSkills.length}
                    </span>
                  </h4>
                  {matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill, index) => (
                        <span
                          key={`${skill.name}-${index}`}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm border border-primary/20 flex items-center shadow-sm font-semibold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-outline bg-surface_container_low p-3 rounded-xl border border-outline_variant/15 font-medium">
                      No key skills matched directly.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-outline_variant/15">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3 flex items-center justify-between">
                    Missing Skills
                    <span className="bg-error/20 text-error px-2 py-0.5 rounded-lg text-[10px]">
                      {missingSkills.length}
                    </span>
                  </h4>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, index) => (
                        <span
                          key={`${skill.name}-${index}`}
                          className="px-3 py-1.5 bg-error/10 text-error rounded-xl text-sm border border-error/20 flex items-center shadow-sm font-semibold"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      You have all the required skills.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {missingSkills.length > 0 && (
              <div className="anim-fade-up bg-surface_container_lowest border border-secondary/30 rounded-[24px] p-6 shadow-ambient-sm relative overflow-hidden group hover:border-secondary/50 transition-colors">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-secondary/20" />

                <h3 className="text-lg font-heading font-extrabold text-on_surface mb-5 flex items-center relative z-10">
                  <Zap className="w-5 h-5 mr-3 text-secondary fill-secondary/20" />
                  AI Resume Tips
                </h3>

                <div className="space-y-4 relative z-10">
                  {missingSkills.map((skill, index) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="bg-surface_container_low border border-outline_variant/15 rounded-[16px] p-4 hover:bg-surface_container_highest transition-colors"
                    >
                      <div className="font-bold text-on_surface text-sm flex items-center justify-between mb-2">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                          {skill.name}
                        </span>
                      </div>
                      <p className="text-sm text-on_surface_variant leading-relaxed font-medium">
                        {skill.improvementTip ||
                          'Consider adding a project or course demonstrating this skill.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
