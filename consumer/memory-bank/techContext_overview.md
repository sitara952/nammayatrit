# Technical Context Overview

This document provides a high-level overview of the technical landscape of the application, including the core technology stack, development setup, and key tooling. For detailed information on specific areas, please refer to the linked documents.

## Core Technology Stack

*   A summary of the main languages (React Native, TypeScript, ReScript for API types), frameworks (React Navigation, Redux Toolkit, React Query), and key libraries (Firebase, TailwindCSS via `twrnc`).
*   **Details:** [./techContext_general/coreStack.md](./techContext_general/coreStack.md)

## Development Environment Setup

*   Information on prerequisites (Node, Yarn, Ruby, Xcode, Android Studio), installation steps for dependencies, and commands for running the application on different platforms.
*   **Details:** [./techContext_general/developmentSetup.md](./techContext_general/developmentSetup.md)

## Tooling & Configuration

*   Covers linters (ESLint), formatters (ReScript Formatter, Prettier), build tools (Metro, ReScript Compiler, TSC), package management (Yarn), dependency patching (`patch-package`), and configurations for TypeScript (`tsconfig.json`) and ReScript (`bsconfig.json`).
*   **Details:** [./techContext_general/tooling.md](./techContext_general/tooling.md)

## Feature-Specific Technical Context

Technical details pertinent to specific major features:

*   **Authentication:** Focuses on Firebase Authentication integration, user profile data management with Firestore, and client-side state for auth.
    *   **Details:** [./features/authentication/tech.md](./features/authentication/tech.md)
*   **Ride Booking (Search & Tracking):** Covers technologies for maps (`react-native-maps`), location services, geocoding, routing, real-time tracking (WebSockets/Push/Polling), and relevant client-side libraries.
    *   **Details:** [./features/rideBooking/tech.md](./features/rideBooking/tech.md)
*   **(Planned) Multimodal Engine Technical Context:** (Link to `features/multimodalEngine/tech_overview.md` once populated)
    *   This would cover any specific technologies or complex integrations unique to the multimodal journey calculation and management, beyond the general rule engine pattern.
*   **(Planned) Home Screen Technical Context:** (Link to `features/homeScreen/tech.md` once populated)
*   **(Planned) Favourites Flow Technical Context:** (Link to `features/favourites/tech.md` once populated)
*   **(Planned) Miscellaneous Features Technical Context:** (Link to `features/miscFeatures/tech.md` once populated)
    *   This would cover tech details for payments (e.g., HyperSDK integration), notifications (FCM specifics beyond core setup), etc.

## Dependencies

*   A comprehensive list of dependencies is available in `package.json`.
*   Key dependencies and their versions are highlighted in [./techContext_general/coreStack.md](./techContext_general/coreStack.md).

## Technical Constraints

*(This section remains open for future additions as specific constraints are identified or defined. Examples could include performance targets, specific OS version support, third-party integration limitations, etc.)*

This overview serves as a map to the more detailed technical documentation.
