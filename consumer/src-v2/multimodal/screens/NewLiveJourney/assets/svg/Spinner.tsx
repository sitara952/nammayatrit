import React from 'react';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

function Spinner() {
    return (
        <Animated.View>
            <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
                <Path
                    d="M44 22c0 12.15-9.85 22-22 22S0 34.15 0 22 9.85 0 22 0s22 9.85 22 22zM4.4 22c0 9.72 7.88 17.6 17.6 17.6 9.72 0 17.6-7.88 17.6-17.6 0-9.72-7.88-17.6-17.6-17.6-9.72 0-17.6 7.88-17.6 17.6z"
                    fill="#E7E7E7"
                />
                <Path
                    d="M22 2.2c0-1.215.987-2.211 2.196-2.09A22 22 0 0143.89 19.804C44.011 21.013 43.015 22 41.8 22c-1.215 0-2.186-.989-2.337-2.194A17.602 17.602 0 0024.194 4.537C22.99 4.386 22 3.415 22 2.2z"
                    fill="#0357B1"
                />
            </Svg>
        </Animated.View>
    );
}

export default Spinner;
