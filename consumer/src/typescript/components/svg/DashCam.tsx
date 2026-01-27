import * as React from 'react';
import { Svg, Path } from 'react-native-svg';

interface DashCamProps {
    width?: number;
    height?: number;
    stroke?: string;
}

export const DashCam = ({ width = 24, height = 24, stroke = '#2C2F3A' }: DashCamProps) => (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16.297 15.538c.08 1.832-1.398 3.382-3.303 3.46-.14.005-6.979-.008-6.979-.008-1.895.144-3.554-1.218-3.704-3.044-.01-.136-.008-7.474-.008-7.474-.084-1.834 1.393-3.387 3.298-3.468.143-.007 6.972.006 6.972.006 1.905-.142 3.569 1.23 3.716 3.064.01.132.008 7.464.008 7.464Z"
            clipRule="evenodd"
        />
        <Path
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m16.3 9.98 3.293-2.695c.816-.668 2.04-.086 2.039.967L21.62 15.6c-.001 1.053-1.226 1.63-2.04.962l-3.28-2.695"
        />
    </Svg>
);
