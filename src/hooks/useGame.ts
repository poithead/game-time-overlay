import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game, TeamData, GameCard } from '@/types/game';

export function useGame(userId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGame = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setGame(data as unknown as Game);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Realtime subscription
  useEffect(() => {
    if (!game?.id) return;
    const channel = supabase
      .channel(`game-${game.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${game.id}`,
      }, (payload) => {
        setGame(payload.new as unknown as Game);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [game?.id]);

  const createGame = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('games')
      .insert({ owner_id: userId })
      .select()
      .single();
    if (data) setGame(data as unknown as Game);
    return data;
  };

  const updateGame = async (updates: Partial<Record<string, unknown>>) => {
    if (!game?.id) return;
    await supabase.from('games').update(updates).eq('id', game.id);
  };

  const updateTeam = async (side: 'home_team' | 'away_team', updates: Partial<TeamData>) => {
    if (!game) return;
    const current = game[side];
    const merged = { ...current, ...updates };
    await updateGame({ [side]: merged });
  };

  const addScore = async (side: 'home_team' | 'away_team', scoreType: 'field_goals' | 'penalty_corners_converted' | 'penalty_strokes_converted') => {
    if (!game || game.is_match_ended) return;
    const team = game[side];
    const updates: Partial<TeamData> = {
      score: team.score + 1,
      [scoreType]: (team[scoreType] as number) + 1,
    };
    await updateTeam(side, updates);
  };

  const addPenaltyStat = async (side: 'home_team' | 'away_team', stat: 'penalty_corners_awarded' | 'penalty_strokes_awarded') => {
    if (!game || game.is_match_ended) return;
    const team = game[side];
    await updateTeam(side, { [stat]: (team[stat] as number) + 1 });
  };

  const addCard = async (side: 'home_team' | 'away_team', type: GameCard['type']) => {
    if (!game || game.is_match_ended) return;
    const team = game[side];
    const durations: Record<string, number> = { green: 120, yellow: 300 };
    const card: GameCard = {
      type,
      id: crypto.randomUUID(),
      ...(type !== 'red' ? { expires_at: new Date(Date.now() + durations[type] * 1000).toISOString() } : {}),
    };
    await updateTeam(side, { cards: [...team.cards, card] });
  };

  const startPeriod = async () => {
    if (!game) return;
    const period = game.current_period === 0 ? 1 : game.current_period;
    await updateGame({
      current_period: period,
      is_timer_running: true,
      timer_started_at: new Date().toISOString(),
      is_match_ended: false,
    });
  };

  const stopPeriod = async () => {
    if (!game || !game.is_timer_running) return;
    const elapsed = game.timer_started_at
      ? Math.floor((Date.now() - new Date(game.timer_started_at).getTime()) / 1000)
      : 0;
    const remaining = Math.max(0, game.timer_remaining_sec - elapsed);
    await updateGame({
      is_timer_running: false,
      timer_remaining_sec: remaining,
      timer_started_at: null,
    });
  };

  const nextPeriod = async () => {
    if (!game) return;
    const maxPeriods = game.game_format.type === 'quarters' ? 4 : 2;
    const next = game.current_period + 1;
    if (next > maxPeriods) {
      await updateGame({ is_match_ended: true, is_timer_running: false, timer_started_at: null });
    } else {
      await updateGame({
        current_period: next,
        timer_remaining_sec: game.game_format.duration_sec,
        is_timer_running: false,
        timer_started_at: null,
      });
    }
  };

  const endMatch = async () => {
    if (!game) return;
    await updateGame({ is_match_ended: true, is_timer_running: false, timer_started_at: null });
  };

  const resetGame = async () => {
    if (!game) return;
    const { defaultTeam } = await import('@/types/game');
    await updateGame({
      home_team: defaultTeam('home'),
      away_team: defaultTeam('away'),
      current_period: 0,
      timer_remaining_sec: game.game_format.duration_sec,
      is_timer_running: false,
      timer_started_at: null,
      is_match_ended: false,
      overlay_stats_visible: false,
    });
  };

  return {
    game, loading, createGame, updateGame, updateTeam,
    addScore, addPenaltyStat, addCard,
    startPeriod, stopPeriod, nextPeriod, endMatch, resetGame,
  };
}
