import React, { useEffect, useState } from 'react';
import { format, startOfToday, addDays } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CalendarIcon, ClipboardIcon, AlertCircleIcon, UserIcon, BarChartIcon, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { useRequestStore } from '../stores/requestStore';
import { RequestStatus, ShiftStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { shifts, fetchShifts, isLoading: shiftsLoading } = useShiftStore();
  const { requests, fetchRequests, isLoading: requestsLoading } = useRequestStore();
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  const isAdmin = user?.role === 'ADMIN';
  const today = startOfToday();
  
  useEffect(() => {
    fetchShifts();
    fetchRequests();
  }, [fetchShifts, fetchRequests]);
  
  useEffect(() => {
    // Get upcoming shifts for the next 7 days
    const nextWeekShifts = shifts
      .filter(shift => {
        const shiftDate = new Date(shift.startDate);
        const sevenDaysFromNow = addDays(today, 7);
        return (
          shift.status === ShiftStatus.PUBLISHED &&
          shiftDate >= today &&
          shiftDate <= sevenDaysFromNow &&
          (isAdmin || shift.userId === user?.id)
        );
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
      
    setUpcomingShifts(nextWeekShifts);
    
    // Get pending requests
    const pendingReqs = requests
      .filter(req => 
        req.status === RequestStatus.PENDING && 
        (isAdmin || req.userId === user?.id)
      )
      .slice(0, 5);
      
    setPendingRequests(pendingReqs);
  }, [shifts, requests, isAdmin, user, today]);
  
  const getStatsForUser = () => {
    // For a regular user
    const userShifts = shifts.filter(shift => shift.userId === user?.id);
    const totalShifts = userShifts.length;
    const emergencyShifts = userShifts.filter(shift => shift.isEmergency).length;
    const completedShifts = userShifts.filter(shift => shift.status === ShiftStatus.COMPLETED).length;
    
    return [
      { name: 'Upcoming Shifts', value: totalShifts - completedShifts, icon: <CalendarIcon size={20} /> },
      { name: 'Emergency Duties', value: emergencyShifts, icon: <AlertCircleIcon size={20} /> },
      { name: 'Total Hours', value: totalShifts * 24, icon: <Clock size={20} /> },
    ];
  };
  
  const getStatsForAdmin = () => {
    // For an admin
    const totalUsers = 4; // Mock data
    const totalPublishedShifts = shifts.filter(shift => shift.status === ShiftStatus.PUBLISHED).length;
    const pendingReqs = requests.filter(req => req.status === RequestStatus.PENDING).length;
    
    return [
      { name: 'Total Staff', value: totalUsers, icon: <UserIcon size={20} /> },
      { name: 'Published Shifts', value: totalPublishedShifts, icon: <CalendarIcon size={20} /> },
      { name: 'Pending Requests', value: pendingReqs, icon: <ClipboardIcon size={20} /> },
    ];
  };
  
  const stats = isAdmin ? getStatsForAdmin() : getStatsForUser();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Welcome, {user?.fullName}</h1>
          <p className="text-neutral-600 mt-1">
            {isAdmin ? 'Here\'s what needs your attention today.' : 'Here\'s your upcoming schedule.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {isAdmin ? (
            <Button 
              onClick={() => navigate('/schedule/create')}
              rightIcon={<CalendarIcon size={16} />}
            >
              Create Schedule
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/requests/new')}
              rightIcon={<ClipboardIcon size={16} />}
            >
              New Request
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-neutral-900">{stat.value}</h3>
                <p className="text-sm text-neutral-500">{stat.name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming shifts */}
        <Card 
          title="Upcoming Shifts" 
          description="Your next scheduled shifts"
          footer={
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/schedule')}
              fullWidth
            >
              View Full Schedule
            </Button>
          }
        >
          {shiftsLoading ? (
            <div className="py-6 flex justify-center">
              <p className="text-neutral-500">Loading shifts...</p>
            </div>
          ) : upcomingShifts.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-neutral-500">
              <CalendarIcon size={24} className="mb-2 opacity-50" />
              <p>No upcoming shifts found</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-neutral-800">
                        {shift.roomId}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {format(new Date(shift.startDate), 'EEEE, MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shift.isEmergency 
                          ? 'bg-error-100 text-error-800' 
                          : 'bg-primary-100 text-primary-800'
                      }`}>
                        {shift.isEmergency ? 'Emergency' : 'Regular'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Requests */}
        <Card 
          title={isAdmin ? "Pending Requests" : "Your Requests"} 
          description={isAdmin ? "Staff requests awaiting your review" : "Status of your recent requests"}
          footer={
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/requests')}
              fullWidth
            >
              View All Requests
            </Button>
          }
        >
          {requestsLoading ? (
            <div className="py-6 flex justify-center">
              <p className="text-neutral-500">Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-neutral-500">
              <ClipboardIcon size={24} className="mb-2 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {pendingRequests.map((request) => (
                <div key={request.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-neutral-800">
                        {request.type === 'LEAVE' ? 'Leave Request' : 
                         request.type === 'SWAP' ? 'Shift Swap' : 'Preference'}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {format(new Date(request.startDate), 'MMM d')} 
                        {request.startDate !== request.endDate && 
                          ` - ${format(new Date(request.endDate), 'MMM d')}`}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'PENDING' 
                          ? 'bg-warning-100 text-warning-800' 
                          : request.status === 'APPROVED'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Overall Stats */}
      <Card title="Duty Performance" description="Monthly stats summary">
        <div className="h-64 flex justify-center items-center">
          <div className="flex flex-col items-center text-neutral-500">
            <BarChartIcon size={48} className="mb-4 opacity-50" />
            <p className="text-center">
              Detailed statistics will be available after more data is collected.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;