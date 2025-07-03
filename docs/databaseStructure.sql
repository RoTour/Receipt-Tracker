-- Create the empty schema.
CREATE SCHEMA rtdev;

create table
  rtdev.stores (
    id uuid not null default gen_random_uuid (),
    name text not null,
    location text null,
    normalized_key text null,
    created_at timestamp with time zone not null default now(),
    constraint stores_pkey primary key (id),
    constraint stores_name_location_key unique (name, location),
    constraint stores_normalized_key_key unique (normalized_key)
  ) tablespace pg_default;

create table
  rtdev.receipts (
    id uuid not null default gen_random_uuid (),
    store_id uuid null,
    purchase_date date not null,
    total numeric null,
    file_path text null,
    created_at timestamp with time zone not null default now(),
    file_hash text null,
    content_hash text null,
    constraint receipts_pkey primary key (id),
    constraint receipts_file_hash_key unique (file_hash),
    constraint receipts_content_hash_key unique (content_hash),
    constraint receipts_store_id_fkey foreign key (store_id) references "rtdev".stores (id)
  ) tablespace pg_default;



create table
  rtdev.products (
    id uuid not null default gen_random_uuid (),
    normalized_name text not null,
    brand text null,
    category text null,
    is_verified boolean not null default false,
    created_at timestamp with time zone not null default now(),
    normalized_key text not null,
    constraint products_pkey primary key (id),
    constraint products_normalized_name_brand_key unique (normalized_name, brand),
    constraint products_normalized_key_unique unique (normalized_key)
  ) tablespace pg_default;


create table
  rtdev.receipt_items (
    id uuid not null default gen_random_uuid (),
    receipt_id uuid not null,
    product_id uuid not null,
    raw_text text not null,
    quantity numeric not null,
    price numeric not null,
    created_at timestamp with time zone not null default now(),
    constraint receipt_items_pkey primary key (id),
    constraint receipt_items_receipt_id_fkey foreign key (receipt_id) references "rtdev".receipts (id) on delete cascade,
    constraint receipt_items_product_id_fkey foreign key (product_id) references "rtdev".products (id)
  ) tablespace pg_default;


CREATE OR REPLACE FUNCTION get_potential_duplicate_stores()
RETURNS TABLE (name text, stores jsonb)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.name,
    jsonb_agg(jsonb_build_object('id', s.id, 'location', s.location))
  FROM rtdev.stores s
  GROUP BY s.name
  HAVING count(*) > 1;
END;
$$ LANGUAGE plpgsql;


