import React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';

export const SafetyToolIcon = () => (
    <Svg width={17} height={16} fill="none">
        <Rect width={16} height={16} x={0.25} fill="#FA4F18" rx={8} />
        <Circle cx={8.25} cy={8} r={4} fill="#fff" />
    </Svg>
);
