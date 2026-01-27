import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useAppKeyboardAnimation } from '@/typescript/utils/useAppKeyboardAnimation';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface LocateOnMapButtonProps {
    onPress: () => void;
}
const LocateOnMapIcon = () => {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_5128_40826)">
                <Path
                    d="M12.58 2.823a6.204 6.204 0 00-8.77 0 6.183 6.183 0 00.01 8.76l3.42 3.42h1.93l3.42-3.42a6.205 6.205 0 000-8.77l-.01.01zM8.2 9.353c-1.3 0-2.36-1.06-2.36-2.36 0-1.3 1.06-2.36 2.36-2.36 1.3 0 2.36 1.06 2.36 2.36 0 1.3-1.06 2.36-2.36 2.36z"
                    fill="#fff"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_5128_40826">
                    <Path fill="#fff" transform="translate(2 1)" d="M0 0H12.4V14H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
export const LocateOnMapButton: React.FC<LocateOnMapButtonProps> = ({ onPress }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const { height } = useAppKeyboardAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const animatedPosition = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -(height.value - 10) }],
        };
    });

    return (
        <Animated.View
            style={[
                tailwind.style(`absolute w-full z-10 flex-row bottom-[40px] left-[${SCREEN_WIDTH / 2 - 150 / 2}px]`),
                animatedPosition,
            ]}>
            <Pressable
                testID="favourites-locate-on-map-button"
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Locate on Map button"
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'flex-row items-center justify-center gap-[6px] rounded-[20px] bg-[#3F3E40] px-[12px] h-[40px]',
                            {
                                shadowColor: '#000000',
                                shadowOffset: { width: 0, height: 2.92 },
                                shadowOpacity: 0.2,
                                shadowRadius: 24.8,
                                elevation: 5,
                            },
                        ),
                        animatedStyle,
                    ]}>
                    <LocateOnMapIcon />
                    <Animated.Text style={tailwind.style('font-areaNormal-extrabold text-[14px] text-white')}>
                        {userLanguageStrings.LocateOnMap}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};
