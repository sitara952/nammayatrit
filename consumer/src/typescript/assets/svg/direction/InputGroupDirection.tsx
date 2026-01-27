import React, { useEffect } from 'react';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type InputGruopDirectionProps = {
  numStops: number | undefined
  heightMap: number[] | undefined
  isMultimodal: boolean | undefined
}

const InputGroupDirection: React.FC<InputGruopDirectionProps> = ({ numStops = 0, heightMap = [63, 113, 162 , 216], isMultimodal  }) => {
  const configManager = useConfigContext();
  const themeColors = configManager.get('themeColors');
  const targetHeight = heightMap[numStops] ?? 63;
  const MAX_HEIGHT = heightMap[heightMap.length - 1] ?? 250;

  const arrowHeight = useSharedValue(targetHeight);

  useEffect(() => {
    arrowHeight.value = withTiming(targetHeight, { duration: 300 });
  }, [targetHeight]);

  const containerStyle = useAnimatedStyle(() => ({
    height: arrowHeight.value,
  }));

  // Note: simulated paths so that the top "start" is fixed (at y≈8) and that the arrow end moves.
  const mainLineProps = useAnimatedProps(() => {
    const h = arrowHeight.value;
    return { d: `M14.07 8v${h - 12}` };
  });

  const dashedPathProps = useAnimatedProps(() => {
    const h = arrowHeight.value;
    return { d: `M13.5 8.5l-2.177 3.197C.1 12.657 0.01 ${h - 15} 13.5 ${h - 6}v0` };
  });

  const arrowPathProps = useAnimatedProps(() => {
    const h = arrowHeight.value;
    return { d: `M7 ${h - 4}h7.071v-7.071` };
  });

  return (
    <Animated.View style={[containerStyle,tailwind.style('mt-5')]}>
      <Svg
        width={25}
        height={MAX_HEIGHT}
        viewBox={`0 0 25 ${MAX_HEIGHT}`}
        fill="none"
      >
        <AnimatedPath
          animatedProps={mainLineProps}
          stroke={themeColors.Fill_neutralLow}
          strokeWidth={1.8}
          strokeLinecap="square"
          strokeLinejoin="round"
        />

        <AnimatedPath
          animatedProps={dashedPathProps}
          stroke="url(#paint0_linear)"
          strokeWidth={1.8}
          strokeMiterlimit={0.01}
          strokeDasharray="8 4"
        />

        <AnimatedPath
          animatedProps={arrowPathProps}
          stroke={isMultimodal ? "#F7493F" : themeColors.Input_Direction_Primary}
          strokeWidth={1.8}
          strokeLinecap="square"
        />

        <Ellipse
          cx={5}
          cy={5}
          rx={5}
          ry={5}
          transform="matrix(0 1 1 0 9 3.5)"
          fill={themeColors.Fill_neutralUltraHigh}
        />

        <Defs>
          <LinearGradient
            id="paint0_linear"
            x1={3}
            y1={9}
            x2={7}
            y2={targetHeight - 15}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor={isMultimodal ? "#8B8B8F" : themeColors.Fill_neutralMax} />
            <Stop offset={1} stopColor={isMultimodal ? "#F7493F" : themeColors.Input_Direction_Primary} />
          </LinearGradient>
        </Defs>
      </Svg>
    </Animated.View>
  );
}

export default InputGroupDirection;
