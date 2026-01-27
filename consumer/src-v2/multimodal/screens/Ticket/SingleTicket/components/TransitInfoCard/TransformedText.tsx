import { Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { tailwind } from '../../../../../../tailwind-theme/tailwind';
import { withAnchorPoint } from '../../../../../../utils/withAnchorPoint';

export const TransformedText = (props: { text: string; width: number }) => {
    const { width, text } = props;
    const animatedStyle = useAnimatedStyle(() => {
        const baseTransform = {
            transform: [{ rotate: '90deg' }, { translateY: -5.5 }], // Removed translateY since withAnchorPoint will handle positioning
        };

        return withAnchorPoint(
            baseTransform,
            { x: 0, y: 0.5 }, // Anchor point at center-left
            { width: width, height: 10 }, // Using the width prop and approximate text height
        );
    }, [width]);

    return (
        <Animated.View style={[tailwind.style('absolute left-0', `bottom-[${width - 20}px]`), animatedStyle]}>
            <Text
                numberOfLines={1}
                style={[
                    tailwind.style(
                        'font-areaNormal-extrabold text-[7px] tracking-[1.5px] leading-[10px] text-[#FFFFFF] opacity-40 uppercase',
                        `w-[${width}px]`,
                    ),
                ]}>
                {text}
            </Text>
        </Animated.View>
    );
};
