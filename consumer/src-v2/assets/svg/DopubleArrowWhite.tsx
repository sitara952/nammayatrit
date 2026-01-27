import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const DoubleArrowsWhite = ({ fill = '#fff' }: { fill: string | undefined }) => {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 13" fill="none">
            <Path
                opacity={0.5}
                d="M8.98 1l5.539 5.538-5.539 5.539"
                stroke={fill}
                strokeWidth={1.84615}
                strokeLinejoin="round"
            />
            <Path d="M1 1l5.538 5.538L1 12.077" stroke={fill} strokeWidth={1.84615} strokeLinejoin="round" />
        </Svg>
    );
};
