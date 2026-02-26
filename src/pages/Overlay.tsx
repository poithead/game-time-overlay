import { useParams } from 'react-router-dom';
import { useGameRealtime } from '@/hooks/useGameRealtime';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamData, GameCard } from '@/types/game';

function useCountdownTimer(
  timerRemaining: number,
  isRunning: boolean,
  startedAt: string | null
) {
  const [display, setDisplay] = useState(timerRemaining);

  useEffect(() => {
    if (!isRunning || !startedAt) {
      setDisplay(timerRemaining);
      return;
    }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setDisplay(Math.max(0, timerRemaining - elapsed));
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [timerRemaining, isRunning, startedAt]);

  return display;
}

function CardDisplay({ card }: { card: GameCard }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!card.expires_at) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(card.expires_at!).getTime() - Date.now()) / 1000));
      setRemaining(left);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [card.expires_at]);

  if (card.expires_at && remaining !== null && remaining <= 0) return null;

  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-600',
  };

  const formatCardTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`${colors[card.type]} rounded px-1.5 py-0.5 text-[10px] font-bold font-display text-black flex items-center gap-0.5`}>
      {card.type[0].toUpperCase()}
      {remaining !== null && <span>{formatCardTime(remaining)}</span>}
    </div>
  );
}

function TeamSection({ team, side, light }: { team: TeamData; side: 'home' | 'away'; light: boolean }) {
  const prevScore = useRef(team.score);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (team.score !== prevScore.current) {
      setPulse(true);
      prevScore.current = team.score;
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [team.score]);

  const activeCards = team.cards.filter(c => {
    if (!c.expires_at) return true;
    return new Date(c.expires_at).getTime() > Date.now();
  });

  const statsText = light ? 'text-black/60' : 'text-white/60';

  return (
    <div className={`flex items-center gap-3 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
      {/* Logo */}
      {team.logo_url ? (
        <img src={team.logo_url} alt={team.name_abbr} className="h-10 w-10 rounded object-contain" />
      ) : (
        <div className="h-10 w-10 rounded flex items-center justify-center text-xs font-bold font-display"
          style={{ backgroundColor: team.primary_color, color: team.font_color }}>
          {team.name_abbr.slice(0, 2)}
        </div>
      )}

      {/* Name + stats */}
      <div className={`flex flex-col ${side === 'away' ? 'items-end' : 'items-start'}`}>
        <span className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: team.font_color }}>
          {team.name_abbr}
        </span>
        <div className={`flex gap-1.5 text-[9px] ${statsText} font-medium`}>
          <span>FG:{team.field_goals}</span>
          <span>PC:{team.penalty_corners_awarded}:{team.penalty_corners_converted}</span>
          <span>PS:{team.penalty_strokes_awarded}:{team.penalty_strokes_converted}</span>
        </div>
        {activeCards.length > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {activeCards.map(c => <CardDisplay key={c.id} card={c} />)}
          </div>
        )}
      </div>

      {/* Score */}
      <div className={`font-display text-4xl font-extrabold ${pulse ? 'score-pulse glow-score' : ''}`}
        style={{ color: team.font_color }}>
        {team.score}
      </div>
    </div>
  );
}

const Overlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { game, loading } = useGameRealtime(gameId);

  // Mark this page as an overlay route
  useEffect(() => {
    document.body.classList.add('overlay-route');
    return () => {
      document.body.classList.remove('overlay-route');
    };
  }, []);

  const timer = useCountdownTimer(
    game?.timer_remaining_sec ?? 0,
    game?.is_timer_running ?? false,
    game?.timer_started_at ?? null
  );

  const light = game?.scoreboard_theme === 'light';

  const scoreboardBgClass = light ? 'bg-white/90' : '';
  const textBase = light ? 'text-black' : 'text-white';
  const textFaded = light ? 'text-black/70' : 'text-white/70';
  const vsText = light ? 'text-black/60' : 'text-white/60';
  const periodText = light ? 'text-black/70' : 'text-white/70';

  const timerColor = timer > 120 ? (light ? 'text-black' : 'text-white') : timer > 30 ? 'text-yellow-400' : 'text-red-500';

  if (loading || !game) {
    return <div className="min-h-screen" />;
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const periodLabel = () => {
    if (game.is_match_ended) return 'FINAL';
    if (game.current_period === 0) return 'PRE';
    const prefix = game.game_format.type === 'quarters' ? 'Q' : 'H';
    return `${prefix}${game.current_period}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* League logo top-left */}
      {game.league_logo_url && (
        <img src={game.league_logo_url} alt="League" className="absolute top-4 left-4 h-12 w-12 object-contain drop-shadow-lg" />
      )}

      {/* Channel logo top-right */}
      {game.channel_logo_url && (
        <img src={game.channel_logo_url} alt="Channel" className="absolute top-4 right-4 h-12 w-12 object-contain drop-shadow-lg" />
      )}

      {/* Scoreboard bar at bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`glass-scoreboard rounded-2xl px-6 py-3 flex items-center justify-between ${scoreboardBgClass}`}
        >
          {/* Home */}
          <TeamSection team={game.home_team} side="home" light={light} />

          {/* Center: period + timer */}
          <div className="flex flex-col items-center px-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={periodLabel()}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`font-display text-xs font-extrabold uppercase tracking-widest ${periodText}`}
              >
                {periodLabel()}
              </motion.span>
            </AnimatePresence>
            <span className={`font-display text-3xl font-extrabold tracking-wider ${timerColor}`}> 
              {formatTime(timer)}
            </span>
          </div>

          {/* Away */}
          <TeamSection team={game.away_team} side="away" light={light} />
        </motion.div>
      </div>

      {/* Stats overlay popup */}
      <AnimatePresence>
        {game.overlay_stats_visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-8"
          >
            <div className={`glass-scoreboard rounded-3xl p-8 max-w-2xl w-full ${scoreboardBgClass}`}> 
              <div className="grid grid-cols-3 gap-6">
                {/* Home stats */}
                <div className="text-center space-y-3">
                  {game.home_team.logo_url && (
                    <img src={game.home_team.logo_url} alt="" className="h-16 w-16 mx-auto rounded-lg object-contain" />
                  )}
                  <h3 className="font-display text-xl font-extrabold" style={{ color: game.home_team.font_color }}>
                    {game.home_team.name_full}
                  </h3>
                  <div className={`font-display text-5xl font-extrabold ${textBase}`}>{game.home_team.score}</div>
                  <StatsColumn team={game.home_team} light={light} />
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center">
                  <span className={`font-display text-2xl font-extrabold ${vsText}`}>VS</span>
                  <span className={`font-display text-sm font-bold ${periodText} mt-2`}>{periodLabel()}</span>
                </div>

                {/* Away stats */}
                <div className="text-center space-y-3">
                  {game.away_team.logo_url && (
                    <img src={game.away_team.logo_url} alt="" className="h-16 w-16 mx-auto rounded-lg object-contain" />
                  )}
                  <h3 className="font-display text-xl font-bold" style={{ color: game.away_team.font_color }}>
                    {game.away_team.name_full}
                  </h3>
                  <div className="font-display text-5xl font-bold text-white">{game.away_team.score}</div>
                  <StatsColumn team={game.away_team} light={light} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function StatsColumn({ team, light }: { team: TeamData; light: boolean }) {
  const containerText = light ? 'text-black font-bold' : 'text-white/90 font-bold';
  const valueText = light ? 'text-black' : 'text-white';
  return (
    <div className={`space-y-1 text-sm ${containerText}`}>      <div className="flex justify-between">
        <span>Field Goals</span><span className={`font-bold ${valueText}`}>{team.field_goals}</span>
      </div>
      <div className="flex justify-between">
        <span>PC (A:C)</span><span className={`font-bold ${valueText}`}>{team.penalty_corners_awarded}:{team.penalty_corners_converted}</span>
      </div>
      <div className="flex justify-between">
        <span>PS (A:C)</span><span className={`font-bold ${valueText}`}>{team.penalty_strokes_awarded}:{team.penalty_strokes_converted}</span>
      </div>
      <div className="flex justify-between">
        <span>Cards</span><span className={`font-bold ${valueText}`}>{team.cards.length}</span>
      </div>
    </div>
  );
}

export default Overlay;
