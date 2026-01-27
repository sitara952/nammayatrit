import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, ViewStyle } from 'react-native';

interface CustomIconProps {
    color?: string;
    size?: number;
    paddingLeft?: number;
    style?: ViewStyle;
}

const ChevronLeftIcon: React.FC<CustomIconProps> = ({ color = 'white', size = 52, paddingLeft = 0, style }) => {
    return (
        <View style={[{ paddingLeft }, style]}>
            <Svg width={size} height={(size / 52) * 40} viewBox="0 0 52 40" fill="none">
                <Path
                    d="M0.5 20C0.5 9.23045 9.23045 0.5 20 0.5H32C42.7696 0.5 51.5 9.23045 51.5 20C51.5 30.7696 42.7696 39.5 32 39.5H20C9.23045 39.5 0.5 30.7696 0.5 20Z"
                    fill={color}
                />
                <Path
                    d="M0.5 20C0.5 9.23045 9.23045 0.5 20 0.5H32C42.7696 0.5 51.5 9.23045 51.5 20C51.5 30.7696 42.7696 39.5 32 39.5H20C9.23045 39.5 0.5 30.7696 0.5 20Z"
                    stroke="#E0E3E8"
                />
                <Path
                    d="M33 20 H20 L25 25 M20 20 L25 15"
                    fill="none"
                    stroke="#4f4d4d"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
};

export default ChevronLeftIcon;
