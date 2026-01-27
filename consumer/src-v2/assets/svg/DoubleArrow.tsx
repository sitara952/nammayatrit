import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DoubleArrowsProps {
    color?: string;
    width?: number;
    height?: number;
    opacity?: number;
    secondOpacity?: number;
}

function DoubleArrows({ color = '#646464', width = 10, height = 9, opacity = 0.5, secondOpacity = 0.5 }: DoubleArrowsProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 10 9" fill="none">
            <Path
                opacity={opacity}
                d="M5.813.95l3.524 3.524-3.524 3.524"
                stroke={color}
                strokeWidth={1.17483}
                strokeLinejoin="round"
            />
            <Path
                opacity={secondOpacity}
                d="M.73.95l3.525 3.524L.73 7.998"
                stroke={color}
                strokeWidth={1.17483}
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export default DoubleArrows;
