import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const EmergencyActions = ({ width = 30, height = 30, fill = '#F78118' }) => (
    <Svg width={width} height={height} viewBox="0 0 20 20">
        <Path
            stroke={fill}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={1.5}
            fill="none"
            d="M4.137 4.798l1.38 1.38 2.759-2.76M4.137 10.317l1.38 1.38 2.759-2.76M4.137 15.833l1.38 1.38 2.759-2.76M10.898 4.797h6M10.898 10.316h6M10.898 15.832h6"
        />
    </Svg>
);
