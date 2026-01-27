import * as React from 'react';
import Svg, { G, Rect, Path, Defs, ClipPath } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

interface MapBusSvgProps {
    width: number | undefined;
    height: number | undefined;
}

function MapBusSvg({ width = 42, height = 42 }: MapBusSvgProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
            <G filter="url(#filter0_d_1150_9467)">
                <Rect x={9} y={7} width={24} height={24} rx={10} fill="#FFE486" />
                <Rect
                    x={7.60653}
                    y={5.60653}
                    width={26.7869}
                    height={26.7869}
                    rx={11.3935}
                    stroke="#fff"
                    strokeWidth={2.78695}
                />
            </G>
            <G clipPath="url(#clip0_1150_9467)">
                <Path
                    d="M27.37 16.675v-2.418a2.45 2.45 0 00-2.324-2.449 89.243 89.243 0 00-4.04-.104c-1.465 0-2.91.062-4.05.115a2.433 2.433 0 00-2.323 2.438v2.418a.518.518 0 00-.524.523v2.282c0 .293.23.523.524.523v5.526c0 .419.345.764.764.764h1.255a.768.768 0 00.764-.764v-.984h7.16v.984c0 .419.345.764.763.764h1.256a.768.768 0 00.764-.764v-5.515c.293 0 .523-.23.523-.524V17.21a.518.518 0 00-.523-.524l.01-.01zm-8.448 5.495a.105.105 0 01-.104.104h-2.313a.105.105 0 01-.105-.104v-1.047c0-.063.052-.105.105-.105h2.313c.063 0 .104.053.104.105v1.047zm6.687 0a.105.105 0 01-.104.104h-2.303a.105.105 0 01-.105-.104v-1.047c0-.063.053-.105.105-.105h2.303c.063 0 .104.053.104.105v1.047zm0-3.384a.143.143 0 01-.146.147h-8.916a.143.143 0 01-.147-.147v-4.26c0-.083.063-.146.147-.146h8.905c.084 0 .147.063.147.146v4.26h.01z"
                    fill="#470F2D"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_1150_9467">
                    <Path fill="#fff" transform="translate(13 11)" d="M0 0H16V16H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

export default MapBusSvg;
