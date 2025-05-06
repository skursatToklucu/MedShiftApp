import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();
  
  const onSubmit = async (data: LoginFormValues) => {
    setLocalError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-smooth">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">MedShift</h1>
          <p className="text-neutral-600">Hospital Shift Scheduling System</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(error || localError) && (
            <div className="bg-error-50 border border-error-200 rounded-md p-3 flex items-start">
              <AlertCircle className="text-error-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p className="text-sm text-error-800">{error || localError}</p>
            </div>
          )}
          
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
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className={`block w-full px-3 py-2 border ${
                errors.password ? 'border-error-300' : 'border-neutral-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>}
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
            >
              Sign in
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
                Register
              </Link>
            </p>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-xs text-center text-neutral-500">
            For demo purposes:<br />
            Email: admin@hospital.com<br />
            Password: any (demo mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;