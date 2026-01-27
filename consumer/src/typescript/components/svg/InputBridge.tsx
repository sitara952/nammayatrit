import React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const InputBridge = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <Svg width="24" height="138" viewBox="0 0 24 138" fill="none">
            <Path
                d="M19.0703 9V99.5"
                stroke={themeColors.Icon_neutralUltraLow}
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
            />
            <Path
                d="M18.1219 10V10C0.782605 32.2696 -3.00487 62.724 9.73966 87.9066C12.8709 94.0938 16.0657 99.6726 19 103.5"
                stroke="url(#paint0_linear_1162_4799)"
                strokeWidth="1.6"
                strokeMiterlimit="4.13936"
                strokeDasharray="11 4"
            />
            <Path
                d="M12 103.8H19.0711V96.729"
                stroke={themeColors.Icon_base}
                strokeWidth="1.6"
                strokeLinecap="square"
            />
            <Ellipse
                cx="5"
                cy="5"
                rx="5"
                ry="5"
                transform="matrix(4.37114e-08 1 1 -4.37114e-08 13 5)"
                fill={themeColors.Icon_neutralUltraHigh}
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_1162_4799"
                    x1="0.560977"
                    y1="10"
                    x2="0.560981"
                    y2="101.364"
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor={colors?.recovered?.neutralMax} />
                    <Stop offset="1" stopColor={themeColors.Icon_base} />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};
