import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

function GraphSvg({fill = `${colors?.recovered?.neutralUltraHigh}`}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8.75 1.25h-7.5V17.5h7.5V1.25zM18.75 6.25h-7.5V17.5h7.5V6.25z"
        fill={fill}
      />
    </Svg>
  );
}

export default GraphSvg;
