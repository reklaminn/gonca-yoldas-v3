/*
  # Fix Guest Order RPC Types
  
  1. Düzeltme:
    - `create_guest_order` fonksiyonunda `program_id` hatalı bir şekilde `integer` olarak cast ediliyordu.
    - Hata: "column 'program_id' is of type uuid but expression is of type integer"
    - Çözüm: `(order_data->>'program_id')::uuid` olarak güncellendi.
*/

CREATE OR REPLACE FUNCTION create_guest_order(order_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id uuid;
BEGIN
  INSERT INTO orders (
    full_name, email, phone, city, district, customer_type,
    tc_no, tax_office, tax_number, billing_address,
    program_id, program_slug, program_title, program_price,
    subtotal, discount_percentage, discount_amount,
    tax_rate, tax_amount, total_amount,
    payment_method, installment, coupon_code,
    payment_status, status,
    card_name, card_last_four,
    sendpulse_sent, metadata,
    user_id
  )
  SELECT
    (order_data->>'full_name')::text,
    (order_data->>'email')::text,
    (order_data->>'phone')::text,
    (order_data->>'city')::text,
    (order_data->>'district')::text,
    (order_data->>'customer_type')::text,
    (order_data->>'tc_no')::text,
    (order_data->>'tax_office')::text,
    (order_data->>'tax_number')::text,
    (order_data->>'billing_address')::text,
    (order_data->>'program_id')::uuid, -- DÜZELTİLDİ: integer -> uuid
    (order_data->>'program_slug')::text,
    (order_data->>'program_title')::text,
    (order_data->>'program_price')::numeric,
    (order_data->>'subtotal')::numeric,
    (order_data->>'discount_percentage')::integer,
    (order_data->>'discount_amount')::numeric,
    (order_data->>'tax_rate')::integer,
    (order_data->>'tax_amount')::numeric,
    (order_data->>'total_amount')::numeric,
    (order_data->>'payment_method')::text,
    (order_data->>'installment')::integer,
    (order_data->>'coupon_code')::text,
    (order_data->>'payment_status')::text,
    (order_data->>'status')::text,
    (order_data->>'card_name')::text,
    (order_data->>'card_last_four')::text,
    (order_data->>'sendpulse_sent')::boolean,
    (order_data->'metadata')::jsonb,
    NULL -- Misafir siparişlerinde user_id her zaman NULL
  RETURNING id INTO new_order_id;

  RETURN new_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_guest_order(jsonb) TO public;
