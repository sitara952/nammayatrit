import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const ChevronRight = ({ fill = '#8519FC' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path
                d="M3.86963 10.5L7.96307 6.40656C8.1861 6.18353 8.1861 5.81647 7.96307 5.59344L3.86963 1.5"
                stroke={fill}
                strokeWidth="2"
                strokeMiterlimit="10"
            />
        </Svg>
    );
};
