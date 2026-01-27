import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { ThumbsDown, ThumbsUp } from '../../../MultiTransitFeedback/components/svg/Thumbs';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface RateTransitProps {
    /** Callback function triggered when thumbs up button is pressed */
    handleOnPressThumbsUp: () => void;
    /** Callback function triggered when thumbs down button is pressed */
    handleOnPressThumbsDown: () => void;

    /** Type of transit being rated - can be Bus, Train, or Metro */
    transitMode: 'Bus' | 'Train' | 'Metro';
    /** Destination of the journey being rated */
    destination: string;
    /** Visual style variant of the component
     * - 'plain': Used for train/suburban transit with yellow background
     * - 'filled': White background with yellow border
     */
    variant?: 'plain' | 'filled';
}

export const RateTransit = (props: RateTransitProps) => {
    const {
        handleOnPressThumbsUp,
        handleOnPressThumbsDown,
        transitMode = 'NA',
        destination = 'NA',
        variant = 'plain',
    } = props;
    const MAX_TEXT_WIDTH = SCREEN_WIDTH - 48 - 52 - 52 - 12 - 16;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            layout={LinearTransition.springify().damping(34).stiffness(300)}
            style={tailwind.style(
                'mx-6 pt-4 pb-3',
                variant === 'plain'
                    ? 'border-t border-[#F4F4F4] flex-row items-center justify-between'
                    : 'items-center justify-center',
            )}>
            <Animated.Text
                style={tailwind.style(
                    'text-[13px] font-areaNormal-extrabold leading-[21px] pr-4',
                    variant === 'plain' ? `max-w-[${MAX_TEXT_WIDTH}px] text-[#7E7E7E]` : 'text-center text-[#3B3A3C]',
                )}>
                {userLanguageStrings.RateYourTransitModeJourneyTo(transitMode)} {'\n'}
                {destination}
            </Animated.Text>
            <Animated.View style={tailwind.style('flex-row items-center gap-3', variant === 'plain' ? '' : 'pt-5')}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Thumbs up button"
                    testID="thumbs-up"
                    onPress={handleOnPressThumbsUp}>
                    <Animated.View
                        style={tailwind.style(
                            'w-13 h-10 rounded-[20px] justify-center items-center p-2',
                            variant === 'filled'
                                ? 'bg-white border-[1px] border-[#FEE480]'
                                : 'border-[1px] border-[#F5F5F5]',
                        )}>
                        <Icon icon={<ThumbsUp stroke="#727581" />} size={24} />
                    </Animated.View>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Thumbs down button"
                    testID="thumbs-down"
                    onPress={handleOnPressThumbsDown}>
                    <Animated.View
                        style={tailwind.style(
                            'w-13 h-10 rounded-[20px] justify-center items-center p-2',
                            variant === 'filled'
                                ? 'bg-white border-[1px] border-[#FEE480]'
                                : 'border-[1px] border-[#F5F5F5]',
                        )}>
                        <Icon icon={<ThumbsDown stroke="#727581" />} size={24} />
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};
