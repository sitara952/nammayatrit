import React from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';

export const Dot = ({ fill = '#EAEAEA' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Rect width="12" height="12" fill="none" />
            <Circle cx="6" cy="6.5" r="1.5" fill={fill} />
        </Svg>
    );
};
