import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Game } from '@/types/game';
import { Play, Pause, SkipForward, Square, RotateCcw, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogoPicker } from '@/components/dashboard/LogoPicker';

interface MatchControlsProps {
  game: Game;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReset: () => void;
  onUpdateGame: (updates: Partial<Record<string, unknown>>) => void;
}

export function MatchControls({ game, onStart, onStop, onNext, onEnd, onReset, onUpdateGame }: MatchControlsProps) {
  const periodLabel = game.game_format.type === 'quarters' ? 'Quarter' : 'Half';
  const maxPeriods = game.game_format.type === 'quarters' ? 4 : 2;
  const overlayUrl = `${window.location.origin}/overlay/${game.id}`;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // scoreboard theme and other configs handled via game object (no local state needed)

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    toast.success('Overlay URL copied!');
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-5">
      <h3 className="font-display text-xl font-bold text-foreground tracking-wide uppercase">Match Control</h3>

      {/* Timer display */}
      <div className="text-center py-4">
        <div className="font-display text-5xl font-bold text-foreground tracking-wider">
          {formatTime(game.timer_remaining_sec)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {game.is_match_ended ? 'MATCH ENDED' : game.current_period === 0 ? 'NOT STARTED' : `${periodLabel} ${game.current_period} of ${maxPeriods}`}
          {game.is_timer_running && ' • RUNNING'}
        </div>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button onClick={onStart} disabled={game.is_timer_running || game.is_match_ended} className="font-display">
          <Play className="h-4 w-4 mr-1" /> Start
        </Button>
        <Button onClick={onStop} disabled={!game.is_timer_running} variant="secondary" className="font-display">
          <Pause className="h-4 w-4 mr-1" /> Stop
        </Button>
        <Button onClick={onNext} variant="secondary" className="font-display" disabled={game.is_timer_running}>
          <SkipForward className="h-4 w-4 mr-1" /> Next
        </Button>
        <Button onClick={onEnd} variant="destructive" className="font-display" disabled={game.is_match_ended}>
          <Square className="h-4 w-4 mr-1" /> End
        </Button>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full font-display" size="sm">
        <RotateCcw className="h-3 w-3 mr-1" /> Reset Scoreboard
      </Button>

      {/* Config */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Format</Label>
            <Select
              value={game.game_format.type}
              onValueChange={(v) => onUpdateGame({
                game_format: { ...game.game_format, type: v },
                timer_remaining_sec: game.game_format.duration_sec,
              })}
            >
              <SelectTrigger className="bg-muted border-border h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarters">4 Quarters</SelectItem>
                <SelectItem value="halves">2 Halves</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Duration (min)</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={Math.floor(game.game_format.duration_sec / 60)}
              onChange={(e) => {
                const sec = parseInt(e.target.value) * 60;
                onUpdateGame({
                  game_format: { ...game.game_format, duration_sec: sec },
                  timer_remaining_sec: sec,
                });
              }}
              className="bg-muted border-border h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Show Stats Overlay</Label>
          <Switch
            checked={game.overlay_stats_visible}
            onCheckedChange={(v) => onUpdateGame({ overlay_stats_visible: v })}
          />
        </div>

        {/* Scoreboard theme and logo pickers */}
        <div className="space-y-3 pt-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Scoreboard Theme</Label>
            <Select
              value={game.scoreboard_theme ?? 'dark'}
              onValueChange={(v) => {
                // apply default font color based on theme unless user has overridden
                const homeDefault = game.scoreboard_theme === 'dark' ? '#ffffff' : '#000000';
                const awayDefault = homeDefault;
                const newDefault = v === 'dark' ? '#ffffff' : '#000000';
                const updates: any = { scoreboard_theme: v };
                if (game.home_team.font_color === homeDefault) {
                  updates.home_team = { ...game.home_team, font_color: newDefault };
                }
                if (game.away_team.font_color === awayDefault) {
                  updates.away_team = { ...game.away_team, font_color: newDefault };
                }
                onUpdateGame(updates);
              }}
            >
              <SelectTrigger className="bg-muted border-border h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <LogoPicker
            label="League Logo"
            value={game.league_logo_url || ''}
            onChange={(u) => onUpdateGame({ league_logo_url: u })}
          />

          <LogoPicker
            label="Channel Logo"
            value={game.channel_logo_url || ''}
            onChange={(u) => onUpdateGame({ channel_logo_url: u })}
          />
        </div>
      </div>

      {/* Overlay URL */}
      <div className="space-y-2 pt-3 border-t border-border">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Overlay URL (for OBS)</Label>
        <div className="flex gap-2">
          <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 text-primary truncate">
            {overlayUrl}
          </code>
          <Button size="sm" variant="outline" onClick={copyOverlayUrl}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={overlayUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
