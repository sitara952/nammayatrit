import React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const MessageIconDark = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_314_12022)">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.818 1.13H2.182A2.184 2.184 0 000 3.31v7.273c0 1.203.979 2.182 2.182 2.182h.727v3.27l3.946-3.27h6.963A2.184 2.184 0 0016 10.584V3.311a2.184 2.184 0 00-2.182-2.181zM3 4.16h6.06v1.25H3V4.16zm10 3.09H3V8.5h10V7.25z"
                    fill={themeColors.Icon_neutralUltraHigh}
                />
            </G>
            <Defs>
                <ClipPath id="clip0_314_12022">
                    <Path fill="#fff" d="M0 0H16V16H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
