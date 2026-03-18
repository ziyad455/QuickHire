import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
          setError('Job not found in your saved Firestore results.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans tracking-wide">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-text-primary mb-4">
            Loading Job Details
          </h2>
          <p className="text-text-secondary">Pulling the saved document from Firestore.</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans tracking-wide">
        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-heading font-bold text-text-primary mb-4">
            Job Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            {error || 'The selected job no longer exists in your saved results.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-300 font-medium border border-primary-500/30 px-6 py-2 rounded-xl"
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
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-primary-500/30">
      <nav className="border-b border-background-elevated bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-xl font-heading font-bold text-text-primary">QuickHire</span>
          </Link>
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Matches
        </button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-surface border border-background-elevated rounded-3xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-heading font-black text-text-primary mb-4 tracking-tight">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm md:text-base font-medium">
                    <div className="flex items-center bg-background/50 border border-white/5 py-1 px-3 rounded-lg">
                      <Building className="w-4 h-4 mr-2 opacity-70" />
                      <span className="text-text-primary">{job.company}</span>
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
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
                    <span className="px-3 py-1 rounded-full border border-background-elevated bg-background">
                      {job.source}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-background-elevated bg-background">
                      Posted {job.datePosted}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-background-elevated bg-background">
                      Search: {job.searchQuery}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-background-elevated bg-background">
                      Saved {formatSearchDate(job.searchDate)}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center justify-center p-5 rounded-3xl bg-primary-500/5 border border-primary-500/20 shadow-glow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary-500/10 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full blur-xl" />
                  <span className="font-heading font-black text-5xl text-primary-400 leading-none relative z-10">
                    {job.matchScore}%
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold mt-2 text-primary-500/80 relative z-10">
                    Match Score
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-background-elevated">
                <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                  About the Role
                </h2>
                <div className="text-text-secondary pr-4">
                  <p className="leading-relaxed text-lg whitespace-pre-line bg-background/30 p-6 rounded-2xl border border-white/5 shadow-inner">
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <a
                  href={job.applyUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] inline-flex items-center justify-center group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  <span className="relative z-10">Apply Now</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform relative z-10" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background-surface border border-background-elevated rounded-3xl p-6"
            >
              <h3 className="text-lg font-heading font-bold text-text-primary mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary-400" />
                Skill Gap Analysis
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center justify-between">
                    Matched Skills
                    <span className="bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-md text-[10px]">
                      {matchedSkills.length}
                    </span>
                  </h4>
                  {matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill, index) => (
                        <span
                          key={`${skill.name}-${index}`}
                          className="px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-xl text-sm border border-primary-500/20 flex items-center shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted bg-background/50 p-3 rounded-xl border border-white/5">
                      No key skills matched directly.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-background-elevated">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center justify-between">
                    Missing Skills
                    <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md text-[10px]">
                      {missingSkills.length}
                    </span>
                  </h4>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, index) => (
                        <span
                          key={`${skill.name}-${index}`}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-center shadow-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary-400 bg-primary-500/5 p-3 rounded-xl border border-primary-500/10 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      You have all the required skills.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {missingSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-background-surface to-background border border-accent-500/30 rounded-3xl p-6 shadow-ai-glow relative overflow-hidden group hover:border-accent-500/50 transition-colors"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-accent-500/10" />

                <h3 className="text-lg font-heading font-bold text-text-primary mb-5 flex items-center relative z-10">
                  <Zap className="w-5 h-5 mr-2 text-accent-400 fill-accent-400/20" />
                  AI Resume Tips
                </h3>

                <div className="space-y-4 relative z-10">
                  {missingSkills.map((skill, index) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="bg-background-elevated/40 border border-white/5 rounded-2xl p-4 hover:bg-background-elevated/60 transition-colors"
                    >
                      <div className="font-semibold text-text-primary text-sm flex items-center justify-between mb-2">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mr-2 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                          {skill.name}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {skill.improvementTip ||
                          'Consider adding a project or course demonstrating this skill.'}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
