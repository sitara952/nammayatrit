import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TabHomeIconProps {
  color?: string;      // the fill color
  size?: number;       // both width & height
}

const TabHomeIcon: React.FC<TabHomeIconProps> = ({
  color = '#E61B1A',
  size = 25,
}) => (
  <Svg width={size} height={size} fill={color}>
    <Path
      d="M19.975 9.29883H3.10001V3.29883H19.975L22.225 6.29883L19.975 9.29883Z"
      fill={color}
    />
    <Path
      d="M4.22501 11.7129H21.1V17.7129H4.22501L1.97501 14.7129L4.22501 11.7129Z"
      fill={color}
    />
    <Path
      d="M13.225 15.5488H10.975V21.6738H13.225V15.5488Z"
      fill={color}
    />
  </Svg>
);

export default TabHomeIcon;
