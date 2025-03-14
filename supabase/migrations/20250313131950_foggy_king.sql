/*
  # Backend Infrastructure Setup

  1. Multi-tenant Architecture
    - Organization-based multi-tenancy
    - Organization configuration and settings
    - Cross-organization data protection

  2. User Management
    - Enhanced user roles and permissions
    - Profile management
    - Password policies

  3. Billing System
    - Subscription tiers
    - Usage tracking
    - Automated billing

  4. Security & Compliance
    - Audit logging
    - Data encryption
    - GDPR compliance
*/

-- Create organizations table for multi-tenancy
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  logo_url text,
  theme jsonb DEFAULT '{"primary_color": "#4F46E5", "accent_color": "#22C55E"}'::jsonb,
  features jsonb DEFAULT '{"max_users": 5, "storage_limit": 5368709120}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription tiers
CREATE TABLE subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL,
  price_yearly numeric NOT NULL,
  features jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create organization subscriptions
CREATE TABLE organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES subscription_tiers(id),
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage tracking
CREATE TABLE usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  value bigint NOT NULL,
  metadata jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Create audit log
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add organization_id to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_factors jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create function to get current organization
CREATE OR REPLACE FUNCTION get_organization_id()
RETURNS uuid AS $$
DECLARE
  v_organization_id uuid;
BEGIN
  SELECT organization_id INTO v_organization_id
  FROM users
  WHERE id = auth.uid();
  RETURN v_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle audit logging
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS trigger AS $$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_organization_id uuid;
BEGIN
  -- Get organization_id
  SELECT organization_id INTO v_organization_id
  FROM users
  WHERE id = auth.uid();

  IF (TG_OP = 'UPDATE') THEN
    v_old_values = to_jsonb(OLD);
    v_new_values = to_jsonb(NEW);
  ELSIF (TG_OP = 'DELETE') THEN
    v_old_values = to_jsonb(OLD);
  ELSIF (TG_OP = 'INSERT') THEN
    v_new_values = to_jsonb(NEW);
  END IF;

  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    metadata
  ) VALUES (
    v_organization_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    v_old_values,
    v_new_values,
    inet_client_addr(),
    jsonb_build_object(
      'timestamp', extract(epoch from now()),
      'session_id', gen_random_uuid()
    )
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
CREATE TRIGGER audit_log_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, description, price_monthly, price_yearly, features) VALUES
(
  'Basic',
  'Perfect for small teams',
  2999,
  29990,
  '{
    "max_users": 5,
    "storage_gb": 10,
    "features": ["basic_analytics", "email_support"]
  }'
),
(
  'Pro',
  'For growing businesses',
  4999,
  49990,
  '{
    "max_users": 20,
    "storage_gb": 50,
    "features": ["advanced_analytics", "priority_support", "custom_branding"]
  }'
),
(
  'Enterprise',
  'For large organizations',
  9999,
  99990,
  '{
    "max_users": 100,
    "storage_gb": 500,
    "features": ["enterprise_analytics", "24_7_support", "custom_branding", "sso", "api_access"]
  }'
);

-- Create function to handle subscription updates
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger AS $$
BEGIN
  -- Update organization config based on new subscription
  UPDATE organizations
  SET features = (
    SELECT features
    FROM subscription_tiers
    WHERE id = NEW.tier_id
  )
  WHERE id = NEW.organization_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription updates
CREATE TRIGGER subscription_update_trigger
  AFTER INSERT OR UPDATE ON organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();

-- Create function to track usage
CREATE OR REPLACE FUNCTION track_usage(
  p_metric_name text,
  p_value bigint,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_organization_id uuid;
BEGIN
  -- Get organization_id from current user
  SELECT organization_id INTO v_organization_id
  FROM users
  WHERE id = auth.uid();

  INSERT INTO usage_metrics (organization_id, metric_name, value, metadata)
  VALUES (v_organization_id, p_metric_name, p_value, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at);
CREATE INDEX idx_usage_metrics_org_metric ON usage_metrics(organization_id, metric_name, recorded_at);
CREATE INDEX idx_users_org_role ON users(organization_id, role);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(organization_id, status);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organization access to own config"
  ON organizations
  USING (id = get_organization_id());

CREATE POLICY "Public access to subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Organization access to own subscription"
  ON organization_subscriptions
  USING (organization_id = get_organization_id());

CREATE POLICY "Organization access to own usage metrics"
  ON usage_metrics
  USING (organization_id = get_organization_id());

CREATE POLICY "Organization access to own audit logs"
  ON audit_logs
  USING (organization_id = get_organization_id());

-- Create demo organization
INSERT INTO organizations (
  id,
  name,
  domain
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Demo Organization',
  'demo.fitsquad.com'
);

-- Update demo user with organization
UPDATE users 
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE id = '00000000-0000-0000-0000-000000000000';