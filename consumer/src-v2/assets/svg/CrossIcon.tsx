import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function CrossIcon({ fill = '#F4F4F4' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 17" fill="none">
            <G clipPath="url(#clip0_8086_15659)" fill={fill}>
                <Path d="M2.272 3.682l10.162 10.162 1.346-1.347L3.618 2.335 2.272 3.682z" />
                <Path d="M13.78 12.485l-1.346 1.345L2.277 3.674l1.346-1.346" />
                <Path d="M12.432 2.322L2.27 12.484l1.346 1.347L13.778 3.669l-1.346-1.347z" />
                <Path d="M3.623 13.83l-1.346-1.345L12.434 2.328l1.346 1.346" />
            </G>
            <Defs>
                <ClipPath id="clip0_8086_15659">
                    <Path fill={fill} transform="translate(2.277 2.328)" d="M0 0H11.5021V11.5021H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

export default CrossIcon;
