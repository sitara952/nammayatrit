import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function SvgComponent() {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path
                d="M13 13L3 3M13 3L3 13"
                stroke={colors?.recovered?.neutralMin}
                strokeWidth={1.8}
                strokeLinecap="square"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export default SvgComponent;
