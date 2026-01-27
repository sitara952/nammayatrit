import React from 'react';
import { Svg, Path, ClipPath, Defs, G } from 'react-native-svg';

const NewChatIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <G clipPath="url(#clip0_89_3690)">
            <Path
                d="M15.988 14.352A6.929 6.929 0 0011.07 2.545H8.937a6.929 6.929 0 000 13.857h2.134c.734 0 1.439-.113 2.106-.33.17.123.33.245.508.358a8.29 8.29 0 002.876 1.025c.282.047.47-.273.33-.517a7.379 7.379 0 01-.903-2.586zM10 6.568c1.146 0 2.086.931 2.086 2.087 0 1.157-.93 2.088-2.086 2.088a2.082 2.082 0 01-2.087-2.088c0-1.156.93-2.086 2.087-2.086zm1.062 7.672H8.928c-.705 0-1.373-.17-1.984-.442a4.187 4.187 0 013.046-1.316c1.203 0 2.284.507 3.046 1.316a4.647 4.647 0 01-1.984.442h.01z"
                fill="#006EC9"
            />
        </G>
        <Defs>
            <ClipPath id="clip0_89_3690">
                <Path fill="#fff" d="M0 0H20V20H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default NewChatIcon;
