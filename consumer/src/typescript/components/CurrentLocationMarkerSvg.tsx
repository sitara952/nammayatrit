import React from 'react';
import Svg, {
    Path,
    G,
    Rect,
    Defs,
    Filter,
    FeFlood,
    FeColorMatrix,
    FeOffset,
    FeGaussianBlur,
    FeComposite,
    FeBlend,
} from 'react-native-svg';

interface CurrentLocationMarkerSvgProps {
    width?: number;
    height?: number;
    fill?: string;
}

const CurrentLocationMarkerSvg: React.FC<CurrentLocationMarkerSvgProps> = ({
    width = 95,
    height = 62,
    fill = '#0265CE',
}) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 95 62" fill="none">
            <Path
                d="M63.99 24.022C63.99 15.17 56.386 8 46.996 8S30 15.17 30 24.022c0 5.497 2.943 10.352 7.422 13.24l6.033 4.655c1.186.919 1.876 2.28 1.876 3.728v7.686a1.67 1.67 0 103.338 0v-7.686c0-1.448.69-2.809 1.876-3.728l6.033-4.656C61.058 34.374 64 29.528 64 24.022h-.01z"
                fill={fill}
            />
            <G filter="url(#filter0_dd_19798_131235)">
                <Rect x={15} y={8} width={65} height={32} rx={16} fill={fill} />
            </G>
            <Path
                d="M27.211 27.594v-3.107l-3.165-5.936h1.844l2.168 4.232h.023l2.168-4.232h1.843c-1.055 1.971-2.098 3.954-3.165 5.924v3.119h-1.716zm7.75.197c-1.971 0-3.34-1.403-3.34-3.42 0-2.006 1.369-3.432 3.34-3.432 1.97 0 3.338 1.426 3.338 3.432 0 2.017-1.368 3.42-3.339 3.42zm0-1.554c.973 0 1.645-.776 1.645-1.866 0-1.113-.672-1.878-1.646-1.878-.974 0-1.657.777-1.657 1.878 0 1.09.684 1.866 1.657 1.866zm7.03 1.554c-1.426 0-2.33-.87-2.33-2.609v-4.057h1.623v3.501c0 .985.394 1.611 1.17 1.611.847 0 1.357-.718 1.357-1.634v-3.478h1.623v4.452c0 1.066.081 1.507.209 2.017H44.02c-.082-.36-.128-.603-.116-.789h-.024c-.359.592-.939.986-1.89.986zM59.58 23.76a4.049 4.049 0 01-4.053-4.052c0-2.24 1.812-4.06 4.052-4.06a4.049 4.049 0 014.052 4.052 4.049 4.049 0 01-4.052 4.053v.007zM52.143 29.298c.476-1.843 1.962-3.281 3.845-3.607a20.715 20.715 0 013.607-.318c1.232 0 2.423.111 3.607.318 1.875.326 3.353 1.772 3.846 3.607a1.794 1.794 0 01-1.748 2.24H53.875c-1.168 0-2.034-1.112-1.732-2.24z"
                fill="#fff"
            />
            <Defs>
                <Filter id="filter0_dd_19798_131235" x={0} y={0} width={95} height={62} filterUnits="userSpaceOnUse">
                    <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                    <FeColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <FeOffset dy={6} />
                    <FeGaussianBlur stdDeviation={7.5} />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_19798_131235" />
                    <FeColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <FeOffset dy={1} />
                    <FeGaussianBlur stdDeviation={1} />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                    <FeBlend
                        mode="normal"
                        in2="effect1_dropShadow_19798_131235"
                        result="effect2_dropShadow_19798_131235"
                    />
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_19798_131235" result="shape" />
                </Filter>
            </Defs>
        </Svg>
    );
};

export default CurrentLocationMarkerSvg;
