import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SparkleIcon() {
    return (
        <Svg width={9} height={9} viewBox="0 0 9 9" fill="none">
            <Path
                d="M5.838 3.163L5.063 0H3.946L3.17 3.163 0 3.945v1.117l3.163.775L3.939 9h1.117l.775-3.163 3.163-.775V3.945L5.831 3.17l.007-.007z"
                fill="#9544FF"
            />
        </Svg>
    );
}

export default SparkleIcon;
