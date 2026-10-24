-- JUNO.1 shop schema. Run once in the Supabase SQL editor.
-- Customers can only READ their own orders. All writes happen in the Edge Functions
-- (service role), so nobody can mark their own order paid from the browser.

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  public_id           text unique not null
                        default ('JN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id             uuid not null references auth.users (id) on delete cascade,

  quantity            int  not null check (quantity between 1 and 10),
  unit_price_paise    int  not null check (unit_price_paise > 0),
  shipping_paise      int  not null default 0 check (shipping_paise >= 0),
  total_paise         int  not null check (total_paise > 0),
  currency            text not null default 'INR',

  customer_name       text not null,
  phone               text not null,
  email               text not null,
  address_line1       text not null,
  address_line2       text,
  city                text not null,
  state               text not null,
  pincode             text not null,
  notes               text,

  status              text not null default 'pending_payment'
                        check (status in ('pending_payment','payment_failed','paid','packed','shipped','delivered','cancelled')),
  razorpay_order_id   text unique,
  razorpay_payment_id text,

  courier             text,
  tracking_number     text,

  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  packed_at           timestamptz,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  updated_at          timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Customers read their own orders" on public.orders;
create policy "Customers read their own orders"
  on public.orders for select
  using (auth.uid() = user_id);
-- No insert / update / delete policies on purpose.

-- When you change `status` in the Table Editor, stamp the matching time automatically.
create or replace function public.stamp_order_status() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status = 'paid'      and new.paid_at      is null then new.paid_at      := now(); end if;
    if new.status = 'packed'    and new.packed_at    is null then new.packed_at    := now(); end if;
    if new.status = 'shipped'   and new.shipped_at   is null then new.shipped_at   := now(); end if;
    if new.status = 'delivered' and new.delivered_at is null then new.delivered_at := now(); end if;
  end if;
  return new;
end $$;

drop trigger if exists orders_stamp_status on public.orders;
create trigger orders_stamp_status before update on public.orders
  for each row execute function public.stamp_order_status();
