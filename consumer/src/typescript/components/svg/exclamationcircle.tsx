import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type ExclamationCircleProps = {
    color: string | undefined;
    size: number | undefined;
};

export default function ExclamationCircle({ color = '#FFB020', size = 24 }: ExclamationCircleProps) {
    const viewSize = 24;
    const scale = size / viewSize;
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                stroke={color}
                strokeWidth={1.5 * scale}
                fill="none"
            />
            <Path
                d="M12 7.5L12 12.5"
                stroke={color}
                strokeWidth={1.6 * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path d="M12 16.2a1 1 0 100-2 1 1 0 000 2z" fill={color} />
        </Svg>
    );
}
