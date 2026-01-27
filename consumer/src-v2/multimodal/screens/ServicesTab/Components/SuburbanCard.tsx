import suburbanTransit from '../../../../assets/3D-assets/full-asset/suburban_transit.webp';
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
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface SuburbanCardProps {
    handleOnSuburbanCardPress: () => void;
    distance: number | null;
}

export const SuburbanCard = (props: SuburbanCardProps) => {
    const { handleOnSuburbanCardPress, distance } = props;
    const { animatedStyle, handlers } = useScaleAnimation();
    const triggerHaptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const handleOnPress = () => {
        triggerHaptic();
        handleOnSuburbanCardPress();
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            testID="suburban-card"
            accessibilityRole="button"
            accessibilityLabel="Book suburban button"
            {...handlers}
            onPress={handleOnPress}>
            <Animated.View style={[tailwind.style('p-4 bg-white rounded-[20px] overflow-hidden'), animatedStyle]}>
                <Animated.View style={tailwind.style('relative pt-[55px]')}>
                    <Animated.View
                        style={tailwind.style(
                            'h-9 w-9 justify-center items-center rounded-full',
                            `bg-[${getIconBGFromType('Subway')}]`,
                        )}>
                        {getIconFromType('Subway', 16, getIconSecondaryBGFromType('Subway'))}
                    </Animated.View>
                    <Animated.Image
                        accessible={false}
                        entering={SlideInRight.delay(200).springify().damping(28).stiffness(300)}
                        source={suburbanTransit}
                        style={tailwind.style('absolute -top-[110px] left-[45px] w-[250px] h-[250px]', {
                            transform: [{ scaleX: -1 }],
                        })}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('pt-2.5')}>
                    <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#313131]')}>
                        {userLanguageStrings.SubUrban}
                    </Animated.Text>
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E] pt-1')}>
                        {distance ? userLanguageStrings.StationKmAway(Number((distance / 1000).toFixed(2))) : ''}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
