-- Add reactions_enabled flag to games for overlay UI
ALTER TABLE public.games
  ADD COLUMN reactions_enabled boolean NOT NULL DEFAULT true;
