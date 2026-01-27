import React from 'react';
import Animated, { interpolate, LinearTransition, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import { Path, Svg } from 'react-native-svg';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';

import { useConfigContext } from '@/typescript/context/ConfigContext';

type RecenterButtonProps = {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    onPress: () => void;
    buttonPositionUpwardsBy: SharedValue<number>;
    additionalOffset: number;
};

const RecenterButton = (props: RecenterButtonProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { sheetAnimatedIndex, sheetAnimatedPosition, onPress, additionalOffset } = props;

    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 72 - additionalOffset,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(300)}
            pointerEvents="box-none"
            style={[tailwind.style(`px-[${token?.spacing[16]}] absolute w-full items-end`), floatingHeaderStyle]}>
            <Button
                testID="ny_user_recenter_btn"
                size="md"
                type="secondary"
                accessibilityLabel="Recenter to current location"
                accessibilityRole="button"
                prefix={
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M22 10.8h-1.88c-.47 0-.88-.33-.97-.79A6.519 6.519 0 0014 4.92c-.47-.09-.8-.5-.8-.97V2h-2.4v1.95c0 .47-.33.88-.8.97-2.58.5-4.62 2.52-5.15 5.09-.09.46-.5.79-.97.79H2v2.4h1.86c.48 0 .89.34.98.81a6.51 6.51 0 003.58 4.71l.83.4c.8.39 1.37 1.13 1.55 1.99v.88h2.4v-.88c.19-.87.75-1.61 1.55-2l.83-.4A6.51 6.51 0 0019.16 14c.09-.47.5-.81.98-.81H22v-2.4.01zm-7 1.8c0 1.33-1.07 2.4-2.4 2.4h-1.2C10.07 15 9 13.93 9 12.6v-1.2C9 10.07 10.07 9 11.4 9h1.2c1.33 0 2.4 1.07 2.4 2.4v1.2z"
                            fill={themeColors.Icon_neutralUltraHigh}
                        />
                    </Svg>
                }
                onPress={() => {
                    onPress();
                }}
            />
        </Animated.View>
    );
};

export default RecenterButton;
