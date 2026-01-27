import * as React from 'react';
import colors from '../../designSystem/colorPalette';
import Svg, { Path } from 'react-native-svg';

function LuggageIcon({ fill = `${colors?.recovered?.neutralMax}` }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 16 16" fill="none">
            <Path
                d="M11.406 3.328h-1.212V1.581A.544.544 0 009.676 1H6.102a.544.544 0 00-.58.518v1.818h-1.15a1.704 1.704 0 00-1.748 1.677v1.23h10.53V5.076a1.717 1.717 0 00-1.687-1.748h-.061zM6.69 2.16h2.336v1.168H6.69V2.16zM2.624 7.096v6.156c0 .325.263.58.58.58h.58v.579a.544.544 0 00.517.58h.07a.544.544 0 00.58-.519V13.822h5.866v.58a.58.58 0 101.16 0v-.58h.58a.58.58 0 00.579-.58V7.097H2.624zm6.393 3.231H6.681a.58.58 0 110-1.159h2.336a.579.579 0 110 1.16z"
                fill={fill}
            />
        </Svg>
    );
}

export default LuggageIcon;
