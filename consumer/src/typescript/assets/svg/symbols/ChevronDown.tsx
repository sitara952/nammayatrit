import React, {FC} from 'react';
import Svg, {Path} from 'react-native-svg';

interface ChevronDownProps {
  height?: number;
  width?: number;
  color?: string;
}

const ChevronDown: FC<ChevronDownProps> = ({
  height = 21,
  width = 20,
  color,
}) => {
  return (
    <Svg width={width} height={height}  viewBox="0 0 25 24"  fill={color}>
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M13.128 16.2071C12.7375 16.5976 12.1043 16.5976 11.7138 16.2071L4.71379 9.20711C4.32327 8.81658 4.32327 8.18342 4.71379 7.79289C5.10431 7.40237 5.73748 7.40237 6.128 7.79289L12.4209 14.0858L18.7138 7.79289C19.1043 7.40237 19.7375 7.40237 20.128 7.79289C20.5185 8.18342 20.5185 8.81658 20.128 9.20711L13.128 16.2071Z" fill={color || '#5B6777'}/>
    </Svg>
  );
};

export default ChevronDown;
