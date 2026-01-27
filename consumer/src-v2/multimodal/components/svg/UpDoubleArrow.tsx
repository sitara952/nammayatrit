import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const UpDoubleArrow = () => {
    return (
        <Svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <Path
                opacity="0.5"
                d="M1 6.53918L6.53846 1.00072L12.0769 6.53918"
                stroke="white"
                strokeWidth="1.84615"
                strokeLinejoin="round"
            />
            <Path
                d="M1.00122 13.5203L6.53968 7.9818L12.0781 13.5203"
                stroke="white"
                strokeWidth="1.84615"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default UpDoubleArrow;
