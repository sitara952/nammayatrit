// eslint-disable-next-line no-restricted-imports
import { Pressable, PressableProps, Text, View, ViewStyle } from 'react-native';
import Animated, {
    AnimatedProps,
    FadeInDown,
    FadeInLeft,
    FadeOutLeft,
    FadeOutUp,
    LinearTransition,
    ZoomIn,
} from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Constants
const _buttonHeight = 56;
const _spacing = 10;
const _fadeIn = FadeInDown.springify().damping(18).stiffness(200);
const _fadeOut = FadeOutUp.springify().damping(18).stiffness(200);
const _layout = LinearTransition.springify().damping(18).stiffness(200);

// Types

type ButtonProps = AnimatedProps<
    PressableProps & {
        style: ViewStyle;
    }
>;
type OnboardingIndicatorProps = {
    data: number[];
    selectedIndex: number;
    onChange: (index: number) => void;
    onPressGetStartedButton: () => void;
};

export function OnboardingIndicator({
    data,
    onChange,
    selectedIndex,
    onPressGetStartedButton,
}: OnboardingIndicatorProps) {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={{ gap: _spacing }}>
            <View style={{ flexDirection: 'row', gap: _spacing }}>
                {selectedIndex > 0 && (
                    <Button
                        style={{ backgroundColor: '#ddd', height: 56, borderRadius: 16 }}
                        onPress={() => {
                            onChange(selectedIndex - 1);
                        }}>
                        <Text
                            style={{
                                fontSize: 16,
                                color: '#3B3A3C',
                                fontFamily: 'AreaNormal-Extrabold',
                            }}>
                            {userLanguageStrings.Back}
                        </Text>
                    </Button>
                )}
                <Button
                    style={{ backgroundColor: '#3B3A3C', flex: 1, height: 56, borderRadius: 16 }}
                    onPress={() => {
                        if (selectedIndex === data.length - 1) {
                            onPressGetStartedButton();
                            return;
                        }
                        onChange(selectedIndex + 1);
                    }}>
                    {selectedIndex === data.length - 1 ? (
                        <Animated.View
                            entering={_fadeIn}
                            exiting={_fadeOut}
                            style={{
                                flexDirection: 'row',
                                gap: _spacing / 2,
                                alignItems: 'center',
                            }}>
                            <Animated.View
                                entering={ZoomIn.delay(100).springify().damping(18).stiffness(200)}></Animated.View>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: 'white',
                                    fontFamily: 'AreaNormal-Extrabold',
                                }}>
                                {userLanguageStrings.GetStarted}
                            </Text>
                        </Animated.View>
                    ) : (
                        <Animated.Text
                            style={{
                                fontSize: 16,
                                color: 'white',
                                fontFamily: 'AreaNormal-Extrabold',
                            }}
                            entering={_fadeIn}
                            exiting={_fadeOut}
                            layout={_layout}>
                            {userLanguageStrings.Next}
                        </Animated.Text>
                    )}
                </Button>
            </View>
        </View>
    );
}

// Reusable Button that's extending Animated from
// Reanimated

function Button({ children, style, ...rest }: ButtonProps) {
    return (
        <AnimatedPressable
            style={[
                {
                    height: _buttonHeight,
                    paddingHorizontal: _spacing * 2,
                    justifyContent: 'center',
                    borderRadius: _buttonHeight,
                    alignItems: 'center',
                },
                style,
            ]}
            entering={FadeInLeft.springify().damping(18).stiffness(200)}
            exiting={FadeOutLeft.springify().damping(18).stiffness(200)}
            layout={_layout}
            {...rest}>
            {children}
        </AnimatedPressable>
    );
}
