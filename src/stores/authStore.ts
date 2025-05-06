import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<void>;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@hospital.com',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
    position: 'Administrator',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    email: 'doctor@hospital.com',
    fullName: 'John Smith',
    role: UserRole.USER,
    position: 'Doctor',
    department: 'Cardiology',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Login failed' });
    }
  },

  register: async (userData: Partial<User>, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email exists
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Email already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        email: userData.email!,
        fullName: userData.fullName!,
        role: UserRole.USER, // Default role
        position: userData.position || 'Staff',
        department: userData.department || 'General',
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      mockUsers.push(newUser);
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(newUser));
      
      set({ user: newUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Registration failed' });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentUser = useAuthStore.getState().user;
      
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      // Update user data
      const updatedUser: User = {
        ...currentUser,
        ...userData,
      };
      
      // Update in mock data
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      }
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Profile update failed' });
    }
  },
}));

// Initialize auth state from localStorage
export const initializeAuthStore = () => {
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as User;
      useAuthStore.setState({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
    }
  }
};