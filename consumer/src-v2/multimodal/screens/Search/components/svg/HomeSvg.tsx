import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function HomeSvg() {
    return (
        <Svg width={18} height={19} viewBox="0 0 18 19" fill="none">
            <Path
                d="M15.372 6.796L9.62 2.81a1.087 1.087 0 00-1.248 0L2.628 6.796C2.234 7.066 2 7.518 2 7.993v6.934c0 .803.657 1.46 1.46 1.46h2.657c.401 0 .73-.329.73-.73V11.92c0-.402.328-.73.73-.73h2.846c.402 0 .73.328.73.73v3.737c0 .401.329.73.73.73h2.657c.803 0 1.46-.657 1.46-1.46V7.993c0-.482-.234-.927-.628-1.197z"
                fill="#525461"
            />
        </Svg>
    );
}

export default HomeSvg;
