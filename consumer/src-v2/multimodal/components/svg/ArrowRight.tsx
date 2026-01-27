import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowRightProps {
    width?: number;
    height?: number;
    color?: string;
}

export const ArrowRight: React.FC<ArrowRightProps> = ({ width = 24, height = 24, color = '#FFFFFF' }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
            <Path d="M16 12L10 18L8.59 16.59L13.17 12L8.59 7.41L10 6L16 12Z" fill={color} />
        </Svg>
    );
};
