import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function RideCompleteArrow() {
    return (
        <Svg width={80} height={24} viewBox="0 0 80 24" fill="none">
            <Path
                d="M68.097 24l-2.05-2.024 8.423-8.504H0v-2.944h74.47L66.046 2.06 68.097 0 80 12 68.097 24z"
                fill={colors?.recovered?.greenHigh}
            />
        </Svg>
    );
}

export default RideCompleteArrow;
