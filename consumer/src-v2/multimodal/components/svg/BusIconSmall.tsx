import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface BusIconSmallProps {
    width?: number;
    height?: number;
}

export const BusIconSmall: React.FC<BusIconSmallProps> = ({ width = 24, height = 24 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
            <Rect width="24" height="24" rx="4" fill="#FFC107" />
            <Path
                d="M17 8C17 7.45 16.55 7 16 7H8C7.45 7 7 7.45 7 8V16C7 16.55 7.45 17 8 17H16C16.55 17 17 16.55 17 16V8ZM15 16H9C8.45 16 8 15.55 8 15V9H16V15C16 15.55 15.55 16 15 16ZM12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14Z"
                fill="#333333"
            />
        </Svg>
    );
};
