# General Navigation Patterns

This document outlines the navigation patterns used in the application, primarily leveraging React Navigation.

## Core Library: React Navigation

*   **React Navigation (v6.x.x):** The application uses React Navigation for all screen transitions, stack management, tab navigation, and drawer navigation (if applicable).
*   **TypeScript Integration:** Navigation setup, route definitions, and parameter types are strongly typed using TypeScript to ensure type safety during navigation actions.

## Navigation Structure (Typical)

*   **App Navigator (Root):** A root navigator (often a stack navigator or a conditional navigator for auth flows) that orchestrates the main sections of the app.
*   **Stack Navigators:** Used for hierarchical navigation where screens are pushed onto and popped from a stack (e.g., navigating from a list to a detail screen).
*   **Tab Navigator:** Used for primary sections of the app accessible via a bottom tab bar (e.g., Home, Bookings, Profile).
*   **Drawer Navigator:** (If used) For less frequently accessed screens or settings, available via a side drawer.
*   **Nested Navigators:** Navigators can be nested to create complex navigation structures (e.g., a stack navigator within each tab of a tab navigator).

## Key Patterns & Practices

*   **Centralized Configuration:** Navigation stacks, screens, and options are typically configured in dedicated files within `src/navigation/` (or a `src-v2/navigation/` equivalent if fully migrated).
*   **Route Definitions:** Screen names and route parameters are clearly defined, often using enums or constant objects for type safety and consistency.
*   **Type-Safe Navigation:**
    *   Navigation actions (e.g., `navigation.navigate('ScreenName', { param: 'value' })`) use typed route names and parameters.
    *   Screen components receive typed `route` and `navigation` props.
*   **Passing Parameters:** Data is passed between screens using route parameters. Complex objects should be avoided; prefer passing IDs or minimal data and fetching details on the destination screen if necessary.
*   **Navigation from Flow Files/Hooks:** Navigation actions are typically dispatched from Flow files/hooks in response to business logic or user actions resolved from `mpDispatch`.

*   **Navigating to Stateful Stages within a Screen Flow:**
    *   Complex user flows, such as ride booking, often manage distinct stages (e.g., "Choose Ride Options", "Looking for Rides/Allocation") as internal states of a primary screen component (e.g., `HomeNavigation` which is rendered by the `'homeTypeScript'` route).
    *   "Navigating" to these specific stages typically involves:
        1.  Ensuring the application is on the correct parent route (e.g., `navigation.navigate('homeTypeScript')`).
        2.  Setting the appropriate global application state (e.g., via Redux actions) to trigger the display of the UI for that specific stage. This state might include flags like `session.bottomSheetStage` and necessary data like `search.pricingItems` or `user.searchId`.
    *   This is different from navigating to a distinct screen in the stack that has its own dedicated route name and parameters (e.g., `navigation.navigate('onRideNavigation', { bookingId: '...' })`).
    *   The specific Redux state variables and values required to show a particular stage are detailed in the feature-specific pattern documents (e.g., `features/rideBooking/patterns_option_selection.md`, `features/rideBooking/patterns_allocation.md`).
*   **Conditional Rendering / Auth Flow:**
    *   The root navigator often handles conditional rendering based on authentication state (e.g., showing an Auth stack if the user is not logged in, and the Main app stack if logged in).
    *   This is usually managed by checking Redux state (e.g., user session token).
*   **Deep Linking:** (If implemented) Configuration for handling deep links that navigate users to specific screens within the app from external sources.
*   **Navigation Lifecycle Events:** Using React Navigation's focus/blur events or `useFocusEffect` / `useIsFocused` hooks to trigger actions when screens come into or go out of view.

## Legacy Navigation

*   The presence of `src/navigationDeprecated/` suggests an older navigation setup that is no longer in active use. All new navigation logic should adhere to the current patterns in the primary navigation directory.

*(Specific navigator implementations and route maps are detailed in the respective navigation configuration files within the codebase.)*
