-- Catatan Guru — langganan Pro & perangkat terdaftar

CREATE TABLE IF NOT EXISTS public.guru_pro_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'android',
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  purchase_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guru_pro_subscriptions_status
  ON public.guru_pro_subscriptions(status);

ALTER TABLE public.guru_pro_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guru_pro_subscriptions_select_own"
  ON public.guru_pro_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.guru_pro_devices (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_label TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.guru_pro_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guru_pro_devices_select_own"
  ON public.guru_pro_devices FOR SELECT
  USING (auth.uid() = user_id);
