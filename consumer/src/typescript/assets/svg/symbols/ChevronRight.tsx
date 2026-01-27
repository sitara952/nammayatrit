import * as React from 'react';
import Svg, {NumberProp, Path} from 'react-native-svg';

interface ChevronRightProps {
  width?: NumberProp,
  height?: NumberProp,
  color?: string
}

const ChevronRight : React.FC<ChevronRightProps> = ({width, height, color}) => (
  <Svg 
    width={width === undefined ? 28 : width} 
    height={height === undefined ? 28 : height} 
    viewBox="0 0 20 20" 
    fill="none">
      <Path
        d="M7.87988 14.1191L11.7378 10.8648C11.8279 10.7888 11.8799 10.6769 11.8799 10.5591L11.8799 9.62505C11.8799 9.51101 11.8312 9.4024 11.7461 9.3265L7.87988 5.87914"
        stroke={color === undefined ? "#9CA3AF" : color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
      />
  </Svg>
);
export default ChevronRight;
