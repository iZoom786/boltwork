/*
  # Create bot deployments and meetings tables

  1. New Tables
    - `bot_deployments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `bot_id` (text, from Recall.ai API)
      - `meeting_url` (text)
      - `status` (text - created, active, completed, failed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `meeting_transcripts`
      - `id` (uuid, primary key)
      - `deployment_id` (uuid, references bot_deployments)
      - `transcript_text` (text)
      - `language` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only view/manage their own bot deployments
    - Users can only view transcripts from their deployments

  3. Indexes
    - Index on user_id for fast lookups
    - Index on created_at for sorting
    - Index on deployment_id for transcript queries
*/

CREATE TABLE IF NOT EXISTS bot_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id text NOT NULL,
  meeting_url text NOT NULL,
  status text DEFAULT 'created' CHECK (status IN ('created', 'active', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES bot_deployments(id) ON DELETE CASCADE,
  transcript_text text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bot_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bot deployments"
  ON bot_deployments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bot deployments"
  ON bot_deployments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bot deployments"
  ON bot_deployments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bot deployments"
  ON bot_deployments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read transcripts from own deployments"
  ON meeting_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bot_deployments
      WHERE bot_deployments.id = meeting_transcripts.deployment_id
      AND bot_deployments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transcripts for own deployments"
  ON meeting_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bot_deployments
      WHERE bot_deployments.id = meeting_transcripts.deployment_id
      AND bot_deployments.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_bot_deployments_user_id ON bot_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_deployments_created_at ON bot_deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_deployment_id ON meeting_transcripts(deployment_id);
