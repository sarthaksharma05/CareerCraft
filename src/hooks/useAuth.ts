import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      
      try {
        // Get initial session without aggressive timeout
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          setInitialized(true);
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
            email_confirmed_at: session.user.email_confirmed_at
          };
          
          setUser(authUser);
          setEmailVerified(!!session.user.email_confirmed_at);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          console.log('ℹ️ No existing session found');
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
            
            if (session?.user) {
              const authUser: AuthUser = {
                id: session.user.id,
                email: session.user.email || '',
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at,
                email_confirmed_at: session.user.email_confirmed_at
              };
              
              setUser(authUser);
              setEmailVerified(!!session.user.email_confirmed_at);
              await fetchUserProfile(session.user.id, session.user.email || '');
            } else {
              setUser(null);
              setProfile(null);
              setEmailVerified(false);
            }
            
            if (!initialized) {
              setLoading(false);
              setInitialized(true);
            }
          }
        );

        authSubscription = subscription;

        // Mark as initialized after setting up the listener
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

    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Safety net - ensure loading stops after reasonable time
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading && !initialized) {
        console.log('⏰ Safety timeout - ensuring auth initialization completes');
        setLoading(false);
        setInitialized(true);
      }
    }, 10000); // 10 seconds instead of 5

    return () => clearTimeout(safetyTimeout);
  }, [loading, initialized]);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // Check if the error is due to JWT expiration
        if (error.message?.includes('JWT expired') || error.code === 'PGRST301') {
          console.log('🔑 JWT expired, signing out user...');
          await signOut();
          return;
        }
        
        return;
      }

      // If no profile exists, create one
      if (!profiles || profiles.length === 0) {
        console.log('📝 Profile not found, creating default profile...');
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: '',
            avatar_url: null,
            niche: null,
            bio: null,
            social_links: {},
            follower_count: 0,
            is_pro: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          return;
        }

        console.log('✅ Profile created successfully:', newProfile?.email);
        setProfile(newProfile);
        return;
      }

      const profile = profiles[0];
      console.log('✅ Profile fetched successfully:', profile?.email);
      setProfile(profile);
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 Attempting to sign up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('❌ Signup error from Supabase:', error);
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw new Error(error.message || 'Failed to create account');
      }

      // Create profile if user was created successfully
      if (data.user) {
        console.log('👤 User created, creating profile...');
        
        // Wait a moment for the user to be fully created in auth
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName, // Use the provided full name
            avatar_url: null,
            niche: null,
            bio: null,
            social_links: {},
            follower_count: 0,
            is_pro: false
          });

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          // Don't throw here as the user was created successfully
        } else {
          console.log('✅ Profile created successfully with name:', fullName);
        }
      }

      console.log('✅ User created successfully:', email);
      
      // Note: The user can now sign in immediately, even if email is not confirmed
      // The email verification status will be tracked in the auth state
      return data;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error; // Re-throw the original error to preserve the message
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Signin error from Supabase:', error);
        // Provide more specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
        } else if (error.message?.includes('Email not confirmed')) {
          // For the new flow, we'll allow sign in but track verification status
          // The user will see a verification banner in the dashboard
          console.log('⚠️ User signed in but email not confirmed');
          // We'll still throw this error for now, but the AuthForm will handle it differently
          throw new Error('Email not confirmed');
        } else if (error.message?.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        throw new Error(error.message || 'Failed to sign in');
      }

      console.log('✅ User signed in successfully:', email);
      return data;
    } catch (error: any) {
      console.error('❌ Signin error:', error);
      throw error; // Re-throw the original error to preserve the message
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setProfile(null);

      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Signout error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) throw new Error('No user logged in');

    try {
      console.log('📝 Updating profile for user:', user.email);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // Check if the error is due to JWT expiration
        if (error.message?.includes('JWT expired') || error.code === 'PGRST301') {
          console.log('🔑 JWT expired during profile update, signing out user...');
          await signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        throw error;
      }

      console.log('✅ Profile updated successfully');
      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      console.log('📧 Resending verification email to:', user.email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) throw error;

      console.log('✅ Verification email sent successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error resending verification email:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const createDemoUser = async () => {
    try {
      console.log('👤 Creating demo user...');
      
      // First, try to sign up the demo user
      const { data, error } = await supabase.auth.signUp({
        email: 'demo@creatorcopilot.com',
        password: 'demo123456',
        options: {
          data: {
            full_name: 'Demo User'
          }
        }
      });

      if (error) {
        // If user already exists, that's fine
        if (error.message?.includes('User already registered')) {
          console.log('ℹ️ Demo user already exists');
          return { success: true, message: 'Demo user already exists' };
        }
        throw error;
      }

      if (data.user) {
        console.log('✅ Demo user created successfully');
        
        // Create profile for demo user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: 'demo@creatorcopilot.com',
            full_name: 'Demo User',
            avatar_url: null,
            niche: 'Technology',
            bio: 'Demo user for CreatorCopilot',
            social_links: {},
            follower_count: 1250,
            is_pro: false
          });

        if (profileError) {
          console.error('❌ Error creating demo profile:', profileError);
        } else {
          console.log('✅ Demo profile created successfully');
        }
      }

      return { success: true, message: 'Demo user created successfully' };
    } catch (error: any) {
      console.error('❌ Error creating demo user:', error);
      throw new Error(error.message || 'Failed to create demo user');
    }
  };

  const signInDemoUser = async () => {
    try {
      console.log('🔐 Attempting demo user sign in...');
      
      // For demo users, we'll use a different approach
      // First, ensure the demo user exists
      await createDemoUser();
      
      // Now try to sign in with the demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@creatorcopilot.com',
        password: 'demo123456'
      });

      if (error) {
        console.error('❌ Demo signin error:', error);
        
        // If email not confirmed, we need to handle this specially
        if (error.message?.includes('Email not confirmed')) {
          console.log('⚠️ Demo user email not confirmed, attempting to confirm...');
          
          // Try to confirm the email programmatically or handle this case
          // For now, we'll throw a more helpful error
          throw new Error('Demo user email needs confirmation. Please check your Supabase dashboard and confirm the demo user email manually.');
        }
        
        throw error;
      }

      console.log('✅ Demo user signed in successfully');
      return data;
    } catch (error: any) {
      console.error('❌ Demo signin failed:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    emailVerified,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendVerificationEmail,
    createDemoUser,
    signInDemoUser,
    isAuthenticated: !!user,
  };
}