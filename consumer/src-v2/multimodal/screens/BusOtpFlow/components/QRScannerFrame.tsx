import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

interface CornerBracketProps {
    style: ViewStyle;
}

export const CornerBracket = ({ style }: CornerBracketProps) => (
    <View
        style={[
            {
                width: 40,
                height: 40,
                borderColor: '#FFFFFF',
                borderWidth: 3,
            },
            style,
        ]}
    />
);

interface QRScannerFrameProps {
    translateY: number;
}

export const QRScannerFrame = ({ translateY }: QRScannerFrameProps) => {
    const FRAME_SIZE = 260;
    const translateX = (SCREEN_WIDTH - FRAME_SIZE) / 2;

    return (
        <View style={[StyleSheet.absoluteFillObject]}>
            <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH}>
                <Defs>
                    <Mask id="hole">
                        <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
                        <Rect
                            x={translateX}
                            y={translateY}
                            width={FRAME_SIZE}
                            height={FRAME_SIZE}
                            fill="black"
                            rx={30}
                        />
                    </Mask>
                </Defs>
                <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="rgba(0, 0, 0, 0.7)" mask="url(#hole)" />
            </Svg>

            {/* Scanner Frame Corners */}
            <View
                style={[
                    {
                        position: 'absolute',
                        top: translateY,
                        left: translateX,
                        width: FRAME_SIZE,
                        height: FRAME_SIZE,
                        padding: 10,
                    },
                ]}>
                {/* Top Left */}
                <CornerBracket
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        borderRightWidth: 0,
                        borderBottomWidth: 0,
                        borderTopLeftRadius: 20,
                    }}
                />
                {/* Top Right */}
                <CornerBracket
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        borderLeftWidth: 0,
                        borderBottomWidth: 0,
                        borderTopRightRadius: 20,
                    }}
                />
                {/* Bottom Left */}
                <CornerBracket
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        borderRightWidth: 0,
                        borderTopWidth: 0,
                        borderBottomLeftRadius: 20,
                    }}
                />
                {/* Bottom Right */}
                <CornerBracket
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        borderLeftWidth: 0,
                        borderTopWidth: 0,
                        borderBottomRightRadius: 20,
                    }}
                />
            </View>
        </View>
    );
};
