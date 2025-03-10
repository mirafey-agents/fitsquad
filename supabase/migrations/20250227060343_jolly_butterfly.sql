-- Add more sample payments for testing
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
  -- Completed payments for different months
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'UPI', NOW() - INTERVAL '75 days', NOW() - INTERVAL '80 days', 'Personal Training - November', 'INV-2024-011', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '105 days', NOW() - INTERVAL '110 days', 'Personal Training - October', 'INV-2024-010', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Cash', NOW() - INTERVAL '135 days', NOW() - INTERVAL '140 days', 'Personal Training - September', 'INV-2024-009', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'UPI', NOW() - INTERVAL '165 days', NOW() - INTERVAL '170 days', 'Personal Training - August', 'INV-2024-008', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '195 days', NOW() - INTERVAL '200 days', 'Personal Training - July', 'INV-2024-007', 'Personal Training'),
  
  -- Group training payments for different months
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'completed', 'UPI', NOW() - INTERVAL '40 days', NOW() - INTERVAL '45 days', 'Group Training - December', 'INV-2024-G012', 'Group Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'completed', 'Cash', NOW() - INTERVAL '70 days', NOW() - INTERVAL '75 days', 'Group Training - November', 'INV-2024-G011', 'Group Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '100 days', NOW() - INTERVAL '105 days', 'Group Training - October', 'INV-2024-G010', 'Group Training'),
  
  -- Pending payments
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'pending', NULL, NULL, NOW() + INTERVAL '15 days', 'Personal Training - March', 'INV-2025-003', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'pending', NULL, NULL, NOW() + INTERVAL '20 days', 'Group Training - March', 'INV-2025-G003', 'Group Training'),
  
  -- Overdue payments
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'overdue', NULL, NULL, NOW() - INTERVAL '10 days', 'Personal Training - Late Payment', 'INV-2025-004', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 2500, 'INR', 'overdue', NULL, NULL, NOW() - INTERVAL '15 days', 'Group Training - Late Payment', 'INV-2025-G004', 'Group Training'),
  
  -- Different payment methods
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'UPI', NOW() - INTERVAL '20 days', NOW() - INTERVAL '25 days', 'Personal Training - UPI Payment', 'INV-2025-005', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '25 days', NOW() - INTERVAL '30 days', 'Personal Training - Bank Transfer', 'INV-2025-006', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Cash', NOW() - INTERVAL '30 days', NOW() - INTERVAL '35 days', 'Personal Training - Cash Payment', 'INV-2025-007', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'completed', 'Card', NOW() - INTERVAL '35 days', NOW() - INTERVAL '40 days', 'Personal Training - Card Payment', 'INV-2025-008', 'Personal Training'),
  
  -- Different amounts
  ('00000000-0000-0000-0000-000000000000', 3000, 'INR', 'completed', 'UPI', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', 'Personal Training - Basic Package', 'INV-2025-009', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 7500, 'INR', 'completed', 'Bank Transfer', NOW() - INTERVAL '6 days', NOW() - INTERVAL '11 days', 'Personal Training - Premium Package', 'INV-2025-010', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 10000, 'INR', 'completed', 'Card', NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', 'Personal Training - Elite Package', 'INV-2025-011', 'Personal Training'),
  
  -- Different currencies
  ('00000000-0000-0000-0000-000000000000', 100, 'USD', 'completed', 'Card', NOW() - INTERVAL '8 days', NOW() - INTERVAL '13 days', 'Personal Training - USD Payment', 'INV-2025-012', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 80, 'EUR', 'completed', 'Bank Transfer', NOW() - INTERVAL '9 days', NOW() - INTERVAL '14 days', 'Personal Training - EUR Payment', 'INV-2025-013', 'Personal Training'),
  
  -- Cancelled and refunded payments
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'cancelled', NULL, NULL, NOW() - INTERVAL '20 days', 'Personal Training - Cancelled', 'INV-2025-014', 'Personal Training'),
  ('00000000-0000-0000-0000-000000000000', 5000, 'INR', 'refunded', 'UPI', NOW() - INTERVAL '25 days', NOW() - INTERVAL '30 days', 'Personal Training - Refunded', 'INV-2025-015', 'Personal Training');

-- Add payment reminders
INSERT INTO payment_reminders (
  payment_id,
  reminder_date,
  status,
  message,
  delivery_method,
  sent_at
)
SELECT 
  id,
  due_date - INTERVAL '3 days',
  'sent',
  'Your payment is due in 3 days. Please make the payment to avoid late fees.',
  'whatsapp',
  due_date - INTERVAL '3 days'
FROM payments
WHERE status IN ('completed', 'overdue')
LIMIT 10;

INSERT INTO payment_reminders (
  payment_id,
  reminder_date,
  status,
  message,
  delivery_method,
  sent_at
)
SELECT 
  id,
  due_date - INTERVAL '1 day',
  'sent',
  'Your payment is due tomorrow. Please make the payment to avoid late fees.',
  'email',
  due_date - INTERVAL '1 day'
FROM payments
WHERE status IN ('completed', 'overdue')
LIMIT 10;

INSERT INTO payment_reminders (
  payment_id,
  reminder_date,
  status,
  message,
  delivery_method
)
SELECT 
  id,
  due_date + INTERVAL '1 day',
  'pending',
  'Your payment is overdue. Please make the payment as soon as possible to avoid service interruption.',
  'whatsapp'
FROM payments
WHERE status = 'pending'
LIMIT 5;

-- Add more invoice templates
INSERT INTO invoice_templates (name, template_data, is_default, created_by)
VALUES 
(
  'Premium Template', 
  '{
    "logo": "https://example.com/premium-logo.png",
    "company_name": "FitSquad Premium",
    "address": "123 Fitness Boulevard, Workout City",
    "phone": "+91 98765 43210",
    "email": "premium@fitsquad.com",
    "colors": {
      "primary": "#22C55E",
      "secondary": "#E8FFE1",
      "accent": "#4F46E5"
    },
    "footer_text": "Thank you for choosing our premium services!"
  }',
  false,
  '00000000-0000-0000-0000-000000000000'
),
(
  'Corporate Template', 
  '{
    "logo": "https://example.com/corporate-logo.png",
    "company_name": "FitSquad Corporate",
    "address": "456 Business Park, Corporate City",
    "phone": "+91 98765 43210",
    "email": "corporate@fitsquad.com",
    "colors": {
      "primary": "#0F172A",
      "secondary": "#F1F5F9",
      "accent": "#3B82F6"
    },
    "footer_text": "Empowering corporate wellness since 2020"
  }',
  false,
  '00000000-0000-0000-0000-000000000000'
);

-- Add more payment methods
INSERT INTO payment_methods (name, type, details, is_active, created_by)
VALUES 
  ('Credit Card', 'card', '{"accepted_cards": ["Visa", "Mastercard", "Amex"], "processing_fee": "2%"}', true, '00000000-0000-0000-0000-000000000000'),
  ('Debit Card', 'card', '{"accepted_cards": ["Visa", "Mastercard", "Rupay"], "processing_fee": "1.5%"}', true, '00000000-0000-0000-0000-000000000000'),
  ('PhonePe', 'wallet', '{"id": "trainer@phonepe", "qr_code": "https://example.com/phonepe-qr.png"}', true, '00000000-0000-0000-0000-000000000000'),
  ('Google Pay', 'wallet', '{"id": "trainer@okicici", "qr_code": "https://example.com/gpay-qr.png"}', true, '00000000-0000-0000-0000-000000000000');