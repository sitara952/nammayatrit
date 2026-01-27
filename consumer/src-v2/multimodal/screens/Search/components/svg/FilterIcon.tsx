import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

function FilterIcon() {
    return (
        <Svg width={13} height={10} viewBox="0 0 13 10" fill="none">
            <Rect x={11} y={4} width={2} height={9} rx={0.75} transform="rotate(90 11 4)" fill="#313131" />
            <Rect x={13} width={2} height={13} rx={0.75} transform="rotate(90 13 0)" fill="#313131" />
            <Rect x={8} y={8} width={2} height={3} rx={0.75} transform="rotate(90 8 8)" fill="#313131" />
        </Svg>
    );
}

export default FilterIcon;
