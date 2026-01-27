import {
    Defs,
    FeBlend,
    FeColorMatrix,
    FeComposite,
    FeFlood,
    FeGaussianBlur,
    FeOffset,
    Filter,
    G,
    LinearGradient,
    Path,
    Stop,
    Svg,
} from 'react-native-svg';

export const Ticket = ({ width, height }: { width: number; height: number }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 439 850" fill="none">
            <G filter="url(#filter0_dd_1363_10399)">
                <Path
                    d="M259 822H395.518C401.899 822 407 817.989 407 813.148V44.8482C407 40.0076 401.716 36 395.335 36H258.776C258.776 36 258.41 36 258.227 36.1394C258.227 36.1394 257.862 36.2789 257.501 36.5541L235.45 49.6577C235.45 49.6577 226.428 54.7736 219.411 54.7736C212.394 54.7736 203.371 49.6577 203.371 49.6577C203.371 49.6577 187.525 41.7378 180 36H43.5C37.1189 36.0036 32 40.0112 32 44.8482L32 813.148C32 817.989 37.284 822 43.6651 822H180.224C180.224 822 180.59 822 180.773 821.86C180.773 821.86 181.138 821.721 181.504 821.446L203.554 811.063C203.554 811.063 213.578 805.947 219.594 805.947C225.609 805.947 235.633 811.063 235.633 811.063C235.633 811.063 249.607 818.058 259 822Z"
                    fill="url(#paint0_linear_1363_10399)"
                />
                <Path
                    d="M259 822H395.518C401.899 822 407 817.989 407 813.148V44.8482C407 40.0076 401.716 36 395.335 36H258.776C258.776 36 258.41 36 258.227 36.1394C258.227 36.1394 257.862 36.2789 257.501 36.5541L235.45 49.6577C235.45 49.6577 226.428 54.7736 219.411 54.7736C212.394 54.7736 203.371 49.6577 203.371 49.6577C203.371 49.6577 187.525 41.7378 180 36H43.5C37.1189 36.0036 32 40.0112 32 44.8482L32 813.148C32 817.989 37.284 822 43.6651 822H180.224C180.224 822 180.59 822 180.773 821.86C180.773 821.86 181.138 821.721 181.504 821.446L203.554 811.063C203.554 811.063 213.578 805.947 219.594 805.947C225.609 805.947 235.633 811.063 235.633 811.063C235.633 811.063 249.607 818.058 259 822Z"
                    fill="#FFA621"
                />
                <Path
                    d="M259 822H395.518C401.899 822 407 817.989 407 813.148V44.8482C407 40.0076 401.716 36 395.335 36H258.776C258.776 36 258.41 36 258.227 36.1394C258.227 36.1394 257.862 36.2789 257.501 36.5541L235.45 49.6577C235.45 49.6577 226.428 54.7736 219.411 54.7736C212.394 54.7736 203.371 49.6577 203.371 49.6577C203.371 49.6577 187.525 41.7378 180 36H43.5C37.1189 36.0036 32 40.0112 32 44.8482L32 813.148C32 817.989 37.284 822 43.6651 822H180.224C180.224 822 180.59 822 180.773 821.86C180.773 821.86 181.138 821.721 181.504 821.446L203.554 811.063C203.554 811.063 213.578 805.947 219.594 805.947C225.609 805.947 235.633 811.063 235.633 811.063C235.633 811.063 249.607 818.058 259 822Z"
                    fill="white"
                />
            </G>
            <Defs>
                <Filter id="filter0_dd_1363_10399" x="0" y="0" width="439" height="850" filterUnits="userSpaceOnUse">
                    <FeFlood floodOpacity="0" result="BackgroundImageFix" />
                    <FeColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <FeOffset dy="-4" />
                    <FeGaussianBlur stdDeviation="16" />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1363_10399" />
                    <FeColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <FeOffset dy="-2" />
                    <FeGaussianBlur stdDeviation="4" />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
                    <FeBlend mode="normal" in2="effect1_dropShadow_1363_10399" result="effect2_dropShadow_1363_10399" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1363_10399" result="shape" />
                </Filter>
                <LinearGradient
                    id="paint0_linear_1363_10399"
                    x1="-0.556834"
                    y1="831.577"
                    x2="895.438"
                    y2="-75.7434"
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#F4074B" />
                    <Stop offset="1" stopColor="#FB550B" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};
