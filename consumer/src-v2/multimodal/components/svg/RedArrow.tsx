import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

function RedArrow({ fill = '#F7493F' }) {
    return (
        <Svg width={18} height={19} viewBox="0 0 18 19" fill="none">
            <Circle cx={9} cy={9.5} r={9} fill={fill} />
            <Path d="M8 13.5l4-4-4-4" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export default RedArrow;
