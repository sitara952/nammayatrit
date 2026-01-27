import React from 'react';
import { Svg, Rect, Path } from 'react-native-svg';

type TwoAndFromIconSvgProps = {
    width: number | undefined;
    height: number | undefined;
    fill: string | undefined;
};

export const TwoAndFromIconSvg: React.FC<TwoAndFromIconSvgProps> = ({ width = 20, height = 20, fill = '#E6E6E6' }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
            <Rect width={20} height={20} rx={6} fill={fill} />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.328 6.397l-2.831-2.83-.868.867 1.952 1.953H5v1.227h7.578l-1.95 1.95.869.867 2.83-2.83a.848.848 0 000-1.204zm-7.159 5.99h7.58v1.228h-7.58l1.95 1.951-.867.868-2.83-2.83a.848.848 0 010-1.204l2.83-2.83.868.867-1.95 1.95z"
                fill="#656565"
            />
        </Svg>
    );
};
