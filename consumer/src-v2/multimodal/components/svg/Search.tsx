import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SearchIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
                d="M17.03 15.97l-2.44-2.44A6.47 6.47 0 0016 9.5C16 5.92 13.08 3 9.5 3S3 5.92 3 9.5 5.92 16 9.5 16c1.52 0 2.92-.53 4.03-1.41l2.44 2.44 1.06-1.06zM4.5 9.5c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z"
                fill="#FFFFFF"
            />
        </Svg>
    );
}

export default SearchIcon;
