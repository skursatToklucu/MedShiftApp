import { create } from 'zustand';
import { Notification, NotificationType } from '../types';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: Notification = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Add some sample notifications for demo purposes
export const initializeNotificationStore = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      userId: '1',
      title: 'New shift scheduled',
      message: 'You have been assigned to Emergency Duty on July 15, 2025',
      type: NotificationType.INFO,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '1',
      title: 'Leave request approved',
      message: 'Your leave request for July 20-22, 2025 has been approved',
      type: NotificationType.SUCCESS,
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: '1',
      title: 'Shift swap pending',
      message: 'Dr. Jane Doe has requested to swap shifts with you on July 18, 2025',
      type: NotificationType.WARNING,
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useNotificationStore.setState({ notifications });
};