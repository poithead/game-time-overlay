import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { TeamData, GameCard } from '@/types/game';
import { Plus, Upload, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

interface TeamControlProps {
  side: 'home_team' | 'away_team';
  team: TeamData;
  isMatchEnded: boolean;
  onUpdate: (updates: Partial<TeamData>) => void;
  onAddScore: (type: 'field_goals' | 'penalty_corners_converted' | 'penalty_strokes_converted') => void;
  onAddPenaltyStat: (stat: 'penalty_corners_awarded' | 'penalty_strokes_awarded') => void;
  onAddCard: (type: GameCard['type']) => void;
}

export function TeamControl({
  side, team, isMatchEnded, onUpdate, onAddScore, onAddPenaltyStat, onAddCard,
}: TeamControlProps) {
  const label = side === 'home_team' ? 'Home Team' : 'Away Team';
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (error) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
    onUpdate({ logo_url: publicUrl });
    setUploading(false);
    toast.success('Logo uploaded');
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
        <Button size="sm" variant="secondary" onClick={() => onAddScore('field_goals')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> FG
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onAddScore('penalty_corners_converted')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PC Goal
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onAddScore('penalty_strokes_converted')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PS Goal
        </Button>
      </div>

      {/* Penalty stats */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={() => onAddPenaltyStat('penalty_corners_awarded')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PC Awarded
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddPenaltyStat('penalty_strokes_awarded')} disabled={isMatchEnded}>
          <Plus className="h-3 w-3 mr-1" /> PS Awarded
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Cards</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" className="bg-card-green hover:bg-card-green/80 text-foreground" onClick={() => onAddCard('green')} disabled={isMatchEnded}>
            Green
          </Button>
          <Button size="sm" className="bg-card-yellow hover:bg-card-yellow/80 text-background" onClick={() => onAddCard('yellow')} disabled={isMatchEnded}>
            Yellow
          </Button>
          <Button size="sm" className="bg-card-red hover:bg-card-red/80 text-foreground" onClick={() => onAddCard('red')} disabled={isMatchEnded}>
            Red
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
              value={team.name_abbr}
              maxLength={10}
              onChange={(e) => onUpdate({ name_abbr: e.target.value.toUpperCase() })}
              className="bg-muted border-border text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={team.name_full}
              onChange={(e) => onUpdate({ name_full: e.target.value })}
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

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Logo</Label>
          <div className="flex gap-2 items-center">
            {team.logo_url && <img src={team.logo_url} alt="logo" className="h-8 w-8 rounded object-contain bg-muted" />}
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded px-2 py-1.5 hover:bg-secondary transition-colors">
                <Upload className="h-3 w-3" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
