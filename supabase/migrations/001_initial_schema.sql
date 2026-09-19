-- ============================================================
-- Synapse Spatial Pro — Initial Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'New User',
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'researcher'
                CHECK (role IN ('admin', 'researcher', 'reviewer', 'viewer')),
  professional_field TEXT NOT NULL DEFAULT 'academic'
                CHECK (professional_field IN ('legal', 'medical', 'business', 'academic')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. USER SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id         UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme           TEXT NOT NULL DEFAULT 'dark'
                  CHECK (theme IN ('dark', 'sepia', 'light', 'midnight')),
  workflow_mode   TEXT NOT NULL DEFAULT 'ai_assistant'
                  CHECK (workflow_mode IN ('manual', 'ai_assistant')),
  device_mode     TEXT NOT NULL DEFAULT 'auto'
                  CHECK (device_mode IN ('auto', 'tablet', 'desktop')),
  ai_tone         TEXT NOT NULL DEFAULT 'concise'
                  CHECK (ai_tone IN ('beginner', 'academic', 'concise')),
  font_family     TEXT NOT NULL DEFAULT 'sans'
                  CHECK (font_family IN ('sans', 'serif', 'dyslexic')),
  density         TEXT NOT NULL DEFAULT 'comfortable'
                  CHECK (density IN ('comfortable', 'compact')),
  canvas_design   TEXT NOT NULL DEFAULT 'dots'
                  CHECK (canvas_design IN ('dots', 'graph', 'cornell', 'minimal', 'nebula', 'sepia')),
  active_provider TEXT NOT NULL DEFAULT 'local-simulated'
                  CHECK (active_provider IN ('gemini', 'openai', 'anthropic', 'ollama', 'local-simulated')),
  gemini_api_key  TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create settings row on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ============================================================
-- 3. MATTERS (projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matters (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  matter_number       TEXT NOT NULL DEFAULT '',
  client              TEXT NOT NULL DEFAULT 'Personal Research',
  field               TEXT NOT NULL DEFAULT 'academic'
                      CHECK (field IN ('legal', 'medical', 'business', 'academic')),
  workflow_mode       TEXT NOT NULL DEFAULT 'ai_assistant'
                      CHECK (workflow_mode IN ('manual', 'ai_assistant')),
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'in_review', 'archived', 'urgent')),
  description         TEXT NOT NULL DEFAULT '',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  document_count      INT NOT NULL DEFAULT 0,
  node_count          INT NOT NULL DEFAULT 0,
  collaborator_count  INT NOT NULL DEFAULT 1,
  last_modified       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS matters_user_id_idx ON public.matters(user_id);
CREATE INDEX IF NOT EXISTS matters_field_idx ON public.matters(field);

-- ============================================================
-- 4. DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id    UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  file_type    TEXT NOT NULL DEFAULT 'pdf'
               CHECK (file_type IN ('pdf', 'docx', 'doc', 'txt', 'md', 'image', 'svg', 'json', 'csv', 'generic')),
  file_url     TEXT,
  page_count   INT NOT NULL DEFAULT 1,
  doc_content  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_matter_id_idx ON public.documents(matter_id);

-- ============================================================
-- 5. CANVAS NODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.canvas_nodes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id   UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'note'
              CHECK (type IN ('claim', 'evidence', 'question', 'note', 'concept')),
  title       TEXT NOT NULL DEFAULT 'New Note',
  content     TEXT NOT NULL DEFAULT '',
  x           FLOAT NOT NULL DEFAULT 100,
  y           FLOAT NOT NULL DEFAULT 100,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  width       FLOAT,
  height      FLOAT,
  is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  anchor      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS canvas_nodes_matter_id_idx ON public.canvas_nodes(matter_id);

-- ============================================================
-- 6. CANVAS EDGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.canvas_edges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id   UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  source_id   UUID NOT NULL REFERENCES public.canvas_nodes(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL REFERENCES public.canvas_nodes(id) ON DELETE CASCADE,
  label       TEXT,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS canvas_edges_matter_id_idx ON public.canvas_edges(matter_id);

-- ============================================================
-- 7. CANVAS FRAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.canvas_frames (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id   UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  x           FLOAT NOT NULL DEFAULT 0,
  y           FLOAT NOT NULL DEFAULT 0,
  width       FLOAT NOT NULL DEFAULT 400,
  height      FLOAT NOT NULL DEFAULT 300,
  label       TEXT NOT NULL DEFAULT 'Group',
  color       TEXT NOT NULL DEFAULT '#6366f120',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. COLLABORATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collaborators (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id   UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'researcher'
              CHECK (role IN ('admin', 'researcher', 'reviewer', 'viewer')),
  color       TEXT NOT NULL DEFAULT '#6366f1',
  is_online   BOOLEAN NOT NULL DEFAULT FALSE,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(matter_id, user_id)
);

CREATE INDEX IF NOT EXISTS collaborators_matter_id_idx ON public.collaborators(matter_id);

-- ============================================================
-- 9. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matter_id   UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  details     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'success'
              CHECK (status IN ('success', 'warning', 'error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);

-- ============================================================
-- 10. SUPABASE STORAGE BUCKET for Documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  FALSE,
  52428800, -- 50MB max file size
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Users can only access their own data
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- User settings: own row only
CREATE POLICY "user_settings_own" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Matters: own + matters where user is a collaborator
CREATE POLICY "matters_owner" ON public.matters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "matters_collaborator_read" ON public.matters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collaborators
      WHERE matter_id = matters.id AND user_id = auth.uid()
    )
  );

-- Documents: owner or collaborator
CREATE POLICY "documents_owner" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "documents_collaborator_read" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collaborators c
      JOIN public.matters m ON m.id = c.matter_id
      WHERE documents.matter_id = m.id AND c.user_id = auth.uid()
    )
  );

-- Canvas nodes: matter owner or collaborator
CREATE POLICY "canvas_nodes_matter_access" ON public.canvas_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matters m
      LEFT JOIN public.collaborators c ON c.matter_id = m.id
      WHERE canvas_nodes.matter_id = m.id
        AND (m.user_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Canvas edges: same pattern
CREATE POLICY "canvas_edges_matter_access" ON public.canvas_edges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matters m
      LEFT JOIN public.collaborators c ON c.matter_id = m.id
      WHERE canvas_edges.matter_id = m.id
        AND (m.user_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Canvas frames: same pattern
CREATE POLICY "canvas_frames_matter_access" ON public.canvas_frames
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matters m
      LEFT JOIN public.collaborators c ON c.matter_id = m.id
      WHERE canvas_frames.matter_id = m.id
        AND (m.user_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Collaborators: matter owner can manage, collaborators can read
CREATE POLICY "collaborators_owner" ON public.collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE id = collaborators.matter_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_self_read" ON public.collaborators
  FOR SELECT USING (auth.uid() = user_id);

-- Audit logs: own entries
CREATE POLICY "audit_logs_own" ON public.audit_logs
  FOR ALL USING (auth.uid() = user_id);

-- Storage: documents bucket policies
CREATE POLICY "storage_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_own_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_own_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 12. REALTIME (enable for collaboration)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.canvas_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.canvas_edges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.canvas_frames;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matters;
