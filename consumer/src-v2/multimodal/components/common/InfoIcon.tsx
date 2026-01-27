import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const InfoIcon = ({ size = 16 }: { size: number | undefined }) => (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <Path
            d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
            fill="#7B8997"
        />
        <Path
            d="M8 4C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.44772 7.44772 4 8 4Z"
            fill="white"
        />
        <Path
            d="M7 7.5C7 7.22386 7.22386 7 7.5 7H8.5C8.77614 7 9 7.22386 9 7.5V11.5C9 11.7761 8.77614 12 8.5 12H7.5C7.22386 12 7 11.7761 7 11.5V7.5Z"
            fill="white"
        />
    </Svg>
);
