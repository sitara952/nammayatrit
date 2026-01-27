import React, { FC, useEffect, useMemo } from 'react';
import ContentLoader from '../components/ContentLoader';
import { PressableProps, ViewStyle } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { tailwind } from '../../tailwindTheme/tailwind';
import Typography from '../components/primitives/Typography';
import token from '../tokens';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface CardDefaultTypes extends PressableProps {
    title: string | undefined;
    description: string | undefined;
    time?: number;
    showTime?: boolean;
    style?: ViewStyle;
    isSelected?: boolean;
    isLoading?: boolean;
    suffixView?: React.ReactNode;
}

const CardDefault: FC<CardDefaultTypes> = ({
    title,
    description,
    time,
    onPress = () => {},
    showTime = true,
    style,
    isSelected = false,
    isLoading = false,
    suffixView = false,
    ...otherProps
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const selectedSharedValue = useSharedValue(0);

    useEffect(() => {
        if (isSelected) {
            selectedSharedValue.value = withSpring(1, {
                duration: 900,
            });
        } else {
            selectedSharedValue.value = withSpring(0, {
                duration: 900,
            });
        }
    }, [isSelected]);

    const selectedBorderStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(
                selectedSharedValue.value,
                [0, 1],
                [themeColors.Fill_neutralMin, themeColors.APP_THEME_COLOR],
            ),
        };
    });

    const [displayTitle, displayDescription] = useMemo(() => {
        const descriptionSplitArray = description?.split(', ').map(item => item.trim());
        if (title != undefined && title?.length < 10) {
            if (descriptionSplitArray != undefined && descriptionSplitArray.length >= 2) {
                return [`${title}, ${descriptionSplitArray[1]}`, descriptionSplitArray.slice(2).join(', ')];
            }
        }
        return [title, description];
    }, [title, description]);

    return (
        <Pressable
            testID="c5f0eb19-a834-49a0-87f6-d88ddea834c0"
            accessibilityRole="button"
            accessibilityLabel={title + ' button'}
            onPress={onPress}
            {...otherProps}>
            {({ pressed }) => (
                <Animated.View
                    style={[
                        tailwind.style(
                            `flex-row items-center gap-[${token?.gap?.spacing?.[4]}] bg-[${themeColors.Fill_neutralMin}] rounded-[${token?.corner.md}]  px-[${token?.spacing[16]}] py-[${token?.spacing?.[16]}] border`,
                            style,
                        ),
                        selectedBorderStyle,
                        pressed && !isSelected
                            ? tailwind.style(`border-[${themeColors.Fill_neutralMidLow}]`)
                            : selectedBorderStyle,
                    ]}>
                    <Animated.View
                        style={tailwind.style(
                            `flex-row flex-1 gap-[${token?.gap?.spacing?.[6]}]  items-center justify-center `,
                        )}>
                        <Animated.View style={tailwind.style(`flex-col flex-1 gap-[${token?.gap?.spacing?.[6]}]`)}>
                            {!isLoading ? (
                                <Animated.View
                                    style={tailwind.style(`gap-[${token?.gap?.spacing?.[6]}]`)}
                                    exiting={FadeOut}
                                    entering={FadeIn}
                                    accessible={true}>
                                    {displayTitle ? (
                                        <Typography
                                            type="subhead-1"
                                            numberOfLines={1}
                                            style={tailwind.style(`text-[${token?.text?.['text-highContrast']}]`)}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {displayTitle}
                                        </Typography>
                                    ) : null}
                                    {displayDescription ? (
                                        <Typography
                                            type="body-1"
                                            numberOfLines={1}
                                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {displayDescription}
                                        </Typography>
                                    ) : null}
                                </Animated.View>
                            ) : null}
                            {isLoading ? (
                                <Animated.View exiting={FadeOut} entering={FadeIn}>
                                    <ContentLoader height={48} width={'75%'}>
                                        <Rect x="0" y="0" rx="6" ry="6" width="60%" height="18" />
                                        <Rect x="0" y="28" rx="6" ry="6" width="95%" height="18" />
                                    </ContentLoader>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    </Animated.View>

                    {showTime && (
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>{`${time} min`}</Typography>
                    )}

                    {suffixView && suffixView}
                </Animated.View>
            )}
        </Pressable>
    );
};

export default CardDefault;
