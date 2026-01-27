import * as React from 'react';
import Svg, { Circle, Rect, Text } from 'react-native-svg';

interface ClockProps {
    fill?: string;
}

export const Clock: React.FC<ClockProps> = ({ fill = '#656269' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 22 22" fill="none">
            <Rect x="3" y="2" width="4.79" height="2" rx="0.5" fill={fill} transform="rotate(-38.21 5.5 2.75)" />

            <Rect x="16.0" y="2" width="4.79" height="2" rx="0.5" fill={fill} transform="rotate(50.79 18.2 4.75)" />

            <Circle cx="12" cy="12" r="8" stroke={fill} strokeWidth="2" fill="none" />

            <Text x="12.5" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill={fill}>
                Z
            </Text>
        </Svg>
    );
};
