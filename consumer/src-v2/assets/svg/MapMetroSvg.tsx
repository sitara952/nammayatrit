import * as React from 'react';
import Svg, { G, Rect, Path, Defs } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

interface MapMetroSvgProps {
    width: number | undefined;
    height: number | undefined;
}

function MapMetroSvg({ width = 42, height = 42 }: MapMetroSvgProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
            <G filter="url(#filter0_d_1644_4429)">
                <Rect x={9} y={7} width={24} height={24} rx={10} fill="#A4DBFF" />
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
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M26.508 13.684a1.041 1.041 0 00-.695-.852A15.25 15.25 0 0020.896 12c-1.716 0-3.359.305-4.906.842a1.058 1.058 0 00-.695.853c-.18 1.306-.295 3.253-.295 5.433 0 2.042.123 4.105.28 5.4.064.527.517.905 1.043.905h.641l-1.312 1.313h2.232l1.312-1.313h3.41l1.31 1.312h2.233l-1.312-1.312h.677c.527 0 .98-.389 1.043-.905.157-1.295.245-3.358.245-5.4 0-2.18-.115-4.127-.294-5.433v-.01zm-4.285 9.908H19.59a.795.795 0 01-.79-.79c0-.431.359-.79.79-.79h2.633c.431 0 .79.358.79.79 0 .432-.359.79-.79.79zm2.221-4.696a1.986 1.986 0 01-1.8 1.4c-.621.032-1.316.064-1.738.064-.42 0-1.116-.032-1.737-.064a1.949 1.949 0 01-1.779-1.4c-.242-.81-.527-2.042-.737-3.685 0-.063.042-.126.105-.126h8.318c.063 0 .116.063.105.126-.221 1.643-.495 2.874-.737 3.685z"
                fill="#1F2D3D"
            />
            <Defs></Defs>
        </Svg>
    );
}

export default MapMetroSvg;
