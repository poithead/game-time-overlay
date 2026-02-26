import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

export function useGameRealtime(gameId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      if (data) setGame(data as unknown as Game);
      setLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`overlay-${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        setGame(payload.new as unknown as Game);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameId]);

  return { game, loading };
}
