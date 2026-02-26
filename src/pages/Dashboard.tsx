import { useAuth } from '@/hooks/useAuth';
import { useGame } from '@/hooks/useGame';
import { TeamControl } from '@/components/dashboard/TeamControl';
import { MatchControls } from '@/components/dashboard/MatchControls';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const {
    game, loading, createGame, updateGame, updateTeam,
    addScore, addPenaltyStat, addCard,
    startPeriod, stopPeriod, nextPeriod, endMatch, resetGame,
  } = useGame(user?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            My<span className="text-primary">Sports</span>Overlay
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-3 w-3 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {!game ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <h2 className="font-display text-3xl text-foreground">No Active Game</h2>
            <p className="text-muted-foreground">Create your first scoreboard to get started</p>
            <Button onClick={createGame} className="font-display text-lg px-8">
              <Plus className="h-5 w-5 mr-2" /> Create Game
            </Button>
          </div>
        ) : (
          <>
            {/* Team controls side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TeamControl
                side="home_team"
                team={game.home_team}
                isMatchEnded={game.is_match_ended}
                onUpdate={(u) => updateTeam('home_team', u)}
                onAddScore={(t) => addScore('home_team', t)}
                onAddPenaltyStat={(s) => addPenaltyStat('home_team', s)}
                onAddCard={(t) => addCard('home_team', t)}
              />
              <TeamControl
                side="away_team"
                team={game.away_team}
                isMatchEnded={game.is_match_ended}
                onUpdate={(u) => updateTeam('away_team', u)}
                onAddScore={(t) => addScore('away_team', t)}
                onAddPenaltyStat={(s) => addPenaltyStat('away_team', s)}
                onAddCard={(t) => addCard('away_team', t)}
              />
            </div>

            {/* Match controls */}
            <MatchControls
              game={game}
              onStart={startPeriod}
              onStop={stopPeriod}
              onNext={nextPeriod}
              onEnd={endMatch}
              onReset={resetGame}
              onUpdateGame={updateGame}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
