# Development Environment Setup

This document outlines the prerequisites, installation steps, and key commands for setting up and running the development environment.

## Prerequisites

*   **Node.js:** Version 18 or higher.
*   **Yarn:** Version 1.22.22 (Classic).
*   **Watchman:** Recommended for Metro bundler's file watching performance. (Implied by `.watchmanconfig`)
*   **Ruby with Bundler:** Required for iOS dependency management (CocoaPods).
*   **Xcode:** For iOS development (including simulators and build tools).
*   **Android Studio & SDK:** For Android development (including emulators and build tools).
*   **Java Development Kit (JDK):** Required for Android builds.

## Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```
2.  **Install JavaScript Dependencies:**
    ```bash
    yarn install 
    ```
    *   This command also triggers a `postinstall` script: `patch-package && yarn re:clean && yarn re:build`.
    *   `patch-package` applies any defined patches to `node_modules`.
    *   `yarn re:clean && yarn re:build` cleans and rebuilds ReScript code, generating necessary TypeScript type definitions.
3.  **Install iOS Dependencies:**
    ```bash
    cd ios
    bundle install  # Installs Ruby gems defined in Gemfile (e.g., CocoaPods)
    bundle exec pod install
    cd ..
    ```

## Running the Application

1.  **Start the Metro Bundler (and Compilers):**
    *   Open a new terminal window/tab.
    *   Run:
        ```bash
        yarn start 
        ```
        *   This script typically starts the Metro bundler.
        *   It may also initiate ReScript and TypeScript compilers in watch mode via `yarn re:start` or similar, ensuring code is recompiled on changes. The `package.json` script for `start` is: `patch-package && yarn re:start`.
        *   `yarn re:start`: `concurrently "yarn rs:start" "yarn ts:start" "yarn config-types:start"`
            *   `yarn rs:start`: `rescript build -w` (ReScript watch mode)
            *   `yarn ts:start`: `tsc --watch` (TypeScript watch mode)
            *   `yarn config-types:start`: (Specific to project, likely generates types from config files)

2.  **Run on Android:**
    *   Open another terminal window/tab.
    *   Ensure an Android emulator is running or a device is connected.
    *   Run:
        ```bash
        yarn android 
        ```
    *   For specific build variants (e.g., different environments or app IDs):
        ```bash
        yarn run-android <variantName> <appId>
        # Example: yarn run-android DevDebug com.example.dev
        ```

3.  **Run on iOS:**
    *   Open another terminal window/tab.
    *   Ensure an iOS simulator is running or a device is connected.
    *   Run:
        ```bash
        yarn ios
        ```
    *   For specific build variants/schemes:
        ```bash
        yarn run-ios <variantName>
        # Example: yarn run-ios Nammayatri-Debug 
        ```
        (The exact script might be `yarn ios --scheme <SchemeName>`)

## Key Scripts/Commands (`package.json`)

*   **Compilation & Watching:**
    *   `yarn re:start`: Starts ReScript and TypeScript compilers in watch mode, plus config type generation.
    *   `yarn rs:start`: `rescript build -w` (ReScript compiler in watch mode).
    *   `yarn ts:start`: `tsc --watch` (TypeScript compiler in watch mode).
    *   `yarn re:build`: `rescript build` (Builds all ReScript code).
    *   `yarn re:clean`: `rescript clean && rimraf src/**/*.gen.tsx src/**/**/*.gen.tsx` (Cleans ReScript build artifacts and generated TypeScript files).
*   **Formatting & Linting:**
    *   `yarn res:format`: `rescript format -all` (Formats all ReScript files).
    *   `yarn lint`: Lints TypeScript code in `src/typescript` and `src-v2` using ESLint.
    *   `yarn lint-fix`: Attempts to automatically fix ESLint issues in TypeScript files.
*   **Testing:**
    *   `yarn test`: Runs Jest tests.
*   **Other Utility Scripts:**
    *   `patch-package`: Applies patches from the `patches/` directory.
    *   Various build and bundling scripts for release (e.g., `bundleRelease.sh`, `build.sh`).

*(Refer to `package.json` for the full list of scripts and their exact commands.)*
