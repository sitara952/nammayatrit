import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const TickIcon = ({ fill = '#09941E' }: { fill: string }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 14 14" fill="none">
            <Path
                d="M5.329 11.78a1.5 1.5 0 01-1.07-.452L.398 7.36l1.404-1.365L5.319 9.6c1.228-1.326 3.83-3.998 7.071-6.522l1.208 1.552c-3.457 2.691-6.158 5.549-7.16 6.659a1.505 1.505 0 01-1.08.49h-.03z"
                fill={fill}
            />
        </Svg>
    );
};

export default TickIcon;
