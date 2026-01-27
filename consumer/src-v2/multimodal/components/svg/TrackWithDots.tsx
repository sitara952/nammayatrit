import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Circle, Path } from 'react-native-svg';

type TrackWithDotsProps = {
    width: number | string;
    height: number | string;
};

const TrackWithDots: React.FC<TrackWithDotsProps> = ({ width = 10, height = 47 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 10 47" fill="none">
            <Circle cx={5.03906} cy={7.5} r={4.5} fill="#969696" />
            <Circle cx={5.03906} cy={38.5} r={4.5} fill="#006ED6" />
            <Circle cx={5.03906} cy={38.5} r={1.96094} fill="white" />
            <Path d="M5.13477 14V32" stroke="url(#paint0_linear)" strokeWidth={1.49495} strokeMiterlimit={10} />
            <Defs>
                <LinearGradient
                    id="paint0_linear"
                    x1={5.63477}
                    y1={14}
                    x2={5.63477}
                    y2={32}
                    gradientUnits="userSpaceOnUse">
                    <Stop offset={0} stopColor="#D0D0D0" />
                    <Stop offset={1} stopColor="#006ED6" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};

export default TrackWithDots;
