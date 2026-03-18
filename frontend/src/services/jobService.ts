import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeJobResult, type JobResult } from '../lib/jobs';

const USERS_COLLECTION = 'users';
const JOBS_SUBCOLLECTION = 'jobs';

interface FirestoreJobDocument extends DocumentData {
  title?: string;
  company?: string;
  location?: string;
  source?: string;
  applyUrl?: string;
  description?: string;
  datePosted?: string;
  queryUsed?: string;
  type?: string;
  remoteOption?: string;
  skills?: JobResult['skills'];
  matchScore?: number;
  searchQuery?: string;
  searchQueries?: string[];
  searchDate?: string;
  savedAt?: Timestamp;
  updatedAt?: Timestamp;
}

const convertToJob = (id: string, data: FirestoreJobDocument): JobResult => {
  const savedAt =
    data.savedAt instanceof Timestamp
      ? data.savedAt.toDate().toISOString()
      : data.searchDate || new Date().toISOString();

  return normalizeJobResult(
    {
      id,
      title: data.title || 'Untitled role',
      company: data.company || 'Unknown company',
      location: data.location || 'Location not specified',
      source: data.source || 'Unknown source',
      applyUrl: data.applyUrl || '',
      description: data.description || 'No job description was provided by this source.',
      datePosted: data.datePosted || 'Unknown',
      queryUsed: data.queryUsed || '',
      type: data.type || 'Unknown',
      remoteOption: data.remoteOption || 'On-site',
      skills: Array.isArray(data.skills) ? data.skills : [],
      matchScore: typeof data.matchScore === 'number' ? data.matchScore : 0,
      searchQuery: data.searchQuery || data.queryUsed || '',
      searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
      searchDate: data.searchDate || savedAt,
    },
    data.searchQuery || '',
    Array.isArray(data.searchQueries) ? data.searchQueries : [],
    data.searchDate || savedAt
  );
};

export const saveUserJobs = async (userId: string, jobs: JobResult[]) => {
  const batch = writeBatch(db);

  jobs.forEach((job) => {
    const jobRef = doc(db, USERS_COLLECTION, userId, JOBS_SUBCOLLECTION, job.id);
    batch.set(
      jobRef,
      {
        title: job.title,
        company: job.company,
        location: job.location,
        source: job.source,
        applyUrl: job.applyUrl,
        description: job.description,
        datePosted: job.datePosted,
        queryUsed: job.queryUsed,
        type: job.type,
        remoteOption: job.remoteOption,
        skills: job.skills,
        matchScore: job.matchScore,
        searchQuery: job.searchQuery,
        searchQueries: job.searchQueries,
        searchDate: job.searchDate,
        savedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
};

export const subscribeToUserJobs = (
  userId: string,
  callback: (jobs: JobResult[]) => void
) => {
  const jobsQuery = query(
    collection(db, USERS_COLLECTION, userId, JOBS_SUBCOLLECTION),
    orderBy('savedAt', 'desc')
  );

  return onSnapshot(jobsQuery, (snapshot) => {
    const jobs = snapshot.docs.map((jobDoc) =>
      convertToJob(jobDoc.id, jobDoc.data() as FirestoreJobDocument)
    );
    callback(jobs);
  });
};

export const getUserJobById = async (userId: string, jobId: string) => {
  const jobRef = doc(db, USERS_COLLECTION, userId, JOBS_SUBCOLLECTION, jobId);
  const jobSnapshot = await getDoc(jobRef);

  if (!jobSnapshot.exists()) {
    return null;
  }

  return convertToJob(jobSnapshot.id, jobSnapshot.data() as FirestoreJobDocument);
};
