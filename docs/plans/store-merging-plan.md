---
Status: To Do
---

# Store Merging Feature Plan

## High-Level Goal

Introduce a "selection mode" on the `/dashboard/stores` page that allows a user to select multiple stores, designate one as the primary, and merge the others into it. This involves updating all associated receipts and then deleting the duplicate store records.

---

### Phase 1: Frontend Changes (`/src/routes/dashboard/stores/+page.svelte`)

1.  **State Management:**
    *   Introduce new state variables to manage the UI:
        *   `let isSelectionMode = $state(false);`
        *   `let selectedStoreIds = $state(new Set<string>());`
        *   `let primaryStoreId = $state<string | null>(null);`

2.  **Entering Selection Mode:**
    *   **Mobile (Long Press):** Add a `oncontextmenu` event to each store item in the list. On mobile, this event is triggered by a long press. This event will:
        *   Prevent the default browser context menu.
        *   Set `isSelectionMode = true;`
        *   Set the long-pressed store as the `primaryStoreId`.
        *   Add its ID to `selectedStoreIds`.
    *   **Desktop (Right-Click):** The same `oncontextmenu` event will provide a consistent entry point on desktop.
    *   **Explicit Button:** Add a "Select" or "Merge" button in the page header that toggles `isSelectionMode`.

3.  **UI in Selection Mode:**
    *   When `isSelectionMode` is `true`:
        *   Display a checkbox next to each store item. The checkbox state will be bound to the `selectedStoreIds` set.
        *   Visually distinguish the `primaryStoreId` item (e.g., with a different background color or a "Primary" badge).
        *   Show a floating action bar at the bottom of the screen containing:
            *   A "Merge Selected" button (enabled only when >1 store is selected).
            *   A "Cancel" button to exit selection mode.

4.  **Form Submission:**
    *   The "Merge Selected" button will be part of a form.
    *   When submitted, this form will send the `primaryStoreId` and a list of the other `selectedStoreIds` (the duplicates) to a new server action.

---

### Phase 2: Backend Changes (`/src/routes/dashboard/stores/+page.server.ts`)

1.  **New `merge` Action:**
    *   Create a new form action named `merge`.
    *   It will expect two fields from the form data: `primaryStoreId` (string) and `duplicateStoreIds` (an array of strings).

2.  **Create a Database Function for Atomicity:**
    *   To ensure the merge is an all-or-nothing operation, create a new SQL function. This is the safest way to handle multi-step data changes.
    *   **Name:** `merge_stores`
    *   **Inputs:** `primary_id UUID`, `duplicate_ids UUID[]`
    *   **Logic:**
        1.  `UPDATE receipts SET store_id = primary_id WHERE store_id = ANY(duplicate_ids);`
        2.  `DELETE FROM stores WHERE id = ANY(duplicate_ids);`
    *   This function should be added to `docs/databaseStructure.sql` for documentation.

3.  **Implement the Action Logic:**
    *   The `merge` action will call this new SQL function via `supabase.rpc('merge_stores', { ... })`.
    *   It will perform validation to ensure at least two stores are provided.
    *   On success, it will return a success message.
    *   On failure (e.g., database error), it will return a `fail()` with an appropriate error message.
