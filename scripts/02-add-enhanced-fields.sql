-- Add due date and priority fields to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id_completed ON todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_due_date ON todos(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_priority ON todos(user_id, priority);
