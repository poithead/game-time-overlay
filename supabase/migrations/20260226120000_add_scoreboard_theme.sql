-- Add scoreboard theme preference to games
ALTER TABLE public.games
  ADD COLUMN scoreboard_theme TEXT NOT NULL DEFAULT 'dark';

-- ensure existing rows default
UPDATE public.games SET scoreboard_theme = 'dark' WHERE scoreboard_theme IS NULL;