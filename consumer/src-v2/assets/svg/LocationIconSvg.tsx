import React from 'react';
import { Svg, Rect, Path } from 'react-native-svg';

type LocationIconSvgProps = {
    width: number | undefined;
    height: number | undefined;
    fill: string | undefined;
};

export const LocationIconSvg: React.FC<LocationIconSvgProps> = ({ width = 24, height = 24, fill = '#969696' }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
            <Rect width={24} height={24} rx={8} fill={fill} />
            <Path d="M16.835 17.313h-9.67v1.45h9.67v-1.45z" fill="#fff" />
            <Path
                d="M16.235 6.985a6 6 0 00-8.481 0 5.98 5.98 0 00.01 8.471l3.307 3.308h1.866l3.308-3.308a6 6 0 000-8.481l-.01.01zm-3.452 6.421h-1.46l-2.234-2.795 1.131-.909 1.799 2.244h.087l1.915-2.263 1.102.938-2.35 2.775.01.01z"
                fill="#fff"
            />
        </Svg>
    );
};
