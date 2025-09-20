import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Lightbulb, 
  Mic, 
  Video,
  TrendingUp, 
  Briefcase, 
  User, 
  Settings,
  Crown,
  Sparkles,
  LogOut,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'AI Content', href: '/app/content', icon: Lightbulb },
    { name: 'Voiceovers', href: '/app/voiceovers', icon: Mic },
    { name: 'AI Videos', href: '/app/videos', icon: Video },
    { name: 'TrendRadar', href: '/app/trends', icon: TrendingUp },
    { name: 'ATS Checker', href: '/app/campaigns', icon: Briefcase },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/app/profile', icon: User },
    { name: 'Billing', href: '/app/billing', icon: CreditCard },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    onClose(); // Close sidebar immediately for instant feedback
    try {
      await signOut();
      navigate('/'); // Redirect to landing page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20
    }
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const isDemoUser = localStorage.getItem('isDemoUser') === 'true';

  // Get subscription badge color and text
  const getSubscriptionBadge = () => {
    if (!profile) return null;
    
    if (profile.subscription_tier === 'studio') {
      return {
        text: 'Studio',
        bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-white'
      };
    } else if (profile.subscription_tier === 'pro') {
      return {
        text: 'Pro',
        bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textColor: 'text-white'
      };
    } else {
      return {
        text: 'Free Plan',
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-700'
      };
    }
  };

  const subscriptionBadge = getSubscriptionBadge();

  // Only render sidebar when it should be visible
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        style={{ zIndex: 999998 }} // High z-index but below sidebar
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sidebar - FIXED position, no space reserved in layout */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl"
        style={{ zIndex: 999999 }} // Ultra high z-index to appear above everything
        variants={sidebarVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <motion.div 
            className="flex h-16 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
            <motion.div 
              className="flex flex-col items-center space-y-1 relative z-10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <span className="text-xl font-bold text-white">CareerCraft</span>
              </motion.div>
              
              {/* Demo Mode Indicator */}
              {localStorage.getItem('isDemoUser') === 'true' && (
                <motion.div
                  className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Demo Mode</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* User Profile Section */}
          {profile && (
            <motion.div
              className="px-4 py-3 border-b border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium shadow-sm">{profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}</div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile.full_name || profile.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
              </div>
              
              {/* Subscription Badge */}
              {subscriptionBadge && (
                <div className={`mt-2 flex items-center justify-center ${subscriptionBadge.bgColor} ${subscriptionBadge.textColor} text-xs px-3 py-1 rounded-full font-medium`}>
                  {profile.subscription_tier !== 'free' && <Crown className="h-3 w-3 mr-1" />}
                  {subscriptionBadge.text}
                </div>
              )}
            </motion.div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <motion.div 
              className="space-y-2"
              variants={containerVariants}
              initial="closed"
              animate="open"
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDemoUser ? (
                    <div
                      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 opacity-60 cursor-not-allowed select-none pointer-events-none"
                      aria-disabled="true"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <motion.div
                            animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <item.icon className="h-5 w-5" />
                          </motion.div>
                          <span>{item.name}</span>
                          {isActive && (
                            <motion.div
                              className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </nav>

          {/* Pro Badge & Logout */}
          {profile && (
            <motion.div 
              className="border-t border-gray-200 p-4 space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
                  profile.subscription_tier === 'studio'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : profile.subscription_tier === 'pro'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={profile.subscription_tier !== 'free' ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Crown className="h-5 w-5" />
                </motion.div>
                <span className="text-sm font-medium">
                  {profile.subscription_tier === 'studio' 
                    ? 'Studio Member' 
                    : profile.subscription_tier === 'pro' 
                    ? 'Pro Member' 
                    : 'Free Plan'}
                </span>
              </motion.div>
              
              {profile.subscription_tier === 'free' && (
                <NavLink to="/app/upgrade">
                  <motion.button 
                    className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 text-sm font-medium text-white hover:from-primary-600 hover:to-secondary-600 transition-all shadow-sm"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={onClose}
                  >
                    Upgrade to Pro
                  </motion.button>
                </NavLink>
              )}

              {/* Logout Button */}
              <motion.button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}