ALTER TABLE rtdev.stores
ADD COLUMN normalized_key TEXT NULL;

UPDATE rtdev.stores
SET
  normalized_key = CONCAT(lower(regexp_replace(name, '\W+', '', 'g')), lower(regexp_replace(location, '\W+', '', 'g')));

ALTER TABLE rtdev.stores
ADD CONSTRAINT stores_normalized_key_key UNIQUE (normalized_key);