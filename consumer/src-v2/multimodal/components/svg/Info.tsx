import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const Info = ({ fill = '#1D74F6' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path
                d="M8.0026 10.8333V8.16667M8.0026 5.5H8.00927M14.6693 8.16667C14.6693 11.8486 11.6845 14.8333 8.0026 14.8333C4.32071 14.8333 1.33594 11.8486 1.33594 8.16667C1.33594 4.48477 4.32071 1.5 8.0026 1.5C11.6845 1.5 14.6693 4.48477 14.6693 8.16667Z"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};
