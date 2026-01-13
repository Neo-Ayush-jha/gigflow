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
  {
    id: 'gig-2',
    title: 'Design Mobile App UI for Fitness Tracking',
    description: 'Need a talented UI/UX designer to create modern, engaging interfaces for a fitness tracking mobile application. Should include workout screens, progress charts, and social features.',
    budget: { min: 300, max: 500 },
    category: 'UI/UX Design',
    skills: ['Figma', 'Mobile Design', 'UI Design', 'Prototyping'],
    status: 'open',
    clientId: 'user-1',
    createdAt: '2024-01-12',
    deadline: '2024-02-01',
    bidsCount: 8,
  },
  {
    id: 'gig-3',
    title: 'Develop RESTful API for E-commerce Platform',
    description: 'Seeking a backend developer to create a robust RESTful API for an e-commerce platform. Must include user authentication, product management, order processing, and payment integration.',
    budget: { min: 800, max: 1200 },
    category: 'Backend Development',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    status: 'open',
    clientId: 'user-4',
    createdAt: '2024-01-08',
    deadline: '2024-03-01',
    bidsCount: 15,
  },
  {
    id: 'gig-4',
    title: 'Write SEO-Optimized Blog Content for Tech Startup',
    description: 'Looking for a content writer to produce 10 high-quality, SEO-optimized blog posts about AI and machine learning for our tech startup blog. Each post should be 1500-2000 words.',
    budget: { min: 200, max: 400 },
    category: 'Content Writing',
    skills: ['SEO', 'Technical Writing', 'Blogging', 'AI/ML Knowledge'],
    status: 'assigned',
    clientId: 'user-3',
    freelancerId: 'user-4',
    createdAt: '2024-01-05',
    deadline: '2024-01-30',
    bidsCount: 22,
  },
  {
    id: 'gig-5',
    title: 'Build Cross-Platform Mobile App with React Native',
    description: 'Need a React Native developer to build a cross-platform mobile app for both iOS and Android. The app is a task management tool with offline support and cloud sync.',
    budget: { min: 1000, max: 1500 },
    category: 'Mobile Development',
    skills: ['React Native', 'TypeScript', 'Redux', 'Firebase'],
    status: 'open',
    clientId: 'user-2',
    createdAt: '2024-01-11',
    deadline: '2024-03-15',
    bidsCount: 9,
  },
  {
    id: 'gig-6',
    title: 'Create Landing Page with Animations',
    description: 'Looking for a frontend developer to create a stunning landing page with smooth animations and interactions. Should be fully responsive and optimized for performance.',
    budget: { min: 250, max: 400 },
    category: 'Web Development',
    skills: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    status: 'open',
    clientId: 'user-5',
    createdAt: '2024-01-13',
    deadline: '2024-01-28',
    bidsCount: 18,
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
  {
    id: 'bid-2',
    gigId: 'gig-1',
    freelancerId: 'user-3',
    amount: 720,
    message: 'Expert in React and data visualization. I\'ve built similar dashboards for Fortune 500 companies.',
    deliveryDays: 18,
    status: 'pending',
    createdAt: '2024-01-11',
  },
  {
    id: 'bid-3',
    gigId: 'gig-2',
    freelancerId: 'user-2',
    amount: 380,
    message: 'As a UI/UX specialist, I can create beautiful and intuitive fitness app designs. Check my portfolio for similar work.',
    deliveryDays: 14,
    status: 'pending',
    createdAt: '2024-01-13',
  },
  {
    id: 'bid-4',
    gigId: 'gig-4',
    freelancerId: 'user-4',
    amount: 350,
    message: 'I specialize in tech content writing with deep knowledge of AI/ML. My articles consistently rank on the first page of Google.',
    deliveryDays: 25,
    status: 'hired',
    createdAt: '2024-01-06',
  },
  {
    id: 'bid-5',
    gigId: 'gig-5',
    freelancerId: 'user-5',
    amount: 1200,
    message: 'React Native is my specialty. I\'ve built 15+ apps on both platforms with offline-first architecture.',
    deliveryDays: 45,
    status: 'pending',
    createdAt: '2024-01-12',
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
