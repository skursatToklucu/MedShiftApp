import React from 'react';
import { X, CheckCircle, AlertCircle, InfoIcon, AlertTriangle } from 'lucide-react';
import { Notification, NotificationType } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../../stores/notificationStore';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="text-success-500" size={18} />;
      case NotificationType.WARNING:
        return <AlertTriangle className="text-warning-500" size={18} />;
      case NotificationType.ERROR:
        return <AlertCircle className="text-error-500" size={18} />;
      case NotificationType.INFO:
      default:
        return <InfoIcon className="text-primary-500" size={18} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900/20" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-sm">
          <div className="h-full flex flex-col bg-white shadow-xl animate-slide-up">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-neutral-800">Notifications</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={clearAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <InfoIcon size={40} className="mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead ? 'bg-white border-neutral-200' : 'bg-primary-50 border-primary-100'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          {getIconForType(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800">{notification.title}</p>
                          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;