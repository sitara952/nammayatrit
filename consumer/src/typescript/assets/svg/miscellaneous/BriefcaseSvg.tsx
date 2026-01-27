import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

function BriefcaseSvg({fill = `${colors?.recovered?.neutralUltraHigh}`}) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none">
      <Path
        d="M16.435 5.747h-2.199V3.525A2.035 2.035 0 0012.211 1.5H7.789a2.035 2.035 0 00-2.025 2.025v2.222h-2.2A2.322 2.322 0 001.25 8.062v6.83a2.322 2.322 0 002.315 2.314h12.87a2.322 2.322 0 002.315-2.315v-6.83a2.322 2.322 0 00-2.315-2.314zM7.5 3.525c0-.162.127-.289.29-.289h4.42c.163 0 .29.127.29.29v2.22h-5v-2.22z"
        fill={fill}
      />
    </Svg>
  );
}

export default BriefcaseSvg;
