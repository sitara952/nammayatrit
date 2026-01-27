import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const ViaPointIcon = () => (
    <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
        <Rect width={15} height={14} rx={4} fill="#BCBCBC" />
        <Path d="M12.75 5h-.764a4.5 4.5 0 00-4.5 4.5v.237" stroke="#fff" strokeWidth={1.57908} />
        <Path d="M2.25 5h.764a4.5 4.5 0 014.5 4.5v.237" stroke="#fff" strokeWidth={1.57908} />
    </Svg>
);

export default ViaPointIcon;
