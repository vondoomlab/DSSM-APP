import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null);
  const [credits,      setCredits]      = useState(null);
  const [creditsError, setCreditsError] = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [loading,      setLoading]      = useState(true);

  const fetchCredits = useCallback(async (session) => {
    if (!session) { setCredits(null); setCreditsError(false); return; }
    setCreditsError(false);
    try {
      const res = await fetch('/api/user/credits', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.balance ?? 0);
        setIsAdmin(data.is_admin ?? false);
        setCreditsError(false);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('[AuthContext] credits fetch failed:', res.status, data);
        setCreditsError(true);
        setCredits(null);
      }
    } catch (err) {
      console.error('[AuthContext] credits fetch threw:', err.message);
      setCreditsError(true);
      setCredits(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchCredits(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchCredits(session);
    });

    return () => subscription.unsubscribe();
  }, [fetchCredits]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const signOut = () => supabase.auth.signOut();

  const refreshCredits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetchCredits(session);
  };

  return (
    <AuthContext.Provider value={{ user, credits, creditsError, isAdmin, loading, getToken, signOut, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
