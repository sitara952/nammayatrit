import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

interface VerifiedProfileProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const VerifiedProfile = ({ width = 24, height = 24, stroke = '#2C2F3A' }: VerifiedProfileProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.908 19.999c0-2.109 1.598-4.733 6.2-4.733M13.415 18.06l1.636 1.707 3.37-3.513"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.07 8.125c0 2.278-1.774 4.126-3.961 4.126s-3.96-1.848-3.96-4.126C7.148 5.847 8.921 4 11.108 4c2.187 0 3.96 1.847 3.96 4.125Z"
            clipRule="evenodd"
        />
    </Svg>
);
