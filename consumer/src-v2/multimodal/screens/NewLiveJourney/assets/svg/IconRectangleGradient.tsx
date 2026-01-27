import * as React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const IconRectangleGradient = () => {
    return (
        <Svg width={8} height={101} viewBox="0 0 8 101" fill="none">
            <Path fill="url(#paint0_linear_13246_15657)" d="M0 0H8V101H0z" />
            <Defs>
                <LinearGradient
                    id="paint0_linear_13246_15657"
                    x1={4}
                    y1={0}
                    x2={4}
                    y2={101}
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#047E5B" />
                    <Stop offset={1} stopColor="#fff" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};

export default IconRectangleGradient;
