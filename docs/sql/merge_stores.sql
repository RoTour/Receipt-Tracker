-- Function to merge duplicate stores into a primary store
CREATE OR REPLACE FUNCTION rtdev.merge_stores(primary_id uuid, duplicate_ids uuid[])
RETURNS void AS $$
BEGIN
  -- Re-assign receipts from duplicate stores to the primary store.
  UPDATE rtdev.receipts
  SET store_id = primary_id
  WHERE store_id = ANY(duplicate_ids);

  -- Delete the duplicate stores.
  DELETE FROM rtdev.stores
  WHERE id = ANY(duplicate_ids);
END;
$$ LANGUAGE plpgsql;
