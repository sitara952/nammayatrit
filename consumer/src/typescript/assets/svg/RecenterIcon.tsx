import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface RecenterIconProps {
    size?: number;
    fill?: string;
}

const RecenterIcon = ({ size = 20, fill = '#004FB6' }: RecenterIconProps) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 8V4M12 20V16M16 12H20M4 12H8M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke={fill}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Circle cx="12" cy="12" r="2" fill={fill} />
        </Svg>
    );
};

export default RecenterIcon;
