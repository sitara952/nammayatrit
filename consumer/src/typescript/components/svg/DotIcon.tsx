import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Circle } from 'react-native-svg';

function DotIcon() {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 12 12" fill="none">
            <Circle cx={6} cy={6.5} r={1.5} fill={colors?.recovered?.neutralMidHigh} />
        </Svg>
    );
}

export default DotIcon;
