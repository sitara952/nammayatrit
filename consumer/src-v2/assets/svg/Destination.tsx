import Svg, { Path } from 'react-native-svg';
import React from 'react';

export const DestinationSvg = () => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path fill="#097B42" d="M0 0H24V24H0z" />
            <Path
                d="M17.63 5.334a7.97 7.97 0 00-11.27 0 7.97 7.97 0 000 11.27L10.758 21h2.485l4.396-4.397a7.97 7.97 0 000-11.27h-.007zm-5.634 8.4a3.03 3.03 0 01-3.033-3.032 3.03 3.03 0 013.033-3.033 3.03 3.03 0 013.033 3.033 3.03 3.03 0 01-3.033 3.033z"
                fill="#fff"
            />
        </Svg>
    );
};
