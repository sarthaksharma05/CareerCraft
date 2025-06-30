import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  isProMember: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  resendVerificationEmail: () => Promise<void>;
  createDemoUser: () => Promise<void>;
  signInDemoUser: () => Promise<void>;
  signIn: (email, password) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          setInitialized(true);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setEmailVerified(!!session.user.email_confirmed_at);
          await fetchUserProfile(session.user.id, session.user.email || '');
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            setUser(session?.user ?? null);
            setEmailVerified(!!session?.user?.email_confirmed_at);
            if (session?.user) {
              await fetchUserProfile(session.user.id, session.user.email || '');
            } else {
              setProfile(null);
            }
            
            if (!initialized) {
              setLoading(false);
              setInitialized(true);
            }
          }
        );

        authSubscription = subscription;

        if (!initialized) {
          setLoading(false);
          setInitialized(true);
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return;
      }

      if (!profiles || profiles.length === 0) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: user?.user_metadata?.full_name || '',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) throw new Error("User not signed in");

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating your profile');
      return null;
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('No email address found for the current user.');
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw error;
  };

  const createDemoUser = async () => {
    // This is a placeholder for demo logic
    console.log("Creating demo user...");
  };

  const signInDemoUser = async () => {
    // This is a placeholder for demo logic
    console.log("Signing in demo user...");
  };

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user && emailVerified,
    emailVerified,
    isProMember: profile?.is_pro || false,
    isAdmin: profile?.is_admin || false,
    signOut,
    updateProfile,
    resendVerificationEmail,
    createDemoUser,
    signInDemoUser,
    signIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 