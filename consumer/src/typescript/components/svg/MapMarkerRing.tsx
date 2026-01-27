import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

function MapMarkerRing({ color }: { color: string | undefined }) {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const custColor = color || themeColors.APP_THEME_COLOR;
    return (
        <Svg width="36" height="21" viewBox="0 0 36 21" fill="none">
            <Path
                d="M17.95 6.57376C24.55 6.57376 29.9 8.51141 29.9 10.9095C29.9 13.3076 24.55 15.2452 17.95 15.2452C11.35 15.2452 6 13.3076 6 10.9095C6 8.51141 11.35 6.57376 17.95 6.57376ZM17.95 0.818359C7.05 0.818359 0 4.77999 0 10.9095C0 17.039 7.05 21.0006 17.95 21.0006C28.85 21.0006 35.9 17.039 35.9 10.9095C35.9 4.77999 28.86 0.818359 17.95 0.818359Z"
                fill={custColor}
            />
        </Svg>
    );
}

export default MapMarkerRing;
