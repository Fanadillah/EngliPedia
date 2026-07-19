-- Add example_id column for Indonesian translations of examples
ALTER TABLE words ADD COLUMN IF NOT EXISTS example_id TEXT DEFAULT '';
