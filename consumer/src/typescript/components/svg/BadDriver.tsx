import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BadDriver({ color = '#14171F' }) {
    return (
        <Svg width={14} height={15} viewBox="0 0 20 20" fill="none">
            <Path
                d="M6.98491 12.0822C8.71922 12.3916 10.0973 13.7228 10.5379 15.4196C10.8098 16.4696 10.0129 17.5008 8.92546 17.5008H2.71007V11.7822H3.64753C4.78187 11.7822 5.89745 11.8853 6.98491 12.0728V12.0822Z"
                fill={color}
            />
            <Path
                d="M3.64773 2.5C5.82265 2.5 7.58508 4.26243 7.58508 6.43735C7.58508 8.61227 5.82265 10.3747 3.64773 10.3747H2.71027V2.5H3.64773Z"
                fill={color}
            />
            <Path d="M15.5072 3.33327L16.6837 4.50977L11.0887 10.1048L9.91219 8.92829L15.5072 3.33327Z" fill={color} />
            <Path d="M11.0887 3.33368L16.6837 8.92871L15.5072 10.1052L9.91219 4.51018L11.0887 3.33368Z" fill={color} />
        </Svg>
    );
}

export default BadDriver;
