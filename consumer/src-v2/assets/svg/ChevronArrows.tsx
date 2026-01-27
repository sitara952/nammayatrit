import React from 'react';
import Svg, { Path } from 'react-native-svg';

// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const ChevronUp = ({ fill = '#016ACD' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 13 8" fill="none">
            <Path d="M12.078 7.305L6.54 1.766 1 7.305" stroke={fill} strokeWidth={1.84615} strokeLinejoin="round" />
        </Svg>
    );
};

// eslint-disable-next-line myCustomPlugin/enforce-optional-params
export const ChevronDown = ({ fill = '#016ACD' }: { fill?: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 13 8" fill="none">
            <Path d="M12.078.766L6.54 6.304 1 .766" stroke={fill} strokeWidth={1.84615} strokeLinejoin="round" />
        </Svg>
    );
};
