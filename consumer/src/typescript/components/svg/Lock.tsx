import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

interface LockProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const Lock = ({ width = 24, height = 24, stroke = '#2C2F3A' }: LockProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16.424 9.448V7.301a4.552 4.552 0 0 0-4.551-4.551 4.55 4.55 0 0 0-4.57 4.531v2.167"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.683 21.248H8.042a3.792 3.792 0 0 1-3.792-3.792v-4.289a3.792 3.792 0 0 1 3.792-3.792h7.641a3.792 3.792 0 0 1 3.792 3.792v4.289a3.792 3.792 0 0 1-3.792 3.792Z"
            clipRule="evenodd"
        />
        <Path stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.863 14.203v2.221" />
    </Svg>
);
