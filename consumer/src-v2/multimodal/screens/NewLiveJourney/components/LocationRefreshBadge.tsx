import { Spinner } from '@/src-v2/multimodal/components/common/Spinner/UI';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useEffect } from 'react';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const LocationError = () => {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G clip-path="url(#clip0_13968_22068)">
                <Path
                    d="M13.9038 7.76281C13.9138 6.15281 13.3138 4.55281 12.0838 3.32281C9.66375 0.902812 5.73375 0.902812 3.31375 3.32281C0.893752 5.74281 0.893752 9.66281 3.32375 12.0828L6.74375 15.5028"
                    stroke="#F73812"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                />
                <Path d="M8.65625 15.5L13.6562 10.5" stroke="#F73812" strokeWidth="1.5" strokeMiterlimit="10" />
                <Path d="M8.65625 10.5L13.6562 15.5" stroke="#F73812" strokeWidth="1.5" strokeMiterlimit="10" />
                <Path d="M7.07812 7H8.31813" stroke="#F73812" strokeWidth="1.5" strokeMiterlimit="10" />
            </G>
            <Defs>
                <ClipPath id="clip0_13968_22068">
                    <Rect width="16" height="16" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

interface RefreshingOrSuccessProps {
    status: 'refreshing' | 'success';
}

interface ErrorProps {
    status: 'error';
    handleOnPress: () => void;
}

type LocationRefreshBadgeProps = RefreshingOrSuccessProps | ErrorProps;

const COLORS = {
    textColor: {
        refreshing: '#E97F06',
        success: '#09941E',
        error: '#3B3A3C',
    },
    backgroundColor: {
        refreshing: '#FFFFFF',
        success: '#FFFFFF',
        error: '#FFE688',
    },
    text: {
        refreshing: 'Refreshing Location',
        success: 'Live',
        error: 'Fix Location',
    },
};

export const LocationRefreshBadge = (props: LocationRefreshBadgeProps) => {
    const { status } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            accessibilityRole="button"
            testID="location-refresh-badge"
            accessibilityLabel={
                status === 'error'
                    ? 'Fix location button'
                    : status === 'refreshing'
                      ? 'Refreshing location type button'
                      : 'Live button'
            }
            style={tailwind.style('items-end')}
            onPress={status === 'error' ? props.handleOnPress : undefined}
            disabled={status === 'refreshing' || status === 'success'}>
            <Animated.View
                entering={FadeIn.springify().damping(30).stiffness(400)}
                exiting={FadeOut.duration(100)}
                layout={LinearTransition.springify().damping(30).stiffness(400)}
                style={tailwind.style(
                    'bg-[#FFFFFF] flex-row justify-center min-h-10 items-center gap-2 rounded-[22px] px-4 py-2',
                    status === 'error' && `bg-[${COLORS.backgroundColor.error}]`,
                )}>
                {status === 'refreshing' && (
                    <>
                        <Spinner size="xs" themeColor="primary" stroke={`border-[${COLORS.textColor[status]}]`} />
                        <Animated.Text
                            style={tailwind.style('text-center text-[14px] font-areaNormal-extrabold', {
                                color: COLORS.textColor[status],
                            })}>
                            {userLanguageStrings.RefreshingLocationType}
                        </Animated.Text>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <Pulse />
                        <Animated.Text
                            style={tailwind.style('text-center text-[14px] font-areaNormal-extrabold', {
                                color: COLORS.textColor[status],
                            })}>
                            {userLanguageStrings.LiveType}
                        </Animated.Text>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <Icon icon={<LocationError />} size={16} />
                        <Animated.Text
                            style={tailwind.style('text-center text-[14px] font-areaNormal-extrabold', {
                                color: COLORS.textColor[status],
                            })}>
                            {userLanguageStrings.FixLocationType}
                        </Animated.Text>
                    </>
                )}
            </Animated.View>
        </Pressable>
    );
};

export const Pulse = () => {
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedValue.value, [0, 1], [1, 0]),
            transform: [
                {
                    scale: interpolate(animatedValue.value, [0, 1], [1, 2]),
                },
            ],
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(34).stiffness(400)}
            style={[tailwind.style('h-2 w-2 rounded-[9999px]', `bg-[${COLORS.textColor.success}]`)]}>
            <Animated.View
                style={[tailwind.style('h-2 w-2 rounded-[9999px]', `bg-[${COLORS.textColor.success}]`), animatedStyle]}
            />
        </Animated.View>
    );
};
