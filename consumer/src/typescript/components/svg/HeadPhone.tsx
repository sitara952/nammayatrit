import React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

export const Headphone = ({ fill = '#515151' }) => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 24 24" fill="none">
            <G clipPath="url(#clip0_9560_32716)" fill={fill}>
                <Path d="M19.71 10.15h-2C17.71 7.31 15.4 5 12.56 5h-1.13c-2.84 0-5.15 2.31-5.15 5.15h-2C4.28 6.21 7.49 3 11.43 3h1.13c3.94 0 7.15 3.21 7.15 7.15z" />
                <Path d="M4.54 16.19l1.48.22a.924.924 0 001.06-.91v-4.66c0-.56-.5-1-1.06-.91l-1.48.22c-1.2.18-2.09 1.2-2.09 2.42v1.23c0 1.21.89 2.24 2.09 2.42v-.03zM19.46 16.19l-1.48.22a.924.924 0 01-1.06-.91v-4.66c0-.56.5-1 1.06-.91l1.48.22c1.2.18 2.09 1.2 2.09 2.42v1.23c0 1.21-.89 2.24-2.09 2.42v-.03z" />
                <Path d="M12.11 20.59l-.33-1.97 4.41-.74a2.33 2.33 0 001.95-2.3v-.77h2v.77c0 2.13-1.52 3.93-3.62 4.28l-4.41.74v-.01z" />
            </G>
            <Defs>
                <ClipPath id="clip0_9560_32716">
                    <Path fill="#fff" transform="translate(2.45 3)" d="M0 0H19.1V17.59H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
