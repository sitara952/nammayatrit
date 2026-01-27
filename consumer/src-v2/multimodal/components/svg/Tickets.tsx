import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function TicketsIcon({ width = 56, height = 16, color = '#282729' }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 56 16" fill="none">
            <Path
                d="M.043 0H0h.043L56 .04c-8.5 1.962-17.5 15.462-27.5 15.462C19.027 16.002 5.08.049.043 0z"
                fill={color}
            />
        </Svg>
    );
}

export default TicketsIcon;
