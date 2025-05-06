import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import RequestForm from '../components/forms/RequestForm';
import { useRequestStore } from '../stores/requestStore';
import { useShiftStore } from '../stores/shiftStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { NotificationType } from '../types';

const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createRequest, isLoading, error } = useRequestStore();
  const { shifts, users, fetchShifts, fetchUsers } = useShiftStore();
  const { addNotification } = useNotificationStore();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      await Promise.all([
        fetchShifts(),
        fetchUsers(),
      ]);
      setDataLoading(false);
    };
    
    fetchData();
  }, [fetchShifts, fetchUsers]);
  
  const handleSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      await createRequest({
        ...data,
        userId: user.id,
      });
      
      setSuccess('Request submitted successfully');
      
      // Add notification for admins
      addNotification({
        userId: '1', // Admin ID
        title: 'New Request Submitted',
        message: `${user.fullName} has submitted a new ${data.type.toLowerCase()} request.`,
        type: NotificationType.INFO,
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/requests');
      }, 1500);
    } catch (err) {
      console.error('Failed to create request:', err);
    }
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">New Request</h1>
      </div>
      
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-3 flex items-start">
          <AlertCircle className="text-error-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-success-50 border border-success-200 rounded-md p-3 flex items-start">
          <CheckCircle className="text-success-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
          <p className="text-sm text-success-800">{success}</p>
        </div>
      )}
      
      <Card title="Submit Request">
        {dataLoading ? (
          <div className="py-6 flex justify-center">
            <p className="text-neutral-500">Loading form...</p>
          </div>
        ) : (
          <RequestForm
            shifts={shifts}
            users={users}
            currentUserId={user.id}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/requests')}
            isLoading={isLoading}
          />
        )}
      </Card>
    </div>
  );
};

export default NewRequestPage;