import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Shift, Room, User, ShiftStatus } from '../../types';
import Button from '../ui/Button';
import { format } from 'date-fns';

interface ShiftFormProps {
  shift?: Shift;
  rooms: Room[];
  users: User[];
  onSubmit: (data: Partial<Shift>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  shift,
  rooms,
  users,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>(shift?.roomId || '');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<Partial<Shift>>({
    defaultValues: shift || {
      status: ShiftStatus.DRAFT,
      startDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      endDate: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
    },
  });

  const watchRoomId = watch('roomId');
  const selectedRoomData = rooms.find(room => room.id === watchRoomId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="roomId" className="block text-sm font-medium text-neutral-700">
          Duty Position*
        </label>
        <select
          id="roomId"
          className={`mt-1 block w-full rounded-md border ${
            errors.roomId ? 'border-error-300' : 'border-neutral-300'
          } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          {...register('roomId', { required: 'Duty position is required' })}
          onChange={(e) => setSelectedRoom(e.target.value)}
        >
          <option value="">Select a duty position</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="mt-1 text-sm text-error-600">{errors.roomId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-neutral-700">
          Assigned Staff*
        </label>
        <select
          id="userId"
          className={`mt-1 block w-full rounded-md border ${
            errors.userId ? 'border-error-300' : 'border-neutral-300'
          } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          {...register('userId', { required: 'Staff assignment is required' })}
        >
          <option value="">Select a staff member</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName} - {user.position}
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-error-600">{errors.userId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">
            Start Date/Time*
          </label>
          <input
            id="startDate"
            type="datetime-local"
            className={`mt-1 block w-full rounded-md border ${
              errors.startDate ? 'border-error-300' : 'border-neutral-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-error-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700">
            End Date/Time*
          </label>
          <input
            id="endDate"
            type="datetime-local"
            className={`mt-1 block w-full rounded-md border ${
              errors.endDate ? 'border-error-300' : 'border-neutral-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            {...register('endDate', { required: 'End date is required' })}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-error-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Any additional information"
          {...register('notes')}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-neutral-700">
          Status
        </label>
        <select
          id="status"
          className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('status')}
        >
          <option value={ShiftStatus.DRAFT}>Draft</option>
          <option value={ShiftStatus.PUBLISHED}>Published</option>
          <option value={ShiftStatus.COMPLETED}>Completed</option>
          <option value={ShiftStatus.CANCELLED}>Cancelled</option>
        </select>
      </div>

      {selectedRoomData?.isEmergency && (
        <div className="bg-warning-50 border border-warning-200 rounded-md p-3">
          <p className="text-sm text-warning-800">
            <strong>Note:</strong> This is an emergency duty position. The assigned staff will receive automatic post-duty leave for the following day.
          </p>
        </div>
      )}

      <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {shift ? 'Update Shift' : 'Create Shift'}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;