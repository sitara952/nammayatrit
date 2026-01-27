import React, { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ArrowLeft from '@/typescript/assets/svg/symbols/ArrowLeft';
import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
// const PEEK = SCREEN_WIDTH * 0.1; // 10% of screen width

interface CarouselProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    style?: ViewStyle;
    progress: Animated.SharedValue<number>;
    onIndexChange?: (index: number) => void;
    scrollEnabled: boolean | undefined;
}

export const CarouselMetroBus = <T,>({
    data,
    renderItem,
    style,
    progress,
    onIndexChange,
    scrollEnabled = true,
}: CarouselProps<T>) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
        scrollX.value = contentOffsetX;

        // Update progress value if provided
        if (progress) {
            const totalWidth = ITEM_WIDTH * (data.length - 1);
            const newProgress = interpolate(contentOffsetX, [0, totalWidth], [0, 1], 'clamp');
            progress.value = withTiming(newProgress, { duration: 100 });
        }
    };

    const AnimatedQRView = (item: T, index: number) => {
        const animatedStyle = useAnimatedStyle(() => {
            const center = index * SCREEN_WIDTH;
            const distance = Math.abs(scrollX.value - center);
            // Clamp distance to SCREEN_WIDTH
            const clamped = Math.min(distance, SCREEN_WIDTH);
            const scale = interpolate(clamped, [0, SCREEN_WIDTH], [1, 0.9], 'clamp');
            return {
                transform: [{ scale }],
            };
        });
        return (
            <Animated.View
                key={index}
                style={[
                    {
                        width: SCREEN_WIDTH,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    animatedStyle,
                ]}>
                {renderItem(item, index)}
            </Animated.View>
        );
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
    };

    // Manual navigation
    const scrollToIndex = (index: number) => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
        }
    };

    return (
        <View style={[styles.container, style]}>
            {data.length > 1 && (
                <>
                    {/* Left Arrow */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="carousel-left-arrow"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            marginTop: -24,
                            zIndex: 2,
                            backgroundColor: 'rgba(255,255,255,0.85)',
                            borderRadius: 24,
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            marginLeft: 25,
                            shadowOffset: { width: 0, height: 2 },
                        }}
                        onPress={() => scrollToIndex(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        activeOpacity={activeIndex === 0 ? 1 : 0.7}>
                        <ArrowLeft />
                    </TouchableOpacity>

                    {/* Right Arrow */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="carousel-right-arrow"
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            marginTop: -24,
                            zIndex: 2,
                            backgroundColor: 'rgba(255,255,255,0.85)',
                            borderRadius: 24,
                            marginRight: 25,
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 2 },
                            transform: [{ scale: 0.65 }],
                        }}
                        onPress={() => scrollToIndex(activeIndex + 1)}
                        disabled={activeIndex === data.length - 1}
                        activeOpacity={activeIndex === data.length - 1 ? 1 : 0.7}>
                        <ArrowRight fill={'#000202'} bold={undefined} />
                    </TouchableOpacity>
                </>
            )}

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={{
                    alignItems: 'center',
                }}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}>
                {data.map((item, index) => {
                    // Animated scale based on visibility
                    return AnimatedQRView(item, index);
                })}
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 1,
        width: '100%',
    },
    paginationItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationLine: {
        height: 4,
        borderRadius: 2,
    },
});
