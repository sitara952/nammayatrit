import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

interface IdCheckProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const IdCheck = ({ width = 24, height = 24, stroke = '#2C2F3A' }: IdCheckProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.304 8.596c0-2.53-1.506-4.315-3.934-4.315H6.966c-2.42 0-3.942 1.786-3.942 4.315v6.819c0 2.521 1.515 4.306 3.942 4.306h9.396c2.436 0 3.942-1.785 3.942-4.306V8.596Z"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.105 16.017c0-.972.736-2.181 2.858-2.181 2.121 0 2.857 1.2 2.857 2.173"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.787 9.882c0 1.05-.817 1.9-1.825 1.9s-1.825-.85-1.825-1.9c0-1.05.817-1.902 1.825-1.902s1.825.852 1.825 1.902Z"
            clipRule="evenodd"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m13.7 10.348 3.334.047M14.95 14.05h2.084"
        />
    </Svg>
);
