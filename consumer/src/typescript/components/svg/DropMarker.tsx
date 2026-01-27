import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

function DropMarker({ width = 37, height = 51 }: { width: number; height: number }) {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height + 10}`} fill="none">
            <Path
                d="M18.4501 35C25.0501 35 30.4001 37.02 30.4001 39.52C30.4001 42.02 25.0501 44.04 18.4501 44.04C11.8501 44.04 6.50012 42.02 6.50012 39.52C6.50012 37.02 11.8501 35 18.4501 35ZM18.4501 29C7.55012 29 0.500122 33.13 0.500122 39.52C0.500122 45.91 7.55012 50.04 18.4501 50.04C29.3501 50.04 36.4001 45.91 36.4001 39.52C36.4001 33.13 29.3601 29 18.4501 29Z"
                fill={themeColors.APP_THEME_COLOR}
            />
            <Path
                d="M18.4503 41.23C20.9466 41.23 22.9703 40.4644 22.9703 39.52C22.9703 38.5756 20.9466 37.81 18.4503 37.81C15.954 37.81 13.9303 38.5756 13.9303 39.52C13.9303 40.4644 15.954 41.23 18.4503 41.23Z"
                fill={themeColors.APP_THEME_COLOR}
            />
            <Path
                d="M2.5 13.9936V17.2072C2.5 22.5815 5.58001 27.4844 10.4279 29.8179L12.2036 30.6744C14.0265 31.5544 15.3072 33.2594 15.6293 35.2551L16.3758 39.8437H19.8408L20.5872 35.2551C20.9093 33.2594 22.1901 31.5465 24.0129 30.6744L25.7886 29.8179C30.6365 27.4844 33.7165 22.5815 33.7165 17.2072V13.9936C33.7165 6.27002 27.4465 0 19.7151 0H16.4936C8.77002 0 2.5 6.27002 2.5 13.9936Z"
                fill="#262421"
            />
            <Path d="M14.3329 9.12231H11.8029V22.2909H14.3329V9.12231Z" fill="#F5F3F3" />
            <Path
                d="M25.4194 17.6247C22.3001 17.0118 19.1808 18.2375 16.0693 17.6247V9.9325C19.1886 10.5454 22.3079 9.31964 25.4194 9.9325V17.6247Z"
                fill="#F5F3F3"
            />
        </Svg>
    );
}

export default DropMarker;
