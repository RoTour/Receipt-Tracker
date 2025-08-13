# Receipt Tracker: My Code Architecture and Best Practices

<!-- docs/articles/project-structure-en.md -->

Building a robust, maintainable, and scalable application requires a thoughtful approach to code organization and development practices. In the Receipt Tracker project, I adhere to a set of core principles and architectural patterns designed to ensure high code quality, ease of testing, and efficient feature development.

## 1. Core Principles: Embracing SOLID

Our development philosophy is rooted in the **SOLID principles** of object-oriented design. While originally for OOP, these principles guide our modular and functional design, promoting:

*   **Single Responsibility Principle (SRP):** Each module, class, or function should have only one reason to change. This leads to smaller, more focused units of code.
*   **Open/Closed Principle (OCP):** Software entities should be open for extension, but closed for modification. New features should ideally be added by extending existing code, not altering it.
*   **Liskov Substitution Principle (LSP):** Objects of a superclass should be replaceable with objects of its subclasses without affecting the correctness of the program. This ensures proper inheritance and interface implementation.
*   **Interface Segregation Principle (ISP):** Clients should not be forced to depend on interfaces they do not use. This means creating fine-grained, specific interfaces rather than large, general-purpose ones.
*   **Dependency Inversion Principle (DIP):** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions. This is crucial for testability and flexibility.

These principles collectively lead us towards an architecture closely resembling the **Hexagonal Architecture**.

## 2. Hexagonal Architecture: Ports and Adapters

The Hexagonal Architecture (also known as Ports and Adapters) is central to our design. Its primary purpose is to **decouple the core business logic (the "Application") from external concerns** such as databases, user interfaces, and third-party APIs. This separation offers significant benefits:

*   **Testability:** The core logic can be tested in isolation, without needing a running database or a browser.
*   **Flexibility:** External dependencies can be swapped out easily (e.g., changing from one database to another, or from a REST API to a GraphQL API) without impacting the core application.
*   **Maintainability:** Changes in external technologies do not necessitate changes in the business rules.

In our project, these concepts map as follows:

*   **Application (Core Logic):** This contains the business rules and use cases. It defines *what* the application does.
*   **Infrastructure (External Dependencies):** This includes databases (Supabase), AI services (OpenAI/Gemini), file storage, and the UI framework (SvelteKit). It defines *how* the application interacts with the outside world.
*   **Adapters:** These are the bridges between the Application and the Infrastructure. They convert data and calls between the core logic's abstract interfaces (ports) and the concrete implementations of the external services. For example, a `SupabaseProductRepository` acts as an adapter for the `ProductRepository` port.
*   **Details:** This refers to the specific implementations within the Infrastructure, such as the actual UI components or the concrete database client.

## 3. Modular Structure (`src/modules`)

To manage complexity and promote clear separation of concerns, our application is divided into **modules**, each representing a distinct business capability. These modules reside in the `src/modules` folder, and each follows a consistent internal structure:

```
src/
└── modules/
    ├── [module-name]/
    │   ├── application/  # Application services, orchestrators (less common in simple modules)
    │   ├── domain/       # Core business entities, value objects, interfaces (ports)
    │   │   ├── entities.ts
    │   │   └── ports.ts
    │   ├── infrastructure/ # Concrete implementations of domain ports (adapters)
    │   │   └── adapters/
    │   │       ├── [Service]Adapter.ts
    │   │       └── [Repository]Repository.ts
    │   └── use-cases/    # Business logic, orchestrating domain and infrastructure
    │       ├── [UseCaseName].ts
    │       └── [UseCaseName].test.ts
    ├── data-management/
    ├── data-visualisation/
    └── receipt-scanning/
```

Each module is self-contained, defining its own domain, interfaces (ports), and adapters. This structure makes it easy to understand, test, and evolve individual parts of the system without affecting others.

## 4. Svelte Architecture: UI as a Detail

As a frontend framework, SvelteKit plays a crucial role, but it's treated as an **infrastructure detail** in our Hexagonal Architecture. This means:

*   **UI as Presentation Layer:** `.svelte` files are primarily responsible for rendering the user interface and handling user interactions. They should contain minimal business logic.
*   **Business Logic in Use Cases/ViewModels:** Complex UI logic or data manipulation is delegated to dedicated **ViewModels** (e.g., `FileUploadVM.svelte.ts`) or directly to **Use Cases** defined within the modules.
*   **`src/routes` for Routing:** The `src/routes` directory is used solely for defining application routes and fetching necessary data for the use cases via SvelteKit's `+page.server.ts` or `+page.ts` files. It acts as an entry point to the application layer.
*   **Component Organization:** Reusable UI components are placed in `src/lib/components` or, if specific to a module/use case, within `src/modules/[module]/usecases/[usecase]/components`.

### Svelte 5 Specific Conventions:

We embrace Svelte 5's new features and adhere to specific conventions:

*   **Event Handling:** The new `onclick` syntax (without the colon) is used for event listeners.
*   **Typing Runes:** Type declarations for runes are placed on the variable declaration, not the rune itself (e.g., `let selectedFiles: File[] = $state([]);`).
*   **ViewModels:** Simple `class MyViewModel {}` structures are used, with instances exported for use in components.
*   **Snippets:** We use `{@render children()}` for slot content, as `<slot/>` is deprecated.
*   **Props Typing:** Component props are explicitly typed using a `type Props = { ... }; let { ... }: Props = $props();` pattern.
*   **Component Size:** Components exceeding 150 lines are reviewed for potential splitting into smaller, more manageable units.

## 5. Testing Strategy: Behavior Over Implementation

Testing is an integral part of our development workflow, ensuring reliability and preventing regressions. Our strategy focuses on **unit testing** and adheres to the following principles:

*   **Test One Thing Only:** Each test case should verify a single, specific behavior.
*   **Test in Isolation:** Components under test should be isolated from their dependencies using Dependency Injection (DI).
*   **Repeatable and Fast:** Tests should produce consistent results and execute quickly to facilitate frequent runs.
*   **Maintainable:** Tests should be easy to read, understand, and update as the codebase evolves.
*   **Test Behavior, Not Implementation:** Tests should focus on *what* the code does, not *how* it does it. This makes tests more resilient to refactoring.

### Dependency Injection (DI) and Stubs:

We heavily utilize DI to inject dependencies into our use cases and other logic units. This allows us to replace real implementations (like database adapters or AI clients) with **stubs** during testing. Stubs are preferred over mocks where possible, as they provide controlled, predictable behavior without tightly coupling tests to implementation details.

### Test File Naming:

*   `.ts` files are tested by `.test.ts` files (e.g., `my-service.ts` -> `my-service.test.ts`).
*   `.svelte.ts` files (ViewModels) are tested by `.test.svelte.ts` files (e.g., `MyComponentVM.svelte.ts` -> `MyComponentVM.test.svelte.ts`).

### Test Execution:

After writing tests, they are run to ensure they pass. If a test fails, the issue is addressed, and tests are re-run until all pass. This iterative process ensures that new features are correctly implemented and existing functionality remains intact.

## Conclusion

By adopting the Hexagonal Architecture, a modular structure, and a rigorous testing strategy, the Receipt Tracker project aims to be a highly maintainable, extensible, and reliable application. These practices not only streamline development but also lay a solid foundation for future enhancements and long-term success.