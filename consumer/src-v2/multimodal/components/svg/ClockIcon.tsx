import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ClockIcon({ fill = '#525866' }) {
    return (
        <Svg
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            width={'100%'}
            height={'100%'}
            viewBox="0 0 16 16"
            fill="none">
            <Path
                d="M8 15c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM8 2.5A5.51 5.51 0 002.5 8c0 3.03 2.47 5.5 5.5 5.5s5.5-2.47 5.5-5.5S11.03 2.5 8 2.5z"
                fill={fill}
            />
            <Path d="M11.12 8.752H7.25v-4.4h1.5v2.9h2.37v1.5z" fill={fill} />
        </Svg>
    );
}

export default ClockIcon;
