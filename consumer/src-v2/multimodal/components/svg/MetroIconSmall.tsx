import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface MetroIconSmallProps {
    width?: number;
    height?: number;
}

export const MetroIconSmall: React.FC<MetroIconSmallProps> = ({ width = 24, height = 24 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
            <Rect width="24" height="24" rx="4" fill="#2196F3" />
            <Path
                d="M16 7H8C6.9 7 6 7.9 6 9V16C6 17.1 6.9 18 8 18H16C17.1 18 18 17.1 18 16V9C18 7.9 17.1 7 16 7ZM11 8.5H13V10H11V8.5ZM8.5 8.5H10V10H8.5V8.5ZM16 16H8V12H16V16Z"
                fill="#FFFFFF"
            />
        </Svg>
    );
};
