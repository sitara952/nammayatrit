const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts } = defaultConfig.resolver;

const config = {
    resolver: {
        assetExts: [...assetExts, 'lottie'],
        extraNodeModules: {
            // common: path.resolve(__dirname, '../common'), // Point to actual folder path, not symlink
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-native': path.resolve(__dirname, 'node_modules/react-native'),
            'config-types': path.resolve(__dirname, '../libs/config-types'),
            rescript: path.resolve(__dirname, 'node_modules/rescript'),
            '@rescript/core': path.resolve(__dirname, 'node_modules/@rescript/core'),
            '@rescript/react': path.resolve(__dirname, 'node_modules/@rescript/react'),
            'rescript-react-native': path.resolve(__dirname, 'node_modules/rescript-react-native'),
            '@react-native-community/geolocation': path.resolve(
                __dirname,
                'node_modules/@react-native-community/geolocation',
            ),
            'react-native-reanimated': path.resolve(__dirname, 'node_modules/react-native-reanimated'),
            twrnc: path.resolve(__dirname, 'node_modules/twrnc'),
            'react-native-encrypted-storage': path.resolve(__dirname, 'node_modules/react-native-encrypted-storage'),
            'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
            'react-native-safe-area-context': path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
            'lottie-react-native': path.resolve(__dirname, 'node_modules/lottie-react-native'),
            'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-maps'),
            'rescript-gesture-handler': path.resolve(__dirname, 'node_modules/rescript-gesture-handler'),
            '@babel/plugin-proposal-export-namespace-from': path.resolve(
                __dirname,
                'node_modules/@babel/plugin-proposal-export-namespace-from',
            ),
            '@backpackapp-io/react-native-toast': path.resolve(
                __dirname,
                'node_modules/@backpackapp-io/react-native-toast',
            ),
            '@glennsl/rescript-fetch': path.resolve(__dirname, 'node_modules/@glennsl/rescript-fetch'),
            '@gorhom/bottom-sheet': path.resolve(__dirname, 'node_modules/@gorhom/bottom-sheet'),
            '@invertase/react-native-apple-authentication': path.resolve(
                __dirname,
                'node_modules/@invertase/react-native-apple-authentication',
            ),
            '@react-native-clipboard/clipboard': path.resolve(
                __dirname,
                'node_modules/@react-native-clipboard/clipboard',
            ),
            '@react-native-community/netinfo': path.resolve(__dirname, 'node_modules/@react-native-community/netinfo'),
            '@react-native-firebase/app': path.resolve(__dirname, 'node_modules/@react-native-firebase/app'),
            '@react-native-firebase/auth': path.resolve(__dirname, 'node_modules/@react-native-firebase/auth'),
            '@react-native-firebase/crashlytics': path.resolve(
                __dirname,
                'node_modules/@react-native-firebase/crashlytics',
            ),
            '@react-native-firebase/firestore': path.resolve(
                __dirname,
                'node_modules/@react-native-firebase/firestore',
            ),
            '@react-native-firebase/messaging': path.resolve(
                __dirname,
                'node_modules/@react-native-firebase/messaging',
            ),
            '@react-native-firebase/remote-config': path.resolve(
                __dirname,
                'node_modules/@react-native-firebase/remote-config',
            ),
            '@react-native-google-signin/google-signin': path.resolve(
                __dirname,
                'node_modules/@react-native-google-signin/google-signin',
            ),
            '@react-native/gradle-plugin': path.resolve(__dirname, 'node_modules/@react-native/gradle-plugin'),
            '@react-navigation/drawer': path.resolve(__dirname, 'node_modules/@react-navigation/drawer'),
            '@react-navigation/native': path.resolve(__dirname, 'node_modules/@react-navigation/native'),
            '@react-navigation/native-stack': path.resolve(__dirname, 'node_modules/@react-navigation/native-stack'),
            '@react-navigation/stack': path.resolve(__dirname, 'node_modules/@react-navigation/stack'),
            '@rescriptbr/react-query': path.resolve(__dirname, 'node_modules/@rescriptbr/react-query'),
            '@shopify/flash-list': path.resolve(__dirname, 'node_modules/@shopify/flash-list'),
            '@stripe/stripe-react-native': path.resolve(__dirname, 'node_modules/@stripe/stripe-react-native'),
            '@tailwindcss/typography': path.resolve(__dirname, 'node_modules/@tailwindcss/typography'),
            '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
            '@twilio/voice-react-native-sdk': path.resolve(__dirname, 'node_modules/@twilio/voice-react-native-sdk'),
            dayjs: path.resolve(__dirname, 'node_modules/dayjs'),
            'react-content-loader': path.resolve(__dirname, 'node_modules/react-content-loader'),
            'react-native-background-timer': path.resolve(__dirname, 'node_modules/react-native-background-timer'),
            'react-native-contacts': path.resolve(__dirname, 'node_modules/react-native-contacts'),
            'react-native-device-info': path.resolve(__dirname, 'node_modules/react-native-device-info'),
            'react-native-fast-image': path.resolve(__dirname, 'node_modules/react-native-fast-image'),
            'react-native-fs': path.resolve(__dirname, 'node_modules/react-native-fs'),
            'react-native-keyboard-aware-scroll-view': path.resolve(
                __dirname,
                'node_modules/react-native-keyboard-aware-scroll-view',
            ),
            'react-native-linear-gradient': path.resolve(__dirname, 'node_modules/react-native-linear-gradient'),
            'react-native-minimize': path.resolve(__dirname, 'node_modules/react-native-minimize'),
            'react-native-pager-view': path.resolve(__dirname, 'node_modules/react-native-pager-view'),
            'react-native-permissions': path.resolve(__dirname, 'node_modules/react-native-permissions'),
            'react-native-push-notification': path.resolve(__dirname, 'node_modules/react-native-push-notification'),
            'react-native-qrcode-svg': path.resolve(__dirname, 'node_modules/react-native-qrcode-svg'),
            'react-native-reanimated-carousel': path.resolve(
                __dirname,
                'node_modules/react-native-reanimated-carousel',
            ),
            'react-native-root-siblings': path.resolve(__dirname, 'node_modules/react-native-root-siblings'),
            'react-native-root-toast': path.resolve(__dirname, 'node_modules/react-native-root-toast'),
            'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
            'react-native-splash-screen': path.resolve(__dirname, 'node_modules/react-native-splash-screen'),
            'react-native-svg': path.resolve(__dirname, 'node_modules/react-native-svg'),
            'react-native-tab-view': path.resolve(__dirname, 'node_modules/react-native-tab-view'),
            'react-native-vector-icons': path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
            'rescript-react-navigation': path.resolve(__dirname, 'node_modules/rescript-react-navigation'),
            uuid: path.resolve(__dirname, 'node_modules/uuid'),
            tailwindcss: path.resolve(__dirname, 'node_modules/tailwindcss'),
            '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
        },
    },
    watchFolders: [path.resolve(__dirname, '../common'), path.resolve(__dirname, '../libs/config-types')],
};

module.exports = mergeConfig(withSentryConfig(getDefaultConfig(__dirname)), config);
