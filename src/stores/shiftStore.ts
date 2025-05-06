import { create } from 'zustand';
import { Shift, ShiftStatus, User } from '../types';
import { formatISO, addDays } from 'date-fns';

interface ShiftState {
  shifts: Shift[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchShifts: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createShift: (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  generateSchedule: (clinicId: string, startDate: Date, days: number) => Promise<void>;
}

// Mock data for users (in a real app, this would be fetched from a users API)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hospital.com',
    fullName: 'Admin User',
    role: 'ADMIN',
    position: 'Administrator',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    email: 'doctor1@hospital.com',
    fullName: 'John Smith',
    role: 'USER',
    position: 'Doctor',
    department: 'Cardiology',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '3',
    email: 'doctor2@hospital.com',
    fullName: 'Jane Doe',
    role: 'USER',
    position: 'Doctor',
    department: 'Emergency',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '4',
    email: 'doctor3@hospital.com',
    fullName: 'Robert Johnson',
    role: 'USER',
    position: 'Doctor',
    department: 'Pediatrics',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

// Mock data for shifts
const today = new Date();
const mockShifts: Shift[] = [
  {
    id: '1',
    roomId: '1',
    userId: '3',
    startDate: formatISO(today),
    endDate: formatISO(addDays(today, 1)),
    isEmergency: true,
    status: ShiftStatus.PUBLISHED,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    roomId: '3',
    userId: '2',
    startDate: formatISO(today),
    endDate: formatISO(addDays(today, 1)),
    isEmergency: false,
    status: ShiftStatus.PUBLISHED,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    roomId: '4',
    userId: '4',
    startDate: formatISO(today),
    endDate: formatISO(addDays(today, 1)),
    isEmergency: false,
    status: ShiftStatus.PUBLISHED,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    roomId: '1',
    userId: '3',
    startDate: formatISO(addDays(today, 2)),
    endDate: formatISO(addDays(today, 3)),
    isEmergency: true,
    status: ShiftStatus.DRAFT,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useShiftStore = create<ShiftState>((set, get) => ({
  shifts: [],
  users: [],
  isLoading: false,
  error: null,

  fetchShifts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ shifts: mockShifts, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch shifts' });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ users: mockUsers, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch users' });
    }
  },

  createShift: async (shift) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for conflicts (if user is already assigned for that date)
      const { shifts, users } = get();
      const existingShift = shifts.find(s => 
        s.userId === shift.userId && 
        new Date(s.startDate).toDateString() === new Date(shift.startDate).toDateString()
      );
      
      if (existingShift) {
        throw new Error('User already has a shift assigned on this date');
      }
      
      // Check post-duty rest day (if user had a shift the previous day)
      const previousDay = new Date(new Date(shift.startDate).getTime() - 24 * 60 * 60 * 1000);
      const previousShift = shifts.find(s => 
        s.userId === shift.userId && 
        new Date(s.startDate).toDateString() === previousDay.toDateString()
      );
      
      if (previousShift) {
        throw new Error('User needs a rest day after their previous shift');
      }
      
      const newShift: Shift = {
        id: String(Date.now()),
        createdBy: '1', // Current user ID would be used here
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...shift,
      };
      
      set((state) => ({
        shifts: [...state.shifts, newShift],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to create shift' });
    }
  },

  updateShift: async (id, shiftUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If updating the user or date, check for conflicts
      if (shiftUpdate.userId || shiftUpdate.startDate) {
        const { shifts } = get();
        const currentShift = shifts.find(s => s.id === id);
        
        if (!currentShift) {
          throw new Error('Shift not found');
        }
        
        const updatedUserId = shiftUpdate.userId || currentShift.userId;
        const updatedStartDate = shiftUpdate.startDate || currentShift.startDate;
        
        // Check for existing shift on that date
        const existingShift = shifts.find(s => 
          s.id !== id &&
          s.userId === updatedUserId && 
          new Date(s.startDate).toDateString() === new Date(updatedStartDate).toDateString()
        );
        
        if (existingShift) {
          throw new Error('User already has a shift assigned on this date');
        }
        
        // Check post-duty rest day
        const previousDay = new Date(new Date(updatedStartDate).getTime() - 24 * 60 * 60 * 1000);
        const previousShift = shifts.find(s => 
          s.id !== id &&
          s.userId === updatedUserId && 
          new Date(s.startDate).toDateString() === previousDay.toDateString()
        );
        
        if (previousShift) {
          throw new Error('User needs a rest day after their previous shift');
        }
      }
      
      set((state) => ({
        shifts: state.shifts.map((shift) =>
          shift.id === id ? { ...shift, ...shiftUpdate, updatedAt: new Date().toISOString() } : shift
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update shift' });
    }
  },

  deleteShift: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => ({
        shifts: state.shifts.filter((shift) => shift.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to delete shift' });
    }
  },

  generateSchedule: async (clinicId, startDate, days) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be a complex algorithm in a real application
      // For demo purposes, we're just creating some sample shifts
      
      const { shifts, users } = get();
      const newShifts: Shift[] = [];
      
      // Get users from this clinic
      const clinicUsers = users.filter(user => user.department === 'Cardiology');
      
      if (clinicUsers.length === 0) {
        throw new Error('No users found for this clinic');
      }
      
      for (let i = 0; i < days; i++) {
        const shiftDate = addDays(startDate, i);
        const randomUserIndex = i % clinicUsers.length;
        
        // Check if a shift already exists for this date and room
        const existingShift = shifts.find(shift => 
          new Date(shift.startDate).toDateString() === shiftDate.toDateString() &&
          shift.roomId === '3' // Cardiology room
        );
        
        if (!existingShift) {
          newShifts.push({
            id: `new-${Date.now()}-${i}`,
            roomId: '3', // Cardiology room
            userId: clinicUsers[randomUserIndex].id,
            startDate: formatISO(shiftDate),
            endDate: formatISO(addDays(shiftDate, 1)),
            isEmergency: false,
            status: ShiftStatus.DRAFT,
            createdBy: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      
      set((state) => ({
        shifts: [...state.shifts, ...newShifts],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to generate schedule' });
    }
  },
}));