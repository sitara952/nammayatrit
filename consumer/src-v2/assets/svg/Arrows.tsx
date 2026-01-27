import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const ChevronRight = () => {
    return (
        <Svg width={12} height={13} viewBox="0 0 12 13" fill="none">
            <Path d="M3.75 11l4.5-4.5L3.75 2" stroke="#969696" strokeWidth={1.35} strokeLinejoin="round" />
        </Svg>
    );
};
