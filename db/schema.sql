-- Users table to store user profiles
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  display_name text,
  gameplay_id text
);

-- Games table to store available games
CREATE TABLE games (
  code text PRIMARY KEY,
  name text,
  description text
);

-- Leaderboards table to track game scores
CREATE TABLE leaderboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code text REFERENCES games(code),
  session_id uuid,
  user_id uuid REFERENCES users(id),
  score integer,
  exited boolean DEFAULT false
);

-- Insert initial games data
INSERT INTO games (code, name, description) VALUES
  ('ttt', 'Tic Tac Toe', 'The classic game of X and O'),
  ('rps', 'Rock Paper Scissors', 'Test your luck against other players'),
  ('quiz', 'Quick Quiz', 'Test your knowledge with random trivia questions'),
  ('mem', 'Memory Match', 'Find matching pairs of cards'); 