import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const LineSlash = ({ stroke = '#ffffff' }) => {
    return (
        <Svg width="5" height="16" viewBox="0 0 5 16" fill="none">
            <Path d="M3.77991 1L0.779907 15" stroke={stroke} stroke-width="1.5" stroke-linecap="round" />
        </Svg>
    );
};
