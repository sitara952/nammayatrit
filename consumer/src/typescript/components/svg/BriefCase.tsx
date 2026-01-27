import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
const BriefCase = ({ fillColor = '#14171F' }) => (
    <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
        <G clipPath="url(#clip0_19798_129134)">
            <Path
                d="M13.333 4h-2.667V2.666c0-.74-.593-1.333-1.333-1.333H6.666c-.74 0-1.333.593-1.333 1.333V4H2.666c-.74 0-1.326.593-1.326 1.333l-.007 7.333c0 .74.593 1.334 1.333 1.334h10.667c.74 0 1.333-.594 1.333-1.334V5.333c0-.74-.593-1.333-1.333-1.333zm-4 0H6.666V2.666h2.667V4z"
                fill={fillColor}
            />
        </G>
        <Defs>
            <ClipPath id="clip0_19798_129134">
                <Path fill="#fff" d="M0 0H16V16H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
export { BriefCase };
