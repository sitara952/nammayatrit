import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function PersonIcon({ fill = `${colors?.recovered?.neutralUltraHigh}` }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 13.513c0-3.155 2.706-5.679 6-5.679 3.295 0 6 2.524 6 5.68v.25l-.243.058a24.76 24.76 0 01-11.513 0L2 13.765v-.252zM5.333 4.167a2.667 2.667 0 115.334 0 2.667 2.667 0 01-5.334 0z"
                fill={fill}
            />
        </Svg>
    );
}

export default PersonIcon;
