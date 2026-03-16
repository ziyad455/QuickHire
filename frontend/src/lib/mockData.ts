export interface JobMock {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remoteOption: string;
  description: string;
  skills: { 
    name: string; 
    required: boolean;
    status?: 'matched' | 'missing';
    improvementTip?: string;
  }[];
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
      { name: 'React', required: true, status: 'matched' },
      { name: 'TypeScript', required: true, status: 'matched' },
      { name: 'WebGL', required: false, status: 'missing', improvementTip: 'Add 1-2 bullet points highlighting any 3D rendering or canvas API experience. Even Three.js side projects will significantly boost your profile for this role.' }
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
      { name: 'Node.js', required: true, status: 'matched' },
      { name: 'Microservices', required: true, status: 'missing', improvementTip: 'Your CV lacks explicit mention of microservices architecture. Rephrase your "Backend API" experience to emphasize how services were decoupled and communicated.' },
      { name: 'Kafka', required: false, status: 'missing', improvementTip: 'Consider mentioning any event-driven architecture experience (like RabbitMQ or Redis Pub/Sub) to bridge the Kafka gap.' }
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
      { name: 'UI/UX', required: true, status: 'matched' },
      { name: 'Prototyping', required: true, status: 'missing', improvementTip: 'Highlight specific prototyping tools in your past roles. Did you use Principle, Framer, or advanced Figma prototyping? Specify this clearly.' },
      { name: 'Figma', required: true, status: 'matched' }
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
      { name: 'React', required: true, status: 'matched' },
      { name: 'GraphQL', required: true, status: 'matched' },
      { name: 'Node.js', required: false, status: 'matched' }
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
      { name: 'JavaScript', required: true, status: 'matched' },
      { name: 'HTML/CSS', required: true, status: 'missing', improvementTip: 'While implied by JavaScript, ATS systems look for explicit HTML/CSS keywords. Add a "Core Technologies" section to explicitly list these.' }
    ],
    matchScore: 65
  }
];
