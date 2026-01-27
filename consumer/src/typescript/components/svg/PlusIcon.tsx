import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function PlusIcon({ fill = `${colors?.recovered?.neutralUltraHigh}` }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path d="M8 2v12M14 8H2" stroke={fill} strokeWidth={1.6} strokeLinecap="square" strokeLinejoin="round" />
        </Svg>
    );
}

export default PlusIcon;
