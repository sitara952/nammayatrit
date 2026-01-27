import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { getIconFromType } from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React from 'react';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { getIconBGFromType, getIconSecondaryBGFromType } from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ServiceTag } from '@/src-v2/systems/configs/types';
import { ImageSourcePropType } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
interface MainServiceCardProps {
    onPress: () => void;
    quickStops: {
        name: string;
        distance: number;
        onPress: () => void;
    }[];
    serviceTag: ServiceTag;
    title: string;
    subtitle: string | undefined;
    buttonText: string;
    imgSrc: ImageSourcePropType;
}

type iconConfig = {
    iconColor: string;
    iconType: React.ReactElement;
};

const getServiceIcon = (serviceTag: ServiceTag): iconConfig | undefined => {
    switch (serviceTag) {
        case 'METRO_V2':
            return {
                iconColor: getIconBGFromType('Metro'),
                iconType: getIconFromType('metro', 16, getIconSecondaryBGFromType('Metro')),
            };
        case 'SUBWAY':
            return {
                iconColor: getIconBGFromType('Subway'),
                iconType: getIconFromType('train', 16, getIconSecondaryBGFromType('Subway')),
            };
        case 'BUS':
        case 'BUS_V2':
        case 'BUS_HYBRID':
            return {
                iconColor: getIconBGFromType('Bus'),
                iconType: getIconFromType('bus', 16, getIconSecondaryBGFromType('Bus')),
            };
        default:
            return undefined;
    }
};

export const MainServiceCard = (props: MainServiceCardProps) => {
    const { onPress, quickStops } = props;
    const { animatedStyle, handlers } = useScaleAnimation();
    const hapticEffect = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const handleOnPress = () => {
        hapticEffect();
        onPress();
    };
    const configManager = useConfigContext();

    const StopsView = quickStops?.map((stop, index) => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={stop.name + ' button'}
            testID={`quick-stop-${index}`}
            style={tailwind.style('')}
            key={stop.name}
            onPress={stop.onPress}>
            <Animated.View
                style={tailwind.style(
                    'flex-row items-center',
                    index === quickStops.length - 1 ? 'pt-4 pb-0' : 'py-4',
                    `max-w-${SCREEN_WIDTH / 1.5}px`,
                )}>
                <Icon
                    style={{ transform: [{ rotate: '-45deg' }] }}
                    icon={<TransitArrowRight />}
                    size={16}
                    color="#7E7E7E"
                />
                <Typography
                    type={'callout'}
                    style={tailwind.style(
                        'text-[14px] leading-[16px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.2px]',
                    )}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {' '}
                    {stop.name}
                </Typography>
            </Animated.View>
            {index !== quickStops.length - 1 && <Animated.View style={tailwind.style('h-[1px] bg-[#F4F4F4] w-full')} />}
        </Pressable>
    ));

    const iconConfig = getServiceIcon(props.serviceTag);
    const colors = configManager.get('themeColors');
    return (
        <Animated.View style={tailwind.style('p-4 bg-white rounded-[20px] mx-4 overflow-hidden')}>
            <Animated.View style={tailwind.style('')}>
                <Animated.View style={tailwind.style('flex-row items-center')}>
                    {iconConfig ? (
                        <Animated.View
                            style={tailwind.style(
                                'h-9 w-9 justify-center items-center rounded-full',
                                `bg-[${iconConfig.iconColor}]`,
                            )}>
                            <Icon icon={iconConfig.iconType} />
                        </Animated.View>
                    ) : null}
                    <Animated.Image
                        accessible={false}
                        entering={SlideInRight.delay(200).springify().damping(28).stiffness(300)}
                        source={props.imgSrc}
                        style={tailwind.style('absolute -top-[100px] left-[225px] w-[250px] h-[250px]', {
                            transform: [{ scaleX: -1 }],
                        })}
                    />
                    <Animated.View style={tailwind.style('pl-2.5')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] font-areaNormal-extrabold text-[#313131] tracking-[0.2px]',
                            )}>
                            {props.title}
                        </Animated.Text>
                        {props.subtitle && (
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.2px]',
                                )}
                                accessibilityLabel={`There are ${quickStops.length} stops near you`}>
                                {props.subtitle}
                            </Animated.Text>
                        )}
                    </Animated.View>
                </Animated.View>
                <Animated.View style={tailwind.style(quickStops.length != 0 ? 'pb-4 pt-2' : 'pb-6 pt-2')}>
                    {StopsView}
                </Animated.View>
                <Animated.View style={[animatedStyle]}>
                    <Pressable
                        {...handlers}
                        style={tailwind.style(
                            `min-h-[55px] bg-[${colors.Button_for_modes_bg}] justify-center items-center rounded-[14px]`,
                        )}
                        testID="book-bus-card-button"
                        accessibilityLabel={props.buttonText + ' button'}
                        accessibilityRole="button"
                        onPress={handleOnPress}>
                        <Animated.Text
                            style={tailwind.style(
                                `text-[16px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}] tracking-[0.2px]`,
                            )}>
                            {props.buttonText}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
