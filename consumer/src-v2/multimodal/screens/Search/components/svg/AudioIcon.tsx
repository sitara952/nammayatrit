import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

function AudioIcon() {
    return (
        <Svg width={19} height={18} viewBox="0 0 19 18" fill="none">
            <Rect x={2.5} y={6} width={2} height={5} rx={0.75} fill="#313131" />
            <Rect x={10.5} y={4} width={2} height={9} rx={0.75} fill="#313131" />
            <Rect x={6.5} y={2} width={2} height={13} rx={0.75} fill="#313131" />
            <Rect x={14.5} y={7} width={2} height={3} rx={0.75} fill="#313131" />
        </Svg>
    );
}

export default AudioIcon;
