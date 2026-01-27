import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function PlaneIcon({ fill = '#525461' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24" fill="none">
            <Path
                d="M11.21 14.59l-1.853 1.079v1.088l2.653-.881 2.652.88V15.67L12.81 14.59l.17-3.264 3.687 1.133V11.3l-3.713-1.987V7.676a.963.963 0 00-1.924 0v1.636L7.316 11.3v1.16l3.714-1.142.17 3.273h.01z"
                fill={fill}
            />
            <Path
                d="M12 3c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9zm0 1.924c3.902.01 7.076 3.183 7.076 7.076S15.902 19.076 12 19.076A7.083 7.083 0 014.924 12 7.083 7.083 0 0112 4.924z"
                fill={fill}
            />
        </Svg>
    );
}

export default PlaneIcon;
