import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SwipeDown() {
    return (
        <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
            <Path d="M12.077 6.962L6.538 12.5 1 6.962" stroke="#3B3B3B" strokeWidth={1.84615} strokeLinejoin="round" />
            <Path d="M12.077 1.423L6.538 6.96 1 1.423" stroke="#656565" strokeWidth={1.84615} strokeLinejoin="round" />
        </Svg>
    );
}

export default SwipeDown;
