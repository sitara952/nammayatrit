import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function AnotherCar({ color = '#14171F' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
                d="M14.63 14.5799L14.07 10.7099L10.85 10.1699L9.47 10.0399L5.44 5.06992L3.29 5.09992L2.76 3.91992H2V6.64992L4.54 6.61992L7.13 9.81992L2 9.71992V16.4299L8.19 16.4999C8.45 17.3699 9.24 17.9999 10.2 17.9999C11.16 17.9999 11.92 17.3799 12.19 16.5399L13.99 16.5599L14.64 14.5799H14.63Z"
                fill={color}
            />
            <Path
                d="M17.93 4.27869L16.5872 3L13.1111 6.51705L11.2038 4.66111L10 5.93865L12.38 8.3186H13.89L17.93 4.27869Z"
                fill={color}
            />
        </Svg>
    );
}

export default AnotherCar;
