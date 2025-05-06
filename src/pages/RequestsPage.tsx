import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Filter, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useRequestStore } from '../stores/requestStore';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Request, RequestStatus, RequestType, NotificationType } from '../types';
import RequestForm from '../components/forms/RequestForm';

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { requests, fetchRequests, reviewRequest, isLoading } = useRequestStore();
  const { shifts, users, fetchShifts, fetchUsers } = useShiftStore();
  const { addNotification } = useNotificationStore();
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  
  const isAdmin = user?.role === 'ADMIN';
  
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchRequests(),
        fetchShifts(),
        fetchUsers(),
      ]);
    };
    
    fetchData();
  }, [fetchRequests, fetchShifts, fetchUsers]);
  
  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
    setReviewNotes('');
  };
  
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRequest(null);
  };
  
  const handleStatusChange = async (status: RequestStatus) => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      await reviewRequest(selectedRequest.id, status, reviewNotes);
      
      // Notify the user who made the request
      addNotification({
        userId: selectedRequest.userId,
        title: `Request ${status === RequestStatus.APPROVED ? 'Approved' : 'Rejected'}`,
        message: `Your ${selectedRequest.type.toLowerCase()} request for ${format(parseISO(selectedRequest.startDate), 'MMM d, yyyy')} has been ${status === RequestStatus.APPROVED ? 'approved' : 'rejected'}.`,
        type: status === RequestStatus.APPROVED ? NotificationType.SUCCESS : NotificationType.ERROR,
      });
      
      handleCloseDetails();
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setActionLoading(false);
    }
  };
  
  const filteredRequests = requests.filter(req => {
    // Filter by status
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    
    // For non-admins, only show their own requests
    if (!isAdmin && req.userId !== user?.id) return false;
    
    return true;
  });
  
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'Unknown User';
  };
  
  const getRequestTypeLabel = (type: RequestType): string => {
    switch (type) {
      case RequestType.LEAVE: return 'Leave Request';
      case RequestType.SWAP: return 'Shift Swap';
      case RequestType.PREFERENCE: return 'Scheduling Preference';
      default: return type;
    }
  };
  
  const getRequestTypeIcon = (type: RequestType) => {
    switch (type) {
      case RequestType.LEAVE: return <FileText size={18} />;
      case RequestType.SWAP: return <Clock size={18} />;
      case RequestType.PREFERENCE: return <Clock size={18} />;
      default: return null;
    }
  };
  
  const getStatusBadgeClass = (status: RequestStatus): string => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-warning-100 text-warning-800';
      case RequestStatus.APPROVED: return 'bg-success-100 text-success-800';
      case RequestStatus.REJECTED: return 'bg-error-100 text-error-800';
      case RequestStatus.CANCELLED: return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Requests</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            onClick={() => {}} // Would open a filter modal
          >
            Filter
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/requests/new')}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="animate-fade-in">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              className="block w-full sm:w-48 rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value={RequestStatus.PENDING}>Pending</option>
              <option value={RequestStatus.APPROVED}>Approved</option>
              <option value={RequestStatus.REJECTED}>Rejected</option>
              <option value={RequestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
          
          <div className="w-full sm:w-auto">
            <label htmlFor="typeFilter" className="block text-sm font-medium text-neutral-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              className="block w-full sm:w-48 rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value={RequestType.LEAVE}>Leave</option>
              <option value={RequestType.SWAP}>Shift Swap</option>
              <option value={RequestType.PREFERENCE}>Preference</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests list */}
      <Card>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <p className="text-neutral-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-neutral-500">
            <FileText size={32} className="mb-2 opacity-50" />
            <p>No requests found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/requests/new')}
            >
              Create New Request
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Staff
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleRequestClick(request)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                          {getRequestTypeIcon(request.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">
                            {getRequestTypeLabel(request.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{getUserName(request.userId)}</div>
                      </td>
                    )}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {format(parseISO(request.startDate), 'MMM d, yyyy')}
                        {request.startDate !== request.endDate && 
                          ` to ${format(parseISO(request.endDate), 'MMM d, yyyy')}`}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {format(parseISO(request.createdAt), 'MMM d, yyyy')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary-600 hover:text-primary-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestClick(request);
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Request details/review panel */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-20 overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/20" onClick={handleCloseDetails}></div>
          
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg">
              <div className="h-full flex flex-col bg-white shadow-xl animate-slide-up">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-neutral-800">
                    {getRequestTypeLabel(selectedRequest.type)}
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Requested By</h3>
                      <p className="mt-1 text-neutral-800">{getUserName(selectedRequest.userId)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">From</h3>
                        <p className="mt-1 text-neutral-800">
                          {format(parseISO(selectedRequest.startDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">To</h3>
                        <p className="mt-1 text-neutral-800">
                          {format(parseISO(selectedRequest.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {selectedRequest.type === RequestType.SWAP && selectedRequest.swapWithUserId && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Swap With</h3>
                        <p className="mt-1 text-neutral-800">{getUserName(selectedRequest.swapWithUserId)}</p>
                      </div>
                    )}
                    
                    {selectedRequest.reason && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Reason</h3>
                        <p className="mt-1 text-neutral-800">{selectedRequest.reason}</p>
                      </div>
                    )}
                    
                    {selectedRequest.reviewNotes && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Review Notes</h3>
                        <p className="mt-1 text-neutral-800">{selectedRequest.reviewNotes}</p>
                      </div>
                    )}
                    
                    {/* Admin review section */}
                    {isAdmin && selectedRequest.status === RequestStatus.PENDING && (
                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-800 mb-2">Review Request</h3>
                        
                        <div className="mb-4">
                          <label htmlFor="reviewNotes" className="block text-sm font-medium text-neutral-700 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="reviewNotes"
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Add notes about your decision"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            leftIcon={<XCircle size={16} />}
                            onClick={() => handleStatusChange(RequestStatus.REJECTED)}
                            isLoading={actionLoading}
                            className="sm:flex-1"
                          >
                            Reject
                          </Button>
                          <Button
                            leftIcon={<CheckCircle size={16} />}
                            onClick={() => handleStatusChange(RequestStatus.APPROVED)}
                            isLoading={actionLoading}
                            className="sm:flex-1"
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!isAdmin && selectedRequest.status === RequestStatus.PENDING && (
                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <p className="text-sm text-neutral-600">
                          Your request is pending review by an administrator.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleCloseDetails}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;