import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function SkipIconTransit() {
    return (
        <Svg width={28} height={24} viewBox="0 0 28 24" fill="none">
            <Rect width={28} height={24} rx={12} fill="#E1D4F8" />
            <Path
                d="M18.58 15.72l-.455-3.146-2.617-.44-1.125-.109-3.282-4.04-1.749.027-.434-.963h-.617v2.224l2.068-.027 2.109 2.603-4.177-.081v5.457l5.038.055a1.7 1.7 0 001.634 1.22c.78 0 1.396-.502 1.62-1.186l1.464.013.53-1.614h-.008v.007z"
                fill="#470F2D"
            />
            <Path
                transform="rotate(45 17.438 6.357)"
                fill="#470F2D"
                d="M17.4375 6.35742H18.77083V10.357420000000001H17.4375z"
            />
            <Path transform="rotate(60 18.209 9.38)" fill="#470F2D" d="M18.2085 9.38028H19.54183V11.58731H18.2085z" />
            <Path
                transform="rotate(19.66 13.602 5.984)"
                fill="#470F2D"
                d="M13.6025 5.98365H14.93583V8.213799999999999H13.6025z"
            />
        </Svg>
    );
}

export default SkipIconTransit;
