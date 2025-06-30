import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  CreditCard, 
  Crown,
  ChevronDown,
  Shield,
  HelpCircle,
  Mail,
  ExternalLink,
  Zap,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  // List of searchable pages
  const searchPages = [
    { name: 'AI Content Generator', path: '/app/content' },
    { name: 'Voiceover Studio', path: '/app/voiceovers' },
    { name: 'AI Video Creator', path: '/app/videos' },
    { name: 'TrendRadar', path: '/app/trends' },
    { name: 'Campaign Marketplace', path: '/app/campaigns' },
    { name: 'Profile', path: '/app/profile' },
    { name: 'Billing', path: '/app/billing' },
    { name: 'Analytics', path: '/app/analytics' },
    { name: 'Settings', path: '/app/settings' },
    { name: 'Upgrade', path: '/app/upgrade' },
    { name: 'Dashboard', path: '/app/dashboard' },
  ];

  // Fuzzy filter
  const filteredPages = searchValue.trim()
    ? searchPages.filter(page => page.name.toLowerCase().includes(searchValue.toLowerCase()))
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDropdownItemClick = (href: string, isExternal = false) => {
    setShowDropdown(false);
    
    if (isExternal) {
      window.open(href, '_blank');
      return;
    }

    // Handle internal navigation
    if (href.startsWith('/app/') || href.startsWith('/')) {
      navigate(href);
    }
  };

  const dropdownItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/app/profile',
      description: 'Manage your profile',
      isExternal: false
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/app/settings',
      description: 'Account preferences',
      isExternal: false
    },
    {
      icon: Crown,
      label: 'Upgrade to Pro',
      href: '/app/upgrade',
      description: 'Unlock all features',
      highlight: !profile?.is_pro,
      isExternal: false
    },
    {
      icon: CreditCard,
      label: 'Billing & Plans',
      href: '/app/billing',
      description: 'Manage subscription & billing',
      isExternal: false
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      href: '/app/settings',
      description: 'Privacy settings',
      isExternal: false
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/contact',
      description: 'Get assistance',
      isExternal: false
    },
    {
      icon: Mail,
      label: 'Contact Us',
      href: '/contact',
      description: 'Send us a message',
      isExternal: false
    }
  ];

  // Get display name - prioritize full_name, fallback to email prefix, then 'User'
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    return profile?.id ? profile.id.substring(0, 8) : 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getDisplayName();
    if (!profile?.full_name && !profile?.email) return 'U';
    
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredPages.length > 0) {
      navigate(filteredPages[0].path);
      setShowResults(false);
      setSearchValue('');
    }
    if (e.key === 'ArrowDown') {
      // Optionally: focus first result
      e.preventDefault();
      const firstResult = document.getElementById('search-result-0');
      if (firstResult) firstResult.focus();
    }
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setSearchValue('');
  };

  return (
    <motion.header 
      className="bg-white shadow-sm border-b border-gray-200 relative"
      style={{ 
        zIndex: 999999,
        position: 'relative'
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/30 to-secondary-50/30"></div>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 relative z-10">
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button - ALWAYS visible with ULTRA HIGH z-index */}
          <motion.button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors relative bg-white shadow-sm border border-gray-200"
            style={{ 
              zIndex: 9999999,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5 text-gray-700" style={{ zIndex: 9999999 }} />
          </motion.button>
          
          <div className="hidden md:flex items-center space-x-4">
            <motion.div 
              className="relative"
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <motion.input
                type="text"
                placeholder="Search content, campaigns..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
                value={searchValue}
                onChange={e => {
                  setSearchValue(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 100)}
                onKeyDown={handleSearchKeyDown}
              />
              {showResults && filteredPages.length > 0 && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {filteredPages.map((page, idx) => (
                    <button
                      key={page.path}
                      id={`search-result-${idx}`}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900"
                      onMouseDown={() => handleResultClick(page.path)}
                      tabIndex={0}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Made by bolt.new sticker */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
          <a 
            href="https://bolt.new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-b-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Zap className="h-3 w-3" />
            <span>Made by bolt.new</span>
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {/* Demo Mode Indicator */}
          {localStorage.getItem('isDemoUser') === 'true' && (
            <motion.div
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="h-3 w-3" />
              <span>Demo Mode</span>
            </motion.div>
          )}

          <motion.button 
            className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            ref={bellRef}
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell className="h-5 w-5" />
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <p className="text-black font-semibold mb-2">Notifications</p>
                <p className="text-gray-700 text-sm">No new notifications.</p>
              </div>
            )}
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="hidden sm:block text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </p>
                {subscriptionBadge && (
                  <div className={`flex items-center justify-center ${subscriptionBadge.bgColor} ${subscriptionBadge.textColor} text-xs px-2 py-0.5 rounded-full font-medium mt-1`}>
                    {profile?.subscription_tier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                    {subscriptionBadge.text}
                  </div>
                )}
              </motion.div>
              
              <motion.div
                className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium shadow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                {getInitials()}
              </motion.div>

              <motion.div
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <>
                  {/* Mobile backdrop - only show on mobile */}
                  <motion.div 
                    className="fixed inset-0 bg-black/40 md:hidden"
                    style={{ zIndex: 999998 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDropdown(false)}
                  />
                  
                  {/* Dropdown content - Ultra high z-index to appear above everything */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 overflow-hidden"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.15)',
                      position: 'fixed',
                      zIndex: 999999,
                      right: '1rem',
                      top: '4rem'
                    }}
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 to-secondary-50/80">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium shadow-lg">
                          {getInitials()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs text-gray-600">{profile?.email}</p>
                          {profile?.subscription_tier === 'studio' ? (
                            <div className="flex items-center space-x-1 mt-1">
                              <Crown className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Studio Member</span>
                            </div>
                          ) : profile?.subscription_tier === 'pro' ? (
                            <div className="flex items-center space-x-1 mt-1">
                              <Crown className="h-3 w-3 text-purple-500" />
                              <span className="text-xs text-purple-600 font-medium">Pro Member</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-3 h-3 bg-gray-400 rounded-full" />
                              <span className="text-xs text-gray-500">Free Plan</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Stats */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {profile?.follower_count?.toLocaleString() || '0'}
                          </p>
                          <p className="text-xs text-gray-500">Followers</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {profile?.niche ? '1' : '0'}
                          </p>
                          <p className="text-xs text-gray-500">Niche Focus</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 max-h-80 overflow-y-auto bg-white">
                      {dropdownItems.map((item, index) => (
                        <div key={index}>
                          <button
                            onClick={() => handleDropdownItemClick(item.href, item.isExternal)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50/80 transition-colors text-left ${
                              item.highlight ? 'bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border-l-4 border-yellow-400' : ''
                            }`}
                          >
                            <item.icon className={`h-5 w-5 ${
                              item.highlight ? 'text-yellow-600' : 'text-gray-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className={`font-medium ${
                                  item.highlight ? 'text-yellow-900' : 'text-gray-900'
                                }`}>
                                  {item.label}
                                </p>
                                {item.isExternal && (
                                  <ExternalLink className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              <p className={`text-xs ${
                                item.highlight ? 'text-yellow-700' : 'text-gray-500'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            {item.highlight && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                Upgrade
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 pt-2 bg-white">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-red-500">End your session</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}