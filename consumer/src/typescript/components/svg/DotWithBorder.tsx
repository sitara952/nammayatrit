import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

export const DotWithBorder = ({ fill = '#FB0000', stroke = '#fff', strokeWidth = 2, size = 12 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <Circle cx={6} cy={6} r={5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </Svg>
    );
};
