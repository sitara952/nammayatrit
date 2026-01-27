# React Native Upgrade: 0.75.4 → 0.79.6

## Overview

This document provides a comprehensive changelog and reference for the React Native consumer app upgrade from version 0.75.4 to 0.79.6. This upgrade has been **completed** and includes all associated dependency updates, architectural changes, and implementation guidelines.

### Key Version Changes

- **React Native**: `0.75.4` → `0.79.6`
- **React**: `18.3.1` → `19.0.0`
- **React Native Reanimated**: `3.16.7` → `3.19.4`
- **React Navigation** (multiple packages): Major version updates
- **Firebase** (all packages): `22.2.0` → `23.4.0`
- **React Native Keyboard Controller**: `1.14.2` → `1.18.6`

### Upgrade Status

**Status**: ✅ Completed

This upgrade included breaking changes in React 19, architectural refactoring in React Navigation, Android edge-to-edge display support implementation, and keyboard handling improvements.

### Critical Changes Summary

⚠️ **Must-Know Changes for Developers:**

1. **Keyboard Handling**: **ALWAYS** use `KeyboardAvoidingView` from `react-native-keyboard-controller`, NOT from `react-native`
   - Old: ❌ `import { KeyboardAvoidingView } from 'react-native'`
   - New: ✅ `import { KeyboardAvoidingView } from 'react-native-keyboard-controller'`

2. **SafeArea**: Use our custom `useSafeAreaInsets` hook from `@/typescript/hooks/safeAreaInsets`
   - Handles edge-to-edge display properly
   - Provides fallback values for devices with zero insets

3. **Navigation**: React Navigation context is now scoped to its navigator
   - Use tab-specific stack navigators (HomeStackNavigator, ProfileStackNavigator, etc.)
   - Navigate between tabs: `navigation.navigate('ProfileTab', { screen: 'myProfile' })`

4. **Performance**: Use `transform` properties instead of `top`/`bottom`/`left`/`right` for animations
   - Prefer `react-native-reanimated` for all animations
   - See Section 5 for complete performance guidelines

---

## 1. Dependency Upgrades

### 1.1 Core Framework

| Package | Previous Version | New Version | Breaking Changes |
|---------|-----------------|-------------|------------------|
| `react` | 18.3.1 | 19.0.0 | Yes - New features and deprecations |
| `react-native` | 0.75.4 | 0.79.6 | Yes - Edge-to-edge support |
| `react-native-reanimated` | 3.16.7 | 3.19.4 | Minor |
| `react-native-screens` | 3.34.0 | 4.16.0 | Yes - API changes |

### 1.2 Firebase SDK

All Firebase packages upgraded from `22.2.0` to `23.4.0`:

```json
{
  "@react-native-firebase/analytics": "23.4.0",
  "@react-native-firebase/app": "23.4.0",
  "@react-native-firebase/auth": "23.4.0",
  "@react-native-firebase/crashlytics": "23.4.0",
  "@react-native-firebase/firestore": "23.4.0",
  "@react-native-firebase/messaging": "23.4.0",
  "@react-native-firebase/remote-config": "23.4.0"
}
```

**Migration Notes:**
- No breaking API changes for our usage patterns
- Performance improvements in Firestore queries
- Enhanced crash reporting capabilities

### 1.3 React Navigation

Major version updates with architectural changes:

| Package | Previous Version | New Version |
|---------|-----------------|-------------|
| `@react-navigation/bottom-tabs` | 6.5.10 | 7.4.7 |
| `@react-navigation/drawer` | 6.7.2 | 7.5.8 |
| `@react-navigation/native` | 6.1.18 | 7.1.18 |
| `@react-navigation/native-stack` | 6.11.0 | 7.3.28 |
| `@react-navigation/stack` | 6.4.1 | 7.4.10 |

**Critical Change**: Navigation context is now scoped to its navigator (see Section 4).

### 1.4 Other Notable Upgrades

| Package | Previous Version | New Version | Notes |
|---------|-----------------|-------------|-------|
| `@d11/react-native-fast-image` | - | 8.12.0 | New dependency for image optimization |
| `@tanstack/react-query` | 5.51.9 | 5.90.2 | Enhanced query capabilities |
| `react-native-gesture-handler` | 2.22.1 | 2.29.1 | Gesture improvements |
| `react-native-keyboard-controller` | 1.14.2 | 1.18.6 | Edge-to-edge support |
| `react-native-device-info` | 11.1.0 | 14.1.1 | Major update |
| `react-native-camera-kit` | 15.1.0 | 16.1.3 | Camera improvements |
| `react-native-safe-area-context` | 4.10.5 | 5.6.1 | Major - Edge-to-edge support |
| `react-native-svg` | 15.12.0 | 15.13.0 | SVG rendering improvements |
| `react-native-video` | 6.14.0 | 6.15.0 | Video playback enhancements |
| `react-native-webview` | 13.12.2 | 13.16.0 | WebView security updates |
| `lottie-react-native` | 7.2.2 | 7.3.4 | Animation performance |
| `clevertap-react-native` | 3.5.0 | 3.6.0 | Analytics improvements |

### 1.5 Development Dependencies

| Package | Previous Version | New Version |
|---------|-----------------|-------------|
| `@react-native/babel-preset` | - | 0.79.6 |
| `@react-native/eslint-config` | - | 0.79.6 |
| `@react-native/metro-config` | - | 0.79.6 |
| `@react-native/typescript-config` | - | 0.79.6 |
| `typescript` | 5.5.3 | 5.5.3 |
| `@typescript-eslint/eslint-plugin` | 8.33.0 | 8.46.2 |
| `@typescript-eslint/parser` | 8.33.0 | 8.46.2 |

---

## 2. Edge-to-Edge Support & SafeArea Changes

### 2.1 Android Edge-to-Edge Mode

React Native 0.79 introduces native support for Android's edge-to-edge display mode, allowing the app content to extend behind the system bars (status bar and navigation bar).

### 2.2 Custom SafeArea Implementation

**Location**: `consumer/src/typescript/hooks/safeAreaInsets.ts`

We implemented a custom `useSafeAreaInsets` hook to handle edge-to-edge mode properly across different device configurations:

```typescript
import { useSafeAreaInsets as safeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { getBoolItem, MMKVKey } from '../utils/MMKV';

export const useSafeAreaInsets = () => {
    const insets = safeAreaInsets();
    const isGestureEnable = getBoolItem(MMKVKey.IS_GESTURE_ENABLE);
    
    // Default values for Android and iOS
    const DEFAULTS = {
        android: {
            top: 18,
            bottom: 15,
            left: 0,
            right: 0,
        },
        ios: {
            top: 20,
            bottom: 10,
            left: 0,
            right: 0,
        },
    };

    if (Platform.OS === 'android') {
        const top = insets.top === 0 ? DEFAULTS.android.top : insets.top + 5;
        const bottom = insets.bottom === 0 
            ? DEFAULTS.android.bottom 
            : insets.bottom + (isGestureEnable ? 10 : 15);
        return { top, bottom, left: insets.left, right: insets.right };
    } else if (Platform.OS === 'ios') {
        const top = insets.top === 0 ? DEFAULTS.ios.top : insets.top;
        const bottom = insets.bottom === 0 ? DEFAULTS.ios.bottom : insets.bottom;
        return { top, bottom, left: insets.left, right: insets.right };
    }
    
    return {
        top: insets.top,
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
    };
};
```

### 2.3 Why Custom Implementation?

1. **Fallback Values**: When system insets are zero (some devices/emulators), we provide sensible defaults
2. **Gesture Navigation Detection**: Adjusts bottom padding based on whether gesture navigation is enabled
3. **Platform-Specific Adjustments**: Adds platform-specific offsets to ensure consistent spacing
4. **Consistency**: Ensures existing screens work without modifications

### 2.4 Gesture Navigation Detection

**Location**: `consumer/android/app/src/main/java/com/mobility/movingtech/MainAppUtils.kt`

Native Android method to detect gesture navigation:

```kotlin
@ReactMethod
fun isGestureNavigationEnabled(promise: Promise) {
    val activity = currentActivity ?: run {
        promise.resolve(false)
        return
    }

    val decorView = activity.window?.decorView ?: run {
        promise.resolve(false)
        return
    }

    decorView.post {
        val insets = ViewCompat.getRootWindowInsets(decorView)
        if (insets == null) {
            promise.resolve(false)
            return@post
        }

        val gesture = insets.getInsets(WindowInsetsCompat.Type.systemGestures()).bottom
        val nav = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom

        promise.resolve(gesture > nav)
    }
}
```

### 2.5 KeyboardProvider Configuration

**Location**: `consumer/src/App.tsx`

Updated KeyboardProvider to support edge-to-edge:

```typescript
<KeyboardProvider
    preserveEdgeToEdge={true}
    navigationBarTranslucent={true}
    statusBarTranslucent={true}>
    {children}
</KeyboardProvider>
```

### 2.6 Keyboard Handling Best Practices

**IMPORTANT**: Always use `KeyboardAvoidingView` from `react-native-keyboard-controller` instead of `react-native`.

**Why?**
- Better edge-to-edge support
- More reliable keyboard handling
- Improved performance
- Better integration with the new architecture

**DON'T** ❌:
```typescript
// AVOID: Don't use KeyboardAvoidingView from react-native
import { KeyboardAvoidingView } from 'react-native';

<KeyboardAvoidingView behavior="padding">
    {/* Content */}
</KeyboardAvoidingView>
```

**DO** ✅:
```typescript
// CORRECT: Use KeyboardAvoidingView from react-native-keyboard-controller
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    {/* Content */}
</KeyboardAvoidingView>
```

**Additional Keyboard Utilities**:

The `react-native-keyboard-controller` package provides additional utilities:

```typescript
import {
    KeyboardAvoidingView,
    KeyboardAwareScrollView,
    useKeyboardHandler,
    useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';

// Use KeyboardAwareScrollView for scrollable content
<KeyboardAwareScrollView>
    {/* Scrollable content with inputs */}
</KeyboardAwareScrollView>

// Use keyboard hooks for advanced animations
const keyboard = useReanimatedKeyboardAnimation();
const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
}));
```

### 2.7 Implementation Guidelines

**SafeArea - DO**:
- ✅ Always use `useSafeAreaInsets` from `@/typescript/hooks/safeAreaInsets`
- ✅ Use SafeAreaView from `react-native-safe-area-context` for full-screen components
- ✅ Test on devices with gesture navigation enabled/disabled
- ✅ Test on devices with different notch/cutout configurations

**SafeArea - DON'T**:
- ❌ Don't use the default `useSafeAreaInsets` from `react-native-safe-area-context` directly
- ❌ Don't hardcode status bar heights
- ❌ Don't assume bottom insets are always present

**Keyboard - DO**:
- ✅ **ALWAYS** use `KeyboardAvoidingView` from `react-native-keyboard-controller`
- ✅ Use `KeyboardAwareScrollView` for scrollable content with inputs
- ✅ Use keyboard hooks (`useReanimatedKeyboardAnimation`) for custom animations
- ✅ Ensure KeyboardProvider is configured with edge-to-edge props

**Keyboard - DON'T**:
- ❌ **NEVER** use `KeyboardAvoidingView` from `react-native` - it doesn't support edge-to-edge properly
- ❌ Don't use deprecated keyboard APIs
- ❌ Don't rely on platform-specific keyboard workarounds

---

## 3. React 19 Breaking Changes

### 3.1 New Features

1. **Compiler Optimizations**: Automatic memoization
2. **New APIs**: `use()` hook for promises and context
3. **Server Components**: Better support (not applicable for RN)
4. **Actions**: Form actions and transitions

### 3.2 Breaking Changes

1. **PropTypes Removed**: TypeScript is now mandatory
2. **Legacy Context Deprecated**: Use `React.createContext`
3. **Default Props on Functions**: No longer supported
4. **Ref Forwarding**: Changed behavior

### 3.3 Migration Required

```typescript
// Before (React 18)
function Component({ defaultValue = 'hello' }) {
  return <div>{defaultValue}</div>;
}
Component.defaultProps = { defaultValue: 'world' };

// After (React 19)
function Component({ defaultValue = 'hello' }) {
  return <div>{defaultValue}</div>;
}
```

---

## 4. React Navigation Refactoring

### 4.1 Critical Architectural Change

**Breaking Change**: Navigation context is now **scoped to its navigator** and does not work at a global level.

### 4.2 Previous Architecture Issues

Before the upgrade:
- Global navigation reference was used throughout the app
- Child screens could access parent navigator's navigation object
- This worked but was not the intended pattern

### 4.3 New Architecture

We implemented **tab-specific stack navigators**:

```
RootNavigator (Stack)
├── OnboardingNavigation (Stack)
└── MainNavigation (Stack)
    ├── Main (Screen)
    ├── MainTabNavigation (Bottom Tabs)
    │   ├── Home Tab
    │   ├── Services Tab
    │   ├── Tickets Tab
    │   ├── Passes Tab
    │   ├── Profile Tab
    │   └── Live Tab
    ├── HomeTab → HomeStackNavigator
    │   ├── journeyOptions
    │   ├── favouritesScreen
    │   ├── reviewAndFeedback
    │   └── busOtpFlow
    ├── ServicesTab → ServicesStackNavigator
    ├── TicketsTab → TicketsStackNavigator
    ├── PassesTab → PassesStackNavigator
    ├── ProfileTab → ProfileStackNavigator
    │   ├── myProfile
    │   ├── aboutScreen
    │   ├── updateMyProfile
    │   ├── manageFavourites
    │   └── safetyScreen
    ├── LiveTab → LiveStackNavigator
    └── [Modal/Shared Screens]
        ├── webView
        ├── driverProfile
        ├── editPickup
        └── ...
```

### 4.4 Implementation Example

**HomeStackNavigator** (`consumer/src/typescript/navigation/homeStackNavigator.tsx`):

```typescript
export const HomeStackNavigator: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'HomeTab'>>();
    const { screen } = route.params ?? {};

    return (
        <HomeStack.Navigator
            initialRouteName={screen ?? 'journeyOptions'}
            screenOptions={{
                headerShown: false,
                animation: 'default',
                presentation: 'card',
                statusBarAnimation: 'fade',
            }}>
            <HomeStack.Screen name="journeyOptions" component={JourneyOptions} />
            <HomeStack.Screen name="favouritesScreen">
                {() => <HyperView viewParam="favourites" />}
            </HomeStack.Screen>
            <HomeStack.Screen name="reviewAndFeedback" component={ReviewAndFeedBack} />
        </HomeStack.Navigator>
    );
};
```

**ProfileStackNavigator** (`consumer/src/typescript/navigation/profileStackNavigator.tsx`):

```typescript
export const ProfileStackNavigator: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'ProfileTab'>>();
    const { screen } = route.params ?? {};
    
    return (
        <ProfileStack.Navigator
            initialRouteName={screen}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <ProfileStack.Screen name="myProfile" component={MyProfileFlow} />
            <ProfileStack.Screen name="aboutScreen" component={AboutScreen} />
            <ProfileStack.Screen name="updateMyProfile" component={UpdateMyProfileFlow} />
            <ProfileStack.Screen name="manageFavourites" component={ManageFavourite} />
            <ProfileStack.Screen name={'safetyScreen'}>
                {({ navigation }) => <SafetyFlow onBack={() => navigation.goBack()} />}
            </ProfileStack.Screen>
        </ProfileStack.Navigator>
    );
};
```

### 4.5 Navigation Between Tabs

To navigate to a specific screen in another tab:

```typescript
// Navigate to a screen in ProfileTab
navigation.navigate('ProfileTab', { screen: 'myProfile' });

// Navigate to a screen in HomeTab
navigation.navigate('HomeTab', { screen: 'reviewAndFeedback' });

// Navigate to a shared modal screen (at MainNavigation level)
navigation.navigate('webView', { url: 'https://example.com' });
```

### 4.6 Type Safety

Updated type definitions in `globalParamList.tsx`:

```typescript
export type MainNavigationParamList = {
    HomeTab: { screen?: HomeTabRoute };
    ServicesTab: { screen?: ServicesTabRoute };
    TicketsTab: { screen?: TicketsTabRoute };
    PassesTab: { screen?: PassesTabRoute };
    ProfileTab: { screen?: ProfileTabRoute };
    LiveTab: { screen?: LiveTabRoute };
    // ... shared screens
};
```

### 4.7 Migration Guidelines

**DO**:
- ✅ Use tab-specific navigators for tab-related screens
- ✅ Use the navigation prop passed to your component
- ✅ Navigate with proper type safety
- ✅ Place shared screens at the MainNavigation level

**DON'T**:
- ❌ Don't rely on global navigation ref for tab navigation
- ❌ Don't nest navigators more than necessary
- ❌ Don't access parent navigator directly from deep children

---

## 5. Performance Optimization Guidelines

### 5.1 Animation Performance Table

React Native properties have different performance characteristics. Some trigger layout recalculations while others can be GPU-accelerated.

| Property | Impact on Performance | Recommended Alternative |
|----------|----------------------|-------------------------|
| `top`, `bottom`, `left`, `right` | ❌ Triggers layout recalculations, affecting positioning of other elements | ✅ Use `transform` properties like `translateX` or `translateY` for smoother animations |
| `width`, `height` | ❌ Causes layout reflows and recalculations | ✅ Utilize `scaleX` and `scaleY` within `transform` for scalable sizing |
| `margin`, `padding` | ❌ Affects layout reflows, especially if impacting sibling elements | ✅ Apply `translate` transformations for dynamic spacing changes |
| `opacity` | ⚠️ Can be costly on large components; may not fully leverage GPU acceleration | ✅ Use `react-native-reanimated` to handle opacity animations more efficiently |
| `borderRadius` | ⚠️ Increases rendering costs with high values or complex shapes | ✅ Limit `borderRadius` values or use pre-rounded images |
| **Shadow properties** | ❌ Computationally heavy, especially on Android | ✅ Minimize shadow complexity; consider using overlays for visual hierarchy |
| `backgroundColor` with opacity | ⚠️ Opacity impacts rendering, especially on large components | ✅ Use solid colors when possible; layer opaque elements sparingly |
| **Font properties** | ⚠️ Changes can lead to layout recalculations and increased memory usage | ✅ Set fonts once if possible; prefer system fonts |
| **Animated colors** | ❌ CPU-bound; not GPU-accelerated | ✅ Use subtle transitions; `react-native-reanimated` can handle color interpolations more efficiently |
| **Dynamic image resizing** | ⚠️ Large images cause recalculations when resized | ✅ Predefine dimensions; use `resizeMode` for scaling control |
| `zIndex` | ⚠️ Can increase memory usage with multiple layers | ✅ Limit `zIndex` usage; layer components by render order |
| **Flexbox properties** | ⚠️ Frequent changes trigger layout recalculations, especially in nested components | ✅ Set flex properties once and avoid dynamic updates |
| **Transform scale on large components** | ⚠️ Memory-intensive when applied to large components | ✅ Break into smaller components; avoid scaling large elements |
| **Position animations** | ⚠️ Layout reflows from position changes | ✅ Use `translateX` or `translateY` for smoother animations |

### 5.2 Using react-native-reanimated

For better performance, use `react-native-reanimated` for animations:

```typescript
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

// Good: Using transform for animations
const translateY = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(translateY.value) }],
}));

// Bad: Animating top/bottom directly
const badStyle = useAnimatedStyle(() => ({
    top: withTiming(topValue.value), // Triggers layout recalculation
}));
```

### 5.3 Opacity Animations

```typescript
// Good: Using react-native-reanimated for opacity
const opacity = useSharedValue(1);

const fadeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value),
}));

<Animated.View style={fadeStyle}>
    {/* Content */}
</Animated.View>
```

### 5.4 Image Optimization

Use `@d11/react-native-fast-image` for better image performance:

```typescript
import FastImage from '@d11/react-native-fast-image';

<FastImage
    style={{ width: 200, height: 200 }}
    source={{
        uri: 'https://example.com/image.jpg',
        priority: FastImage.priority.normal,
    }}
    resizeMode={FastImage.resizeMode.contain}
/>
```

### 5.5 FlatList Optimization

```typescript
<FlatList
    data={items}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    // Performance optimizations
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={5}
    initialNumToRender={10}
    getItemLayout={getItemLayout} // For consistent item sizes
/>
```

### 5.6 Component Memoization

```typescript
import React, { memo } from 'react';

// Memoize components that receive static props
const MyComponent = memo(({ data }) => {
    return <View>{/* Render data */}</View>;
});

// Use React.memo with custom comparison
const MyComplexComponent = memo(
    ({ data, onPress }) => {
        return <View>{/* Render */}</View>;
    },
    (prevProps, nextProps) => {
        return prevProps.data.id === nextProps.data.id;
    }
);
```

### 5.7 Avoid Anonymous Functions in Renders

```typescript
// Bad: Creates new function on every render
<TouchableOpacity onPress={() => handlePress(item.id)}>
    <Text>Press Me</Text>
</TouchableOpacity>

// Good: Use useCallback
const handleItemPress = useCallback(() => {
    handlePress(item.id);
}, [item.id]);

<TouchableOpacity onPress={handleItemPress}>
    <Text>Press Me</Text>
</TouchableOpacity>
```

---

## 6. Breaking Changes & Required Migrations

### 6.1 Import Path Changes

Some packages have updated their import paths:

```typescript
// Update all imports to use new package structures
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```

### 6.2 SafeAreaView Updates

```typescript
// Always import from react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

// Use with edge prop for edge-to-edge support
<SafeAreaView edges={['top', 'bottom']}>
    {/* Content */}
</SafeAreaView>
```

### 6.3 Keyboard Handling

**⚠️ CRITICAL**: Always use `KeyboardAvoidingView` from `react-native-keyboard-controller`, NOT from `react-native`.

```typescript
// CORRECT: Import from react-native-keyboard-controller
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// Use with proper configuration for edge-to-edge
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}>
    {/* Content */}
</KeyboardAvoidingView>

// For scrollable content, use KeyboardAwareScrollView
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

<KeyboardAwareScrollView>
    {/* Scrollable content with inputs */}
</KeyboardAwareScrollView>
```

**Benefits of using `react-native-keyboard-controller`:**
- ✅ Native edge-to-edge support
- ✅ Better performance with reanimated integration
- ✅ More predictable behavior across devices
- ✅ Advanced keyboard animations support
- ✅ Works seamlessly with the new React Native architecture

### 6.4 Metro Config Updates

Ensure metro config is compatible:

```javascript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
    // Your custom config
};

module.exports = mergeConfig(defaultConfig, config);
```

### 6.5 Babel Config Updates

```javascript
// babel.config.js
module.exports = {
    presets: ['@react-native/babel-preset'],
    plugins: [
        // Your plugins
    ],
};
```

---

## 7. Testing & Validation Checklist

### 7.1 Pre-Deployment Testing

- [ ] **SafeArea Testing**
  - [ ] Test on devices with notch/cutout
  - [ ] Test on devices without notch
  - [ ] Test with gesture navigation enabled
  - [ ] Test with 3-button navigation
  - [ ] Test landscape orientation
  - [ ] Test on tablets

- [ ] **Navigation Testing**
  - [ ] Verify all tab navigations work
  - [ ] Test deep linking
  - [ ] Test back button behavior
  - [ ] Test navigation state persistence
  - [ ] Test modal presentations
  - [ ] Test screen transitions

- [ ] **Performance Testing**
  - [ ] Check animation smoothness (60 FPS target)
  - [ ] Profile with React DevTools
  - [ ] Check memory usage
  - [ ] Test on low-end devices
  - [ ] Test FlatList scrolling performance
  - [ ] Monitor JS thread performance

- [ ] **UI/UX Testing**
  - [ ] Verify all screens render correctly
  - [ ] Check keyboard behavior with inputs
  - [ ] Test KeyboardAvoidingView on all input screens
  - [ ] Verify keyboard dismissal on scroll
  - [ ] Test keyboard appearance/disappearance animations
  - [ ] Test bottom sheets
  - [ ] Verify safe area insets
  - [ ] Check modals and overlays
  - [ ] Test pull-to-refresh

- [ ] **Integration Testing**
  - [ ] Firebase analytics working
  - [ ] Crashlytics reporting
  - [ ] Push notifications
  - [ ] Deep links
  - [ ] Payment flows
  - [ ] Location services

### 7.2 Common Issues & Solutions

#### Issue: Content hidden behind system bars

**Solution**: Ensure you're using the custom `useSafeAreaInsets` hook:

```typescript
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const insets = useSafeAreaInsets();
const styles = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
};
```

#### Issue: Navigation not working between tabs

**Solution**: Use proper navigation syntax:

```typescript
// Navigate to screen in another tab
navigation.navigate('ProfileTab', { screen: 'myProfile' });
```

#### Issue: Animations are janky

**Solution**: Use `react-native-reanimated` and transform properties:

```typescript
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(value.value) }],
}));
```

#### Issue: KeyboardAvoidingView not working properly

**Root Cause**: Using `KeyboardAvoidingView` from `react-native` instead of `react-native-keyboard-controller`.

**Solution**: Always import from the correct package:

```typescript
// ❌ WRONG - Don't do this
import { KeyboardAvoidingView } from 'react-native';

// ✅ CORRECT - Always use this
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}>
    {/* Content */}
</KeyboardAvoidingView>
```

**Additional Fix**: Ensure KeyboardProvider is configured correctly in App.tsx:

```typescript
<KeyboardProvider
    preserveEdgeToEdge={true}
    navigationBarTranslucent={true}
    statusBarTranslucent={true}>
    {/* Content */}
</KeyboardProvider>
```

### 7.3 Performance Monitoring

Enable performance monitoring in development:

```typescript
// Add to your development tools
import { enableScreens } from 'react-native-screens';
import { enableFreeze } from 'react-native-screens';

if (__DEV__) {
    enableScreens(true);
    enableFreeze(true);
}
```

Monitor with React DevTools Profiler:
- Identify slow renders
- Check component re-render counts
- Analyze commit phases

### 7.4 Rollback Plan

If critical issues are discovered:

1. **Immediate**: Revert to previous version
2. **Git**: Use commit hash before upgrade
3. **Dependencies**: `yarn install` with old `package.json`
4. **Native**: Rebuild iOS/Android apps
5. **Testing**: Run regression tests

---

## 8. Known Issues & Workarounds

### 8.1 react-native-screens on Android

**Issue**: Some screen transition animations may have slight delays.

**Workaround**: Use `animation: 'none'` for specific screens if needed:

```typescript
<Stack.Screen 
    name="screenName" 
    component={Component}
    options={{ animation: 'none' }}
/>
```

### 8.2 SafeAreaView on Some Android Devices

**Issue**: Some Android devices may report incorrect insets initially.

**Workaround**: Custom hook provides fallback values (already implemented).

### 8.3 React Navigation Type Errors

**Issue**: TypeScript may complain about navigation types.

**Workaround**: Ensure all param lists are properly defined and exported.

---

## 9. Future Considerations

### 9.1 React Native 0.80+

Monitor for future releases:
- New Architecture (Fabric) improvements
- Bridgeless mode stabilization
- Further performance optimizations

### 9.2 React Navigation 8

Next major version is in development:
- Better TypeScript support
- Performance improvements
- New navigation patterns

### 9.3 Reanimated 4

Future version considerations:
- Better web support
- Enhanced layout animations
- More efficient worklet execution

---

## 10. Resources & References

### Official Documentation

- [React Native 0.79 Release Notes](https://reactnative.dev/blog/2024/04/22/release-0.79)
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)
- [React Navigation 7 Docs](https://reactnavigation.org/docs/7.x/getting-started)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Keyboard Controller](https://kirillzyusko.github.io/react-native-keyboard-controller/)
- [Edge-to-Edge Guide](https://reactnative.dev/docs/next/edge-to-edge)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)

### Community Resources

- [React Native Community Discord](https://discord.gg/react-native)
- [React Navigation Discussions](https://github.com/react-navigation/react-navigation/discussions)

### Internal Documentation

- `consumer/src/typescript/hooks/safeAreaInsets.ts` - Custom SafeArea hook
- `consumer/src/typescript/navigation/` - Navigation structure
- `consumer/android/app/src/main/java/com/mobility/movingtech/MainAppUtils.kt` - Native utilities

---

## Appendix A: Complete Package Diff

### Dependencies Added

```json
{
  "@d11/react-native-fast-image": "^8.12.0"
}
```

### Dependencies Upgraded (Selected)

```diff
- "@animatereactnative/marquee": "^0.5.2"
+ "@animatereactnative/marquee": "^0.5.2"

- "@gorhom/bottom-sheet": "git+https://github.com/nammayatri/react-native-bottom-sheet#fix-remove-accessibility"
+ "@gorhom/bottom-sheet": "git+https://github.com/nammayatri/react-native-bottom-sheet.git#bottomsheet-test"

- "@react-native-community/blur": "^4.4.1"
+ "@react-native-community/blur": "^4.4.1"

- "@react-native-firebase/analytics": "22.2.0"
+ "@react-native-firebase/analytics": "23.4.0"

- "@react-native-firebase/app": "22.2.0"
+ "@react-native-firebase/app": "23.4.0"

- "@react-native-firebase/auth": "22.2.0"
+ "@react-native-firebase/auth": "23.4.0"

- "@react-native-firebase/crashlytics": "22.2.0"
+ "@react-native-firebase/crashlytics": "23.4.0"

- "@react-native-firebase/firestore": "22.2.0"
+ "@react-native-firebase/firestore": "23.4.0"

- "@react-native-firebase/messaging": "22.2.0"
+ "@react-native-firebase/messaging": "23.4.0"

- "@react-native-firebase/remote-config": "22.2.0"
+ "@react-native-firebase/remote-config": "23.4.0"

- "@react-navigation/bottom-tabs": "^6.5.10"
+ "@react-navigation/bottom-tabs": "^7.4.7"

- "@react-navigation/drawer": "^6.7.2"
+ "@react-navigation/drawer": "^7.5.8"

- "@react-navigation/native": "^6.1.18"
+ "@react-navigation/native": "^7.1.18"

- "@react-navigation/native-stack": "^6.11.0"
+ "@react-navigation/native-stack": "^7.3.28"

- "@react-navigation/stack": "^6.4.1"
+ "@react-navigation/stack": "^7.4.10"

- "react": "18.3.1"
+ "react": "19.0.0"

- "react-native": "0.75.4"
+ "react-native": "^0.79.6"

- "react-native-reanimated": "^3.16.7"
+ "react-native-reanimated": "^3.19.4"

- "react-native-safe-area-context": "^4.10.5"
+ "react-native-safe-area-context": "^5.6.1"

- "react-native-screens": "3.34.0"
+ "react-native-screens": "4.16.0"
```

---

## Appendix B: What Was Changed

### Key Implementation Changes

#### 1. Custom SafeArea Hook
- Created `useSafeAreaInsets` hook in `consumer/src/typescript/hooks/safeAreaInsets.ts`
- Provides fallback values for Android/iOS when insets are zero
- Detects gesture navigation and adjusts padding accordingly
- Adds platform-specific offsets for consistency

#### 2. Keyboard Controller Integration
- Replaced all `KeyboardAvoidingView` imports from `react-native` to `react-native-keyboard-controller`
- Configured KeyboardProvider with edge-to-edge support
- Implemented `KeyboardAwareScrollView` for input forms
- Added keyboard animation hooks for custom interactions

#### 3. Navigation Refactoring
- Created tab-specific stack navigators:
  - `HomeStackNavigator` - Journey options, favorites, reviews
  - `ServicesStackNavigator` - Service-related screens
  - `TicketsStackNavigator` - Ticket booking flows
  - `PassesStackNavigator` - Pass management screens
  - `ProfileStackNavigator` - Profile and settings screens
  - `LiveStackNavigator` - Live tracking screens
- Updated all navigation calls to use proper tab navigation syntax
- Fixed type definitions in `globalParamList.tsx`

#### 4. Gesture Navigation Detection
- Implemented native Android method in `MainAppUtils.kt`
- Detects if device uses gesture navigation
- Stores value in MMKV for runtime access
- Used by custom SafeArea hook for proper padding

#### 5. Dependency Updates
- Upgraded 50+ packages including React, React Native, Firebase, and React Navigation
- Fixed all breaking changes and compilation errors
- Updated native iOS/Android configurations
- Tested all integrations (Firebase, payment SDK, location services)

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Maintained By**: Development Team  
**Next Review**: After React Native 0.80 release

