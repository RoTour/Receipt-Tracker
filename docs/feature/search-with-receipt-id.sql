-- docs/feature/search-with-receipt-id.sql

-- Drop the existing function if it exists, to avoid errors on re-run.
-- The new version adds the receipt_id to the output for linking from search results.
DROP FUNCTION IF EXISTS rtdev.search_products(text);

-- Recreate the function with the new receipt_id column
CREATE OR REPLACE FUNCTION rtdev.search_products(search_term text)
RETURNS TABLE(
    id uuid, -- This is the receipt_item id
    receipt_id uuid, -- This is the receipt id
    normalized_name text,
    brand text,
    price numeric,
    quantity numeric,
    purchase_date date,
    store_name text
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      ri.id,
      r.id as receipt_id,
      p.normalized_name,
      p.brand,
      ri.price,
      ri.quantity,
      r.purchase_date,
      s.name as store_name
    FROM
      rtdev.receipt_items ri
    JOIN
      rtdev.products p ON ri.product_id = p.id
    JOIN
      rtdev.receipts r ON ri.receipt_id = r.id
    JOIN
      rtdev.stores s ON r.store_id = s.id
    WHERE
      -- Use unaccent to perform a case-insensitive and accent-insensitive search
      unaccent(p.normalized_name) ILIKE unaccent('%' || search_term || '%')
    ORDER BY
      r.purchase_date DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;
