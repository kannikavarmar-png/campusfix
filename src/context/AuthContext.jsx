import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEMO_USERS } from '../lib/demoData';

const AuthContext = createContext(null);
const DEMO_USER_STORAGE_KEY = 'campusfix_demo_active_user';
const FORCE_DEMO_KEY = 'campusfix_force_demo_mode';

export function AuthProvider({ children }) {
  const [forceDemoMode, setForceDemoMode] = useState(() => {
    if (!isSupabaseConfigured) return true;
    return localStorage.getItem(FORCE_DEMO_KEY) === 'true';
  });

  const isDemoMode = !isSupabaseConfigured || forceDemoMode;

  const [user, setUser] = useState(() => {
    if (!isSupabaseConfigured || localStorage.getItem(FORCE_DEMO_KEY) === 'true') {
      try {
        const saved = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => isSupabaseConfigured && !forceDemoMode);

  const loadSupabaseProfile = useCallback(async (authUser) => {
    if (!authUser || !supabase) {
      setUser(null);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', authUser.id)
      .maybeSingle();

    setUser({
      id: authUser.id,
      email: authUser.email,
      name:
        profile?.name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Campus Member',
      role: profile?.role || 'student',
    });
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        if (data?.session?.user) {
          return loadSupabaseProfile(data.session.user);
        }
        setUser(null);
        return undefined;
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadSupabaseProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [isDemoMode, loadSupabaseProfile]);

  const signInLive = async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Use Demo Mode or add Supabase keys to .env.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await loadSupabaseProfile(data.user);
    return data.user;
  };

  const signUpLive = async ({ name, email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Use Demo Mode or add Supabase keys to .env.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), role: 'student' },
      },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      await loadSupabaseProfile(data.user);
    }
    return data;
  };

  const signInDemo = (roleKey = 'student') => {
    const selected = DEMO_USERS[roleKey] || DEMO_USERS.student;
    setForceDemoMode(true);
    localStorage.setItem(FORCE_DEMO_KEY, 'true');
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(selected));
    setUser(selected);
    return selected;
  };

  const exitDemoToLive = () => {
    if (!isSupabaseConfigured) return;
    localStorage.removeItem(FORCE_DEMO_KEY);
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setForceDemoMode(false);
    setUser(null);
  };

  const signOut = async () => {
    if (!isDemoMode && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isDemoMode,
    isSupabaseConfigured,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    signInLive,
    signUpLive,
    signInDemo,
    exitDemoToLive,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
