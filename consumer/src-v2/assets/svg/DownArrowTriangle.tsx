import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function DownArrowTriangle({ fill = '#fff' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 20 20" fill="none">
            <Path
                d="M16.46 7.117l-5.382 7.4a1.333 1.333 0 01-2.156 0l-5.382-7.4C2.899 6.236 3.528 5 4.618 5h10.764c1.09 0 1.72 1.236 1.078 2.117z"
                fill={fill}
            />
        </Svg>
    );
}

export default DownArrowTriangle;
