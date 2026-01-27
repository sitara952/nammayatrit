import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const ThreeDot = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
            <Rect x="12" y="1" width="4" height="4" rx="2" transform="rotate(90 12 1)" fill="#6E6E6E" />
            <Rect x="12" y="8" width="4" height="4" rx="2" transform="rotate(90 12 8)" fill="#6E6E6E" />
            <Rect x="12" y="15" width="4" height="4" rx="2" transform="rotate(90 12 15)" fill="#6E6E6E" />
        </Svg>
    );
};
