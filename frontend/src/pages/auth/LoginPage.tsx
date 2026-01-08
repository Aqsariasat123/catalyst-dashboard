import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-redstone-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-redstone-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14" viewBox="0 0 40 40" fill="none">
                <path d="M8 32L16 8H22L14 32H8Z" fill="url(#redGradientLogin1)" />
                <path d="M18 32L26 8H32L24 32H18Z" fill="url(#redGradientLogin2)" />
                <defs>
                  <linearGradient id="redGradientLogin1" x1="12" y1="8" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="redGradientLogin2" x1="25" y1="8" x2="25" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Redstone Catalyst</h1>
              <p className="text-dark-400 text-sm">Task Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Manage Projects.<br />
            Track Time.<br />
            <span className="text-redstone-400">Deliver Excellence.</span>
          </h2>

          <p className="text-dark-400 text-lg max-w-md">
            The complete solution for software teams to manage tasks, track time, and deliver projects on time.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-dark-400 text-sm">Active Projects</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1.2K+</p>
              <p className="text-dark-400 text-sm">Tasks Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5K+</p>
              <p className="text-dark-400 text-sm">Hours Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
                <path d="M8 32L16 8H22L14 32H8Z" fill="url(#redGradientMobile1)" />
                <path d="M18 32L26 8H32L24 32H18Z" fill="url(#redGradientMobile2)" />
                <defs>
                  <linearGradient id="redGradientMobile1" x1="12" y1="8" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="redGradientMobile2" x1="25" y1="8" x2="25" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Redstone Catalyst</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-dark-400">
              Sign in to your account to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="p-4 bg-redstone-500/10 border border-redstone-500/20 rounded-xl animate-fade-in">
                <p className="text-sm text-redstone-400">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 p-1 text-dark-400 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-redstone-500 focus:ring-gray-400 focus:ring-offset-0"
                />
                <span className="text-sm text-dark-400">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-redstone-400 hover:text-redstone-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-dark-800/50 border border-dark-700 rounded-xl">
            <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-dark-900/50 rounded-lg">
                <span className="text-dark-400">Admin</span>
                <code className="text-redstone-400 text-xs">admin@redstone.dev / admin123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-dark-900/50 rounded-lg">
                <span className="text-dark-400">Developer</span>
                <code className="text-redstone-400 text-xs">john@redstone.dev / dev123</code>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-dark-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-redstone-400 hover:text-redstone-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
