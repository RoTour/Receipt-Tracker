
BEGIN
    -- The RETURN QUERY statement executes the query and returns its result set.
RETURN QUERY
SELECT
    ri.id,
    ri.price,
    ri.quantity,
    p.normalized_name,
    p.brand,
    r.purchase_date,
    s.name AS store_name
FROM
    rtdev.receipt_items AS ri
        JOIN
    rtdev.products AS p ON ri.product_id = p.id
        JOIN
    rtdev.receipts AS r ON ri.receipt_id = r.id
        JOIN
    rtdev.stores AS s ON r.store_id = s.id
WHERE
    -- The unaccent() function removes accents (diacritics) from strings.
    -- Using it on both the column and the search term makes the search accent-insensitive.
    -- The ILIKE operator performs a case-insensitive search.
    unaccent(p.normalized_name) ILIKE unaccent('%' || search_term || '%')
ORDER BY
    r.purchase_date DESC
    LIMIT 50;
END;
