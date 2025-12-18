# Database Schema Audit Report

## Tables Found in Project

### 1. **profiles** ✅ FIXED
- **Status**: Recently updated
- **Columns**: id, full_name, phone, email, city, district, tax_office, tax_number, role, subscription_tier, created_at, updated_at

### 2. **orders** 
- **Used in**: `src/services/orders.ts`
- **Required Columns**:
  - id, user_id, order_number
  - full_name, email, phone
  - country, city, district, postal_code, address
  - tax_office, tax_number
  - program_id, program_slug, program_title, program_price
  - subtotal, discount_percentage, discount_amount
  - tax_rate, tax_amount, total_amount
  - payment_method, installment, coupon_code, payment_status
  - card_name, card_last_four
  - sendpulse_sent, sendpulse_sent_at, sendpulse_error
  - order_date, created_at, updated_at

### 3. **order_items**
- **Used in**: `supabase/migrations/003_orders_system.sql`
- **Required Columns**:
  - id, order_id
  - program_id, program_slug, program_title
  - quantity, unit_price, total_price
  - created_at

### 4. **subscription_plans**
- **Used in**: `supabase/migrations/002_subscription_system.sql`
- **Required Columns**:
  - id, name, slug, description
  - price, currency, billing_period
  - features (jsonb)
  - is_active
  - created_at, updated_at

### 5. **user_subscriptions**
- **Used in**: `supabase/migrations/002_subscription_system.sql`
- **Required Columns**:
  - id, user_id, plan_id
  - status, started_at, expires_at, cancelled_at
  - payment_method, payment_provider
  - external_subscription_id
  - metadata (jsonb)
  - created_at, updated_at

### 6. **payment_transactions**
- **Used in**: `supabase/migrations/002_subscription_system.sql`
- **Required Columns**:
  - id, user_id, subscription_id
  - amount, currency, status
  - payment_method, payment_provider
  - external_transaction_id
  - metadata (jsonb)
  - created_at, updated_at

### 7. **audit_logs** (Referenced but not defined)
- **Used in**: `supabase/migrations/002_subscription_system.sql`
- **Required Columns**:
  - id, user_id
  - action, resource
  - metadata (jsonb)
  - created_at

## Action Plan
1. ✅ profiles - Already fixed
2. ⚠️ Verify orders table schema
3. ⚠️ Verify order_items table schema
4. ⚠️ Verify subscription tables
5. ⚠️ Create audit_logs table (missing)
