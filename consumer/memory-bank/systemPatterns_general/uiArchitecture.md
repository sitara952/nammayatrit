# General UI Architecture Patterns

This document outlines the core UI architecture patterns used throughout the application, primarily within the `src-v2/` TypeScript environment.

## Component-Based UI

*   Standard for React Native, implemented in TypeScript within `src-v2/`.
*   **Custom Primitive Components:** ESLint rules enforce the use of custom UI primitives from `src-v2/primitives` (e.g., Button, Pressable) instead of default React Native components. This promotes a consistent UI, adherence to design system, and potentially enhanced functionality.
*   **Higher-Level Components:** Feature-specific or more complex reusable components are located in `src-v2/components/`.
*   Legacy ReScript components in `src/components/` are not used for new development.

## Screen Development Framework (UI/Flow Separation)

New screens in `src-v2` follow a strict two-file pattern within their respective feature subdirectory (e.g., `src-v2/screens/FeatureName/`) to separate concerns:

*   **UI File (e.g., `ScreenNameUI.tsx` or `UI.tsx`):**
    *   Responsible for rendering the screen's UI, including JSX, styling, and UI-specific animations.
    *   Receives all necessary data (view state) and an `mpDispatch` function via props from the Flow file/hook.
    *   Handles direct user interactions (e.g., button presses, text input).
    *   To trigger business logic or state changes managed by the Flow file, it calls `props.mpDispatch(createAction('ACTION_TYPE', payload))`.
    *   Is kept free of complex business logic, direct global state management (Redux/React Query), and direct API calls.
*   **Flow File/Hook (e.g., `ScreenNameFlow.tsx` or `useScreenNameFlow.ts`):**
    *   Manages all state relevant to the screen:
        *   Local component state (using `useState`, `useReducer`).
        *   Global Redux state (via `useAppSelector` for reading, `useAppDispatch` for writing).
        *   Server state (via React Query hooks).
    *   Handles all business logic, side effects (e.g., API calls, navigation).
    *   Defines a `resolver` function (typically a switch statement based on action types) that processes actions dispatched from the UI file via `mpDispatch`.
    *   Often uses a utility (e.g., `createDispatcher(resolver)`) to create the `mpDispatch` function that is passed to the UI file.
    *   Consolidates all data required by the UI (view state) and the `mpDispatch` function into a props object that is passed to the UI file when rendering it.

**Benefits of UI/Flow Separation:**
*   **Clear Separation of Concerns:** Presentation logic is isolated from business/state logic.
*   **Improved Testability:** UI components can be tested with mock props; Flow logic can be tested independently of rendering.
*   **Enhanced Maintainability:** Changes in UI are less likely to break business logic, and vice versa.
*   **Reusability:** Flow logic might be reusable across different UI presentations (though less common at screen level).

**Example Interaction Flow:**
1.  Flow file initializes, fetches data, prepares initial view state and `mpDispatch`.
2.  Flow file renders UI file, passing view state and `mpDispatch` as props.
3.  User interacts with UI file (e.g., clicks button).
4.  UI file calls `props.mpDispatch(createAction('USER_ACTION', ...))`.
5.  `mpDispatch` in Flow file invokes its resolver.
6.  Resolver handles the action: updates state (local, Redux, React Query), performs business logic, calls APIs.
7.  State changes trigger re-render of Flow file.
8.  Flow file prepares new view state.
9.  Flow file re-renders UI file with new props.
10. UI file updates to reflect new state.

*(Refer to the main data flow diagram in `systemPatterns_overview.md` for a visual representation).*

## Styling

*   **TailwindCSS (via `twrnc`):** A utility-first CSS approach is used for styling React Native components.
    *   Configuration and custom utilities are typically found in `src-v2/tailwind-theme/`.
*   Direct import of `twrnc` is often managed via a custom wrapper or utility from `@/src-v2/tailwind-theme/tailwind` as per ESLint rules.

## Folder Structure (UI Related)

*   **Screens:** `src-v2/screens/`
    *   All active screens are TypeScript-based.
    *   Organized into feature-specific subdirectories (e.g., `HomeScreen/`, `MyProfile/`, `Search/`).
    *   Each screen subdirectory contains its `UI.tsx` and `Flow.tsx` (or `useFlowHook.ts`) files, and often a `Types.ts`.
*   **Components:**
    *   `src-v2/components/`: Higher-level, often feature-specific, reusable UI components.
    *   `src-v2/primitives/`: Custom, reusable base UI components (e.g., Button, Pressable, View, Text wrappers), enforced by ESLint.
*   Legacy ReScript screens and components are in `src/screens/` and `src/components/` respectively and are not for new development.
