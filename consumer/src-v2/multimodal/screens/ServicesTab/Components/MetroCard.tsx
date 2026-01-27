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
import metroTransit from '../../../../assets/3D-assets/full-asset/metro_transit.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
export interface MetroCardProps {
    handleOnMetroCardPress: () => void;
    distance: number | null;
}

export const MetroCard = (props: MetroCardProps) => {
    const { handleOnMetroCardPress, distance } = props;
    const { animatedStyle, handlers } = useScaleAnimation();
    const triggerHaptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const handleOnPress = () => {
        triggerHaptic();
        handleOnMetroCardPress();
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            testID="suburban-card"
            accessibilityRole="button"
            accessibilityLabel="Book metro button"
            {...handlers}
            onPress={handleOnPress}>
            <Animated.View style={[tailwind.style('p-4 bg-white rounded-[20px] overflow-hidden'), animatedStyle]}>
                <Animated.View style={tailwind.style('relative pt-[55px]')}>
                    <Animated.View
                        style={tailwind.style(
                            'h-9 w-9 justify-center items-center rounded-full',
                            `bg-[${getIconBGFromType('Metro')}]`,
                        )}>
                        {getIconFromType('Metro', 16, getIconSecondaryBGFromType('Metro'))}
                    </Animated.View>
                    <Animated.Image
                        accessible={false}
                        entering={SlideInRight.delay(200).springify().damping(28).stiffness(300)}
                        source={metroTransit}
                        style={tailwind.style('absolute -top-[110px] left-[45px] w-[250px] h-[250px]', {
                            transform: [{ scaleX: -1 }],
                        })}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('pt-2.5')}>
                    <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#313131]')}>
                        {userLanguageStrings.Metro}
                    </Animated.Text>
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E] pt-1')}>
                        {distance ? userLanguageStrings.StationKmAway(Number((distance / 1000).toFixed(2))) : ''}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
