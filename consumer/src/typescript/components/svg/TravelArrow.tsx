import * as React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

function TravelArrow() {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Svg width={40} height={16} viewBox="0 0 40 16" fill="none">
            <Path opacity={0.1} d="M3.5 12.11h34v1.392h-34v-1.393z" fill={themeColors.Input_Direction_Primary} />
            <Circle cx={3} cy={11.3008} r={2.5} fill={themeColors.Fill_neutralMax} />
            <Path
                d="M37.967 13.55a.75.75 0 00.782-.717l.293-6.743a.75.75 0 10-1.498-.065l-.26 5.994-5.995-.26a.75.75 0 10-.065 1.498l6.743.293zm-.67-1.517l.553-.506-.553.507zm-32.8-1.17A23.036 23.036 0 019.956 7.26l-.64-1.357A24.535 24.535 0 003.503 9.74l.994 1.123zm9.954-5.173a23.136 23.136 0 0112.93.673l.494-1.416a24.636 24.636 0 00-13.77-.717l.346 1.46zM31.689 8.39a23.036 23.036 0 015.055 4.15l1.105-1.014a24.534 24.534 0 00-5.383-4.419l-.777 1.283zm5.055 4.15l.258.28 1.105-1.013-.258-.281-1.105 1.013zm.445.485l.258.282 1.106-1.014-.258-.281-1.106 1.013z"
                fill="url(#paint0_linear_2128_16625)"
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_2128_16625"
                    x1={37.5}
                    y1={6.30078}
                    x2={11.5}
                    y2={6.30078}
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor={themeColors.Input_Direction_Primary} />
                    <Stop offset={1} stopColor={themeColors.Fill_neutralMax} />
                </LinearGradient>
            </Defs>
        </Svg>
    );
}

export default TravelArrow;
