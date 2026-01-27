import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Sparkle({ fill = '#9544FF' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 7 7" fill="none">
            <Path
                d="M4.54 2.46L3.937 0h-.869l-.603 2.46L0 3.068v.87l2.46.602L3.063 7h.869l.603-2.46 2.46-.603v-.869l-2.46-.603.005-.005z"
                fill={fill}
            />
        </Svg>
    );
}

export default Sparkle;
