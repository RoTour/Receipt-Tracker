---
Status: To Do
---

# Store Deduplication Plan

This plan outlines a two-phased approach to identify, prevent, and merge duplicate store entries, ensuring data consistency and reliability.

## Phase 1: Prevent New Duplicates with Enhanced Normalization

**Goal:** Immediately reduce the creation of new duplicate stores by implementing a robust, unique key for each store based on its name and location.

1.  **Database Schema Update:**
    *   Add a new column `normalized_key` to the `stores` table in `docs/databaseStructure.sql`.
    *   This column will be of type `text` and must have a `UNIQUE` constraint.

2.  **Backend Normalization Logic:**
    *   In `src/lib/server/normalization.ts`, create a new function named `generateStoreKey`.
    *   This function will take a store's name and location, and generate a consistent key by:
        *   Converting text to lowercase.
        *   Removing all accents and diacritics.
        *   Removing all punctuation (hyphens, commas, etc.) and whitespace.
        *   Standardizing common address terms (e.g., "rue" -> "r").

3.  **Update Upload Process:**
    *   In `src/routes/dashboard/upload/+page.server.ts`, modify the `upload` action.
    *   Before creating a store, call `generateStoreKey` with the AI-extracted store name and location.
    *   Use this generated key in the `upsert` operation on the `stores` table, using the `normalized_key` column as the conflict target (`onConflict`). This will automatically link the receipt to an existing store if the key matches, or create a new one if it doesn't.

## Phase 2: Clean Up Existing Duplicates with a Manual Merging Tool

**Goal:** Empower the user to clean up existing duplicates by providing a simple interface to merge them.

1.  **Create New Route:**
    *   Create a new route at `/dashboard/stores/merge`. This will involve creating:
        *   `src/routes/dashboard/stores/merge/+page.svelte`
        *   `src/routes/dashboard/stores/merge/+page.server.ts`

2.  **Backend Logic (`+page.server.ts`):**
    *   The `load` function will identify potential duplicate store groups. A good strategy is to find stores with the same `name` but different `id`s or slightly different `location`s.
    *   Create a form action named `merge` that:
        *   Accepts a "primary" store ID and a list of "duplicate" store IDs.
        *   Re-assigns all `receipts` linked to the duplicate IDs to the primary ID.
        *   Deletes the now-unlinked duplicate store records.

3.  **Frontend UI (`+page.svelte`):**
    *   Display the groups of potential duplicates identified by the `load` function.
    *   For each group, allow the user to select which store is the "canonical" version.
    *   Provide a "Merge" button that submits the selected primary and duplicate IDs to the `merge` action.
    *   The UI should provide clear feedback on the success or failure of the merge operation.

4.  **Update Navigation:**
    *   Add a "Merge Stores" link to the sidebar in `src/routes/dashboard/+layout.svelte` to make the new tool accessible.
