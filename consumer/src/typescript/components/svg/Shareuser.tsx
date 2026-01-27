import React from 'react';
import { Path, Svg, G, ClipPath, Defs } from 'react-native-svg';
function ShareUserIcon() {
    return (
        <Svg width="25" height="24" fill="none" viewBox="0 0 25 24">
            <G fill="#14171F" clipPath="url(#clip0_3402_12781)">
                <Path d="M6.14 19.775H4.1v-5.16a4.497 4.497 0 014.488-4.488h5.736v2.04H8.588a2.45 2.45 0 00-2.448 2.448v5.16z" />
                <Path d="M11.168 16.872l-1.44-1.44 3.924-3.924v-.468L9.728 7.116l1.44-1.44 4.524 4.512v2.16l-4.524 4.524zM22.04 4.32a4.051 4.051 0 00-4.056 4.055 4.051 4.051 0 004.056 4.056V4.32zM18.608 14.183c-1.788.312-3.204 1.692-3.66 3.444-.276 1.08.54 2.148 1.656 2.148h5.436v-5.892c-1.164 0-2.316.108-3.432.3z" />
            </G>
            <Defs>
                <ClipPath id="clip0_3402_12781">
                    <Path fill="#fff" d="M0 0H17.94V15.456H0z" transform="translate(4.1 4.32)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

export default ShareUserIcon;
