#!/bin/bash

# Function to build Android
build_android() {
  echo "Building APK for Android..."
  cd android
  fastlane buildAPK
  cd ..
}

# Function to build iOS
build_ios() {
  echo "Building IPA for iOS..."
  cd ios
  fastlane build_ipa
  cd ..
}

install_fastlane() {
  if ! command -v fastlane &> /dev/null; then
    echo "Fastlane not found. Installing Fastlane..."
    sudo gem install fastlane -NV
  else
    echo "Fastlane is already installed."
  fi
}

# Check if the platform argument is provided
if [ -z "$1" ]; then
  echo "Please specify a platform (android, ios, or all)"
  exit 1
fi

# Assign the first argument to the platform variable
PLATFORM=$1

install_fastlane

# Run common commands
echo "Running yarn install..."
yarn install

echo "Running yarn re:build..."
yarn re:build

# Check the platform and run the respective commands
case $PLATFORM in
  android)
    build_android
    ;;
  ios)
    build_ios
    ;;
  all)
    build_android &
    build_ios &
    # Wait for all background jobs to finish
    wait
    ;;
  *)
    echo "ERROR:: Invalid platform specified. Please use 'android', 'ios', or 'all'."
    exit 1
    ;;
esac
