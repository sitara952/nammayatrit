import React from 'react';
import { Svg, Rect, G, Path, Defs, ClipPath } from 'react-native-svg';

type BusIconSvgProps = {
    width: number | undefined;
    height: number | undefined;
    fill: string | undefined;
};

export const BusIconSvg: React.FC<BusIconSvgProps> = ({ width = 28, height = 28, fill = '#FFE898' }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
            <Rect width={28} height={28} rx={10} fill={fill} />
            <G clipPath="url(#clip0_2901_11682)">
                <Path
                    d="M20.088 11.75V9.44c0-1.25-.98-2.28-2.22-2.34-1.09-.05-2.46-.1-3.86-.1s-2.78.06-3.87.11a2.324 2.324 0 00-2.22 2.33v2.31c-.28 0-.5.22-.5.5v2.18c0 .28.22.5.5.5v5.28c0 .4.33.73.73.73h1.2c.4 0 .73-.33.73-.73v-.94h6.84v.94c0 .4.33.73.73.73h1.2c.4 0 .73-.33.73-.73v-5.27c.28 0 .5-.22.5-.5v-2.18c0-.28-.22-.5-.5-.5l.01-.01zM12.017 17a.1.1 0 01-.1.1h-2.21a.1.1 0 01-.1-.1v-1c0-.06.05-.1.1-.1h2.21c.06 0 .1.05.1.1v1zm6.39 0a.1.1 0 01-.1.1h-2.2a.1.1 0 01-.1-.1v-1c0-.06.05-.1.1-.1h2.2c.06 0 .1.05.1.1v1zm0-3.233c0 .08-.06.14-.14.14h-8.52c-.08 0-.14-.06-.14-.14v-4.07c0-.08.06-.14.14-.14h8.51c.08 0 .14.06.14.14v4.07h.01z"
                    fill="#470F2D"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_2901_11682">
                    <Path fill="#fff" transform="translate(6 6)" d="M0 0H16V16H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
