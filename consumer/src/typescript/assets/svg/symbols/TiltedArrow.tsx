import React from 'react';
import Svg, {
    Path,
} from 'react-native-svg';

export const TiltedArrow = () => {
    return (
        <Svg width="12" height="12" viewBox="0 0 12 12" fill="none" >
            <Path d="M2.24266 2.24271L10.7279 10.728L2.24266 2.24271ZM10.7279 10.728L2.24266 10.728L10.7279 10.728ZM10.7279 10.728L10.7279 2.24271L10.7279 10.728Z" fill="#9D9D9D" />
            <Path
                d="M2.24266 2.24271L10.7279 10.728M10.7279 10.728L2.24266 10.728M10.7279 10.728L10.7279 2.24271"
                stroke="#9D9D9D"
                strokeWidth="2"
                strokeLinecap="square"
            />
        </Svg>
    );
};

