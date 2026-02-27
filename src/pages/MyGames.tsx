import { useAuth } from '@/hooks/useAuth';
import { useGamesList } from '@/hooks/useGamesList';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/hooks/useGame';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Loader2, Copy, Trash2, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MyGames = () => {
  const { user, signOut } = useAuth();
  const { games, loading: gamesLoading, deleteGame, addGame } = useGamesList(user?.id);
  const { profile, loading: profileLoading, toggleTheme } = useProfile(user?.id);
  const { createGame } = useGame(undefined);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!user?.id) return;
    const name = window.prompt('Enter a name for the new game', `Game ${new Date().toLocaleDateString()}`) || undefined;
    setCreating(true);
    const newGame = await createGame(user.id, name);
    setCreating(false);
    if (newGame) {
      addGame(newGame);
      toast({
        title: 'Success',
        description: 'Game created successfully',
      });
    }
  };

  const handleCopyOverlayUrl = (gameId: string) => {
    const url = `${window.location.origin}/overlay/${gameId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'Overlay URL copied to clipboard',
    });
  };

  const handleDeleteGame = async (gameId: string) => {
    await deleteGame(gameId);
    toast({
      title: 'Deleted',
      description: 'Game deleted successfully',
    });
  };

  const handleEditDescription = async (game: Game) => {
    const newDesc = window.prompt('Enter game description', game.description || '');
    if (newDesc === null) return; // cancelled
    const { error } = await supabase
      .from('games')
      .update({ description: newDesc })
      .eq('id', game.id);
    if (!error) {
      toast({ title: 'Updated', description: 'Description saved' });
    } else {
      toast({ title: 'Error', description: 'Unable to save description' });
    }
  };

  if (profileLoading || gamesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            My<span className="text-primary">Sports</span>Overlay
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
              {profile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="font-display"
                >
                  {profile.app_theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* New Game Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
              My Games
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your scoreboard configurations
            </p>
          </div>
          <Button onClick={handleCreateGame} disabled={creating} className="font-display ">
            {creating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Game
          </Button>
        </div>

        {games.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 space-y-6 border border-dashed border-border rounded-lg bg-card/50 p-12">
            <div className="text-center space-y-2">
              <h3 className="font-display text-2xl font-bold text-foreground">
                No Games Yet
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Create your first scoreboard to start managing matches and displaying live scores.
              </p>
            </div>
            <Button onClick={handleCreateGame} disabled={creating} size="lg" className="font-display">
              {creating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              Create Your First Game
            </Button>
          </div>
        ) : (
          // Games grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 space-y-4">
                  {/* Game name + editable description */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">
                      {game.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(game.created_at).toLocaleDateString()}
                    </p>
                    <p
                      className="text-sm text-muted-foreground line-clamp-1 mt-1 flex items-center gap-1 cursor-pointer"
                      onClick={() => handleEditDescription(game)}
                    >
                      {game.description || <span className="italic">Add description...</span>}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5l3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </p>
                  </div>

                  {/* Teams display */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {/* Home team */}
                    <div className="flex items-center gap-3">
                      {game.home_team.logo_url ? (
                        <img
                          src={game.home_team.logo_url}
                          alt={game.home_team.name_abbr}
                          className="h-12 w-12 rounded object-contain"
                        />
                      ) : (
                        <div
                          className="h-12 w-12 rounded flex items-center justify-center text-xs font-bold font-display text-white"
                          style={{ backgroundColor: game.home_team.primary_color }}
                        >
                          {game.home_team.name_abbr.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {game.home_team.name_full}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {game.home_team.name_abbr}
                        </p>
                      </div>
                      <div className="font-display text-xl font-bold text-foreground">
                        {game.home_team.score}
                      </div>
                    </div>

                    {/* VS */}
                    <div className="text-center py-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        vs
                      </span>
                    </div>

                    {/* Away team */}
                    <div className="flex items-center gap-3">
                      {game.away_team.logo_url ? (
                        <img
                          src={game.away_team.logo_url}
                          alt={game.away_team.name_abbr}
                          className="h-12 w-12 rounded object-contain"
                        />
                      ) : (
                        <div
                          className="h-12 w-12 rounded flex items-center justify-center text-xs font-bold font-display text-white"
                          style={{ backgroundColor: game.away_team.primary_color }}
                        >
                          {game.away_team.name_abbr.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {game.away_team.name_full}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {game.away_team.name_abbr}
                        </p>
                      </div>
                      <div className="font-display text-xl font-bold text-foreground">
                        {game.away_team.score}
                      </div>
                    </div>
                  </div>

                  {/* Game status */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      {game.is_match_ended ? (
                        <span className="inline-block px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px]">Ended</span>
                      ) : game.current_period > 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px]">Live</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-gray-500 text-white rounded-full text-[10px]">Not Started</span>
                      )}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={() => navigate(`/control/${game.id}`)}
                      size="sm"
                      className="font-display"
                    >
                      <Play className="h-3.5 w-3.5 mr-1" /> Control
                    </Button>
                    <Button
                      onClick={() => handleCopyOverlayUrl(game.id)}
                      size="sm"
                      variant="outline"
                      className="font-display"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="!text-destructive font-display">
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Game</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{game.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGame(game.id)}
                            className="!bg-destructive !text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyGames;
