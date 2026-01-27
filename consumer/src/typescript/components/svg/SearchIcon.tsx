import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const SearchIcon = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path
                d="M15.03 13.97L12.59 11.53C13.47 10.42 14 9.02 14 7.5C14 3.92 11.08 1 7.5 1C3.92 1 1 3.92 1 7.5C1 11.08 3.92 14 7.5 14C9.02 14 10.42 13.47 11.53 12.59L13.97 15.03L15.03 13.97ZM2.5 7.5C2.5 4.74 4.74 2.5 7.5 2.5C10.26 2.5 12.5 4.74 12.5 7.5C12.5 10.26 10.26 12.5 7.5 12.5C4.74 12.5 2.5 10.26 2.5 7.5Z"
                fill={themeColors.Icon_base}
            />
        </Svg>
    );
};
