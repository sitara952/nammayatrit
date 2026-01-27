import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const MetroBlueLineIcon = ({ fill }: { fill: string }) => {
    return (
        <Svg width={21} height={20} viewBox="0 0 21 20" fill={fill}>
            <Rect width={21} height={20} rx={6} fill={fill} />
            <Path
                d="M5.484 15V5.64h2.22c.972 2.184 1.932 4.38 2.892 6.576h.024c.96-2.196 1.92-4.392 2.892-6.576h2.22V15H13.92V8.976h-.048c-.864 2.004-1.74 4.02-2.616 6.024H9.96a1306.21 1306.21 0 01-2.616-6.024h-.048V15H5.484z"
                fill="#fff"
            />
        </Svg>
    );
};

export default MetroBlueLineIcon;
