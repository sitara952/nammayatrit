import * as React from 'react';
import { Path, Svg } from 'react-native-svg';

interface LiveTrackingProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ width = 24, height = 24, stroke = '#2C2F3A' }) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.993 8.485c0 3.563 4.207 6.968 5.008 6.968.8 0 5.008-3.405 5.008-6.968a5.008 5.008 0 0 0-10.016 0Z"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.967 13.133h3.08c1.327 0 2.445.976 2.626 2.293l.303 2.237a2.52 2.52 0 0 1-2.493 2.863H5.517a2.52 2.52 0 0 1-2.493-2.863l.303-2.237a2.647 2.647 0 0 1 2.626-2.293h3.08"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.493 8.442a1.493 1.493 0 1 0-2.986 0 1.493 1.493 0 0 0 2.986 0Z"
            clipRule="evenodd"
        />
    </Svg>
);
