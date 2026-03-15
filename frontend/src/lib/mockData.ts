export interface JobMock {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remoteOption: string;
  description: string;
  skills: { name: string; required: boolean }[];
  matchScore: number;
}

export const mockJobs: JobMock[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remoteOption: 'Remote',
    description: 'We are looking for a Senior Frontend Engineer to build the next generation of financial infrastructure. You will work extensively with React, TypeScript, and modern CSS architectures.',
    skills: [
      { name: 'React', required: true },
      { name: 'TypeScript', required: true },
      { name: 'WebGL', required: false }
    ],
    matchScore: 92
  },
  {
    id: 'job-2',
    title: 'Backend Developer',
    company: 'Spotify',
    location: 'New York, NY',
    type: 'Full-time',
    remoteOption: 'Hybrid',
    description: 'Join our audio streaming backend team. Experience with microservices, Java/Node.js, and high-throughput systems is required.',
    skills: [
      { name: 'Node.js', required: true },
      { name: 'Microservices', required: true },
      { name: 'Kafka', required: false }
    ],
    matchScore: 78
  },
  {
    id: 'job-3',
    title: 'Product Designer',
    company: 'Figma',
    location: 'London, UK',
    type: 'Contract',
    remoteOption: 'On-site',
    description: 'Design the tools that designers use. Strong portfolio emphasizing interactive prototyping and systems design required.',
    skills: [
      { name: 'UI/UX', required: true },
      { name: 'Prototyping', required: true },
      { name: 'Figma', required: true }
    ],
    matchScore: 85
  },
  {
    id: 'job-4',
    title: 'Full Stack Engineer',
    company: 'Linear',
    location: 'Portland, OR',
    type: 'Full-time',
    remoteOption: 'Remote',
    description: 'Help us build the most magical issue tracker. Looking for product-minded engineers who obsess over performance and craft.',
    skills: [
      { name: 'React', required: true },
      { name: 'GraphQL', required: true },
      { name: 'Node.js', required: false }
    ],
    matchScore: 95
  },
  {
    id: 'job-5',
    title: 'Junior Web Developer',
    company: 'TechStart Inc.',
    location: 'Austin, TX',
    type: 'Internship',
    remoteOption: 'Hybrid',
    description: 'Great opportunity for recent graduates. Learn building production ready web apps with modern Javascript tools.',
    skills: [
      { name: 'JavaScript', required: true },
      { name: 'HTML/CSS', required: true }
    ],
    matchScore: 65
  }
];
