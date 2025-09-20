import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Lightbulb, 
  Mic, 
  Video,
  Briefcase, 
  Crown,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Zap,
  Play,
  Users,
  Star,
  Award,
  Target,
  Mail,
  X,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { tavusService } from '../../lib/tavus';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { profile, emailVerified, resendVerificationEmail, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    contentGenerated: 0,
    voiceoversCreated: 0,
    videosCreated: 0,
    campaignsApplied: 0,
    trendsViewed: 0,
  });
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    // Send weekly Tavus message (this would typically be done via a cron job)
    if (profile?.niche) {
      tavusService.sendWeeklyMessage(
        profile.id, 
        profile.niche, 
        profile.full_name
      );
    }
    setIsDemoUser(localStorage.getItem('isDemoUser') === 'true');
  }, [profile]);

  const loadDashboardStats = async () => {
    if (!profile) return;

    try {
      const [contentData, voiceoverData, applicationData] = await Promise.all([
        supabase
          .from('generated_content')
          .select('id')
          .eq('user_id', profile.id),
        supabase
          .from('voiceovers')
          .select('id')
          .eq('user_id', profile.id),
        supabase
          .from('campaign_applications')
          .select('id')
          .eq('creator_id', profile.id),
      ]);

      setStats({
        contentGenerated: contentData.data?.length || 0,
        voiceoversCreated: voiceoverData.data?.length || 0,
        videosCreated: 3, // Mock data for videos
        campaignsApplied: applicationData.data?.length || 0,
        trendsViewed: 12, // This would be tracked in analytics
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/app/upgrade');
  };

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleDismissEmailBanner = () => {
    setShowEmailBanner(false);
  };

  const quickActions = [
    {
      title: 'Smart Formating ',
      description: 'Create scripts, captions, and ideas with GPT-4',
      icon: Lightbulb,
      href: '/app/content',
      color: 'from-gray-400 via-white to-gray-300',
      features: ['YouTube Scripts', 'Instagram Captions', 'Hashtag Suggestions', 'Content Ideas']
    },
    {
      title: 'Voiceover Studio',
      description: 'Turn text into professional audio with ElevenLabs',
      icon: Mic,
      href: '/app/voiceovers',
      color: 'from-gray-500 via-white to-gray-400',
      features: ['Multiple Voices', 'High Quality Audio', 'Download & Share', 'Custom Scripts']
    },
    {
      title: 'AI Video Creator',
      description: 'Generate videos with AI avatars using Tavus',
      icon: Video,
      href: '/app/videos',
      color: 'from-gray-600 via-white to-gray-500',
      features: ['AI Avatars', 'Custom Backgrounds', 'Auto Subtitles', 'Professional Quality']
    },
    {
      title: 'TrendRadar',
      description: 'Discover trending topics with AI insights',
      icon: TrendingUp,
      href: '/app/trends',
      color: 'from-gray-700 via-white to-gray-600',
      features: ['Trending Topics', 'Niche Analysis', 'Content Opportunities', 'Market Insights']
    },
    {
      title: 'ATS Resume Checker',
      description: 'Analyze your resume against job descriptions',
      icon: Briefcase,
      href: '/app/campaigns',
      color: 'from-gray-800 via-white to-gray-700',
      features: ['ATS Score', 'Keyword Matching', 'Improvement Suggestions', 'Refined Resume PDF']
    },
  ];

  const statCards = [
    {
      title: 'Content Generated',
      value: stats.contentGenerated,
      icon: Lightbulb,
      color: 'text-white',
      bgColor: 'bg-white/10',
      change: '+12%',
    },
    {
      title: 'Voiceovers Created',
      value: stats.voiceoversCreated,
      icon: Mic,
      color: 'text-white',
      bgColor: 'bg-white/10',
      change: '+8%',
    },
    {
      title: 'AI Videos Made',
      value: stats.videosCreated,
      icon: Video,
      color: 'text-white',
      bgColor: 'bg-white/10',
      change: '+25%',
    },
    {
      title: 'Campaigns Applied',
      value: stats.campaignsApplied,
      icon: Briefcase,
      color: 'text-white',
      bgColor: 'bg-white/10',
      change: '+15%',
    },
    {
      title: 'Trends Explored',
      value: stats.trendsViewed,
      icon: TrendingUp,
      color: 'text-white',
      bgColor: 'bg-white/10',
      change: '+18%',
    },
  ];

  const recentActivity = [
    {
      type: 'content',
      title: 'Instagram Caption Ideas',
      description: 'Generated 5 engaging captions for fitness content',
      time: '2 hours ago',
      icon: Lightbulb,
      color: 'text-white'
    },
    {
      type: 'voiceover',
      title: 'Workout Motivation Script',
      description: 'Created professional voiceover for YouTube intro',
      time: '1 day ago',
      icon: Mic,
      color: 'text-white'
    },
    {
      type: 'trend',
      title: 'Fitness Trends Analysis',
      description: 'Discovered 3 trending workout formats',
      time: '2 days ago',
      icon: TrendingUp,
      color: 'text-white'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isDemoUser && (
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 shadow-sm mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Demo Mode Active
                </h3>
                <p className="text-xs text-gray-600">
                  You're exploring CareerCraft in demo mode. Features are locked - sign up to unlock everything!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => navigate('/signin')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Up
              </motion.button>
              <button
                onClick={async () => {
                  localStorage.removeItem('isDemoUser');
                  try {
                    await signOut();
                    navigate('/');
                  } catch (error) {
                    console.error('Error signing out:', error);
                    // Still navigate even if signOut fails
                    navigate('/');
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Email Verification Banner */}
      {!emailVerified && showEmailBanner && !isDemoUser && (
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Verify your email address
                </h3>
                <p className="text-gray-600 mb-4">
                  We sent a verification email to <span className="font-medium">{profile?.email}</span>. 
                  Please check your inbox and click the verification link to complete your account setup.
                </p>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={handleResendVerificationEmail}
                    disabled={resendingEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {resendingEmail ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>Resend Email</span>
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={handleDismissEmailBanner}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismissEmailBanner}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="text-gray-400 mt-1">Here's your CareerCraft dashboard.</p>
        </div>
        {!profile?.is_pro && (
          <motion.button
            onClick={handleUpgradeClick}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Pro</span>
          </motion.button>
        )}
      </motion.div>

      {/* Upgrade banner - only show for non-pro users */}
      {!profile?.is_pro && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/10 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Unlock Your Full Potential</h2>
              <p className="text-purple-200 mt-1">Go Pro to access unlimited content generation, premium features, and priority support.</p>
            </div>
          </div>
          <motion.button
            onClick={handleUpgradeClick}
            className="flex-shrink-0 flex items-center space-x-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>View Pro Plans</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index} 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              y: -5,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <motion.p 
                  className="text-3xl font-bold text-gray-900 mt-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                >
                  {stat.value}
                </motion.p>
                <motion.p 
                  className="text-xs text-green-600 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  {stat.change} from last week
                </motion.p>
              </div>
              <motion.div 
                className={`p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <stat.icon className={`h-6 w-6 text-white`} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Creator Tools</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
              role="button"
              tabIndex={0}
              aria-label={action.title}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 block relative overflow-hidden h-full cursor-pointer focus:ring-2 focus:ring-primary-500"
              onClick={() => { if (!isDemoUser) navigate(action.href); }}
              onKeyDown={e => { if (!isDemoUser && (e.key === 'Enter' || e.key === ' ')) navigate(action.href); }}
            >
              {/* Demo overlay for interactive elements */}
              {isDemoUser && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Demo Mode</p>
                    <p className="text-xs text-gray-500">Sign up to unlock this feature</p>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <motion.div 
                className="inline-flex p-3 rounded-lg bg-blue-600 mb-4 relative z-10 shadow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <action.icon className="h-6 w-6 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 relative z-10">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 relative z-10">
                {action.description}
              </p>
              
              <div className="space-y-2 mb-4 relative z-10">
                {action.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              <motion.div 
                className="flex items-center text-blue-600 group-hover:text-blue-700 relative z-10"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium">
                  {isDemoUser ? 'Locked in Demo' : 'Get started'}
                </span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link 
              to="/app/content" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="flex-shrink-0"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Trending Now</h3>
            <Link 
              to="/app/trends" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Explore
            </Link>
          </div>
          <div className="space-y-4">
            {[
              'Short-form educational content',
              'Behind-the-scenes vlogs',
              'Quick productivity tips',
              'AI-generated thumbnails',
              'Interactive Q&A sessions'
            ].map((trend, index) => (
              <motion.div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="flex-shrink-0"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{trend}</p>
                  <p className="text-xs text-gray-500">Trending up 🔥</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Start Guide - Only show for free users */}
      {!profile?.is_pro && (
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
          variants={itemVariants}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                New to CareerCraft? Start here!
              </h3>
              <p className="text-gray-600 mb-4">
                Follow these steps to get the most out of your AI-powered creator toolkit.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm text-gray-700">Complete your profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm text-gray-700">Generate your first content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm text-gray-700">Explore brand campaigns</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}