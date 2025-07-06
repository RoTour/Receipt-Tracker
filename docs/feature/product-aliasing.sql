-- Defines the new product_aliases table for mapping raw text to products.
CREATE TABLE rtdev.product_aliases (
    alias_text TEXT PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES rtdev.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add a comment to the table for clarity
COMMENT ON TABLE rtdev.product_aliases IS 'Maps a normalized raw text string from a receipt to a canonical product_id.';
