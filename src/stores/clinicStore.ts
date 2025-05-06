import { create } from 'zustand';
import { Clinic, Room } from '../types';

interface ClinicState {
  clinics: Clinic[];
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  fetchClinics: () => Promise<void>;
  fetchRooms: () => Promise<void>;
  addClinic: (clinic: Omit<Clinic, 'id' | 'createdAt'>) => Promise<void>;
  updateClinic: (id: string, clinic: Partial<Clinic>) => Promise<void>;
  deleteClinic: (id: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id' | 'createdAt'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

// Mock data
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Emergency Department',
    description: 'Handles all emergency cases and trauma',
    requiresWeekendCoverage: true,
    requiresHolidayCoverage: true,
    defaultShiftDuration: 24,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Cardiology',
    description: 'Specializes in heart-related conditions',
    requiresWeekendCoverage: true,
    requiresHolidayCoverage: true,
    defaultShiftDuration: 24,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Pediatrics',
    description: 'Care for children and adolescents',
    requiresWeekendCoverage: true,
    requiresHolidayCoverage: true,
    defaultShiftDuration: 24,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'ER Shift 1',
    clinicId: '1',
    description: 'Primary emergency room duty',
    isEmergency: true,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'ER Shift 2',
    clinicId: '1',
    description: 'Secondary emergency room duty',
    isEmergency: true,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Cardiology On-Call',
    clinicId: '2',
    description: 'On-call duty for cardiology cases',
    isEmergency: false,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '4',
    name: 'Pediatrics On-Call',
    clinicId: '3',
    description: 'On-call duty for pediatric cases',
    isEmergency: false,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export const useClinicStore = create<ClinicState>((set, get) => ({
  clinics: [],
  rooms: [],
  isLoading: false,
  error: null,

  fetchClinics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ clinics: mockClinics, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch clinics' });
    }
  },

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ rooms: mockRooms, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    }
  },

  addClinic: async (clinic) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newClinic: Clinic = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        ...clinic,
      };
      
      set((state) => ({
        clinics: [...state.clinics, newClinic],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add clinic' });
    }
  },

  updateClinic: async (id, clinicUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => ({
        clinics: state.clinics.map((clinic) =>
          clinic.id === id ? { ...clinic, ...clinicUpdate } : clinic
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update clinic' });
    }
  },

  deleteClinic: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if clinic has rooms
      const clinicRooms = get().rooms.filter(room => room.clinicId === id);
      
      if (clinicRooms.length > 0) {
        throw new Error('Cannot delete clinic with existing rooms. Delete rooms first.');
      }
      
      set((state) => ({
        clinics: state.clinics.filter((clinic) => clinic.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to delete clinic' });
    }
  },

  addRoom: async (room) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRoom: Room = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        ...room,
      };
      
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add room' });
    }
  },

  updateRoom: async (id, roomUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === id ? { ...room, ...roomUpdate } : room
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update room' });
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to delete room' });
    }
  },
}));