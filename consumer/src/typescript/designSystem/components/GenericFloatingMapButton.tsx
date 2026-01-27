import React from 'react';
import colors from '../../designSystem/colorPalette';
import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '../../tailwindTheme/tailwind';
import { useAppKeyboardAnimation } from '../../utils/useAppKeyboardAnimation';
import { MapPinIcon } from '../../components/svg/MapPinIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface GenericFloatingMapBtnProps {
    handleOnPress: () => void;
}

export const GenericFloatingMapButton: React.FC<GenericFloatingMapBtnProps> = ({ handleOnPress }) => {
    const { bottom } = useSafeAreaInsets();
    const { height, progress } = useAppKeyboardAnimation();
    const bottomValue = useDerivedValue(() => interpolate(progress.value, [0, 1], [bottom + 16, 20]));
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const animatedPosition = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -(height.value + bottomValue.value) }],
        };
    });

    return (
        <Animated.View
            style={[tailwind.style('absolute w-full justify-end flex-1 items-center bottom-0'), animatedPosition]}>
            <Button
                testID="82b88ff2-9ec7-4840-ad61-9948e30e686f"
                type={'primary'}
                style={[
                    tailwind.style(' rounded-full'),
                    styles.floatingMapButtonShadow,
                    { backgroundColor: themeColors.where_you_going_bg },
                ]}
                suffix={<MapPinIcon color={themeColors.Button_Primary_Default_Text_Base} />}
                text="Map"
                onPress={handleOnPress}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    floatingMapButtonShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '1F',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 13,
    },
});
