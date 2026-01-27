import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

interface props {
    fillColor?: string;
}

export const CallIcon: React.FC<props> = ({ fillColor }: props) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path
                d="M10.816 8.028l-1.8 2.16a10.594 10.594 0 01-3.203-3.205l2.16-1.8L5.893.5l-3.379.876a1.358 1.358 0 00-1.001 1.5c.841 5.995 5.616 10.77 11.612 11.611a1.359 1.359 0 001.499-1.002l.876-3.377-4.684-2.08z"
                fill={fillColor ?? themeColors.Icon_neutralUltraHigh}
            />
        </Svg>
    );
};
