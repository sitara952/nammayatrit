import * as React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, {Path} from 'react-native-svg';

function MinusIcon() {
  return (
    <Svg width="20" height="21" viewBox="0 0 20 21" fill="none">
      <Path d="M15.0001 9.6665H10.8334H9.16675H5.00008C4.53985 9.6665 4.16675 10.0396 4.16675 10.4998C4.16675 10.9601 4.53985 11.3332 5.00008 11.3332H9.16675H10.8334H15.0001C15.4603 11.3332 15.8334 10.9601 15.8334 10.4998C15.8334 10.0396 15.4603 9.6665 15.0001 9.6665Z"
       fill={colors?.primitive.black[2]}/>
    </Svg>
  );
}

export default MinusIcon;
