import mtIcDriver from '../../assets/ny-service/mt_ic_driver.webp';
import React from 'react';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';

type HomePageDriverAvatarProps = {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    onPress: () => void;
    buttonPositionUpwardsBy: SharedValue<number>;
};

const HomePageDriverAvatar = (props: HomePageDriverAvatarProps) => {
    const { sheetAnimatedIndex, sheetAnimatedPosition, buttonPositionUpwardsBy } = props;
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - buttonPositionUpwardsBy.value - 60,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0, 0.5], [1, 0]),
        };
    });

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[tailwind.style(`px-[${token?.spacing[16]}] absolute w-full items-center`), floatingHeaderStyle]}>
            <Animated.View>
                <Animated.View style={tailwind.style('bottom-[20px]')}>
                    <Svg width={209} height={194} viewBox="0 0 209 194" fill="none" {...props}>
                        <Circle cx={104.5} cy={104.5} r={104.5} fill="#FFD45D" />
                    </Svg>
                </Animated.View>
                <Animated.View style={tailwind.style('absolute bottom-[20px] left-[-25%]')}>
                    <Animated.Image accessible={true} accessibilityLabel="driver avatar image" source={mtIcDriver} />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default HomePageDriverAvatar;
