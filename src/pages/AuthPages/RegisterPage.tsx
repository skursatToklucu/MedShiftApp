import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  position: string;
  department: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();
  
  const password = watch('password');
  
  const departments = [
    'Emergency',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Surgery',
    'Orthopedics',
    'Oncology',
    'Gynecology',
    'Psychiatry',
    'Radiology',
    'Administration',
  ];
  
  const positions = [
    'Doctor',
    'Resident',
    'Nurse',
    'Technician',
    'Administrator',
  ];
  
  const onSubmit = async (data: RegisterFormValues) => {
    setLocalError(null);
    
    if (data.password !== data.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      const userData: Partial<User> = {
        email: data.email,
        fullName: data.fullName,
        position: data.position,
        department: data.department,
      };
      
      await registerUser(userData, data.password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-8">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-smooth">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Create Account</h1>
          <p className="text-neutral-600">Join MedShift Hospital Scheduling System</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(error || localError) && (
            <div className="bg-error-50 border border-error-200 rounded-md p-3 flex items-start">
              <AlertCircle className="text-error-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p className="text-sm text-error-800">{error || localError}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className={`block w-full px-3 py-2 border ${
                errors.fullName ? 'border-error-300' : 'border-neutral-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              placeholder="John Doe"
              {...register('fullName', { required: 'Full name is required' })}
            />
            {errors.fullName && <p className="mt-1 text-sm text-error-600">{errors.fullName.message}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`block w-full px-3 py-2 border ${
                errors.email ? 'border-error-300' : 'border-neutral-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-neutral-700 mb-1">
                Position
              </label>
              <select
                id="position"
                className={`block w-full px-3 py-2 border ${
                  errors.position ? 'border-error-300' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                {...register('position', { required: 'Position is required' })}
              >
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.position && <p className="mt-1 text-sm text-error-600">{errors.position.message}</p>}
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
                Department
              </label>
              <select
                id="department"
                className={`block w-full px-3 py-2 border ${
                  errors.department ? 'border-error-300' : 'border-neutral-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                {...register('department', { required: 'Department is required' })}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-sm text-error-600">{errors.department.message}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`block w-full px-3 py-2 border ${
                errors.password ? 'border-error-300' : 'border-neutral-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`block w-full px-3 py-2 border ${
                errors.confirmPassword ? 'border-error-300' : 'border-neutral-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>}
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
            >
              Create Account
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;