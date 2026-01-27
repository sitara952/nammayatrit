import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function TriangleFillerSvg() {
    return (
        <Svg width={5} height={7} viewBox="0 0 5 7" fill="none">
            <Path
                d="M.5.613A.5.5 0 011.332.24L4.58 3.126a.5.5 0 010 .748L1.332 6.76A.5.5 0 01.5 6.387V.613z"
                fill="#D6D7D9"
            />
        </Svg>
    );
}

export default TriangleFillerSvg;
