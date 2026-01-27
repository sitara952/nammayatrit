import { StyleSheet } from 'react-native';
import { ThemeTokens } from 'config-types';

export const getPostRideStartFragmentStyles = (
    themeColors: ThemeTokens,
    safeAreaTop: number,
    safeAreaBottom: number,
) => {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: themeColors?.Fill_sunYellow,
            justifyContent: 'space-between',
            alignItems: 'stretch',
            flex: 1,
            flexDirection: 'column',
        },
        centerRow: {
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 72,
        },
        centerRowMainText: {
            textAlign: 'center',
            fontWeight: 800,
        },
        centerRowSubText: {
            textAlign: 'center',
            marginTop: 8,
            fontWeight: 800,
        },
        vehicleImage: {
            width: 200,
            height: 100,
        },
        topRow: {
            marginTop: safeAreaTop,
            marginHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        topRowButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 24,
        },
        dot: {
            borderRadius: 5,
            borderWidth: 5,
            marginRight: 0,
            borderColor: themeColors?.Fill_orange,
        },
        bottomRow: {
            marginBottom: safeAreaBottom,
        },
    });
};
