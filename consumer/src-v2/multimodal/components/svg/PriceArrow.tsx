import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export const PriceArrow = ({ fill = '#1A471B', width = 90, height = 34 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 88 24" fill="none">
            <Path
                d="M74.907 24l-2.256-2.024 9.266-8.504H0v-2.944h81.917L72.65 2.06 74.907 0 88 12 74.907 24z"
                fill={fill}
            />
        </Svg>
    );
};
