-- Add name and description fields to games table
ALTER TABLE public.games
  ADD COLUMN name TEXT NOT NULL DEFAULT 'New Game',
  ADD COLUMN description TEXT DEFAULT NULL;

-- Set existing games with more descriptive names
UPDATE public.games 
SET name = 'Game ' || COALESCE(home_team->>'name_full', 'Home') || ' vs ' || COALESCE(away_team->>'name_full', 'Away')
WHERE name = 'New Game';
