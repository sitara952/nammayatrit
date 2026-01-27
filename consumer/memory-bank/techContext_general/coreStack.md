# Core Technology Stack

This document lists the primary technologies, languages, and key libraries that form the core of the application.

## Core Platform & Languages

*   **Mobile Framework:** React Native (v0.75.4)
*   **Primary Application Language:** TypeScript (v5.5.3)
    *   All new UI components, screens, and business logic are developed in TypeScript, primarily within the `src-v2/` directory.
*   **API Type Definition Language:** ReScript (v11.1.0)
    *   Usage is **exclusively for defining API type contracts**. ReScript code is compiled to JavaScript/TypeScript (`.bs.js`, `.gen.tsx`) for consumption by the TypeScript application.
    *   Legacy ReScript UI code in `src/` is not actively used for new development.

## Key Libraries & Frameworks

*   **State Management:**
    *   Redux Toolkit (v2.8.2) - For global client-side state.
    *   React Query (via `@tanstack/react-query` v5.51.9, potentially with `@rescriptbr/react-query` for ReScript type generation if used in that layer) - For server state management, caching, and data fetching.
*   **Navigation:**
    *   React Navigation (v6.x.x - various packages like `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`) - For all screen transitions and navigation patterns.
*   **Styling:**
    *   TailwindCSS (v3.4.11) - Implemented via `twrnc` (v4.8.0) for utility-first styling in React Native.
    *   `classnames` - Utility for conditionally joining class names.
*   **Backend Services (Client-Side Integration):**
    *   Firebase (v22.2.0 for `@react-native-firebase/*` packages)
        *   Analytics
        *   App
        *   Auth (Authentication)
        *   Crashlytics (Crash Reporting)
        *   Firestore (NoSQL Database)
        *   Messaging (Push Notifications - FCM)
        *   Remote Config (Remote Configuration)
*   **Common UI Libraries/Components (Examples):**
    *   Lottie (`lottie-react-native`) - For animations.
    *   React Native Maps (`react-native-maps`) - For map displays and interactions.
    *   React Native Bottom Sheet (`@gorhom/bottom-sheet`) - For modal-like bottom sheets.
    *   React Native SVG (`react-native-svg`) - For using SVG images.
    *   React Native Webview (`react-native-webview`) - For embedding web content.
    *   React Native Video (`react-native-video`) - For video playback.
    *   React Native Date Picker (`react-native-date-picker`)
    *   React Native QR Code Scanner/Generator (e.g., `react-native-qrcode-svg`)
    *   React Native Haptic Feedback (`react-native-haptic-feedback`)
    *   React Native Masked View (`@react-native-masked-view/masked-view`)
    *   React Native Reanimated (`react-native-reanimated`) - For advanced animations.
        *   Reanimated Carousel (`react-native-reanimated-carousel`)
*   **Testing:**
    *   Jest - For unit and integration testing.
*   **Build/Bundling:**
    *   Metro (React Native's default bundler, invoked via React Native CLI).
*   **Version Control:**
    *   Git (assumed, standard for such projects).
