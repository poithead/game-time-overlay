
-- Create games table for match data
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  home_team JSONB NOT NULL DEFAULT '{
    "name_abbr": "HOME",
    "name_full": "Home Team",
    "logo_url": "",
    "primary_color": "#1a56db",
    "secondary_color": "#1e3a5f",
    "font_color": "#ffffff",
    "score": 0,
    "field_goals": 0,
    "penalty_corners_awarded": 0,
    "penalty_corners_converted": 0,
    "penalty_strokes_awarded": 0,
    "penalty_strokes_converted": 0,
    "cards": []
  }'::jsonb,
  away_team JSONB NOT NULL DEFAULT '{
    "name_abbr": "AWAY",
    "name_full": "Away Team",
    "logo_url": "",
    "primary_color": "#dc2626",
    "secondary_color": "#7f1d1d",
    "font_color": "#ffffff",
    "score": 0,
    "field_goals": 0,
    "penalty_corners_awarded": 0,
    "penalty_corners_converted": 0,
    "penalty_strokes_awarded": 0,
    "penalty_strokes_converted": 0,
    "cards": []
  }'::jsonb,
  game_format JSONB NOT NULL DEFAULT '{"type": "quarters", "duration_sec": 900}'::jsonb,
  current_period INT NOT NULL DEFAULT 0,
  timer_remaining_sec INT NOT NULL DEFAULT 900,
  is_timer_running BOOLEAN NOT NULL DEFAULT false,
  timer_started_at TIMESTAMPTZ,
  is_match_ended BOOLEAN NOT NULL DEFAULT false,
  league_logo_url TEXT,
  channel_logo_url TEXT,
  overlay_stats_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their games
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own games"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own games"
  ON public.games FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Public read access for overlay (anyone with the game ID can view)
CREATE POLICY "Anyone can view games for overlay"
  ON public.games FOR SELECT
  TO anon
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage policies
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Users can update their logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'logos');

CREATE POLICY "Users can delete their logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'logos');
