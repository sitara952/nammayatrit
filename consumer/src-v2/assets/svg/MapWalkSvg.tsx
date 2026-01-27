// import * as React from 'react';
import Svg, {
    ClipPath,
    Defs,
    FeBlend,
    FeColorMatrix,
    FeComposite,
    FeFlood,
    FeGaussianBlur,
    FeOffset,
    Filter,
    G,
    Path,
    Rect,
} from 'react-native-svg';

interface MapWalkSvgProps {
    height: number | undefined;
    width: number | undefined;
}

import * as React from 'react';
function MapWalkSvg({ width = 42, height = 42 }: MapWalkSvgProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 42 42" fill="none">
            <G filter="url(#filter0_d_2842_9834)">
                <Rect x={9} y={7} width={24} height={24} rx={10} fill="#C9C9C9" />
                <Rect
                    x={7.60653}
                    y={5.60653}
                    width={26.7869}
                    height={26.7869}
                    rx={11.3935}
                    stroke="white"
                    strokeWidth={2.78695}
                />
            </G>
            <G clipPath="url(#clip0_2842_9834)">
                <Path
                    d="M21.5569 15.4972C22.5227 15.4972 23.3055 14.7143 23.3055 13.7486C23.3055 12.7829 22.5227 12 21.5569 12C20.5912 12 19.8083 12.7829 19.8083 13.7486C19.8083 14.7143 20.5912 15.4972 21.5569 15.4972Z"
                    fill="#3B3A3C"
                />
                <Path
                    d="M22.3653 18.3874C22.798 18.8378 23.7164 19.8004 24.4848 20.5334L25.7035 19.2529C24.7232 18.3256 23.425 16.9391 23.4162 16.9303L23.2042 16.7007L22.8951 16.6565C21.8177 16.5064 20.9169 16.5152 20.078 16.5329C18.3824 16.5682 17.0223 17.8752 16.9075 19.5708C16.8722 20.0919 16.8545 20.6571 16.8369 21.2753L18.6031 21.3106C18.612 20.7277 18.6385 20.189 18.665 19.6945C18.7003 19.1293 19.0447 18.6612 19.5304 18.4404L19.6099 19.9594C19.6276 20.3656 19.7689 20.7542 20.0073 21.081L21.853 23.6332L23.4692 26H25.6063L22.3741 21.2488V18.3874H22.3653Z"
                    fill="#3B3A3C"
                />
                <Path d="M18.9508 22.4737L16.2926 25.9974H18.5093L20.1342 23.8425L18.9508 22.4737Z" fill="#3B3A3C" />
            </G>
            <Defs>
                <Filter
                    id="filter0_d_2842_9834"
                    x={0.213074}
                    y={0.213135}
                    width={41.5739}
                    height={41.5737}
                    filterUnits="userSpaceOnUse"
                    // colorInterpolationFilters="sRGB"
                >
                    <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                    <FeColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <FeOffset dy={2} />
                    <FeGaussianBlur stdDeviation={3} />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2842_9834" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2842_9834" result="shape" />
                </Filter>
                <ClipPath id="clip0_2842_9834">
                    <Rect width={16} height={16} fill="white" transform="translate(13 11)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}
export default MapWalkSvg;
