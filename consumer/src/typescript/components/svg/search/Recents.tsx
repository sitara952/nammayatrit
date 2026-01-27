import React from 'react';
import colors from '../../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

export const Recents = ({ fill = `${colors?.recovered?.neutralMid}` }) => {
    return (
        <Svg
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none">
            <Path
                d="M5.15 7.87L3.44 6.84c-.4.67-.73 1.38-.96 2.13l1.91.61c.19-.59.45-1.16.77-1.7l-.01-.01zM8.708 4.7l-.82-1.82c-1.04.47-1.98 1.11-2.81 1.9l1.38 1.44a7.97 7.97 0 012.25-1.52zM12 2v2c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8H2c0 5.51 4.49 10 10 10s10-4.49 10-10S17.51 2 12 2z"
                fill={fill}
            />
            <Path d="M16.8 11H13V7.2h-2V13h5.8v-2z" fill={fill} />
        </Svg>
    );
};
