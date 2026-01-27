import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function BoostSearch({ fillColor = '#F78118' }) {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect width={24} height={24} rx={12} fill="#fff" />
            <Path d="M10.164 18L18 10.52h-4.144L15.326 7h-5.84L7 13.453h4.03L9.676 18h.49z" fill={fillColor} />
        </Svg>
    );
}

export default BoostSearch;
