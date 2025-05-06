import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Request, RequestType, RequestStatus, User, Shift } from '../../types';
import Button from '../ui/Button';
import { format } from 'date-fns';

interface RequestFormProps {
  request?: Request;
  shifts?: Shift[];
  users?: User[];
  currentUserId: string;
  onSubmit: (data: Partial<Request>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({
  request,
  shifts = [],
  users = [],
  currentUserId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Partial<Request>>({
    defaultValues: request || {
      userId: currentUserId,
      type: RequestType.LEAVE,
      status: RequestStatus.PENDING,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const requestType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-neutral-700">
          Request Type*
        </label>
        <select
          id="type"
          className={`mt-1 block w-full rounded-md border ${
            errors.type ? 'border-error-300' : 'border-neutral-300'
          } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          {...register('type', { required: 'Request type is required' })}
        >
          <option value={RequestType.LEAVE}>Leave Request</option>
          <option value={RequestType.SWAP}>Shift Swap</option>
          <option value={RequestType.PREFERENCE}>Scheduling Preference</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
        )}
      </div>

      {requestType === RequestType.SWAP && (
        <>
          <div>
            <label htmlFor="shiftId" className="block text-sm font-medium text-neutral-700">
              Shift to Swap*
            </label>
            <select
              id="shiftId"
              className={`mt-1 block w-full rounded-md border ${
                errors.swapShiftId ? 'border-error-300' : 'border-neutral-300'
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              {...register('swapShiftId', {
                required: requestType === RequestType.SWAP ? 'Shift selection is required for swaps' : false,
              })}
            >
              <option value="">Select your shift</option>
              {shifts
                .filter(shift => shift.userId === currentUserId)
                .map((shift) => {
                  const startDate = new Date(shift.startDate);
                  return (
                    <option key={shift.id} value={shift.id}>
                      {format(startDate, 'MMM dd, yyyy')} - Room: {shift.roomId}
                    </option>
                  );
                })}
            </select>
            {errors.swapShiftId && (
              <p className="mt-1 text-sm text-error-600">{errors.swapShiftId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="swapWithUserId" className="block text-sm font-medium text-neutral-700">
              Swap With (Optional)
            </label>
            <select
              id="swapWithUserId"
              className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              {...register('swapWithUserId')}
            >
              <option value="">Select a colleague (or leave empty to find any volunteer)</option>
              {users
                .filter(user => user.id !== currentUserId)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.position}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">
            Start Date*
          </label>
          <input
            id="startDate"
            type="date"
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
            End Date*
          </label>
          <input
            id="endDate"
            type="date"
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
        <label htmlFor="reason" className="block text-sm font-medium text-neutral-700">
          Reason / Details
        </label>
        <textarea
          id="reason"
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Please provide details about your request"
          {...register('reason')}
        />
      </div>

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
          {request ? 'Update Request' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default RequestForm;