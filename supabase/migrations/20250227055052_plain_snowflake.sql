-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled', 'refunded')),
  payment_method text,
  payment_date timestamptz,
  due_date timestamptz NOT NULL,
  description text,
  invoice_number text,
  service_type text NOT NULL,
  payment_link text,
  payment_qr_code text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  reminder_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  message text,
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'sms', 'whatsapp')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_data jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('upi', 'bank_transfer', 'cash', 'card', 'wallet')),
  details jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Trainers can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

CREATE POLICY "Members can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Create policies for payment_reminders
CREATE POLICY "Trainers can manage all payment reminders"
  ON payment_reminders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

-- Create policies for invoice_templates
CREATE POLICY "Trainers can manage invoice templates"
  ON invoice_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

-- Create policies for payment_methods
CREATE POLICY "Trainers can manage payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

CREATE POLICY "Members can view payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default payment methods
INSERT INTO payment_methods (name, type, details, is_active, created_by)
VALUES 
  ('UPI', 'upi', '{"id": "trainer@upi", "qr_code": "https://example.com/qr-code.png"}', true, '00000000-0000-0000-0000-000000000000'),
  ('Bank Transfer', 'bank_transfer', '{"account_number": "1234567890", "ifsc": "BANK0001234", "account_name": "Trainer Name"}', true, '00000000-0000-0000-0000-000000000000'),
  ('Cash', 'cash', '{}', true, '00000000-0000-0000-0000-000000000000');

-- Insert default invoice template
INSERT INTO invoice_templates (name, template_data, is_default, created_by)
VALUES (
  'Standard Invoice', 
  '{
    "logo": "https://example.com/logo.png",
    "company_name": "FitSquad Training",
    "address": "123 Fitness Street, Workout City",
    "phone": "+91 98765 43210",
    "email": "trainer@fitsquad.com",
    "colors": {
      "primary": "#4F46E5",
      "secondary": "#F0F0FF",
      "accent": "#34C759"
    },
    "footer_text": "Thank you for your business!"
  }',
  true,
  '00000000-0000-0000-0000-000000000000'
);

-- Insert sample payments for demo
INSERT INTO payments (
  user_id, 
  amount, 
  currency, 
  status, 
  payment_method, 
  payment_date, 
  due_date, 
  description, 
  invoice_number, 
  service_type
)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'UPI', NOW() - INTERVAL '15 days', NOW() - INTERVAL '20 days', 'Personal Training - January', 'INV-2025-001', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '45 days', NOW() - INTERVAL '50 days', 'Personal Training - December', 'INV-2024-012', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'pending', NULL, NULL, NOW() + INTERVAL '5 days', 'Personal Training - February', 'INV-2025-002', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'overdue', NULL, NULL, NOW() - INTERVAL '5 days', 'Personal Training - February (Late)', 'INV-2025-003', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'completed', 'Cash', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'Group Training - January', 'INV-2025-004', 'Group Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'pending', NULL, NULL, NOW() + INTERVAL '10 days', 'Group Training - February', 'INV-2025-005', 'Group Training');