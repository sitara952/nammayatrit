import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function FavoriteIcon({ fill = '#fff' }) {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 16 16" fill="none">
            <Path
                d="M11.759 1.5A4.245 4.245 0 008 3.717 4.281 4.281 0 004.241 1.5C1.908 1.5 0 3.345 0 5.618c0 2.608 2.467 4.657 4.376 6.185C5.186 12.455 8 14.188 8 14.3c0-.112 2.815-1.845 3.624-2.497C13.533 10.275 16 8.226 16 5.618 16 3.345 14.092 1.5 11.74 1.5h.019z"
                fill={fill}
            />
        </Svg>
    );
}

export default FavoriteIcon;
