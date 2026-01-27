import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

function MapMarkerDot({ color }: { color: string | undefined }) {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const custColor = color || themeColors.APP_THEME_COLOR;
    return (
        <Svg width="15" height="10" viewBox="0 0 10 10" fill="none">
            <Path
                d="M4.94969 3.55011C7.44602 3.55011 9.46969 2.81572 9.46969 1.90982C9.46969 1.00391 7.44602 0.269531 4.94969 0.269531C2.45336 0.269531 0.429688 1.00391 0.429688 1.90982C0.429688 2.81572 2.45336 3.55011 4.94969 3.55011Z"
                fill={custColor}
            />
        </Svg>
    );
}

export default MapMarkerDot;
