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
  viewBox="0 0 25 24"
  fill="none"
>
  <Path
    d="M7.85 10.15a2.919 2.919 0 002.917-2.917A2.919 2.919 0 007.85 4.316a2.919 2.919 0 00-2.916 2.917A2.919 2.919 0 007.85 10.15zM18.72 4.418h-2.487c-.869 0-1.573.704-1.573 1.573v2.487c0 .868.704 1.572 1.573 1.572h2.487c.868 0 1.573-.704 1.573-1.572V5.99c0-.869-.705-1.573-1.573-1.573zM6.835 14.352L5.31 15.878a1.426 1.426 0 000 2.017l1.526 1.526c.557.557 1.46.557 2.017 0l1.526-1.526a1.426 1.426 0 000-2.017l-1.526-1.526a1.426 1.426 0 00-2.017 0zM18.409 14.859a1.11 1.11 0 00-1.865 0l-1.582 2.45a1.84 1.84 0 00-.302 1.024c0 .503.412.915.915.915h3.812a.917.917 0 00.915-.915c0-.365-.101-.722-.302-1.024l-1.591-2.45z"
    fill={color}
    stroke={color}
        strokeWidth={0.96234}
      />
    </Svg>
  );


export default TabServicesIcon;
