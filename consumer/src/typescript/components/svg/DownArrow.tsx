import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

const DownArrow = ({ size = 16 }: { size: number | undefined }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
            <Path
                d="M13.3 6l-5.4 5.4L2.5 6"
                stroke={colors?.recovered?.neutralUltraHigh}
                strokeWidth={1.8}
                strokeLinecap="square"
            />
        </Svg>
    );
};

export default DownArrow;
