import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const CaretRight = ({ fill = '#969696' }: { fill: string }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path d="M3.75 10.5L8.25 6L3.75 1.5" stroke={fill} strokeWidth="1.35" strokeLinejoin="round" />
        </Svg>
    );
};
export const CaretDown = ({ fill = '#969696' }: { fill: string }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path d="M1.5 3.75L6 8.25L10.5 3.75" stroke={fill} strokeWidth="1.35" strokeLinejoin="round" />
        </Svg>
    );
};
