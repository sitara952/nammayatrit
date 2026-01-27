import * as React from 'react';
import Svg, { G, Rect, Path, Defs } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

interface MapTrainSvgProps {
    width: number | undefined;
    height: number | undefined;
}

function MapTrainSvg({ width = 42, height = 42 }: MapTrainSvgProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
            <G filter="url(#filter0_d_1644_4368)">
                <Rect x={9} y={7} width={24} height={24} rx={10} fill="#A9DB91" />
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
            <Path transform="translate(13 10.507)" fill="#A9DB91" d="M0 0H16V16H0z" />
            <Path
                d="M26.03 12.817c-1.43-.82-3.16-1.31-5.03-1.31s-3.61.48-5.03 1.31c-.61.35-.97 1.02-.97 1.72v7.53c0 1.1.9 2 2 2h.22l-1.35 1.42h2.08l1.35-1.42h3.41l1.35 1.42h2.07l-1.35-1.42H25c1.1 0 2-.9 2-2v-7.53c0-.7-.36-1.37-.97-1.72zm-9.53 8.21c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3.75-3.14c0 .06-.04.1-.1.1H16.6c-.06 0-.1-.04-.1-.1v-3.32c0-.06.04-.1.1-.1h3.55c.06 0 .1.04.1.1v3.32zm4.25 4.14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4.14c0 .06-.04.1-.1.1h-3.55c-.06 0-.1-.04-.1-.1v-3.32c0-.06.04-.1.1-.1h3.55c.06 0 .1.04.1.1v3.32z"
                fill="#3B3A3C"
            />
            <Defs></Defs>
        </Svg>
    );
}

export default MapTrainSvg;
