import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const SpecialPickUpLocationPin = ({ fillColor = 'white' }) => (
    <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
        <Path
            d="M8.00016 11.3333V6M8.00016 6C9.10473 6 10.0002 5.10457 10.0002 4C10.0002 2.89543 9.10473 2 8.00016 2C6.89559 2 6.00016 2.89543 6.00016 4C6.00016 5.10457 6.89559 6 8.00016 6ZM14.6668 11.6667C14.6668 13.3235 11.6821 14.6667 8.00016 14.6667C4.31826 14.6667 1.3335 13.3235 1.3335 11.6667C1.3335 10.4365 2.97896 9.37923 5.3335 8.91629V8.91629C7.10057 8.64043 8.89975 8.64043 10.6668 8.91629V8.91629C13.0214 9.37923 14.6668 10.4365 14.6668 11.6667Z"
            stroke={fillColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
