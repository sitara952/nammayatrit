import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent() {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.993 10.222l-4.618 4.618a.746.746 0 01-1.061 0l-2.309-2.309a.75.75 0 011.06-1.061l1.78 1.779 4.087-4.088a.75.75 0 111.061 1.061zM12 2.5c-5.238 0-9.5 4.262-9.5 9.5 0 5.239 4.262 9.5 9.5 9.5s9.5-4.261 9.5-9.5c0-5.238-4.262-9.5-9.5-9.5z"
                fill="#fff"
            />
        </Svg>
    );
}

export default SvgComponent;
