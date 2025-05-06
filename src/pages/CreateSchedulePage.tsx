import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { useShiftStore } from '../stores/shiftStore';
import { useClinicStore } from '../stores/clinicStore';
import { addDays, format, startOfMonth } from 'date-fns';
import ShiftForm from '../components/forms/ShiftForm';

const CreateSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as { state?: { date?: Date } };
  
  const { shifts, users, fetchShifts, fetchUsers, createShift, generateSchedule, error } = useShiftStore();
  const { rooms, clinics, fetchRooms, fetchClinics } = useClinicStore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(state?.date || new Date());
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [generationType, setGenerationType] = useState<'manual' | 'auto'>('manual');
  const [generationDays, setGenerationDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  
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
  
  const handleCreateShift = async (data: any) => {
    try {
      await createShift(data);
      setSuccess('Shift created successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reset form or navigate
      navigate('/schedule');
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleGenerateSchedule = async () => {
    if (!selectedClinic) return;
    
    setIsGenerating(true);
    try {
      // In a real app, this would send the parameters to the backend
      await generateSchedule(selectedClinic, selectedDate, generationDays);
      setSuccess('Schedule generated successfully');
      setTimeout(() => setSuccess(''), 3000);
      navigate('/schedule');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Create Schedule</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/schedule')}
        >
          Cancel
        </Button>
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
      
      <Card title="Schedule Creation Method">
        <div className="space-y-4">
          <div>
            <p className="text-neutral-700">Choose how you want to create the schedule:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${
                generationType === 'manual' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-300 hover:border-primary-300'
              }`}
              onClick={() => setGenerationType('manual')}
            >
              <h3 className="font-medium text-neutral-800 mb-2">Manual Assignment</h3>
              <p className="text-sm text-neutral-600">Create a single shift with specific details.</p>
            </div>
            
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${
                generationType === 'auto' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-300 hover:border-primary-300'
              }`}
              onClick={() => setGenerationType('auto')}
            >
              <h3 className="font-medium text-neutral-800 mb-2">Auto Generate</h3>
              <p className="text-sm text-neutral-600">Generate multiple shifts automatically based on rules.</p>
            </div>
          </div>
        </div>
      </Card>
      
      {generationType === 'manual' ? (
        <Card title="Manual Shift Assignment">
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : (
            <ShiftForm
              rooms={rooms}
              users={users}
              onSubmit={handleCreateShift}
              onCancel={() => navigate('/schedule')}
              isLoading={isLoading}
            />
          )}
        </Card>
      ) : (
        <Card title="Auto Generate Schedule">
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="clinic" className="block text-sm font-medium text-neutral-700 mb-1">
                  Department*
                </label>
                <select
                  id="clinic"
                  className="block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  required
                >
                  <option value="">Select a department</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
                    Start Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-neutral-500" />
                    </div>
                    <input
                      id="startDate"
                      type="date"
                      className="pl-10 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-neutral-700 mb-1">
                    Number of Days*
                  </label>
                  <input
                    id="days"
                    type="number"
                    min={1}
                    max={90}
                    className="block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={generationDays}
                    onChange={(e) => setGenerationDays(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <div className="bg-primary-50 border border-primary-100 rounded-md p-3">
                  <h4 className="text-sm font-semibold text-primary-800 mb-1">Schedule will generate based on:</h4>
                  <ul className="text-sm text-primary-700 ml-5 list-disc">
                    <li>Fair distribution of shifts among staff</li>
                    <li>Rest day after each shift</li>
                    <li>No overlapping shifts for any staff member</li>
                    <li>Department-specific requirements</li>
                    <li>Staff availability and specialties</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/schedule')}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  isLoading={isGenerating}
                  onClick={handleGenerateSchedule}
                  disabled={!selectedClinic}
                >
                  Generate Schedule
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default CreateSchedulePage;