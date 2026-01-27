import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

function HomeSvg({fill = `${colors?.recovered?.neutralUltraHigh}`}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.669 1.711l6.45 4.469c.317.21.505.574.505.961v8.187c0 .645-.528 1.172-1.173 1.172h-4.105v-5.289c0-.645-.528-1.173-1.173-1.173H8.827c-.645 0-1.172.528-1.172 1.173v5.29H3.55a1.176 1.176 0 01-1.173-1.173V7.14c0-.387.188-.739.504-.961l6.45-4.469a1.164 1.164 0 011.338 0z"
        fill={fill}
      />
    </Svg>
  );
}

export default HomeSvg;
