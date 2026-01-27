import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const ShuffleHorizontal = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 15 14" fill="none">
            <Rect width="15" height="14" rx="4" fill="#BCBCBC" />
            <Path
                d="M12.75 5L11.9864 5C9.50113 5 7.48641 7.01472 7.48641 9.5L7.48641 9.73723"
                stroke="white"
                strokeWidth="1.57908"
            />
            <Path
                d="M2.25 5L3.01359 5C5.49887 5 7.51359 7.01472 7.51359 9.5L7.51359 9.73723"
                stroke="white"
                strokeWidth="1.57908"
            />
            <Rect width="15" height="14" rx="4" fill="#656565" />
            <Path d="M3.75 4L6.48272 7.45185C7.75694 9.06139 9.69713 10 11.75 10V10" stroke="white" strokeWidth="1.5" />
            <Path d="M3.75 10L6.48272 6.54815C7.75694 4.93861 9.69713 4 11.75 4V4" stroke="white" strokeWidth="1.5" />
        </Svg>
    );
};
