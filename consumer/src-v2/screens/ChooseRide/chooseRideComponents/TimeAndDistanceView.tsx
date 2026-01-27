import mtIcClock from '@/typescript/assets/mt_ic_clock.webp';
import mtIcRoute from '@/typescript/assets/mt_ic_route.webp';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import colors from '@/typescript/designSystem/colorPalette';
import { formatTimeFromSeconds } from '@/src-v2/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const TimeAndDistanceView = ({ distance, duration }: { distance: number; duration: number | undefined }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const formattedDuration = formatTimeFromSeconds(duration ?? 0, true, userLanguageStrings) ?? 0;
    const formattedDistance = `${((distance ?? 0) / 1000.0).toFixed(1)}`;

    return duration !== undefined ? (
        <Animated.View
            style={tailwind.style('gap-[4px] flex-row items-center')}
            accessible={true}
            accessibilityLabel={`Travel Distance ${formattedDistance} km and Travel Time duration ${formattedDuration}`}>
            <Image
                accessible={true}
                accessibilityLabel="route image"
                source={mtIcRoute}
                style={tailwind.style('h-[16px] w-[16px]')}
            />
            <Typography
                type="body-7"
                style={styles.textStyle}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {`${formattedDistance} km`}
            </Typography>
            <Animated.View style={tailwind.style(`h-[3px] w-[3px] rounded-[32px] bg-[${colors.primitive.gray[13]}]`)} />
            <Image
                accessible={true}
                accessibilityLabel="clock image"
                source={mtIcClock}
                style={tailwind.style('h-[16px] w-[16px]')}
            />
            <Typography
                type="body-7"
                style={styles.textStyle}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {formattedDuration}
            </Typography>
        </Animated.View>
    ) : null;
};

const TimeView = ({ duration }: { duration: number | undefined }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const formattedDuration = formatTimeFromSeconds(duration ?? 0, true, userLanguageStrings) ?? 0;
    return duration !== undefined ? (
        <Animated.View
            style={tailwind.style('gap-[4px] flex-row items-center')}
            accessible={true}
            accessibilityLabel={`Travel Time duration ${formattedDuration}`}>
            <Animated.Image
                accessible={true}
                accessibilityLabel="clock image"
                source={mtIcClock}
                style={tailwind.style('h-[16px] w-[16px]')}
            />
            <Typography
                type="body-7"
                style={tailwind.style(`text-[${colors.primitive.gray[13]}]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {formattedDuration}
            </Typography>
        </Animated.View>
    ) : null;
};

export const TimeViewMemo = React.memo(TimeView);

export const TimeAndDistanceMemo = React.memo(TimeAndDistanceView);

const styles = StyleSheet.create({
    textStyle: { color: colors.primitive.gray[13], fontSize: 12 },
});
