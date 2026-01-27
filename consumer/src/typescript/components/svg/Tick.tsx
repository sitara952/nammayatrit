import React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent({ fill = '#53BB6F', size = 6 }) {
    return (
        <Svg width={size * 1.5} height={size} viewBox="0 0 9 6" fill="none">
            <Path
                d="M7.5 1L3.375 5L1.5 3.18182"
                stroke={fill}
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </Svg>
    );
}

export default SvgComponent;
