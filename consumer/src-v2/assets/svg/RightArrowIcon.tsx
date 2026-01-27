import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface RightArrowIconProps {
  width: number | undefined;
  height: number | undefined;
  color: string | undefined;
  strokeWidth: number | undefined;
}

export const RightArrowIcon: React.FC<RightArrowIconProps> = ({
  width = 20,
  height = 20,
  color = '#3B3A3C',
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10H14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 6L14 10L10 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
