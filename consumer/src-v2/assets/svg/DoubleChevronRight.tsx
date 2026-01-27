import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function DoubleChevronRight({ fill }: { fill: string | undefined }) {
    const fillColor = fill || '#016ACD';
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 13" fill="none">
            <Path
                opacity={0.5}
                d="M8.98.96L14.52 6.5 8.98 12.037"
                stroke={fillColor}
                strokeWidth={1.84615}
                strokeLinejoin="round"
            />
            <Path d="M1 .96L6.538 6.5 1 12.037" stroke={fillColor} strokeWidth={1.84615} strokeLinejoin="round" />
        </Svg>
    );
}

export default DoubleChevronRight;
