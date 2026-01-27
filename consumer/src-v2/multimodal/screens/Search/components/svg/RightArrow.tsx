import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const RightArrow = ({ fill = '#727581' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path
                d="M3.75 10.5L8.25 6L3.75 1.5"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};
