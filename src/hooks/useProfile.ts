import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  app_theme: 'dark' | 'light';
  created_at: string;
  updated_at: string;
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as Profile);
      applyTheme((data.app_theme as 'dark' | 'light') || 'dark');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Realtime subscription for profile updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as Profile;
        setProfile(updated);
        applyTheme((updated.app_theme as 'dark' | 'light') || 'dark');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    if (!profile) return;
    const newTheme = profile.app_theme === 'dark' ? 'light' : 'dark';
    const { error } = await supabase
      .from('profiles')
      .update({ app_theme: newTheme })
      .eq('id', profile.id);
    
    if (!error) {
      setProfile({ ...profile, app_theme: newTheme });
      applyTheme(newTheme);
    }
  };

  return { profile, loading, toggleTheme };
}
