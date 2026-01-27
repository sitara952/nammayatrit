# Authentication System Patterns

This document outlines system patterns specifically related to user authentication and profile management. All active UI and flow logic for these features are implemented in TypeScript.

## Authentication & Onboarding Flows (TypeScript)

The primary user onboarding, mobile number entry, OTP verification, and initial login/registration sequences are handled by TypeScript code.
*   **Implementation Approach:**
    *   These flows are built using TypeScript and React Native components, adhering to the UI/Flow architecture (from `src-v2/`) if they are distinct screens.
    *   If not distinct screens in `src-v2/screens/`, the logic might be part of a more generic screen, a common component, or orchestrated by the root application navigator/a dedicated authentication navigator, all within the TypeScript domain.
*   **State Management:** Uses local component state, Redux for global session state, and/or React Query for any related server state, all managed from TypeScript.
*   **Navigation:** Handled by the application's React Navigation setup (TypeScript).
*   **Authentication Service Interaction:** Interaction with the backend authentication service for OTP, user creation, and sign-in is managed from TypeScript (Flow files/hooks or dedicated service layers). The specific service (e.g., custom backend, third-party SDK other than Firebase for core login) needs to be identified from the codebase.

## Profile Management Flows (TypeScript - `src-v2/`)

User profile viewing and updates for already authenticated users are handled by TypeScript components in `src-v2/screens/`.

*   **Key Screens (from `src-v2/screens/`):**
    *   `MyProfile/`: Displays the current user's profile information.
    *   `UpdateMyProfile/`: Allows users to edit their profile details.
    *   `ProfileTab/`: May serve as a container or entry point within a tab-based navigation structure for accessing profile features.
*   **Pattern:**
    *   These screens follow the standard `src-v2/` UI/Flow architecture:
        *   UI files (`UI.tsx`) for presentation.
        *   Flow files/hooks (`Flow.tsx` or `use...Flow.ts`) for logic, state management (Redux, React Query), and API interactions (e.g., fetching profile data, submitting updates).
    *   Data for user profiles is likely fetched from Firebase Firestore or a dedicated backend API.
    *   Updates are sent via API calls, with state managed by React Query and/or reflected in Redux.

## Core Authentication Logic (TypeScript)

*   **Login/Registration (Primarily Phone OTP based):**
    *   User provides their mobile number.
    *   Application, via TypeScript code, interacts with the designated backend authentication service to send an OTP.
    *   User submits the received OTP.
    *   Application verifies the OTP with the authentication service.
    *   On successful verification, the authentication service creates a new user (if one doesn't exist for that phone number) or signs in an existing user.
    *   Session tokens are stored (e.g., in Redux, secure storage).
    *   User is navigated to the main application.
*   **Password Reset Flow (If email/password auth is also supported by the auth service):**
    *   User requests password reset (typically via email).
    *   A secure token/link is sent by the authentication service.
    *   User sets a new password.

## Session Management

*   **Token Storage:** Securely store authentication tokens (e.g., using `react-native-keychain` or similar, potentially managed via Redux persist).
*   **Token Refresh:** Implement logic for refreshing tokens before they expire to maintain active sessions (interaction with the auth service).
*   **Logout:** Clear session tokens and navigate user to the login screen. Redux state related to the user session is cleared.

## Profile Management Data

*   **Data Source:** User profile data (beyond core auth identity) might be stored in Firebase Firestore or a dedicated backend service.
*   **Update Flow:**
    *   User modifies profile information in the UI.
    *   Application sends update request to the backend (Firestore or custom API).
    *   Local state (Redux, React Query cache) is updated on success.

## Key Components / Services

*   **Authentication Service Client/SDK:** The specific client library or API interaction layer used to communicate with the backend authentication mechanism. (This needs to be identified from the codebase, e.g., custom API client, a non-Firebase auth SDK).
*   **Firebase Firestore (`@react-native-firebase/firestore`):** May be used for storing extended user profile information, potentially separate from the core authentication mechanism if auth is handled by a different service.
*   **Redux User/Session Slice:** Manages global state related to the authenticated user (e.g., user ID, tokens) and session status.
*   **Navigation Guards/Conditional Navigation:** Root navigator often checks authentication state (from Redux) to direct users to either authentication screens or the main app.

*(Specific screen names and component details for authentication flows, and the precise nature of the Authentication Service, will be detailed here as they are identified from the codebase.)*
