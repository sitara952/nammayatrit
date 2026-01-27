#!/bin/bash

# Check if two arguments are passed
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <android_version> <ios_version>"
    exit 1
fi

ANDROID_VERSION=$1
IOS_VERSION=$2

# Android Apps
android_apps=(
    "MovingTech/nammayatriconsumer"
    "MovingTech/odishayatriconsumer-1"
    "MovingTech/yatrisathiconsumer-1"
)

# iOS Apps
ios_apps=(
    "MovingTech/manayatriconsumer"
    "MovingTech/nammayatriconsumer-1"
    "MovingTech/odishayatriconsumer"
    "MovingTech/yatriconsumer"
    "MovingTech/yatrisathiconsumer"
)

# Directory or main.jsbundle file to use
OUTPUT_DIR="./"
BUNDLE_FILE="main.jsbundle"

# Error tracking
errors=()

# Release to Android apps
for app in "${android_apps[@]}"; do
    echo "Releasing to Android app: $app"
    if ! appcenter codepush release-react -a "$app" -d Production -t "$ANDROID_VERSION" -o "$OUTPUT_DIR" --mandatory true; then
        echo "Error releasing to $app"
        errors+=("Android app $app failed")
    fi
done

# Release to iOS apps
for app in "${ios_apps[@]}"; do
    echo "Releasing to iOS app: $app"
    if ! appcenter codepush release-react -a "$app" -d Production -t "$IOS_VERSION" -o "$OUTPUT_DIR" -b "$BUNDLE_FILE" --mandatory true; then
        echo "Error releasing to $app"
        errors+=("iOS app $app failed")
    fi
done

# Report errors if any
if [ ${#errors[@]} -ne 0 ]; then
    echo "The following errors occurred:"
    for error in "${errors[@]}"; do
        echo "- $error"
    done
else
    echo "Release completed successfully for all apps!"
fi
