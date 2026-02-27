import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { TeamData, GameCard } from '@/types/game';
import { Plus, Upload, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { defaultTeam } from '@/types/game';
import { LogoPicker } from '@/components/dashboard/LogoPicker';


interface TeamControlProps {
  side: 'home_team' | 'away_team';
  team: TeamData;
  isMatchEnded: boolean;
  onUpdate: (updates: Partial<TeamData>) => void;
  onAddScore: (type: 'field_goals' | 'penalty_corners_converted' | 'penalty_strokes_converted') => void;
  onSubtractScore: (type: 'field_goals' | 'penalty_corners_converted' | 'penalty_strokes_converted') => void;
  onAddPenaltyStat: (stat: 'penalty_corners_awarded' | 'penalty_strokes_awarded') => void;
  onSubtractPenaltyStat: (stat: 'penalty_corners_awarded' | 'penalty_strokes_awarded') => void;
  onAddCard: (type: GameCard['type']) => void;
  onRemoveCard: (type: GameCard['type']) => void;
}

export function TeamControl({
  side, team, isMatchEnded, onUpdate, onAddScore, onSubtractScore, onAddPenaltyStat, onSubtractPenaltyStat, onAddCard, onRemoveCard,
}: TeamControlProps) {
  const label = side === 'home_team' ? 'Home Team' : 'Away Team';

  const [localAbbr, setLocalAbbr] = useState(team.name_abbr);
  const [localFull, setLocalFull] = useState(team.name_full);

  // sync when parent changes (e.g. reset)
  useEffect(() => {
    setLocalAbbr(team.name_abbr);
  }, [team.name_abbr]);
  useEffect(() => {
    setLocalFull(team.name_full);
  }, [team.name_full]);

  const commitAbbr = () => {
    if (localAbbr !== team.name_abbr) {
      onUpdate({ name_abbr: localAbbr.toUpperCase() });
    }
  };
  const commitFull = () => {
    if (localFull !== team.name_full) {
      onUpdate({ name_full: localFull });
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <h3
        className="font-display text-xl font-bold tracking-wide uppercase"
        style={{ color: team.primary_color }}
      >
        {label}
      </h3>

      {/* Score display */}
      <div className="flex items-center justify-center gap-4 py-3">
        <span className="font-display text-6xl font-bold text-foreground">{team.score}</span>
      </div>

      {/* Score buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="outline" className="hover:bg-green-500/20" onClick={() => onAddScore('field_goals')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> FG
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-green-500/20" onClick={() => onAddScore('penalty_corners_converted')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PC Goal
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-green-500/20" onClick={() => onAddScore('penalty_strokes_converted')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PS Goal
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onSubtractScore('field_goals')} disabled={isMatchEnded || team.score <= 0}>
          - FG
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onSubtractScore('penalty_corners_converted')} disabled={isMatchEnded || team.penalty_corners_converted <= 0}>
          - PC Goal
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onSubtractScore('penalty_strokes_converted')} disabled={isMatchEnded || team.penalty_strokes_converted <= 0}>
          - PS Goal
        </Button>
      </div>

      {/* Penalty stats */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="hover:bg-green-500/20" onClick={() => onAddPenaltyStat('penalty_corners_awarded')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PC Awarded
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-green-500/20" onClick={() => onAddPenaltyStat('penalty_strokes_awarded')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PS Awarded
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onSubtractPenaltyStat('penalty_corners_awarded')} disabled={isMatchEnded || team.penalty_corners_awarded <= 0}>
          - PC
        </Button>
        <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onSubtractPenaltyStat('penalty_strokes_awarded')} disabled={isMatchEnded || team.penalty_strokes_awarded <= 0}>
          - PS
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Cards</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" className="bg-card-green hover:bg-card-green/80 text-white" onClick={() => onAddCard('green')} disabled={isMatchEnded}>
            Green
          </Button>
          <Button size="sm" className="bg-card-yellow hover:bg-card-yellow/80 text-black" onClick={() => onAddCard('yellow')} disabled={isMatchEnded}>
            Yellow
          </Button>
          <Button size="sm" className="bg-card-red hover:bg-card-red/80 text-white" onClick={() => onAddCard('red')} disabled={isMatchEnded}>
            Red
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onRemoveCard('green')} disabled={isMatchEnded || team.cards.filter(c=>c.type==='green').length===0}>
            - Green
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onRemoveCard('yellow')} disabled={isMatchEnded || team.cards.filter(c=>c.type==='yellow').length===0}>
            - Yellow
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => onRemoveCard('red')} disabled={isMatchEnded || team.cards.filter(c=>c.type==='red').length===0}>
            - Red
          </Button>
        </div>
        {team.cards.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {team.cards.map((c) => (
              <span key={c.id} className={`text-xs px-2 py-0.5 rounded font-medium ${
                c.type === 'green' ? 'bg-card-green/30 text-card-green' :
                c.type === 'yellow' ? 'bg-card-yellow/30 text-card-yellow' :
                'bg-card-red/30 text-card-red'
              }`}>
                {c.type.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Team config */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Abbreviation</Label>
            <Input
              value={localAbbr}
              maxLength={10}
              onChange={(e) => setLocalAbbr(e.target.value)}
              onBlur={commitAbbr}
              className="bg-muted border-border text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={localFull}
              onChange={(e) => setLocalFull(e.target.value)}
              onBlur={commitFull}
              className="bg-muted border-border text-sm h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Primary</Label>
            <Input type="color" value={team.primary_color} onChange={(e) => onUpdate({ primary_color: e.target.value })} className="h-8 p-1 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Secondary</Label>
            <Input type="color" value={team.secondary_color} onChange={(e) => onUpdate({ secondary_color: e.target.value })} className="h-8 p-1 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Font</Label>
            <Input type="color" value={team.font_color} onChange={(e) => onUpdate({ font_color: e.target.value })} className="h-8 p-1 bg-muted" />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => {
            const simpleSide = side === 'home_team' ? 'home' : 'away';
            onUpdate(defaultTeam(simpleSide));
          }}
        >
          Reset Team
        </Button>

        <LogoPicker
          label="Logo"
          value={team.logo_url}
          onChange={(u) => onUpdate({ logo_url: u })}
          disabled={isMatchEnded}
        />
      </div>
    </div>
  );
}
