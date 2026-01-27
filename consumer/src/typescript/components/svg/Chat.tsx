import * as React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

interface ChatProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const Chat = ({ width = 24, height = 24, stroke = '#2B2E3B' }: ChatProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeWidth={1.5}
            d="M8.344 3h7.251C19.093 3 22 6.14 22 10s-2.907 7-6.405 7h-3.25l-3.36 3.707a.845.845 0 0 1-.988.217c-.339-.154-.559-.52-.559-.924v-3.071C4.368 16.442 2 13.52 2 10c0-3.86 2.846-7 6.344-7Z"
            clipRule="evenodd"
        />
        <Circle cx={7} cy={10} r={1} fill={stroke} stroke={stroke} strokeWidth={1.5} />
        <Circle cx={12} cy={10} r={1} fill={stroke} stroke={stroke} strokeWidth={1.5} />
        <Circle cx={17} cy={10} r={1} fill={stroke} stroke={stroke} strokeWidth={1.5} />
    </Svg>
);
