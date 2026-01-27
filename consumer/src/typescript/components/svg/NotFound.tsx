import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const NotFound = () => {
    return (
        <Svg width={100} height={100} fill="none" viewBox="0 -2 80 85">
            <Rect width={80} height={80} x={0.909} fill="#fff" rx={40} />
            <Path
                stroke="#F78118"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={7}
                d="M40.75 23v20.833M40.75 54v1"
            />
        </Svg>
    );
};
export default NotFound;
