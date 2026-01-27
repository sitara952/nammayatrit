import HamburgerIcon from '@/typescript/components/svg/HamburgerIcon';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import Tag from '@/typescript/designSystem/components/primitives/Tag';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

const HamburgerView = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { top: topInsets } = useSafeAreaInsets();
    const { sheetAnimatedIndex } = useAnimatedContextValues(undefined);

    const menuIconAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [0, 1, 1]);
        const translateY = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [0, 0, -6]);

        const translateX = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [-100, -100, 0]);
        const paddingTop = interpolate(sheetAnimatedIndex.value, [0, 0.9, 1], [0, 0, topInsets / 3]);

        return { transform: [{ translateX }, { translateY }], opacity, paddingTop };
    });

    return (
        <Animated.View style={[tailwind.style('flex-row flex items-center ')]}>
            <Animated.View style={[tailwind.style('items-center'), menuIconAnimatedStyle, { opacity: 1 }]}>
                <Tag
                    testID="home_hamburger_menu"
                    size="md"
                    key={'tag'}
                    type="secondary"
                    style={tailwind.style(
                        `bg-[${themeColors.Fill_neutralLow}]  ml-[20px] mr-3 h-[43px] w-[50px] flex items-center justify-center rounded-[18px]`,
                    )}
                    onPress={() => {}}
                    icon={<HamburgerIcon height={15} />}
                    accessibilityLabel="Hamburger Menu"
                    accessibilityRole="button"
                    accessible={true}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default HamburgerView;
