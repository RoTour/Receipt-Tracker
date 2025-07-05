---
Status: Completed
---

# View All Receipts Plan

Here is the plan to implement a page for viewing and searching all receipts:

1.  **Create a New Route and Page:**
    *   Establish a new route at `/dashboard/receipts`.
    *   This involves creating `/src/routes/dashboard/receipts/+page.svelte` and `/src/routes/dashboard/receipts/+page.server.ts`.

2.  **Implement Backend Logic (`+page.server.ts`):**
    *   The `load` function will fetch all receipts, including store names.
    *   It will support URL-based search queries (e.g., `?query=...`) to filter by store name.
    *   Pagination will be implemented to handle large datasets (e.g., `?page=...`).

3.  **Design the Frontend (`+page.svelte`):**
    *   A search bar will be available to filter receipts.
    *   Receipts will be displayed in a table with columns for Store, Date, and Total.
    *   Each row will link to the corresponding receipt's detail page.
    *   Pagination controls will be added for navigation.

4.  **Update Sidebar Navigation:**
    *   A "Receipts" link will be added to the main navigation sidebar in `src/routes/dashboard/+layout.svelte` for easy access.
