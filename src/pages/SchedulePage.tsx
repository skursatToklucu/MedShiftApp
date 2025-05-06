import React, { useEffect, useState } from 'react';
import { format, addMonths, parseISO, isEqual } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MonthCalendar from '../components/calendar/MonthCalendar';
import { Plus, Filter, AlertCircle, Check, X } from 'lucide-react';
import { useShiftStore } from '../stores/shiftStore';
import { useClinicStore } from '../stores/clinicStore';
import { Shift, ShiftStatus, Room } from '../types';
import { useNavigate } from 'react-router-dom';
import ShiftForm from '../components/forms/ShiftForm';

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { shifts, users, fetchShifts, fetchUsers, updateShift, deleteShift, error } = useShiftStore();
  const { rooms, clinics, fetchRooms, fetchClinics } = useClinicStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterClinic, setFilterClinic] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [publishingIds, setPublishingIds] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchShifts(),
        fetchUsers(),
        fetchRooms(),
        fetchClinics(),
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [fetchShifts, fetchUsers, fetchRooms, fetchClinics]);
  
  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDetailsOpen(true);
    setIsEditMode(false);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDetailsOpen(true);
    setSelectedShift(null);
    setIsEditMode(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedShift(null);
    setSelectedDate(null);
    setIsEditMode(false);
  };
  
  const handleUpdateShift = async (data: Partial<Shift>) => {
    if (selectedShift) {
      await updateShift(selectedShift.id, data);
      setIsEditMode(false);
    } else if (selectedDate) {
      navigate('/schedule/create', { state: { date: selectedDate } });
      handleCloseDetails();
    }
  };
  
  const handleDeleteShift = async () => {
    if (selectedShift) {
      await deleteShift(selectedShift.id);
      handleCloseDetails();
    }
  };
  
  const handlePublishShift = async () => {
    if (selectedShift) {
      setPublishingIds([...publishingIds, selectedShift.id]);
      await updateShift(selectedShift.id, { status: ShiftStatus.PUBLISHED });
      setPublishingIds(publishingIds.filter(id => id !== selectedShift.id));
      setIsDetailsOpen(false);
    }
  };
  
  const filteredShifts = shifts.filter(shift => {
    if (filterClinic !== 'all') {
      const room = rooms.find(r => r.id === shift.roomId);
      if (!room || room.clinicId !== filterClinic) return false;
    }
    
    if (filterRoom !== 'all' && shift.roomId !== filterRoom) return false;
    
    return true;
  });
  
  const getClinicForRoom = (roomId: string): string => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 'Unknown';
    
    const clinic = clinics.find(c => c.id === room.clinicId);
    return clinic?.name || 'Unknown';
  };
  
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'Unassigned';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Schedule</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            onClick={() => {}} // This would open a filter modal
          >
            Filter
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/schedule/create')}
          >
            Create Shift
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="animate-fade-in">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="filterClinic" className="block text-sm font-medium text-neutral-700 mb-1">
              Department
            </label>
            <select
              id="filterClinic"
              className="block w-full sm:w-48 rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
            >
              <option value="all">All Departments</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full sm:w-auto">
            <label htmlFor="filterRoom" className="block text-sm font-medium text-neutral-700 mb-1">
              Duty Position
            </label>
            <select
              id="filterRoom"
              className="block w-full sm:w-48 rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              disabled={filterClinic === 'all'}
            >
              <option value="all">All Positions</option>
              {rooms
                .filter(room => filterClinic === 'all' || room.clinicId === filterClinic)
                .map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))
              }
            </select>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-smooth p-6 flex justify-center">
          <p className="text-neutral-500">Loading schedule...</p>
        </div>
      ) : (
        <MonthCalendar
          shifts={filteredShifts}
          users={users}
          onShiftClick={handleShiftClick}
          onDateClick={handleDateClick}
        />
      )}

      {/* Shift details/edit panel */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-20 overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/20" onClick={handleCloseDetails}></div>
          
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg">
              <div className="h-full flex flex-col bg-white shadow-xl animate-slide-up">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-neutral-800">
                    {isEditMode
                      ? selectedShift ? 'Edit Shift' : 'Create Shift'
                      : 'Shift Details'}
                  </h2>
                  <button 
                    onClick={handleCloseDetails}
                    className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {error && (
                    <div className="mb-4 bg-error-50 border border-error-200 rounded-md p-3 flex items-start">
                      <AlertCircle className="text-error-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
                      <p className="text-sm text-error-800">{error}</p>
                    </div>
                  )}
                  
                  {isEditMode ? (
                    <ShiftForm
                      shift={selectedShift || undefined}
                      rooms={rooms}
                      users={users}
                      onSubmit={handleUpdateShift}
                      onCancel={handleCloseDetails}
                      isLoading={isLoading}
                    />
                  ) : selectedShift && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Department</h3>
                        <p className="mt-1 text-neutral-800">{getClinicForRoom(selectedShift.roomId)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Duty Position</h3>
                        <p className="mt-1 text-neutral-800">
                          {rooms.find(r => r.id === selectedShift.roomId)?.name || 'Unknown'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Assigned Staff</h3>
                        <p className="mt-1 text-neutral-800">{getUserName(selectedShift.userId)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Start Date/Time</h3>
                          <p className="mt-1 text-neutral-800">
                            {format(parseISO(selectedShift.startDate), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">End Date/Time</h3>
                          <p className="mt-1 text-neutral-800">
                            {format(parseISO(selectedShift.endDate), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Status</h3>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedShift.status === ShiftStatus.DRAFT
                              ? 'bg-warning-100 text-warning-800'
                              : selectedShift.status === ShiftStatus.PUBLISHED
                              ? 'bg-success-100 text-success-800'
                              : selectedShift.status === ShiftStatus.COMPLETED
                              ? 'bg-neutral-100 text-neutral-800'
                              : 'bg-error-100 text-error-800'
                          }`}>
                            {selectedShift.status}
                          </span>
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Type</h3>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedShift.isEmergency
                              ? 'bg-error-100 text-error-800'
                              : 'bg-primary-100 text-primary-800'
                          }`}>
                            {selectedShift.isEmergency ? 'Emergency' : 'Regular'}
                          </span>
                        </p>
                      </div>
                      
                      {selectedShift.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500">Notes</h3>
                          <p className="mt-1 text-neutral-800">{selectedShift.notes}</p>
                        </div>
                      )}
                      
                      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-neutral-200">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditMode(true)}
                        >
                          Edit
                        </Button>
                        
                        {selectedShift.status === ShiftStatus.DRAFT && (
                          <Button
                            leftIcon={<Check size={16} />}
                            isLoading={publishingIds.includes(selectedShift.id)}
                            onClick={handlePublishShift}
                          >
                            Publish
                          </Button>
                        )}
                        
                        <Button
                          variant="danger"
                          onClick={handleDeleteShift}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;