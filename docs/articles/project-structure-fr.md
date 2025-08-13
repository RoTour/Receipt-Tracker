# Receipt Tracker : Mon Architecture de Code et Mes Bonnes Pratiques

<!-- docs/articles/project-structure-fr.md -->

Construire une application robuste, maintenable et évolutive nécessite une approche réfléchie de l'organisation du code et des pratiques de développement. Dans le projet Receipt Tracker, j'adhère à un ensemble de principes fondamentaux et de modèles architecturaux conçus pour garantir une qualité de code élevée, une facilité de test et un développement de fonctionnalités efficace.

## 1. Principes Fondamentaux : Adopter SOLID

Ma philosophie de développement est ancrée dans les **principes SOLID** de la conception orientée objet. Bien qu'initialement destinés à la POO, ces principes guident ma conception modulaire et fonctionnelle, favorisant :

*   **Principe de Responsabilité Unique (SRP) :** Chaque module, classe ou fonction ne doit avoir qu'une seule raison de changer. Cela conduit à des unités de code plus petites et plus ciblées.
*   **Principe Ouvert/Fermé (OCP) :** Les entités logicielles doivent être ouvertes à l'extension, mais fermées à la modification. Les nouvelles fonctionnalités doivent idéalement être ajoutées en étendant le code existant, et non en le modifiant.
*   **Principe de Substitution de Liskov (LSP) :** Les objets d'une superclasse doivent pouvoir être remplacés par des objets de ses sous-classes sans affecter la correction du programme. Cela garantit une bonne héritage et une bonne implémentation des interfaces.
*   **Principe de Ségrégation des Interfaces (ISP) :** Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas. Cela signifie créer des interfaces granulaires et spécifiques plutôt que de grandes interfaces à usage général.
*   **Principe d'Inversion des Dépendances (DIP) :** Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions. Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions. Ceci est crucial pour la testabilité et la flexibilité.

Ces principes nous mènent collectivement vers une architecture qui ressemble étroitement à l'**Architecture Hexagonale**.

## 2. Architecture Hexagonale : Ports et Adaptateurs

L'Architecture Hexagonale (également connue sous le nom de Ports et Adaptateurs) est au cœur de notre conception. Son objectif principal est de **découpler la logique métier principale (l'"Application") des préoccupations externes** telles que les bases de données, les interfaces utilisateur et les API tierces. Cette séparation offre des avantages significatifs :

*   **Testabilité :** La logique métier peut être testée de manière isolée, sans avoir besoin d'une base de données en cours d'exécution ou d'un navigateur.
*   **Flexibilité :** Les dépendances externes peuvent être facilement échangées (par exemple, passer d'une base de données à une autre, ou d'une API REST à une API GraphQL) sans affecter l'application principale.
*   **Maintenabilité :** Les changements dans les technologies externes n'entraînent pas de changements dans les règles métier.

Dans notre projet, ces concepts se traduisent comme suit :

*   **Application (Logique Métier) :** Contient les règles métier et les cas d'utilisation. Elle définit *ce que* l'application fait.
*   **Infrastructure (Dépendances Externes) :** Inclut les bases de données (Supabase), les services d'IA (OpenAI/Gemini), le stockage de fichiers et le framework d'interface utilisateur (SvelteKit). Elle définit *comment* l'application interagit avec le monde extérieur.
*   **Adaptateurs :** Ce sont les ponts entre l'Application et l'Infrastructure. Ils convertissent les données et les appels entre les interfaces abstraites (ports) de la logique métier et les implémentations concrètes des services externes. Par exemple, un `SupabaseProductRepository` agit comme un adaptateur pour le port `ProductRepository`.
*   **Détails :** Fait référence aux implémentations spécifiques au sein de l'Infrastructure, telles que les composants d'interface utilisateur réels ou le client de base de données concret.

## 3. Structure Modulaire (`src/modules`)

Pour gérer la complexité et promouvoir une séparation claire des préoccupations, notre application est divisée en **modules**, chacun représentant une capacité métier distincte. Ces modules résident dans le dossier `src/modules`, et chacun suit une structure interne cohérente :

```
src/
└── modules/
    ├── [nom-du-module]/
    │   ├── application/  # Services d'application, orchestrateurs (moins courant dans les modules simples)
    │   ├── domain/       # Entités métier principales, objets de valeur, interfaces (ports)
    │   │   ├── entities.ts
    │   │   └── ports.ts
    │   ├── infrastructure/ # Implémentations concrètes des ports de domaine (adaptateurs)
    │   │   └── adapters/
    │   │       ├── [Service]Adapter.ts
    │   │       └── [Repository]Repository.ts
    │   └── use-cases/    # Logique métier, orchestrant le domaine et l'infrastructure
    │       ├── [NomDuCasDUtilisation].ts
    │       └── [NomDuCasDUtilisation].test.ts
    ├── data-management/
    ├── data-visualisation/
    └── receipt-scanning/
```

Chaque module est autonome, définissant son propre domaine, ses interfaces (ports) et ses adaptateurs. Cette structure facilite la compréhension, le test et l'évolution des parties individuelles du système sans affecter les autres.

## 4. Architecture Svelte : L'UI comme Détail

En tant que framework frontend, SvelteKit joue un rôle crucial, mais il est traité comme un **détail d'infrastructure** dans notre Architecture Hexagonale. Cela signifie que :

*   **L'UI comme Couche de Présentation :** Les fichiers `.svelte` sont principalement responsables du rendu de l'interface utilisateur et de la gestion des interactions utilisateur. Ils doivent contenir une logique métier minimale.
*   **Logique Métier dans les Cas d'Utilisation/ViewModels :** La logique d'interface utilisateur complexe ou la manipulation de données est déléguée à des **ViewModels** dédiés (par exemple, `FileUploadVM.svelte.ts`) ou directement aux **Cas d'Utilisation** définis dans les modules.
*   **`src/routes` pour le Routage :** Le répertoire `src/routes` est utilisé uniquement pour définir les routes de l'application et récupérer les données nécessaires aux cas d'utilisation via les fichiers `+page.server.ts` ou `+page.ts` de SvelteKit. Il agit comme un point d'entrée vers la couche application.
*   **Organisation des Composants :** Les composants d'interface utilisateur réutilisables sont placés dans `src/lib/components` ou, s'ils sont spécifiques à un module/cas d'utilisation, dans `src/modules/[module]/usecases/[usecase]/components`.

### Conventions Spécifiques à Svelte 5 :

Nous adoptons les nouvelles fonctionnalités de Svelte 5 et adhérons à des conventions spécifiques :

*   **Gestion des Événements :** La nouvelle syntaxe `onclick` (sans le deux-points) est utilisée pour les écouteurs d'événements.
*   **Typage des Runes :** Les déclarations de type pour les runes sont placées sur la déclaration de variable, et non sur la rune elle-même (par exemple, `let selectedFiles: File[] = $state([]);`).
*   **ViewModels :** Des structures de classe simples `class MyViewModel {}` sont utilisées, avec des instances exportées pour être utilisées dans les composants.
*   **Snippets :** Nous utilisons `{@render children()}` pour le contenu des slots, car `<slot/>` est déprécié.
*   **Typage des Props :** Les props des composants sont explicitement typées à l'aide d'un modèle `type Props = { ... }; let { ... }: Props = $props();`.
*   **Taille des Composants :** Les composants dépassant 150 lignes sont examinés pour un éventuel découpage en unités plus petites et plus gérables.

## 5. Stratégie de Test : Le Comportement avant l'Implémentation

Le test fait partie intégrante de notre flux de travail de développement, garantissant la fiabilité et prévenant les régressions. Notre stratégie se concentre sur les **tests unitaires** et adhère aux principes suivants :

*   **Tester une seule chose :** Chaque cas de test doit vérifier un comportement unique et spécifique.
*   **Tester en isolation :** Les composants testés doivent être isolés de leurs dépendances à l'aide de l'injection de dépendances (DI).
*   **Répétable et rapide :** Les tests doivent produire des résultats cohérents et s'exécuter rapidement pour faciliter les exécutions fréquentes.
*   **Maintenable :** Les tests doivent être faciles à lire, à comprendre et à mettre à jour à mesure que le code évolue.
*   **Tester le comportement, pas l'implémentation :** Les tests doivent se concentrer sur *ce que* le code fait, et non sur *comment* il le fait. Cela rend les tests plus résistants au refactoring.

### Injection de Dépendances (DI) et Stubs :

Nous utilisons massivement la DI pour injecter des dépendances dans nos cas d'utilisation et autres unités logiques. Cela nous permet de remplacer les implémentations réelles (comme les adaptateurs de base de données ou les clients d'IA) par des **stubs** pendant les tests. Les stubs sont préférés aux mocks lorsque cela est possible, car ils fournissent un comportement contrôlé et prévisible sans coupler étroitement les tests aux détails d'implémentation.

### Nommage des Fichiers de Test :

*   Les fichiers `.ts` sont testés par des fichiers `.test.ts` (par exemple, `my-service.ts` -> `my-service.test.ts`).
*   Les fichiers `.svelte.ts` (ViewModels) sont testés par des fichiers `.test.svelte.ts` (par exemple, `MyComponentVM.svelte.ts` -> `MyComponentVM.test.svelte.ts`).

### Exécution des Tests :

Après avoir écrit les tests, ils sont exécutés pour s'assurer qu'ils passent. Si un test échoue, le problème est résolu et les tests sont réexécutés jusqu'à ce que tous passent. Ce processus itératif garantit que les nouvelles fonctionnalités sont correctement implémentées et que les fonctionnalités existantes restent intactes.

## Conclusion

En adoptant l'Architecture Hexagonale, une structure modulaire et une stratégie de test rigoureuse, le projet Receipt Tracker vise à être une application hautement maintenable, extensible et fiable. Ces pratiques rationalisent non seulement le développement, mais jettent également des bases solides pour les améliorations futures et le succès à long terme.