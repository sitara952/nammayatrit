import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export const LiveOff = () => {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G clipPath="url(#clip0_live_off)">
                {/* Location pin */}
                <Path
                    d="M8 1.5C5.1 1.5 2.75 3.85 2.75 6.75C2.75 10.25 8 14.5 8 14.5C8 14.5 13.25 10.25 13.25 6.75C13.25 3.85 10.9 1.5 8 1.5Z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                />

                {/* Center dot */}
                <Path
                    d="M8 5.25C7.2 5.25 6.55 5.9 6.55 6.7C6.55 7.5 7.2 8.15 8 8.15C8.8 8.15 9.45 7.5 9.45 6.7C9.45 5.9 8.8 5.25 8 5.25Z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                />

                {/* Slash (off) */}
                <Path d="M2 14L14 2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </G>
            <Defs>
                <ClipPath id="clip0_live_off">
                    <Rect width="16" height="16" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
