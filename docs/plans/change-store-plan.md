---
Status: Done
---

# Change Store Plan

Here is a plan to add the ability to change the store on the receipt details page:

1.  **Backend - `+page.server.ts` (`/src/routes/dashboard/receipt/[id]/`):**
    *   Modify the `load` function to fetch and return a list of all available stores from the database.
    *   Create a new form action named `updateStore` that will handle the logic for associating the receipt with a different (or new) store.

2.  **Frontend - `+page.svelte` (`/src/routes/dashboard/receipt/[id]/`):**
    *   Add a new UI element, such as an "Edit" or "Change" button, next to the store's name.
    *   Clicking this button will reveal a form. This form should contain a searchable select/dropdown menu populated with the list of stores fetched in the `load` function.
    *   The form will submit the selected store to the new `updateStore` action.
    *   Upon a successful update from the action, the UI should refresh to display the new store name without a full page reload.