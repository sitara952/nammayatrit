import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export const LocationPin = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
            <Path
                d="M10 0C6.55918 0 3 2.53869 3 6.78766C3 10.7907 9.27136 17.5153 9.53864 17.7992C9.65891 17.9279 9.82564 18 10 18C10.1744 18 10.3411 17.9279 10.4614 17.7998C10.7286 17.5153 17 10.7914 17 6.7883C17 2.53869 13.4408 0 10 0ZM10 9.65527C8.59618 9.65527 7.45455 8.5005 7.45455 7.08053C7.45455 5.66056 8.59618 4.50579 10 4.50579C11.4038 4.50579 12.5455 5.66056 12.5455 7.08053C12.5455 8.5005 11.4038 9.65527 10 9.65527Z"
                fill={themeColors.Icon_base}
            />
        </Svg>
    );
};
