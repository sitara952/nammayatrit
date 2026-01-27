import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useEffect, useState } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';

type SingleModeBusSearchBarProps = { onPressSingleModeBusSearch: () => void };

export const SingleModeBusSearchBar = ({ onPressSingleModeBusSearch }: SingleModeBusSearchBarProps) => {
    const expanded = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
        width: withTiming(expanded.value ? 300 : 160, { duration: 500 }),
    }));
    const configManager = useConfigContext();
    const singleModeBusSearchBarAnimationDuration =
        useAppSelector(selectNewFeatureFlags).singleModeBusSearchBarAnimationDuration;
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [text, setText] = useState(userLanguageStrings.Search);
    useEffect(() => {
        const timer = setTimeout(() => {
            expanded.value = 1;
            setText(userLanguageStrings.SearchForBusStopAndBusNo);
        }, singleModeBusSearchBarAnimationDuration);

        return () => {
            clearTimeout(timer);
        };
    }, []);
    return (
        <Animated.View style={[animatedStyle]}>
            <Pressable
                accessibilityRole="button"
                testID="singleModeBusSearchBarButton"
                onPress={onPressSingleModeBusSearch}
                style={tailwind.style(
                    `p-[10px] rounded-full bg-[#FFFFFF] flex flex-row gap-2 items-center justify-center`,
                )}>
                <Icon icon={<MagnifyingGlass fill={'#000'} />} size={16} color="#0e0e0f" />
                <Typography
                    style={[]}
                    numberOfLines={1}
                    type="subhead-600"
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityRole={undefined}
                    accessibilityLabel={undefined}>
                    {text}
                </Typography>
            </Pressable>
        </Animated.View>
    );
};
