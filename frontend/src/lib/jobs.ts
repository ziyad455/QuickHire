export interface SkillMatch {
  name: string;
  required: boolean;
  status?: 'matched' | 'missing';
  improvementTip?: string;
}

export interface CandidateProfile {
  candidate_name: string;
  primary_role: string;
  years_of_experience: number;
  skills: string[];
  location: string;
}

export interface BackendJobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  apply_url: string;
  description: string;
  date_posted: string;
  query_used: string;
  type?: string;
  remote_option?: string;
  skills?: SkillMatch[];
  matchScore?: number;
  search_query?: string;
  search_queries?: string[];
  search_date?: string;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  applyUrl: string;
  description: string;
  datePosted: string;
  queryUsed: string;
  type: string;
  remoteOption: string;
  skills: SkillMatch[];
  matchScore: number;
  searchQuery: string;
  searchQueries: string[];
  searchDate: string;
}

export interface AnalyzeCvSuccessResponse {
  status: 'success';
  candidate: CandidateProfile;
  matches: BackendJobResult[];
  search_query: string;
  search_queries: string[];
}

const normalizeEmploymentType = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  const normalized = value.replace(/[_-]/g, ' ').trim().toLowerCase();
  const mapping: Record<string, string> = {
    fulltime: 'Full-time',
    'full time': 'Full-time',
    parttime: 'Part-time',
    'part time': 'Part-time',
    contract: 'Contract',
    contractor: 'Contract',
    intern: 'Internship',
    internship: 'Internship',
  };

  return mapping[normalized] ?? value;
};

const normalizeRemoteOption = (location: string, remoteOption?: string) => {
  if (remoteOption) {
    return remoteOption;
  }

  const lowered = location.toLowerCase();
  if (lowered.includes('remote')) {
    return 'Remote';
  }
  if (lowered.includes('hybrid')) {
    return 'Hybrid';
  }
  return 'On-site';
};

const normalizeSkills = (skills?: SkillMatch[]) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills.map((skill) => {
    const normalizedSkill: SkillMatch = {
      name: skill.name,
      required: skill.required,
    };

    if (skill.status) {
      normalizedSkill.status = skill.status;
    }

    if (skill.improvementTip) {
      normalizedSkill.improvementTip = skill.improvementTip;
    }

    return normalizedSkill;
  });
};

export const normalizeJobResult = (
  job: BackendJobResult | JobResult,
  fallbackSearchQuery = '',
  fallbackSearchQueries: string[] = [],
  fallbackSearchDate = new Date().toISOString()
): JobResult => {
  if ('applyUrl' in job) {
    return {
      ...job,
      type: normalizeEmploymentType(job.type),
      remoteOption: normalizeRemoteOption(job.location, job.remoteOption),
      skills: normalizeSkills(job.skills),
      searchQuery: job.searchQuery || fallbackSearchQuery,
      searchQueries: job.searchQueries.length > 0 ? job.searchQueries : fallbackSearchQueries,
      searchDate: job.searchDate || fallbackSearchDate,
    };
  }

  return {
    id: job.id,
    title: job.title || 'Untitled role',
    company: job.company || 'Unknown company',
    location: job.location || 'Location not specified',
    source: job.source || 'Unknown source',
    applyUrl: job.apply_url || '',
    description: job.description?.trim() || 'No job description was provided by this source.',
    datePosted: job.date_posted || 'Unknown',
    queryUsed: job.query_used || fallbackSearchQuery,
    type: normalizeEmploymentType(job.type),
    remoteOption: normalizeRemoteOption(job.location || '', job.remote_option),
    skills: normalizeSkills(job.skills),
    matchScore: typeof job.matchScore === 'number' ? job.matchScore : 0,
    searchQuery: job.search_query || fallbackSearchQuery || job.query_used || '',
    searchQueries: job.search_queries?.length ? job.search_queries : fallbackSearchQueries,
    searchDate: job.search_date || fallbackSearchDate,
  };
};

export const formatSearchDate = (isoDate: string) => {
  const parsedDate = new Date(isoDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};
