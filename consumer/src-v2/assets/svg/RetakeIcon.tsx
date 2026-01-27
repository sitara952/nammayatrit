import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import React from 'react';

export const RetakeIconSvg = () => {
    return (
        <Svg width={12} height={13} viewBox="0 0 12 13" fill="none">
            <G clipPath="url(#clip0_5423_28299)">
                <Path
                    d="M9.81814 2.91311C8.83944 1.93441 7.49448 1.33398 5.99942 1.33398C3.02129 1.33398 0.601562 3.74771 0.601562 6.73184C0.601562 9.70996 3.01529 12.1297 5.99942 12.1297C8.98355 12.1297 11.3973 9.71597 11.3973 6.73184"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                />
                <Path
                    d="M6.96484 3.49471L9.97299 3.11644L9.58872 0.0722656"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_5423_28299">
                    <Rect width="11.9966" height="12.7291" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

