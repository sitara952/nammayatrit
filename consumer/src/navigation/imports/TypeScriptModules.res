// React Elements

module TypeScriptApp = {
  @module("../../typescript/navigation/onboardingNavigation.tsx") @react.component
  external make: unit => React.element = "default"
}

type initialPayloadType = {appId: string}
module MobilityApp = {
  @module("../../App.tsx") @react.component
  external make: (~initialPayload: initialPayloadType) => React.element = "default"
}

module MyRidePrestoView = {
  @module("../../typescript/components/hyperView.tsx") @react.component
  external make: (~viewParam: string) => React.element = "HyperView"
}

module MyRidesNavigation = {
  @module("../../typescript/navigation/myRideNavigation.tsx") @react.component
  external make: unit => React.element = "MyRideNavigation"
}

module LogOutModal = {
  @module("../../typescript/components/LogOut.tsx") @react.component
  external make: (~closeModal: unit => unit) => React.element = "default"
}

module RideConfirmed = {
  @module("../../../src-v2/screens/RideConfirmed/Flow.tsx") @react.component
  external make: unit => React.element = "default"
}

module Toast = {
  @module("../../typescript/designSystem/components/primitives/Toast.tsx") @react.component
  external make: unit => React.element = "default"
}

module ReviewAndFeedback = {
  @module("../../typescript/screens/reviewAndFeedback/index.tsx") @react.component
  external make: unit => React.element = "default"
}

module Home = {
  @module("../../typescript/screens/home/HomeScreen.tsx") @react.component
  external make: unit => React.element = "default"
}

module RootAppNavigation = {
  @module("../../typescript/navigation/mainNavigation.tsx") @react.component
  external make: unit => React.element = "default"
}

module RateCard = {
  @module("../../typescript/designSystem/components/RateCard.tsx") @react.component
  external make: unit => React.element = "default"
}

// Providers

module RefsProvider = {
  @module("../../typescript/context/RefsContext.tsx") @react.component
  external make: (~children: React.element) => React.element = "RefsProvider"
}
module BottomSheetModalProvider = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (~children: React.element) => React.element = "BottomSheetModalProvider"
}

module AnimatedValuesProvider = {
  @module("../../typescript/context/AnimatedValuesContext.tsx") @react.component
  external make: (~children: React.element) => React.element = "AnimatedValuesProvider"
}

module KeyboardProvider = {
  @module("react-native-keyboard-controller") @react.component
  external make: (~children: React.element) => React.element = "KeyboardProvider"
}

// Stores
