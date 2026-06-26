-- Catatan Guru — skema Supabase (auth + cadangan Pro)
-- Jalankan di SQL Editor project Supabase baru (Auth + cadangan Pro).

-- Cadangan JSON per akun (POST/GET /api/guru/v1/sync/snapshot dari backend)
CREATE TABLE IF NOT EXISTS public.guru_cloud_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schema_version INTEGER NOT NULL DEFAULT 2,
  payload JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT guru_cloud_snapshots_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_guru_cloud_snapshots_user
  ON public.guru_cloud_snapshots(user_id);

ALTER TABLE public.guru_cloud_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guru_snapshots_select_own"
  ON public.guru_cloud_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "guru_snapshots_insert_own"
  ON public.guru_cloud_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guru_snapshots_update_own"
  ON public.guru_cloud_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "guru_snapshots_delete_own"
  ON public.guru_cloud_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Metadata sekolah mandiri yang guru daftarkan (bukan tenant sekolah)
CREATE TABLE IF NOT EXISTS public.guru_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  npsn TEXT,
  attendance_mode TEXT NOT NULL DEFAULT 'class',
  school_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT guru_workspaces_user_workspace_unique UNIQUE (user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_guru_workspaces_user
  ON public.guru_workspaces(user_id);

ALTER TABLE public.guru_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guru_workspaces_select_own"
  ON public.guru_workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "guru_workspaces_insert_own"
  ON public.guru_workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guru_workspaces_update_own"
  ON public.guru_workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "guru_workspaces_delete_own"
  ON public.guru_workspaces FOR DELETE
  USING (auth.uid() = user_id);
