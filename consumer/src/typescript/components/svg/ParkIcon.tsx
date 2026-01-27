import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Park({ fill = 'black' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.499 2.5c-1.59 0-3.03.646-4.071 1.691-1.076 1.08-1.572 2.581-1.572 4.055l.009.815a4.652 4.652 0 00-2.523 4.162 4.672 4.672 0 004.677 4.667h6.97a4.67 4.67 0 004.668-4.667 4.674 4.674 0 00-2.53-4.162l.023-.762v-.015c0-1.676-.653-3.367-1.985-4.467A5.744 5.744 0 0012.499 2.5zm.75 7.113a.75.75 0 10-1.5 0v3.067l-.829-.83a.75.75 0 10-1.06 1.061l1.89 1.89V21a.75.75 0 001.5 0v-6.472a.72.72 0 000-.075V13.28l1.89-1.89a.75.75 0 00-1.06-1.061l-.83.83V9.613z"
                fill={fill}
            />
        </Svg>
    );
}

export default Park;
