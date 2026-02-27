import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

export function useGamesList(userId: string | undefined) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setGames(data as unknown as Game[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Realtime subscription for list updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`games-list-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `owner_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newGame = payload.new as unknown as Game;
          setGames(prev => [newGame, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedGame = payload.new as unknown as Game;
          setGames(prev => prev.map(g => g.id === updatedGame.id ? updatedGame : g));
        } else if (payload.eventType === 'DELETE') {
          const deletedGame = payload.old as unknown as Game;
          setGames(prev => prev.filter(g => g.id !== deletedGame.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const deleteGame = async (gameId: string) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);
    
    if (!error) {
      setGames(prev => prev.filter(g => g.id !== gameId));
    }
  };

  const addGame = (game: Game) => {
    setGames(prev => [game, ...prev]);
  };

  return { games, loading, deleteGame, addGame };
}
