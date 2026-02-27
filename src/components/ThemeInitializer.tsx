import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const applyAppTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('app_theme')
          .eq('id', user.id)
          .single();

        const isDark = (profile?.app_theme as string | null) === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
      } catch (err) {
        console.error('App theme load error:', err);
        // fallback to dark
        document.documentElement.classList.add('dark');
      }
    };

    applyAppTheme();

    // Re-apply on auth changes (login/logout/refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      applyAppTheme();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
};

export default ThemeInitializer;