export interface GameCard {
  type: 'green' | 'yellow' | 'red';
  expires_at?: string; // ISO timestamp
  id: string;
}

export interface TeamData {
  name_abbr: string;
  name_full: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_color: string;
  score: number;
  field_goals: number;
  penalty_corners_awarded: number;
  penalty_corners_converted: number;
  penalty_strokes_awarded: number;
  penalty_strokes_converted: number;
  cards: GameCard[];
}

export interface GameFormat {
  type: 'quarters' | 'halves';
  duration_sec: number;
}

export interface Game {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  home_team: TeamData;
  away_team: TeamData;
  game_format: GameFormat;
  current_period: number;
  timer_remaining_sec: number;
  is_timer_running: boolean;
  timer_started_at: string | null;
  is_match_ended: boolean;
  league_logo_url: string | null;
  channel_logo_url: string | null;
  overlay_stats_visible: boolean;
  scoreboard_theme: 'dark' | 'light';
  created_at: string;
  updated_at: string;
}

export const defaultTeam = (side: 'home' | 'away'): TeamData => ({
  name_abbr: side === 'home' ? 'HOME' : 'AWAY',
  name_full: side === 'home' ? 'Home Team' : 'Away Team',
  logo_url: '',
  primary_color: side === 'home' ? '#1a56db' : '#dc2626',
  secondary_color: side === 'home' ? '#1e3a5f' : '#7f1d1d',
  font_color: '#ffffff',
  score: 0,
  field_goals: 0,
  penalty_corners_awarded: 0,
  penalty_corners_converted: 0,
  penalty_strokes_awarded: 0,
  penalty_strokes_converted: 0,
  cards: [],
});
