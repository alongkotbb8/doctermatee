-- Helper RPC: deduct product stock atomically
create or replace function decrement_stock(product_id uuid, amount integer)
returns void language plpgsql security definer as $$
begin
  update products
  set stock = stock - amount
  where id = product_id and stock >= amount;

  if not found then
    raise exception 'insufficient_stock';
  end if;
end;
$$;

-- Helper RPC: increment coupon used count
create or replace function increment_coupon_use(coupon_id uuid)
returns void language plpgsql security definer as $$
begin
  update coupons
  set used_count = used_count + 1
  where id = coupon_id;
end;
$$;
