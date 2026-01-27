import React, {FC} from 'react';
import Svg, {Path} from 'react-native-svg';

interface ChevronUpProps {
  height?: number;
  width?: number;
  color?: string;
}

const ChevronUp: FC<ChevronUpProps> = ({
  height = 21,
  width = 20,
  color,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24"  fill={color}>
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M11.7138 7.79289C12.1043 7.40237 12.7375 7.40237 13.128 7.79289L20.128 14.7929C20.5185 15.1834 20.5185 15.8166 20.128 16.2071C19.7375 16.5976 19.1043 16.5976 18.7138 16.2071L12.4209 9.91421L6.12801 16.2071C5.73748 16.5976 5.10432 16.5976 4.71379 16.2071C4.32327 15.8166 4.32327 15.1834 4.71379 14.7929L11.7138 7.79289Z" fill={color || '#5B6777'}/>
    </Svg>
  );
};

export default ChevronUp;