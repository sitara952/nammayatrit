import colors from '@/typescript/designSystem/colorPalette';
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function WalkIcon({fill = colors?.recovered?.blue}) {
  return (
    <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.716 7.503a2.251 2.251 0 100-4.503 2.251 2.251 0 000 4.503zM13.763 11.199c.557.58 1.74 1.82 2.729 2.763l1.569-1.649c-1.262-1.194-2.934-2.979-2.945-2.99l-.273-.296-.398-.057c-1.387-.193-2.547-.182-3.627-.159a4.163 4.163 0 00-4.082 3.912c-.046.67-.069 1.398-.091 2.194l2.274.046c.011-.75.045-1.444.08-2.081a1.896 1.896 0 011.114-1.615l.102 1.956c.023.523.205 1.023.512 1.444l2.376 3.286L15.184 21h2.752l-4.162-6.117v-3.684h-.011z"
        fill={fill}
      />
      <Path
        d="M9.362 16.452L5.939 20.99h2.855l2.092-2.774-1.524-1.763z"
        fill={fill}
      />
    </Svg>
  );
}

export default WalkIcon;
