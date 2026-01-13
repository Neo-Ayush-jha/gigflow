export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  joinedDate: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: { min: number; max: number };
  category: string;
  skills: string[];
  status: 'open' | 'assigned' | 'completed';
  clientId: string;
  freelancerId?: string;
  createdAt: string;
  deadline: string;
  bidsCount: number;
}

export interface Bid {
  id: string;
  gigId: string;
  freelancerId: string;
  amount: number;
  message: string;
  deliveryDays: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
}

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    rating: 4.9,
    completedJobs: 47,
    joinedDate: '2023-01-15',
  },
];

export const gigs: Gig[] = [
  {
    id: 'gig-1',
    title: 'Build a React Dashboard with Charts and Analytics',
    description: 'Looking for an experienced React developer to build a comprehensive admin dashboard with real-time charts, data tables, and user management features. Must be responsive and work across all devices.',
    budget: { min: 500, max: 800 },
    category: 'Web Development',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    status: 'open',
    clientId: 'user-2',
    createdAt: '2024-01-10',
    deadline: '2024-02-15',
    bidsCount: 12,
  },
];

export const bids: Bid[] = [
  {
    id: 'bid-1',
    gigId: 'gig-1',
    freelancerId: 'user-1',
    amount: 650,
    message: 'I have extensive experience building React dashboards with real-time data visualization. I can deliver this project within 3 weeks.',
    deliveryDays: 21,
    status: 'pending',
    createdAt: '2024-01-11',
  },
];

export const categories = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Backend Development',
  'Content Writing',
  'Data Science',
  'DevOps',
  'Marketing',
];

export const currentUser: User = users[0];

export const getUserById = (id: string): User | undefined => users.find(u => u.id === id);
export const getGigById = (id: string): Gig | undefined => gigs.find(g => g.id === id);
export const getBidsByGigId = (gigId: string): Bid[] => bids.filter(b => b.gigId === gigId);
export const getGigsByClientId = (clientId: string): Gig[] => gigs.filter(g => g.clientId === clientId);
export const getBidsByFreelancerId = (freelancerId: string): Bid[] => bids.filter(b => b.freelancerId === freelancerId);
