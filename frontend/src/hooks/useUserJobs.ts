import { useEffect, useState } from 'react';
import type { JobResult } from '../lib/jobs';
import { subscribeToUserJobs } from '../services/jobService';

export const useUserJobs = (userId?: string) => {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setJobs([]);
        setLoading(false);
        setError(null);
      });
      return;
    }

    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });

    const unsubscribe = subscribeToUserJobs(userId, (updatedJobs) => {
      setJobs(updatedJobs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return {
    jobs,
    loading,
    error,
  };
};
