# Project Brief

## Core Requirements

*   Develop and maintain a mobile application using React Native, with TypeScript as the primary language for UI and application logic.
*   The application likely serves end-users with features related to rides, navigation, user accounts, and payments, given folder names like `rideSearchFlow`, `myRidesFlow`, `paymentMethods`, `HomeScreen`, `DriverProfile`, etc. All new UI development is done in TypeScript within the `src-v2` directory.
*   **Screen Development:** UI screens are to be created by assembling pre-existing UI component files (which will be provided). This includes integrating these components with their corresponding Flow files and TypeScript types. Coding of the individual UI components themselves is not part of this task.
*   **Import Strategy:** Direct imports for components, Flows, UI files, and Types are required. `index.ts` barrel files should not be created or used for this purpose.
*   Integrate with Firebase for backend services (auth, data storage, messaging, analytics).
*   Utilize ReScript **exclusively** for defining API type contracts, ensuring type safety for backend interactions. Legacy ReScript UI code in `src/` is not actively used for new development.

## Goals

*   Provide a functional and performant mobile user experience.
*   Maintain a well-structured and maintainable codebase using established patterns and linting rules.
*   Successfully integrate various native modules and third-party services.

## Scope

*   **In Scope:** Frontend mobile application development for iOS and Android. This includes UI/UX implementation, state management, API integrations, and use of native device features.
*   **Out of Scope (Assumed):** Backend API development (beyond Firebase client-side SDKs), web application development (unless specified otherwise).

## Key Stakeholders

*(To be identified - likely includes product owners, development team, QA, and end-users.)*
