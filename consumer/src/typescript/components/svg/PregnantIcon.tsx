import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function PregnantIcon({ fill = `${colors?.recovered?.neutralMax}` }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 16 16" fill="none">
            <Path
                d="M11.298 11.945l-2.22-6.837a.83.83 0 00-.79-.57H6.821a.83.83 0 00-.685.359l-.772 1.115a.703.703 0 00.201.991l2.16 1.343a.714.714 0 01-.676 1.255l-1.536-.71-.615 3.098a.378.378 0 00.369.447h5.679a.376.376 0 00.36-.491h-.01z"
                fill={fill}
            />
            <Path
                d="M11.201 8.514A2.274 2.274 0 008.928 6.24c-.386 0-.746.106-1.07.281l1.79 4.152a2.264 2.264 0 001.562-2.15l-.009-.01zM7.49 3.879A1.44 1.44 0 107.49 1a1.44 1.44 0 000 2.879zM6.611 12.963h1.817l-.22 1.8a.275.275 0 01-.271.236H6.866a.273.273 0 01-.272-.272l.017-1.764z"
                fill={fill}
            />
        </Svg>
    );
}

export default PregnantIcon;
