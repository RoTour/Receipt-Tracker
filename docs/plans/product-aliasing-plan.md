---
Status: In Progress
---

# Product Aliasing Feature Plan

This plan outlines a two-phased approach to allow users to link raw receipt item text to canonical products, improving data accuracy and reducing manual edits for future uploads.

### **Phase 1: Database and Backend Foundation**

This phase focuses on setting up the necessary database structures and modifying the backend logic to use them, without touching the user interface.

1.  **Create a New `product_aliases` Table:**
    *   Create a new SQL file at `docs/feature/product-aliasing.sql`.
    *   This file will define a new table named `product_aliases` with the following columns:
        *   `alias_text` (TEXT, PRIMARY KEY): This will store a normalized version of the raw text from a receipt item (e.g., "pat yaourt nat x2"). It will be the unique key for lookups.
        *   `product_id` (UUID, FOREIGN KEY): This will reference the `id` in the canonical `products` table.
    *   This table will act as a direct mapping: "When you see this text, it always means this product."

2.  **Update the Upload Process:**
    *   Modify the `processAndSaveReceiptItems` function in `src/lib/server/db_helpers.ts`.
    *   When a new receipt is being processed, for each item, the logic will be:
        1.  Normalize the `raw_text` from the receipt to create a consistent `alias_text` key.
        2.  **First, query the new `product_aliases` table** with this key.
        3.  **If a match is found:** Use the `product_id` from the alias table to link the new `receipt_item`.
        4.  **If no match is found:** Fall back to the current behavior of using the AI's best guess to find or create a product in the `products` table.

### **Phase 2: User Interface for Alias Management**

This phase focuses on creating the UI for users to create and manage these aliases from the receipt details page.

1.  **Add "Link to Product" UI:**
    *   In the `ReceiptItemsTable.svelte` component, add a new "Link to Product" option to the context menu that appears when you right-click (or long-press) on an item.

2.  **Create a "Link Product" Dialog:**
    *   Clicking the new menu option will open a new dialog component, which will be named `LinkProductDialog.svelte`.
    *   This dialog will contain:
        *   The original raw text of the item (e.g., "PAT YAOURT NAT x2").
        *   A search bar to find an existing, canonical product to link it to.

3.  **Implement Product Linking Logic:**
    *   The search bar in the dialog will call a new, lightweight server action to search the `products` table by name.
    *   When the user selects a product from the search results and clicks "Link", a new form action (`linkProduct`) will be submitted.
    *   This `linkProduct` action in `src/routes/dashboard/receipt/[id]/+page.server.ts` will:
        1.  Create or update an entry in the `product_aliases` table, mapping the item's `alias_text` to the selected `product_id`.
        2.  Update the current `receipt_item` to point to the correct `product_id`.
        3.  Refresh the data on the page to show the immediate change.
