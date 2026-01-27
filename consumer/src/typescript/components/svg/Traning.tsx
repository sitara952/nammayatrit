import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

interface TrainingProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const Training = ({ width = 24, height = 24, stroke = '#2C2F3A' }: TrainingProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m10.774 14.369-6.568-3.345c-1.405-.715-1.405-2.8 0-3.515l6.273-3.194a2.86 2.86 0 0 1 2.608 0l6.282 3.197c1.405.715 1.405 2.801 0 3.516l-6.279 3.197c-.825.42-1.79.42-2.616 0l-3.989-2.031M20.432 9.258l-.032 5.414"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.485 12.195v4.971c0 .857.488 1.645 1.247 1.972 2.664 1.145 5.317 1.16 7.96.006.753-.328 1.236-1.115 1.236-1.966v-4.892"
        />
    </Svg>
);
