import { Path, Svg } from 'react-native-svg';
import * as React from 'react';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const AudioIcon = ({ fill = undefined }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const custFill = fill || themeColors.Icon_neutralUltraHigh;
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 17" fill="none">
            <Path
                d="M13.021 7.31126C13.3775 7.31126 13.6668 7.59633 13.6668 7.94899C13.6668 10.8182 11.4672 13.1874 8.6463 13.5056V14.7893C8.6463 15.1414 8.35697 15.4271 8.00049 15.4271C7.64335 15.4271 7.35467 15.1414 7.35467 14.7893V13.5056C4.53313 13.1874 2.3335 10.8182 2.3335 7.94899C2.3335 7.59633 2.62282 7.31126 2.97931 7.31126C3.33579 7.31126 3.62512 7.59633 3.62512 7.94899C3.62512 10.3309 5.58774 12.269 8.00049 12.269C10.4126 12.269 12.3752 10.3309 12.3752 7.94899C12.3752 7.59633 12.6645 7.31126 13.021 7.31126ZM8.11667 2.09375C9.71892 2.09375 11.0183 3.37624 11.0183 4.95846V8.04064C11.0183 9.62222 9.71892 10.9053 8.11667 10.9053H7.88353C6.28127 10.9053 4.98255 9.62222 4.98255 8.04064V4.95846C4.98255 3.37624 6.28127 2.09375 7.88353 2.09375H8.11667Z"
                fill={custFill}
            />
        </Svg>
    );
};
