import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function SvgComponent({ color = colors?.recovered?.neutralUltraHigh, height = 16, width = 16 }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
            <Path
                d="M13 13L3 3M13 3L3 13"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="square"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export default SvgComponent;
