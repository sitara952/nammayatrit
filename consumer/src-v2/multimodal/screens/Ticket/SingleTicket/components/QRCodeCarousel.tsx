import React, { useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { QrCodeView } from '../../../PaymentStatus/QrCodeView';
import { ScreenshotGuard } from '@/src-v2/components/ScreenShotGuard';
import { MultiQrCodeViewProps } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QRCodeCarouselProps extends MultiQrCodeViewProps {
    onQrPress?: (index: number) => void;
}

export const QRCodeCarousel: React.FC<QRCodeCarouselProps> = ({ qrCodes, size = 175, onQrPress }) => {
    const progress = useSharedValue(0);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Calculate height for carousel (QR code size + padding)
    const carouselHeight = size + 40;

    const _handleQrPress = useCallback(
        (index: number) => {
            onQrPress?.(index);
        },
        [onQrPress],
    );

    const renderItem = useCallback(
        ({ item }: { item: string }) => {
            return (
                <View
                    style={[
                        tailwind.style('flex-1 justify-center items-center'),
                        {
                            width: SCREEN_WIDTH,
                            height: carouselHeight,
                        },
                    ]}>
                    <ScreenshotGuard>
                        <QrCodeView jsonString={item} size={size} />
                    </ScreenshotGuard>
                </View>
            );
        },
        [size, carouselHeight],
    );

    const handleSnapToItem = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Safety check: return null if no QR codes
    if (!qrCodes || qrCodes.length === 0) {
        return null;
    }

    const hasMultipleQRCodes = qrCodes.length > 1;

    return (
        <Animated.View style={tailwind.style('items-center w-full')}>
            {/* QR Code Carousel */}
            <Carousel
                loop={false}
                width={SCREEN_WIDTH}
                height={carouselHeight}
                data={qrCodes}
                renderItem={renderItem}
                onSnapToItem={handleSnapToItem}
                onProgressChange={progress}
                pagingEnabled={hasMultipleQRCodes}
                enabled={hasMultipleQRCodes}
                testID="qr-carousel-scroll-view"
            />

            {/* Pagination Indicators */}
            {qrCodes.length > 1 && (
                <Animated.View
                    style={tailwind.style('flex-row justify-center items-center mt-4 gap-2')}
                    testID="qr-carousel-pagination">
                    <Pagination.Basic
                        progress={progress}
                        data={qrCodes}
                        containerStyle={tailwind.style('flex-row gap-2')}
                        dotStyle={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#CACACA',
                        }}
                        activeDotStyle={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#047AEA',
                        }}
                    />
                </Animated.View>
            )}

            {/* Counter Text */}
            {qrCodes.length > 1 && (
                <Animated.View style={tailwind.style('mt-2')}>
                    <Animated.Text
                        style={tailwind.style('text-[12px] font-areaNormal-medium text-[#7E7E7E] text-center')}
                        accessible={true}
                        accessibilityLabel={`QR code ${currentIndex + 1} of ${qrCodes.length}`}>
                        {currentIndex + 1} of {qrCodes.length}
                    </Animated.Text>
                </Animated.View>
            )}
        </Animated.View>
    );
};
