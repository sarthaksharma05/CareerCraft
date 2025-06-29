import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
}

interface AuthFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export function AuthForm({ onBack, onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, createDemoUser, signInDemoUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        if (!data.fullName) {
          throw new Error('Full name is required');
        }
        await signUp(data.email, data.password, data.fullName);
        
        // After successful signup, try to sign in the user
        try {
          await signIn(data.email, data.password);
          toast.success('Account created successfully! Welcome to CreatorCopilot!');
          localStorage.removeItem('isDemoUser');
          navigate('/app/dashboard');
        } catch (signInError: any) {
          // If sign in fails due to email confirmation, show helpful message and switch to signin
          if (signInError.message?.includes('Email not confirmed')) {
            toast.success('Account created! Please check your email and click the verification link, then sign in.');
            setIsSignUp(false); // Switch to sign in mode
            reset(); // Clear the form
            return;
          } else {
            throw signInError; // Re-throw other sign in errors
          }
        }
      } else {
        await signIn(data.email, data.password);
        toast.success('Welcome back to CreatorCopilot!');
        if (data.email === 'demo@creatorcopilot.com') {
          localStorage.setItem('isDemoUser', 'true');
        } else {
          localStorage.removeItem('isDemoUser');
        }
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Authentication failed';
      
      if (error.message?.includes('Invalid login credentials')) {
        if (isSignUp) {
          errorMessage = 'Failed to create account. Please try again.';
        } else {
          errorMessage = 'Invalid email or password. Please check your credentials or sign up for a new account.';
        }
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  // Demo credentials helper
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      console.log('🔐 Attempting demo login...');
      
      // Use the specialized demo sign-in function
      const result = await signInDemoUser();
      console.log('✅ Demo login successful:', result);
      localStorage.setItem('isDemoUser', 'true');
      toast.success('Logged in as Demo User!');
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('❌ Demo login failed:', error);
      console.error('Error details:', error.message);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to log in as Demo User';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Demo user credentials are invalid. Please check if the demo user exists in your database.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Demo user email not confirmed. Please verify the demo user in your Supabase dashboard.';
      } else if (error.message?.includes('Demo user email needs confirmation')) {
        errorMessage = 'Demo user email needs confirmation. Please check your Supabase dashboard and confirm the demo user email manually.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (error.message?.includes('Supabase not configured')) {
        errorMessage = 'Supabase is not configured. Please check your environment variables.';
      } else {
        errorMessage = `Demo login failed: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-bounce-soft"></div>
      </div>

      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </motion.button>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="flex justify-center mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="bg-gradient-to-r from-white to-gray-300 p-4 rounded-2xl">
                <Sparkles className="h-10 w-10 text-black" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-200">
              {isSignUp 
                ? 'Join CreatorCopilot and start your AI-powered creator journey' 
                : 'Sign in to access your creative workspace'
              }
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="fullName" className="sr-only">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    {...register('fullName', { 
                      required: isSignUp ? 'Full name is required' : false 
                    })}
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-md transition-all"
                    placeholder="Full name"
                  />
                </div>
                {errors.fullName && (
                  <motion.p 
                    className="mt-2 text-sm text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.fullName.message}
                  </motion.p>
                )}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-md transition-all"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <motion.p 
                  className="mt-2 text-sm text-red-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 placeholder-gray-300 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-md transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  className="mt-2 text-sm text-red-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-white to-gray-300 text-black py-4 rounded-xl font-semibold hover:from-gray-100 hover:to-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>

            {/* Demo Credentials Button */}
            <motion.button
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-white/5 border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Try Demo Credentials'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <motion.button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-white font-semibold hover:underline transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </motion.button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}