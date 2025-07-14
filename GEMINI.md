## DATABASE INFORMATION
### **Overall Schema Purpose**

This database is designed for a **Receipt Tracking Application**. It captures information about stores, the products they sell, and links them together through individual purchase receipts and their line items.

---

### **1. Core Entities (Tables)**

The schema consists of four main tables:

1.  `stores`: Information about physical store locations.
2.  `products`: A master list of all unique products.
3.  `receipts`: High-level data for each purchase receipt.
4.  `receipt_items`: The individual items listed on each receipt, acting as a link between `receipts` and `products`.

---

### **2. Table Breakdown**

#### **Table: `stores`**
* **Purpose:** Stores unique store locations (e.g., Intermarché, Toulouse).
* **Columns:**
    * `id`: `UUID` - Primary Key.
    * `name`: `text` - The name of the store (e.g., "Carrefour Market").
    * `location`: `text` - The location of the store (e.g., "Rue de Metz, Toulouse").
    * `created_at`: `timestamp` - When the store was added.

#### **Table: `products`**
* **Purpose:** A canonical list of all unique products, with a verification status.
* **Columns:**
    * `id`: `UUID` - Primary Key.
    * `normalized_name`: `text` - A clean, standardized name for the product.
    * `brand`: `text` - The product's brand (e.g., "Lu").
    * `category`: `text` - The product's category (e.g., "Biscuits").
    * `is_verified`: `boolean` - A flag indicating if the product information has been manually confirmed.
    * `created_at`: `timestamp` - When the product was first added.

#### **Table: `receipts`**
* **Purpose:** Contains high-level information for each uploaded receipt.
* **Columns:**
    * `id`: `UUID` - Primary Key.
    * `store_id`: `UUID` - **Foreign Key** referencing `stores.id`.
    * `purchase_date`: `date` - The date of the transaction.
    * `total`: `numeric` - The total amount on the receipt.
    * `file_path`: `text` - A path to the stored receipt file (e.g., an image).
    * `created_at`: `timestamp` - When the receipt was added.

#### **Table: `receipt_items`**
* **Purpose:** This is a join table representing individual line items from each receipt, linking products, quantities, and prices.
* **Columns:**
    * `id`: `UUID` - Primary Key.
    * `receipt_id`: `UUID` - **Foreign Key** referencing `receipts.id`.
    * `product_id`: `UUID` - **Foreign Key** referencing `products.id`.
    * `raw_text`: `text` - The original line item text as it appears on the receipt.
    * `quantity`: `numeric` - The quantity of the product purchased.
    * `price`: `numeric` - The total price for that line item (quantity * unit price).
    * `created_at`: `timestamp` - When the receipt item was added.

---

### **3. Key Relationships**

* **One-to-Many:** A `store` can have many `receipts`.
    * (`stores.id` ← `receipts.store_id`)
* **One-to-Many:** A `receipt` can have many `receipt_items`.
    * (`receipts.id` ← `receipt_items.receipt_id`)
* **Many-to-Many (via `receipt_items`):** A `product` can appear on many `receipt_items`, and a `receipt` contains many `products` through its items.
    * (`products.id` ← `receipt_items.product_id`)
* **Deletion Rule:** If a `receipt` is deleted, all of its associated `receipt_items` are also automatically deleted (`ON DELETE CASCADE`).

---

### **4. Functionality**

#### **Function: `search_products(search_term text)`**
* **Purpose:** Provides a user-friendly way to search for past purchases.
* **Input:** A text string (`search_term`).
* **Action:**
    1.  It performs a case-insensitive and accent-insensitive search (`ILIKE` with `unaccent`) on the product's standardized name (`products.normalized_name`).
    2.  It joins all four tables (`stores`, `products`, `receipts`, `receipt_items`) to collect detailed information about each matching purchase.
* **Output:** A table of up to 50 results, sorted by the most recent purchase date, containing the product's name and brand, the price and quantity paid, the purchase date, and the store where it was bought.

---

### **5. Technical Metadata**

* **Ownership & Permissions:** All tables and functions are owned by `supabase_admin`. Broad `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions are granted to Supabase's standard roles (`anon`, `authenticated`, `service_role`), indicating this schema is for a Supabase project.

---

### **6. Technical Instructions**

When changes are needed on the database, write the SQL queries in a .sql file under `docs/[feature]/[feature].sql`.
Assume the database is already set up and running.

---
## Code Architecture (Code must be refactored to follow this section, wait for user asking for it)

### **1. Principles**
We are aiming to follow SOLID principles and best practices for code quality and maintainability. From these principles emerge an architecture close to the Hexagonal Architecture.

### **2. Architecture**

#### **2.1. Hexagonal Architecture**
* **Purpose:** The Hexagonal Architecture is a design pattern that separates the core logic of the application from the external dependencies, such as the database and the user interface. This allows the application to be tested in isolation and to be easily modified or extended in the future.
* **Components:**
    * `Application`: The core logic of the application, which is independent of the external dependencies.
    * `Infrastructure`: The external dependencies, such as the database and the user interface.
    * `Adapter`: The bridge between the `Application` and the `Infrastructure`, which is responsible for converting the data between the two.
    * `Details`: The implementation details of the application, such as UI, database, etc.

#### **2.2. Modules**
We have a `src/modules` folder that contains the different modules of the application. Each module has its own usecases, adapters, applications, interfaces, components etc. Each type of component should be in its own folder.
Each module is defined by a broad business need, such as 'extracting data', 'data-viz', 'data-management' etc.

#### **2.3. Svelte Architecture**
We are using SvelteKit as our framework.
To follow our architecture principles, we should make sure that our `.svelte` files are only responsible for the UI and that the business logic is in the usecases folder.
`src/routes` should only contain the routes and the necessary parameters for the usecases.
Components should be in their own `src/modules/[module]/usecases/[usecase]/components` folder.
Components with logic should be coupled with the respective ViewModel.

#### **2.4. Testing Strategy**
Before refactoring/implementing feature, it's extremely important to have a clear understanding of the feature and its requirements.
Then, we should write tests for the feature.
Tests should follow the main unit testing rules:
- Test one thing only
- Test in isolation
- Test in a repeatable way
- Test in a fast way
- Test in a maintainable way
- Test behavior, not implementation

We should use DI (Dependency Injection) to inject the dependencies of the usecases.
This projects uses supabase as database, but tests should stub the database. Avoid mocking as much as possible, prefer using DI, interface and stubs instead.

Tests should be written in a separate file next to the component it's testing.
Test for .ts files should end with .test.ts
Test for .svelte.ts files should end with .test.svelte.ts

Once tests are written, we should run them and make sure they pass.
If they don't, we should fix the issue and run the tests again.