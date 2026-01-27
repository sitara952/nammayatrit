import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import colors from '../../designSystem/colorPalette';
import React from 'react';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const RidePath = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Svg width="13" height="51" viewBox="0 0 13 51" fill="none">
            <Ellipse
                cx="2.3107"
                cy="2.3107"
                rx="2.3107"
                ry="2.3107"
                transform="matrix(4.67014e-08 1 1 -4.09128e-08 8.37799 3.80859)"
                fill={themeColors.Icon_neutralUltraHigh}
            />
            <Path
                d="M11.6982 42.0512C11.6699 42.4368 11.3344 42.7264 10.9489 42.6981L4.66574 42.2373C4.28017 42.2091 3.99053 41.8736 4.01881 41.488C4.04708 41.1025 4.38257 40.8128 4.76813 40.8411L10.3531 41.2507L10.7627 35.6657C10.791 35.2801 11.1265 34.9905 11.512 35.0187C11.8976 35.047 12.1872 35.3825 12.159 35.7681L11.6982 42.0512ZM10.4681 41.3839L10.998 40.9264L10.4681 41.3839ZM9.95471 7.42359C9.0475 8.61713 8.2548 9.86665 7.57602 11.1579L6.3368 10.5065C7.05143 9.14705 7.88576 7.832 8.84013 6.57641L9.95471 7.42359ZM6.25335 14.0946C5.19508 16.886 4.62493 19.813 4.53918 22.7485L3.13977 22.7076C3.23002 19.6183 3.83006 16.5373 4.94427 13.5983L6.25335 14.0946ZM4.63944 25.9682C4.90768 28.8927 5.65883 31.7785 6.88873 34.4986L5.61307 35.0754C4.31816 32.2115 3.52758 29.1738 3.24529 26.0961L4.63944 25.9682ZM8.39156 37.3473C9.14937 38.5939 10.0183 39.7917 10.998 40.9264L9.93829 41.8413C8.90764 40.6476 7.99311 39.387 7.19527 38.0746L8.39156 37.3473ZM10.998 40.9264L11.193 41.1523L10.1333 42.0672L9.93829 41.8413L10.998 40.9264ZM11.3349 41.3166L11.5299 41.5426L10.4702 42.4574L10.2752 42.2315L11.3349 41.3166Z"
                fill="url(#paint0_linear_60_7670)"
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_60_7670"
                    x1="3.31713"
                    y1="7"
                    x2="3.31713"
                    y2="41.0187"
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor={colors?.recovered?.neutralMax} />
                    <Stop offset="1" stopColor={themeColors.Icon_base} />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};
