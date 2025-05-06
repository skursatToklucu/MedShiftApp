import { create } from 'zustand';
import { Request, RequestStatus, RequestType, User } from '../types';
import { formatISO } from 'date-fns';

interface RequestState {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (request: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateRequest: (id: string, request: Partial<Request>) => Promise<void>;
  reviewRequest: (id: string, status: RequestStatus, reviewNotes?: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

// Mock data
let mockRequests: Request[] = [
  {
    id: '1',
    userId: '2',
    type: RequestType.LEAVE,
    status: RequestStatus.PENDING,
    startDate: formatISO(new Date(2025, 6, 10)),
    endDate: formatISO(new Date(2025, 6, 15)),
    reason: 'Family vacation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '3',
    type: RequestType.SWAP,
    status: RequestStatus.APPROVED,
    startDate: formatISO(new Date(2025, 6, 5)),
    endDate: formatISO(new Date(2025, 6, 6)),
    reason: 'Personal commitment',
    swapWithUserId: '4',
    swapShiftId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewedBy: '1',
    reviewedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: '4',
    type: RequestType.PREFERENCE,
    status: RequestStatus.REJECTED,
    startDate: formatISO(new Date(2025, 6, 20)),
    endDate: formatISO(new Date(2025, 6, 20)),
    reason: 'Prefer not to work on Saturdays',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewedBy: '1',
    reviewedAt: new Date().toISOString(),
    reviewNotes: 'We need coverage on Saturdays. Will try to minimize but cannot guarantee.',
  },
];

export const useRequestStore = create<RequestState>((set) => ({
  requests: mockRequests,
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ requests: mockRequests, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch requests' });
    }
  },

  createRequest: async (request) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRequest: Request = {
        id: String(Date.now()),
        status: RequestStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...request,
      };
      
      // Update both the store and mock data
      mockRequests = [...mockRequests, newRequest];
      
      set((state) => ({
        requests: mockRequests,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to create request' });
    }
  },

  updateRequest: async (id, requestUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update both the store and mock data
      mockRequests = mockRequests.map((request) =>
        request.id === id ? { ...request, ...requestUpdate, updatedAt: new Date().toISOString() } : request
      );
      
      set((state) => ({
        requests: mockRequests,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update request' });
    }
  },

  reviewRequest: async (id, status, reviewNotes) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update both the store and mock data
      mockRequests = mockRequests.map((request) =>
        request.id === id ? {
          ...request,
          status,
          reviewedBy: '1', // Current user ID would be used here
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || request.reviewNotes,
          updatedAt: new Date().toISOString(),
        } : request
      );
      
      set((state) => ({
        requests: mockRequests,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to review request' });
    }
  },

  deleteRequest: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update both the store and mock data
      mockRequests = mockRequests.filter((request) => request.id !== id);
      
      set((state) => ({
        requests: mockRequests,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to delete request' });
    }
  },
}));