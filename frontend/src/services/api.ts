// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gigflow-pnkh.onrender.com/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const config: RequestInit = {
    ...options,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }), 
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Auth API
export const authApi = {
  async register(name: string, email: string, password: string) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    // If you add a logout endpoint later
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Gig API
export interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  skills: string[];
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  clientId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt: string;
  updatedAt?: string;
  bidsCount?: number;
}

export const gigApi = {
  async getGigs(): Promise<Gig[]> {
    return apiRequest<Gig[]>('/gigs');
  },

  async getGigById(id: string): Promise<Gig> {
    return apiRequest<Gig>(`/gigs/${id}`);
  },

  async createGig(gigData: {    
    title: string;
    description: string;
    category: string;
    budget: { min: number; max: number };
    skills: string[];
    deadline: string;
  }): Promise<Gig> {
    return apiRequest<Gig>('/gigs', {
      method: 'POST',
      body: JSON.stringify(gigData),
    });
  },

  async updateGigStatus(id: string, status: 'open' | 'in-progress' | 'completed'): Promise<Gig> {
    return apiRequest<Gig>(`/gigs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getMyGigs(): Promise<Gig[]> {
    return apiRequest<Gig[]>('/gigs/client/my-gigs');
  },
};

// Bid API
export interface Bid {
  _id: string;
  gigId: string | Gig;
  freelancerId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    rating?: number;
    completedJobs?: number;
    skills?: string[];
  } | string;
  amount: number;
  message: string;
  deliveryDays: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const bidApi = {
  async placeBid(bidData: {
    gigId: string;
    amount: number;
    message: string;
    deliveryDays: number;
  }): Promise<Bid> {
    return apiRequest<Bid>('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  async getBidsForGig(gigId: string): Promise<Bid[]> {
    return apiRequest<Bid[]>(`/bids/gig/${gigId}`);
  },

  async getBidsForFreelancer(): Promise<Bid[]> {
    return apiRequest<Bid[]>('/bids/freelancer/my-bids');
  },

  async hireBid(bidId: string): Promise<Bid> {
    return apiRequest<Bid>(`/bids/${bidId}/hire`, {
      method: 'PATCH',
    });
  },
};
