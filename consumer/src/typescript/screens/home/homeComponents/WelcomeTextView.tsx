import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { selectOperatingCity } from '@/typescript/state/client/session';
import { selectUserName } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { getWelcomeText } from '@/typescript/utils/common';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import ContentLoader from '@/typescript/designSystem/components/ContentLoader';
import colors from '@/typescript/designSystem/colorPalette';
import { FC, useMemo } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const WelcomeTextView: FC = () => {
    const userName = useAppSelector(selectUserName);
    const operatingCity = useAppSelector(selectOperatingCity);
    const { sheetAnimatedIndex } = useAnimatedContextValues(undefined);
    const appName = useAppSelector(selectAppReadableName);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [1, 1, 0]);
        const height = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [38, 38, Platform.OS === 'ios' ? 16 : 8]);
        return { opacity, height };
    }, [sheetAnimatedIndex.value]);

    const welcomeText = useMemo(() => {
        return getWelcomeText(operatingCity, appName, userLanguageStrings) + userName;
    }, [operatingCity, appName, userLanguageStrings, userName]);

    return (
        <Animated.View style={[tailwind.style('justify-center'), titleAnimatedStyle]}>
            {userName ? (
                <Animated.Text
                    accessible={false}
                    style={[
                        {
                            fontSize: Platform.OS === 'ios' ? 19 : 18,
                            paddingTop: 9,
                            paddingHorizontal: 16,
                            fontFamily: 'AreaNormal-Black',
                            color: '#2A2B31',
                        },
                        tailwind.style('tracking-[0.31px]'),
                        // tailwind.style(
                        //   'text-[20px] pt-[6] px-[16px] font-areaNormal-extrabold text-[#14171F]',
                        // ),
                        titleAnimatedStyle,
                    ]}>
                    {welcomeText}
                </Animated.Text>
            ) : (
                <ContentLoader style={[style.shimmerContainer]} foregroundColor={`${colors?.recovered?.neutralMin}`}>
                    <Rect width={'150'} height={'30'} rx={15} ry={15} />
                </ContentLoader>
            )}
        </Animated.View>
    );
};

const style = StyleSheet.create({
    shimmerContainer: {
        height: 50,
        width: 150,
        paddingHorizontal: 16,
    },
});

export default WelcomeTextView;
