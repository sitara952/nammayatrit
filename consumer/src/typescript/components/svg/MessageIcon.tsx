import React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

export const MessageIcon = () => {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill={'none'}>
            <G clipPath="url(#clip0_3490_12709)">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.818 1.129H2.182A2.184 2.184 0 000 3.31v7.273c0 1.202.979 2.181 2.182 2.181h.727v3.27l3.946-3.27h6.963A2.184 2.184 0 0016 10.584V3.31a2.184 2.184 0 00-2.182-2.182zM3 4.159h6.06v1.25H3V4.16zm10 3.09H3V8.5h10V7.25z"
                    fill="#fff"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_3490_12709">
                    <Path fill="#fff" d="M0 0H16V16H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
