import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import { Icon } from '@/typescript/components/Icon';
import ConfirmButton from './ConfirmButton';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { StyleSheet } from 'react-native';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';

const LocationIcon = () => {
    return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <G clipPath="url(#clip0_5128_40040)">
                <Path
                    d="M16.668 9.997a6.667 6.667 0 01-6.667 6.667m6.667-6.667a6.667 6.667 0 00-6.667-6.666m6.667 6.666h1.667M10 16.664a6.667 6.667 0 01-6.666-6.667M10 16.664v1.667M3.335 9.997A6.667 6.667 0 0110 3.331M3.335 9.997H1.668m8.333-6.666V1.664m2.5 8.333a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    stroke="#656565"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_5128_40040">
                    <Path fill="#fff" d="M0 0H20V20H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

const LocateOnMap = ({
    onLocationPress,
    selectedLocation,
    onConfirmPress,
}: {
    onLocationPress: () => void;
    selectedLocation: location;
    onConfirmPress: () => void;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={styles.container}>
            <Animated.Text style={[styles.title, tailwind.style('font-areaNormal-extrabold')]}>
                {userLanguageStrings.Locateonmap}
            </Animated.Text>

            <Animated.View style={styles.contentContainer}>
                <Pressable
                    accessibilityLabel="Locate on Map button"
                    accessibilityRole="button"
                    testID="favourites-locate-on-map-button"
                    style={styles.locationButton}
                    onPress={onLocationPress}>
                    <Animated.Text
                        style={[styles.locationText, tailwind.style('font-areaNormal-extrabold')]}
                        numberOfLines={1}>
                        {selectedLocation.title}, {selectedLocation.subtitle}
                    </Animated.Text>
                    <Icon icon={<LocationIcon />} />
                </Pressable>

                <Animated.View style={styles.buttonContainer}>
                    <ConfirmButton onPress={onConfirmPress} disabled={false} text={userLanguageStrings.Confirm} />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(LocateOnMap);

const styles = StyleSheet.create({
    container: {
        paddingTop: 0,
        backgroundColor: homeSheetBg,
    },
    title: {
        fontSize: 15,
        color: colors.gray450,
        textAlign: 'center',
    },
    contentContainer: {
        marginTop: 18,
        paddingHorizontal: 20,
    },
    locationButton: {
        backgroundColor: colors.neutral100,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.gray240,
        paddingHorizontal: 16,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationText: {
        fontSize: 14,
        color: '#3B3A3C',
        width: '90%',
        lineHeight: 15,
    },
    buttonContainer: {
        marginTop: 15,
    },
});
