
import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface TabLiveIconProps {
  color?: string;
  size?: number;
}

const TabLiveIcon: React.FC<TabLiveIconProps> = ({
  color = '#969696',
  size = 25,
}) => (
    <Svg width={size} height={size} fill={color}>
    <Circle cx="12.5" cy="12.5" r="10.5" fill={color}/>
    <Circle cx="12.5" cy="12.5" r="4.5" fill="white"/>
    </Svg>
);

export default TabLiveIcon;
