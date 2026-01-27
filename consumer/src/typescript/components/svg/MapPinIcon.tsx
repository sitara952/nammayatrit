import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const MapPinIcon = ({ color = '#525461' }) => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 9.03v1.611a7.03 7.03 0 003.98 6.333l.89.427a3.093 3.093 0 011.715 2.3L10.96 22h1.742l.375-2.3a3.098 3.098 0 011.716-2.3l.888-.426a7.03 7.03 0 003.981-6.333V9.03C19.679 5.145 16.535 2 12.65 2h-1.62A7.026 7.026 0 004 9.03zm8.51-4.173h-1.332v3.485h1.332V4.857zm-1.332 6.586h1.332v3.484h-1.332v-3.484zm5.697-2.213H13.39v1.333h3.485V9.23zm-10.07 0h3.484v1.333H6.805V9.23z"
                fill={color}
            />
        </Svg>
    );
};
