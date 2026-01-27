# Authentication: Technical Context

This document outlines specific technical details related to the implementation of user authentication and profile management features. All UI and flow logic are implemented in TypeScript.

## Authentication & Onboarding (TypeScript)

*   **Technology:** TypeScript, React Native. UI elements are built using components from `src-v2/primitives` or `src-v2/components`.
*   **Authentication Service Integration:**
    *   The application interacts with a backend authentication service (details to be identified from codebase - e.g., custom backend API, a specific third-party auth SDK).
    *   This interaction is managed from TypeScript code (e.g., within Flow files/hooks or dedicated auth service modules) for:
        *   Phone number OTP sending and verification.
        *   User creation and sign-in.
*   **Firebase SDKs that might be involved (even if not for core login/OTP):**
    *   `@react-native-firebase/auth` (v22.2.0): While not necessarily the primary mechanism for phone OTP login as per recent clarification, this SDK might be used for other auth-related functionalities if present (e.g., linking other credential types, handling ID tokens if the custom auth service integrates with Firebase Identity Platform). Its exact role in the core auth flow needs to be verified from the codebase.
*   **State Management:**
    *   Local component state for UI interactions (e.g., OTP input fields).
    *   Redux Toolkit for managing global user session state.
    *   React Query if any server-side state needs to be managed related to the custom authentication flow.

## Profile Management (TypeScript - `src-v2/`)

*   **Technology:** TypeScript, following the standard UI/Flow architecture of `src-v2/`.
*   **Data Storage & Retrieval:**
    *   `@react-native-firebase/firestore` (v22.2.0) is likely used for fetching and updating extended user profile data stored in Firestore.
    *   Alternatively, a custom backend API might serve this data.
*   **Firebase Auth SDK (for user context):**
    *   `@react-native-firebase/auth` (v22.2.0) might be used to access current user details (`firebase.auth().currentUser`) if the session management ultimately ties into a Firebase User ID, even if the initial auth is custom. This needs verification.
*   **State Management:**
    *   Redux Toolkit for global user session state.
    *   React Query for managing server state related to fetching/updating profile data.
*   **Key Screens/Files (from `src-v2/screens/`):**
    *   `MyProfile/`
    *   `UpdateMyProfile/`
    *   `ProfileTab/`

## Core Authentication Service Interaction Details (To Be Confirmed from Codebase)

*   **Primary Authentication Mechanism:** The specific SDK or API client for the main authentication service (e.g., custom API, non-Firebase auth provider) needs to be identified.
*   **Key Features Handled by the Auth Service:**
    *   User Creation/Sign-in (e.g., via Phone OTP).
    *   Session token issuance and validation.
    *   Password Reset (if applicable).
*   **Firebase Auth SDK's Role (if any in core auth):** To be clarified. It's listed as a dependency, but its role in the primary phone OTP login flow is now understood to be potentially indirect or secondary.

## User Profile Data Management (from TypeScript)

*   **Firebase Firestore:**
    *   Likely datastore for additional user profile information (e.g., user preferences, application-specific data).
    *   User documents in Firestore are typically keyed by a unique User ID (which might or might not be a Firebase Auth UID, depending on the core auth service).
    *   Uses `@react-native-firebase/firestore` (v22.2.0) package.
*   **API for Profile Updates:** If a separate backend is used for profile data, API calls (defined in TypeScript) would be made.

## Client-Side State Management for Auth (TypeScript)

*   **Redux (User/Session Slice):**
    *   Stores information about the current authenticated user (e.g., User ID, tokens).
    *   Manages a flag indicating authentication status.
    *   Updated based on responses from the actual authentication service.

## Security Considerations

*   **Secure Token Storage:** Use `react-native-keychain` or similar for any locally stored sensitive tokens.
*   **Input Validation:** Validate all user inputs in TypeScript logic.
*   **API Security:** Ensure all backend APIs (auth, profile) are properly secured.

*(This document will be further refined once the specific authentication service and its integration points in the TypeScript codebase are analyzed.)*
