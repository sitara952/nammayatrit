import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TabServicesIconProps {
  color?: string;
  size?: number;
}

const TabServicesIcon: React.FC<TabServicesIconProps> = ({
  color = '#969696',
  size = 25,
}) => (
  <Svg
  width={size}
  height={size}
  viewBox="0 0 34 42"
  fill="none"
>
  <Path
    d="M9.89.17s-.1-.1-.14-.1c0 0-.07 0-.1-.03H2.13C.95.03 0 .96 0 2.11v37.74c0 1.15.98 2.11 2.17 2.11h7.52s.07 0 .1-.03c0 0 .07-.03.14-.1l4.1-3.99c.81-.79 1.86-1.22 2.98-1.22 1.12 0 2.2.43 2.98 1.22l4.1 3.96s.1.1.14.1c0 0 .07 0 .1.03h7.52c1.19 0 2.13-.92 2.13-2.08V2.11C33.98.96 33 0 31.81 0h-7.52s-.07 0-.1.03c0 0-.07.03-.14.1l-4.1 3.99c-.81.79-1.86 1.22-2.98 1.22-1.12 0-2.2-.43-2.98-1.22L9.89.13v.04z"
    fill={color}
  />
</Svg>

);

export default TabServicesIcon;
