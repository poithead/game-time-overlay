import { useAuth } from '@/hooks/useAuth';
import { useGame } from '@/hooks/useGame';
import { TeamControl } from '@/components/dashboard/TeamControl';
import { MatchControls } from '@/components/dashboard/MatchControls';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ControlPanel = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { user, signOut } = useAuth();
  const {
    game, loading, createGame, updateGame, updateTeam,
    addScore, subtractScore, addPenaltyStat, subtractPenaltyStat, addCard, removeCard,
    startPeriod, stopPeriod, nextPeriod, endMatch, resetGame,
  } = useGame(gameId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Game not found</h2>
        <Button onClick={() => navigate('/dashboard')} className="font-display">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Games
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                {game.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {game.home_team.name_full} vs {game.away_team.name_full}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-3 w-3 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 space-y-10">
        {/* Team controls side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TeamControl
            side="home_team"
            team={game.home_team}
            isMatchEnded={game.is_match_ended}
            onUpdate={(u) => updateTeam('home_team', u)}
            onAddScore={(t) => addScore('home_team', t)}
            onSubtractScore={(t) => subtractScore('home_team', t)}
            onAddPenaltyStat={(s) => addPenaltyStat('home_team', s)}
            onSubtractPenaltyStat={(s) => subtractPenaltyStat('home_team', s)}
            onAddCard={(t) => addCard('home_team', t)}
            onRemoveCard={(t) => removeCard('home_team', t)}
          />
          <TeamControl
            side="away_team"
            team={game.away_team}
            isMatchEnded={game.is_match_ended}
            onUpdate={(u) => updateTeam('away_team', u)}
            onAddScore={(t) => addScore('away_team', t)}
            onSubtractScore={(t) => subtractScore('away_team', t)}
            onAddPenaltyStat={(s) => addPenaltyStat('away_team', s)}
            onSubtractPenaltyStat={(s) => subtractPenaltyStat('away_team', s)}
            onAddCard={(t) => addCard('away_team', t)}
            onRemoveCard={(t) => removeCard('away_team', t)}
          />
        </div>

        {/* Match controls */}
        <div className="mt-8">
          <MatchControls
            game={game}
            onStart={startPeriod}
            onStop={stopPeriod}
            onNext={nextPeriod}
            onEnd={endMatch}
            onReset={resetGame}
            onUpdateGame={updateGame}
          />
        </div>
      </main>
    </div>
  );
};

export default ControlPanel;
