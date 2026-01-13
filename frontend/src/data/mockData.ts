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
