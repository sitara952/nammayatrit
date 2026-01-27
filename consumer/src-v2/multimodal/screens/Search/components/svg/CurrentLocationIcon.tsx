import * as React from 'react';
import Svg, { Rect, G, Circle, Path, Defs } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function CurrentLocationIcon() {
    return (
        <Svg width={39} height={37} viewBox="0 0 39 37" fill="none">
            <Rect x={0.5} width={38} height={37} rx={18.5} fill="#F0F1F4" />
            <G filter="url(#filter0_d_1152_13324)">
                <Circle cx={19} cy={18.5} r={7} fill="#4285F4" />
                <Circle cx={19} cy={18.5} r={8.25} stroke="#fff" strokeWidth={2.5} />
            </G>
            <Path
                d="M31 15.613a.5.5 0 01.832-.373l3.248 2.886a.5.5 0 010 .748l-3.248 2.886a.5.5 0 01-.832-.373v-5.774z"
                fill="#4285F4"
            />
            <Defs></Defs>
        </Svg>
    );
}

export default CurrentLocationIcon;
