import Svg, { Rect } from 'react-native-svg';
import React from 'react';

export const PixelArrow = () => {
    return (
        <Svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <Rect width="2" height="2" fill="#C9C9C9" />
            <Rect x="2" y="2" width="2" height="2" fill="#C9C9C9" />
            <Rect x="4" y="4" width="2" height="2" fill="#C9C9C9" />
            <Rect x="6" y="2" width="2" height="2" fill="#C9C9C9" />
            <Rect x="8" width="2" height="2" fill="#C9C9C9" />
        </Svg>
    );
};
