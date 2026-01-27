import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function ShareIcon({fill = '#F5B63B'}) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.578 7.21a4.15 4.15 0 004.151 4.151V3.06a4.15 4.15 0 00-4.15 4.15zM11.397 18.297a2.01 2.01 0 001.953 2.513h6.39V13.9c-1.379 0-2.717.123-4.042.355-2.103.37-3.769 1.98-4.301 4.042zM12.286 8.82L8.845 5.38 7.397 6.826l2.035 2.035H5.554A2.558 2.558 0 003 11.415v4.615h2.048v-4.615c0-.273.219-.506.506-.506h3.878l-2.035 2.035 1.448 1.447 3.44-3.44a1.508 1.508 0 000-2.13z"
        fill={fill}
      />
    </Svg>
  );
}

export default ShareIcon;
