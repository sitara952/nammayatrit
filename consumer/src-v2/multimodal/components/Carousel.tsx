import React, { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
const PEEK = SCREEN_WIDTH * 0.1; // 10% of screen width
const DOT_SIZE = 10;
const ACTIVE_WIDTH = 56;
const INACTIVE_WIDTH = DOT_SIZE;
const ACTIVE_COLOR = '#5c5858';
const INACTIVE_COLOR = 'rgb(209, 213, 219)';

interface CarouselProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    style?: ViewStyle;
    progress?: Animated.SharedValue<number>;
}

const PaginationDot = ({ isActive, index }: { isActive: boolean; index: number }) => {
    const width = useSharedValue(isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH);
    const color = useSharedValue(isActive ? 1 : 0);

    React.useEffect(() => {
        width.value = withTiming(isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH, { duration: 350 });
        color.value = withTiming(isActive ? 1 : 0, { duration: 350 });
    }, [isActive]);

    const animatedStyles = useAnimatedStyle(() => ({
        width: width.value,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: interpolateColor(color.value, [0, 1], [INACTIVE_COLOR, ACTIVE_COLOR]),
        marginHorizontal: 2,
        overflow: 'hidden',
        position: 'relative',
        borderColor: INACTIVE_COLOR,
        borderWidth: 1,
    }));

    return <Animated.View key={index} style={animatedStyles} />;
};

const CarouselItem = <T,>({
    item,
    index,
    scrollX,
    renderItem,
}: {
    item: T;
    index: number;
    scrollX: Animated.SharedValue<number>;
    renderItem: (item: T, index: number) => React.ReactNode;
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const center = index * ITEM_WIDTH;
        const distance = Math.abs(scrollX.value - center);
        const clamped = Math.min(distance, ITEM_WIDTH);
        const scale = interpolate(clamped, [0, ITEM_WIDTH], [index === 0 ? 1 : 1.1, 0.9], 'clamp');
        return {
            transform: [{ scale }],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    width: ITEM_WIDTH,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: index === 1 ? -200 : 0,
                },
                animatedStyle,
            ]}>
            {renderItem(item, index)}
        </Animated.View>
    );
};

export const Carousel = <T,>({ data, renderItem, style, progress }: CarouselProps<T>) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
        scrollX.value = contentOffsetX;

        // Update progress value if provided
        if (progress) {
            const totalWidth = ITEM_WIDTH * (data.length - 1);
            const newProgress = interpolate(contentOffsetX, [0, totalWidth], [0, 1], 'clamp');
            progress.value = withTiming(newProgress, { duration: 100 });
        }
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);
        setActiveIndex(newIndex);
    };

    const renderPagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {data.map((_, index) => (
                    <PaginationDot key={index} isActive={index === activeIndex} index={index} />
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, style]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: PEEK / 2,
                    alignItems: 'center',
                }}>
                {data.map((item, index) => (
                    <CarouselItem key={index} item={item} index={index} scrollX={scrollX} renderItem={renderItem} />
                ))}
            </ScrollView>
            {renderPagination()}
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
