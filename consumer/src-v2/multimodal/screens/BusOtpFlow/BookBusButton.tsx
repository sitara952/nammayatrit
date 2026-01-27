import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
interface BookBusButtonProps {
    onPress: () => void;
}

const BookBusButton = ({ onPress }: BookBusButtonProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();

    return (
        <Pressable
            testID="book-bus-button"
            onPress={onPress}
            {...handlers}
            accessibilityRole="button"
            accessible={true}
            accessibilityLabel="Book Bus Button">
            <Animated.View
                style={[
                    tailwind.style(
                        'flex-col items-center justify-center w-[95px] h-[76px] pt-[11px] pb-[7px] bg-[#0057E2] rounded-[26px] gap-[8px] px-[0px]',
                    ),
                    animatedStyle,
                ]}>
                <LottieWithFallback
                    style={tailwind.style('w-[150px] h-[150px]')}
                    source={require('@/src-v2/assets/lottie/scan.lottie')}
                    autoPlay
                    loop
                    fallback={undefined}
                />
            </Animated.View>
        </Pressable>
    );
};

export default BookBusButton;
