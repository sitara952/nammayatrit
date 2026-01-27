import { Platform, StyleSheet, TextStyle } from 'react-native';
import colors from '../designSystem/colorPalette';

const defaultTextStyle: TextStyle = {
    textAlign: 'left',
    backgroundColor: 'transparent',
    ...Platform.select({
        android: {
            includeFontPadding: false,
        },
        ios: undefined,
        macos: undefined,
        windows: undefined,
        web: undefined,
        native: undefined,
    }),
};

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonText: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontWeight: 600,
                fontFamily: 'PlusJakartaSans-Medium',
            },
            android: {
                fontFamily: 'PlusJakartaSans-SemiBold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 16,
        lineHeight: 20,
    },
    sHead700: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontWeight: 600,
                fontFamily: 'AreaNormal-Bold',
            },
            android: {
                fontFamily: 'AreaNormal-Bold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 16,
        lineHeight: 22,
    },
    sBody700: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontWeight: 600,
                fontFamily: 'AreaNormal-Extrabold',
            },
            android: {
                fontFamily: 'AreaNormal-Extrabold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 12,
        lineHeight: 16,
    },
    bodyText: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontWeight: 500,
                fontFamily: 'PlusJakartaSans-Medium',
            },
            android: {
                fontFamily: 'PlusJakartaSans-SemiBold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 14,
        lineHeight: 18,
    },
    bodyText3: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontWeight: 400,
                fontFamily: 'PlusJakartaSans-Medium',
            },
            android: {
                fontFamily: 'PlusJakartaSans-SemiBold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        color: `${colors?.recovered?.neutralUltraHigh}`,
        fontSize: 14,
        lineHeight: 16,
    },
    heading1: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontFamily: 'PlusJakartaSans-Medium',
                fontWeight: 700,
            },
            android: {
                fontFamily: 'PlusJakartaSans-Bold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 22,
        lineHeight: 28,
    },
    subHeading1: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontFamily: 'PlusJakartaSans-Medium',
                fontWeight: 600,
            },
            android: {
                fontFamily: 'PlusJakartaSans-SemiBold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 16,
        lineHeight: 20,
        color: `${colors?.recovered?.neutralUltraHigh}`,
    },
    subHeading2: {
        ...defaultTextStyle,
        ...Platform.select({
            ios: {
                fontFamily: 'PlusJakartaSans-Medium',
                fontWeight: 500,
            },
            android: {
                fontFamily: 'PlusJakartaSans-SemiBold',
            },
            macos: undefined,
            windows: undefined,
            web: undefined,
            native: undefined,
        }),
        fontSize: 16,
        lineHeight: 24,
        color: `${colors?.recovered?.neutralUltraHigh}`,
    },
    buttonPrimaryColor: {
        color: `${colors?.recovered?.orangeMid}`,
    },
    buttonDisabledColor: {
        color: `${colors?.recovered?.orangeLow}`,
    },
    errorColor: {
        color: `${colors?.recovered?.pinkRed}`,
    },
    lightBgColor: {
        color: `${colors?.recovered?.orangelUltraLow}`,
    },
    defaultBgColor: {
        color: `${colors?.recovered?.neutralMin}`,
    },
    headerBgColor: {
        color: `${colors?.recovered?.neutralMax}`,
    },
    headerTextColor: {
        color: `${colors?.primitive?.black[2]}`,
    },
    black800: {
        color: `${colors?.recovered?.neutralUltraHigh}`,
    },
    white: {
        color: `${colors?.recovered?.neutralMin}`,
    },
    appBackground: {
        color: `${colors?.recovered?.neutralMin}`,
    },
    borderNeutralLow: {
        color: '#f1f2f7',
    },
    borderNeutralMid: {
        color: '#e0e3e8',
    },
    fillNeutralLow: {
        color: '#f8f9fb',
    },
});
