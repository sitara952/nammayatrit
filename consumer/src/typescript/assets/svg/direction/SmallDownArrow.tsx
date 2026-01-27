import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

function SmallDownArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.175 9.824L4.5 8.5l4.313 4.313h.575l4.3-4.313 1.325 1.325-4.85 4.863H8.025l-4.85-4.863z"
        fill={colors?.recovered?.neutralMax}
      />
    </Svg>
  );
}

export default SmallDownArrow;
