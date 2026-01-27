import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { selectRentalDistance, setRentalDistance } from '@/typescript/state/client/session';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { selectRideDuration, setRideDuration } from '../state/client/session';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { tailwind } from '../tailwindTheme/tailwind';
import { CircularSlider } from './CircularSlider';
import { hapticEffect } from '../utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useAnimatedContextValues } from '../context/AnimatedValuesContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { getRemoteConfig, getString } from '@react-native-firebase/remote-config';

interface CustomiseRentalProps {
    onInfoClick: () => void;
}

type RentalConfig = {
    rentalMaxDistance: number;
    sliderStep: number;
};

function CustomiseRental(props: CustomiseRentalProps): React.JSX.Element {
    const rentalDistance = useAppSelector(selectRentalDistance);
    const rentalDuration = useAppSelector(selectRideDuration) ?? 3600; //1 hour by default;
    const dispatch = useAppDispatch();
    const { circularSliderParentScroll } = useAnimatedContextValues(undefined);

    const rentalConfig = useMemo((): RentalConfig => {
        const remoteConfigInstance = getRemoteConfig();
        const config = getString(remoteConfigInstance, 'rental_configs');
        try {
            const parsed = safeJsonParse<{ rentalMaxDistance: number; sliderStep: number }>(
                config,
                { rentalMaxDistance: 120, sliderStep: 5 },
                'rentalConfigs',
            );
            const rentalMaxDistance = parsed?.rentalMaxDistance ? parsed.rentalMaxDistance : 120;
            const sliderStep = parsed?.sliderStep ? parsed.sliderStep : 5;
            return { rentalMaxDistance, sliderStep };
        } catch (e) {
            console.error('Error parsing rental configs:', e);
            return { rentalMaxDistance: 120, sliderStep: 5 };
        }
    }, []);

    const handleChange = (v: number) => {
        dispatch(setRentalDistance(Math.round(v * 10 * 1000)));
        dispatch(setRideDuration(Math.round(v * 3600)));
    };

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const incrementDistance = useCallback(() => {
        const rentalDistKm = rentalDistance / 1000;
        const rentalDurHr = rentalDuration / 3600;
        const maxCheck = rentalDistKm < rentalConfig.rentalMaxDistance;
        if (maxCheck && rentalDistKm < 2 * (rentalDurHr * 10)) {
            dispatch(setRentalDistance(rentalDistance + rentalConfig.sliderStep * 1000));
        }
        hapticEffect(HapticFeedbackTypes.selection, undefined);
    }, [rentalDistance, rentalDuration]);

    const decrementDistance = useCallback(() => {
        const rentalDistKm = rentalDistance / 1000;
        const rentalDurHr = rentalDuration / 3600;
        if (rentalDistKm > rentalDurHr * 10) {
            dispatch(setRentalDistance(rentalDistance - rentalConfig.sliderStep * 1000));
        }
        hapticEffect(HapticFeedbackTypes.selection, undefined);
    }, [rentalDistance, rentalDuration]);
    return (
        <View style={styles.container}>
            <TouchableOpacity
                accessibilityRole="button"
                testID="customise_rental_info"
                style={tailwind.style(`flex-row  items-center`)}
                onPress={props.onInfoClick}>
                <Typography
                    type="body-1"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {' '}
                    {userLanguageStrings.CustomiseYourRental}{' '}
                </Typography>
                <InfoIcon />
            </TouchableOpacity>
            <View style={styles.sliderContainer}>
                <CircularSlider
                    value={rentalDuration / 3600}
                    min={1}
                    max={12}
                    onChange={handleChange}
                    parentScroll={circularSliderParentScroll}
                />
            </View>

            <View style={[styles.addRentalPrice, { backgroundColor: themeColors.APP_THEME_COLOR_SECONDARY }]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="customise_rental_distance_decrement"
                    style={tailwind.style(`px-[5px] justify-content items-center`)}
                    onPress={decrementDistance}>
                    <Typography
                        type="title-800"
                        style={tailwind.style(
                            `text-[30px] leading-[30px] text-[${themeColors.APP_THEME_COLOR}] text-center`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        -
                    </Typography>
                </TouchableOpacity>
                <Typography
                    type="body-1"
                    style={[
                        tailwind.style(`text-[#14171F] flex-1 text-center`),
                        { includeFontPadding: false, textAlignVertical: 'center' },
                    ]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {' '}
                    {`${rentalDistance / 1000} km`}
                </Typography>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="customise_rental_distance_increment"
                    style={tailwind.style(`px-[5px] justify-content items-center`)}
                    onPress={incrementDistance}>
                    <Typography
                        type="title-800"
                        style={tailwind.style(
                            `text-[30px] leading-[30px] text-[${themeColors.APP_THEME_COLOR}] text-center`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        +
                    </Typography>
                </TouchableOpacity>
            </View>

            <Typography
                type="subhead-600"
                style={tailwind.style(`text-[#6D7280] mt-[12px] p-[2px]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.RentalInfo}
            </Typography>
        </View>
    );
}

export default CustomiseRental;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: '#F1F2F7',
        borderWidth: 1,
        padding: 16,
        justifyContent: 'center',
    },
    sliderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    addRentalPrice: {
        padding: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
});
