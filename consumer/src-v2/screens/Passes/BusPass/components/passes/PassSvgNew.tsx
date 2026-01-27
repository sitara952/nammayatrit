import React from 'react';
import Svg, { G, Rect, Path, Mask, Text as SvgText, TSpan } from 'react-native-svg';

type PassSvgNewProps = {
    width: number | undefined;
    height: number | undefined;
    fleetNo: string | undefined;
    rotation: number | undefined;
    showBig: boolean | undefined;
};

export const PassSvgNew: React.FC<PassSvgNewProps> = ({ width = 118, height = 81, fleetNo, rotation, showBig }) => {
    // Viewbox size (internal coordinate system). Keep small and stable so existing icons remain compatible.
    const VB_W = 118;
    const VB_H = 81 + (showBig ? 13 : 0);
    // rotate entire sticker to match screenshot (clockwise ~8-12 deg). Tuned to 10deg.
    const defaultStickerRotation = 0; // degrees (small tilt, align with original card)
    const stickerRotation = typeof rotation === 'number' ? rotation : defaultStickerRotation;
    const centerX = VB_W / 2;
    const centerY = VB_H / 2;
    const scaleFactor = Math.min((width || VB_W) / VB_W, (height || VB_H) / VB_H);
    const baseFontLarge = 13; // for 'Pass'
    const baseFontSmall = 13; // for 'Activated!'
    const baseFontFleet = 8; // for fleet number
    const minFontLarge = 12;
    const minFontSmall = 10;
    const minFontFleet = 8;
    const maxFontLarge = 30;
    const maxFontSmall = 26;
    const maxFontFleet = 16;
    const fontLarge = Math.max(minFontLarge, Math.min(maxFontLarge, Math.round(baseFontLarge * scaleFactor)));
    const fontSmall = Math.max(minFontSmall, Math.min(maxFontSmall, Math.round(baseFontSmall * scaleFactor)));
    const fontFleet = Math.max(minFontFleet, Math.min(maxFontFleet, Math.round(baseFontFleet * scaleFactor)));
    const padX = VB_W * 0.03;
    const padY = VB_H * 0.12;
    const rectX = padX;
    const rectY = padY;
    const rectW = VB_W - padX * 2;
    const rectH = VB_H - padY * 2;
    const rectRx = Math.min(14, rectH * 0.22);
    const innerPadX = padX + 1.6;
    const innerPadY = padY + 1.5;
    const innerX = innerPadX;
    const innerY = innerPadY;
    const innerW = VB_W - innerPadX * 2;
    const innerH = VB_H - innerPadY * 2;
    const innerRx = Math.min(12, innerH * 0.2);
    const textStartX = rectX + 10;
    const textStartY = rectY + fontLarge - 2;
    const activatedDy = Math.max(12, Math.round(fontLarge * 0.9));
    const fleetY = textStartY + fontLarge + fontSmall * 0.5 + 18; // a bit of breathing room
    return (
        <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none">
            <G transform={`rotate(${stickerRotation} ${centerX} ${centerY})`}>
                {/* Box sizing fills the viewbox with padding so change in parent width/height scales appropriately. */}
                <Rect
                    x={rectX}
                    y={rectY}
                    width={rectW}
                    height={rectH}
                    rx={rectRx}
                    fill="#B19A58"
                    stroke="white"
                    strokeWidth={3}
                />
                {/* Blue inner rectangle (fills the gold border with inner inset) */}
                <Rect x={innerX} y={innerY} width={innerW} height={innerH} rx={innerRx} fill="#025FE2" />
                {/* Mask follows the blue rect */}
                <Mask
                    id="mask0_5874_120902"
                    maskUnits="userSpaceOnUse"
                    x={innerX}
                    y={innerY}
                    width={innerW}
                    height={innerH}>
                    <Rect x={innerX} y={innerY} width={innerW} height={innerH} rx={innerRx} fill="#D5C07F" />
                </Mask>
                <G mask="url(#mask0_5874_120902)">
                    <Path
                        d="M158.803 19.0962C151.144 0.183674 132.788 -11.3865 110.902 -11.0873C109.583 -11.0737 108.206 -11.0117 106.814 -10.9132C68.6529 -8.21251 56.8424 21.5614 58.2118 40.9101C59.5811 60.2589 75.4671 88.0726 113.637 85.3713C114.55 85.3067 115.514 85.2119 116.659 85.0866C116.659 85.0866 118.185 84.9077 118.332 84.8796C119.312 84.7334 119.8 84.625 119.795 84.5544L115.241 20.2115L107.986 20.7249C107.986 20.7249 97.8551 29.8796 90.3866 34.042L94.2172 41.7211L104.296 36.5231L106.952 74.0477C95.967 73.7349 86.9713 70.1527 80.2151 63.3808C78.3325 61.4844 76.6131 59.3017 75.105 56.8913C69.3167 47.6135 67.9928 36.3181 71.4523 25.9073C74.5607 17.5776 81.3709 10.4129 90.6312 5.75137C95.7298 3.18363 101.623 1.59661 107.678 1.16814C121.63 0.180705 134.714 5.20188 142.67 14.5921C145.78 18.263 148.15 22.7306 149.519 27.4907C152.372 38.4032 150.16 50.1437 143.619 58.8848C141.231 62.0761 138.33 64.8163 134.998 67.0197L134.923 67.0693L140.642 76.9724L140.725 76.9133C159.476 64.7999 167.246 39.9473 158.803 19.0962Z"
                        fill="#E5DE0F"
                    />
                </G>
                {/* Always show 'Pass' and 'Activated!' on two lines and small fleet number (if provided) */}
                <G>
                    {/* "Pass" (large) and "Activated!" (slightly smaller) stacked */}
                    <SvgText x={textStartX} y={textStartY} fill="white" fontWeight="700">
                        <TSpan x={textStartX} dy={10} fontSize={fontLarge} fontWeight="700">
                            Pass
                        </TSpan>
                        <TSpan x={textStartX} dy={activatedDy} fontSize={fontSmall} fontWeight="700">
                            Activated!
                        </TSpan>
                    </SvgText>
                    {fleetNo ? (
                        <SvgText
                            x={textStartX}
                            y={fleetY}
                            fill="white"
                            fontSize={fontFleet}
                            fontWeight="700"
                            letterSpacing={10}>
                            {fleetNo}
                        </SvgText>
                    ) : null}
                </G>
            </G>
        </Svg>
    );
};

export default PassSvgNew;
