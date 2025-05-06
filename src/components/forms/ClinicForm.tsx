import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Clinic } from '../../types';
import Button from '../ui/Button';

interface ClinicFormProps {
  clinic?: Clinic;
  onSubmit: (data: Partial<Clinic>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ClinicForm: React.FC<ClinicFormProps> = ({
  clinic,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Partial<Clinic>>({
    defaultValues: clinic || {
      name: '',
      description: '',
      requiresWeekendCoverage: true,
      requiresHolidayCoverage: true,
      defaultShiftDuration: 24,
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Clinic Name*
        </label>
        <input
          id="name"
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-error-300' : 'border-neutral-300'
          } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
          {...register('name', { required: 'Clinic name is required' })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="defaultShiftDuration" className="block text-sm font-medium text-neutral-700">
            Default Shift Duration (hours)*
          </label>
          <input
            id="defaultShiftDuration"
            type="number"
            min={1}
            max={48}
            className="mt-1 block w-full rounded-md border border-neutral-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('defaultShiftDuration', {
              required: 'Duration is required',
              min: { value: 1, message: 'Minimum duration is 1 hour' },
              max: { value: 48, message: 'Maximum duration is 48 hours' },
            })}
          />
          {errors.defaultShiftDuration && (
            <p className="mt-1 text-sm text-error-600">{errors.defaultShiftDuration.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center">
          <Controller
            name="requiresWeekendCoverage"
            control={control}
            render={({ field }) => (
              <input
                id="requiresWeekendCoverage"
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            )}
          />
          <label htmlFor="requiresWeekendCoverage" className="ml-2 block text-sm text-neutral-700">
            Requires weekend coverage
          </label>
        </div>

        <div className="flex items-center">
          <Controller
            name="requiresHolidayCoverage"
            control={control}
            render={({ field }) => (
              <input
                id="requiresHolidayCoverage"
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            )}
          />
          <label htmlFor="requiresHolidayCoverage" className="ml-2 block text-sm text-neutral-700">
            Requires holiday coverage
          </label>
        </div>
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
          {clinic ? 'Update Clinic' : 'Create Clinic'}
        </Button>
      </div>
    </form>
  );
};

export default ClinicForm;