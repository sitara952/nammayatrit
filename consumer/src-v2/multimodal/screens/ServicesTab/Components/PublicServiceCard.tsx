import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, { SlideInRight } from 'react-native-reanimated';
import {
    getIconBGFromType,
    getIconFromType,
    getIconSecondaryBGFromType,
} from '../../JourneyInfoScreen/components/TransitIconWrapper';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { ImageSourcePropType } from 'react-native';
import { ServiceTag } from '@/src-v2/systems/configs/types';

const maxWidth = SCREEN_WIDTH / 2 - 28;

export interface ServiceCardProps {
    title: string;
    subtitle: string | undefined;
    image: ImageSourcePropType;
    serviceTag: ServiceTag;
    testID: string;
    onPress: () => void;
}

type iconConfig = {
    iconColor: string;
    iconType: React.ReactElement | null;
    imageStyle: string;
};

const getServiceIcon = (serviceTag: ServiceTag): iconConfig | undefined => {
    switch (serviceTag) {
        case 'METRO_V2':
            return {
                iconColor: getIconBGFromType('Metro'),
                iconType: getIconFromType('Metro', 16, getIconSecondaryBGFromType('Metro')),
                imageStyle: `w-250px h-250px absolute -top-100px left-[${maxWidth / 4.5}px]`,
            };
        case 'SUBWAY':
            return {
                iconColor: getIconBGFromType('Subway'),
                iconType: getIconFromType('Subway', 16, getIconSecondaryBGFromType('Subway')),
                imageStyle: `w-250px h-250px absolute -top-110px left-[${maxWidth / 4}px]`,
            };
        case 'BUS':
        case 'BUS_V2':
        case 'BUS_HYBRID':
            return {
                iconColor: getIconBGFromType('Bus'),
                iconType: getIconFromType('Bus', 16, getIconSecondaryBGFromType('Bus')),
                imageStyle: `w-250px h-250px absolute -top-90px left-[${maxWidth / 7}px]`,
            };
        case 'AMBULANCE_SERVICE':
        case 'BOATING':
            return {
                iconColor: '',
                iconType: null,
                imageStyle: `w-155px h-100px absolute -top-8px -left-23px`,
            };
        case 'DURGA_PUJO':
            return {
                iconColor: '',
                iconType: null,
                imageStyle: `w-155px h-90px absolute -top-3px -left-2px`,
            };
        default:
            return undefined;
    }
};

export const PublicServiceCard = (props: ServiceCardProps) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    const triggerHaptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });

    const iconConfig = getServiceIcon(props.serviceTag);

    const handleOnPress = () => {
        triggerHaptic();
        props.onPress();
    };

    return (
        <Pressable
            testID={props.testID}
            accessibilityRole="button"
            accessibilityLabel={props.title + ' button'}
            {...handlers}
            style={{ width: maxWidth }}
            onPress={handleOnPress}>
            <Animated.View style={[tailwind.style('p-4 bg-white rounded-[20px] overflow-hidden'), animatedStyle]}>
                <Animated.View style={tailwind.style('relative pt-[55px] flex-row')}>
                    {iconConfig ? (
                        <Animated.View
                            style={tailwind.style(
                                'h-9 w-9 justify-center items-center rounded-full',
                                `bg-[${iconConfig?.iconColor}]`,
                            )}>
                            {iconConfig?.iconType}
                        </Animated.View>
                    ) : (
                        <Animated.View style={{ height: 26, width: 25 }} />
                    )}
                    <Animated.View style={{ flex: 1 }} />

                    <Animated.Image
                        accessible={false}
                        entering={SlideInRight.delay(200).springify().damping(28).stiffness(300)}
                        source={props.image}
                        style={tailwind.style(
                            iconConfig?.imageStyle ?? 'absolute -top-[110px] left-[45px] w-[250px] h-[250px]',
                            {
                                transform: [{ scaleX: -1 }],
                            },
                        )}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('pt-2.5')}>
                    <Typography
                        type={'callout-1'}
                        style={{ fontSize: 13 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.title}
                    </Typography>
                    {props.subtitle && (
                        <Typography
                            type={'callout-1'}
                            style={{ color: '#7E7E7E', fontSize: 12 }}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {props.subtitle ? props.subtitle : ''}
                        </Typography>
                    )}
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
