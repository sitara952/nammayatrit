# Tooling & Configuration

This document covers key development tools, their configurations, and usage patterns, including linters, formatters, build tools, and language-specific configurations.

## Linters & Formatters

*   **ESLint (for TypeScript):**
    *   **Configuration:** `eslint.config.mjs`.
    *   **Purpose:** Enforces a strict, consistent, and functional-leaning coding style for all TypeScript code in `src/typescript/` and `src-v2/`.
    *   **Ignored Files:**
        *   `**/*.bs.js` (JavaScript compiled from ReScript, typically API types).
        *   `**/*.gen.tsx` (TypeScript definitions generated from ReScript by `genType`).
    *   **Key Plugins & Rules (Examples):**
        *   `@typescript-eslint`: Core TypeScript linting rules.
        *   `eslint-plugin-unused-imports`: Detects and helps remove unused imports.
        *   `eslint-plugin-functional`: Encourages functional programming paradigms.
            *   `functional/no-let: ['error', { ignoreIdentifierPattern: '^mutable' }]`: Discourages `let` unless the variable is prefixed with `mutable`. Promotes `const` for immutability.
            *   `functional/immutable-data: ['error', { ignoreAccessorPattern: [...] }]`: Enforces immutable data structures, with common exceptions (e.g., `ref.current`, Redux state mutations within Immer).
        *   `eslint-plugin-react-hooks`: Enforces rules of Hooks.
        *   `custom-linters`: Project-specific custom linting rules.
        *   **Strict Typing Enforcement:**
            *   `@typescript-eslint/no-non-null-assertion: 'error'`
            *   `@typescript-eslint/ban-ts-comment: 'error'` (disallows `@ts-ignore`, etc.)
            *   Custom rule `myCustomPlugin/no-any-in-modified-files: 'error'` (encourages avoiding `any`).
        *   **Import Restrictions:**
            *   Disallows direct import of certain `react-native` components (`ScrollView`, `Animated`, `Button`, `Pressable`, `TouchableOpacity`, `TouchableWithoutFeedback`) in favor of custom alternatives from `@/src-v2/primitives/`.
            *   Disallows default import from `twrnc`, favoring a specific import from `@/src-v2/tailwind-theme/tailwind`.
        *   **Code Cleanliness:**
            *   `unused-imports/no-unused-vars: ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]`
            *   `no-console: ['error', { allow: ['warn', 'error', 'info', ...] }]`
        *   **Custom Rules Examples:** `enforce-optional-params`, `no-duplicate-test-id`, `no-lazy-png-imports`.
    *   **Usage:**
        *   `yarn lint`: To check for linting errors.
        *   `yarn lint-fix`: To automatically fix fixable linting errors.
    *   **Proactive Adherence:** Developers should write code with these ESLint rules in mind to maintain high code quality and minimize iterative fixing.

*   **ReScript Formatter:**
    *   **Command:** `rescript format -all` (often run as `yarn res:format`).
    *   **Purpose:** Formats all ReScript (`.res`, `.resi`) files in the project, ensuring consistent styling for API type definitions.
    *   **Pre-commit Hook:** `res:format` is typically run as a pre-commit hook to ensure all committed ReScript code is formatted.

*   **Prettier:**
    *   Version 3.5.3 is a dev dependency.
    *   Likely used for formatting non-TS/JS/ReScript files (e.g., JSON, Markdown).
    *   May also be integrated with ESLint for TypeScript/JavaScript formatting, or used as a fallback.

## Build Tools

*   **Metro:** The default React Native bundler, used for bundling JavaScript and assets for development and release builds. Invoked via React Native CLI commands (e.g., `yarn start`, `yarn android`, `yarn ios`).
*   **ReScript Compiler:**
    *   **Command:** `rescript build` (or `rescript build -w` for watch mode).
    *   **Purpose:** Compiles ReScript files (`.res`, `.resi`) into JavaScript (`.bs.js`) and generates corresponding TypeScript type definitions (`.gen.tsx` via `genType`).
*   **TypeScript Compiler (`tsc`):**
    *   **Command:** `tsc` (or `tsc --watch` for watch mode).
    *   **Purpose:** Type-checks TypeScript code and can transpile it (though Metro handles the primary bundling for React Native). Used for generating declaration files (`.d.ts`) if configured.

## Package Manager

*   **Yarn (Classic v1.22.22):** Used for managing project dependencies.
    *   `yarn.lock` file tracks exact dependency versions.
    *   `yarn install` to install dependencies.

## Patching Dependencies

*   **`patch-package`:** Used to apply custom patches to `node_modules`. Patches are stored in the `patches/` directory. This is useful for fixing bugs or making small modifications in third-party libraries without waiting for official releases.

## TypeScript Configuration (`tsconfig.json`)

*   **Inheritance:** `extends: "../tsconfig.json"` suggests a base configuration is shared, possibly in a monorepo setup or a higher-level project directory.
*   **`baseUrl: "./"`:** Sets the base directory for module resolution.
*   **`skipLibCheck: true`:** Skips type checking of all declaration files (`*.d.ts`).
*   **Path Aliases:** Defined for convenient module imports:
    *   `@/src-v2/*`: maps to `src-v2/*`
    *   `#/babyconfig/*`: maps to `../babyconfig/*` (references an external/shared configuration directory)
    *   `@/*`: maps to `src/*`
    *   `@designSystem/*`: maps to `src/typescript/designSystem/*`
    *   `@/typescript/*`: maps to `src/typescript/*`
*   **Includes:** Specifies files and directories to be included in the TypeScript compilation context: `src/**/*`, `src-v2/**/*`, `../babyconfig/**/*`, `global.d.ts`.

## ReScript Configuration (`bsconfig.json`)

*   (Details of `bsconfig.json` would be included here if available, covering ReScript version, sources, package-specs, bs-dependencies, ppx-flags, and `gentype` configuration for generating TypeScript types.)
    *   Typically specifies source directories (e.g., `src/api`).
    *   `gentypeconfig` within `bsconfig.json` controls how TypeScript definitions are generated from ReScript types.
