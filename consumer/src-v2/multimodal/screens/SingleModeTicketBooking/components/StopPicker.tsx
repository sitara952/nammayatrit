import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FlatList, FlatListProps, LayoutRectangle, Text, useWindowDimensions } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { tailwind } from '../../../../tailwind-theme/tailwind';

const AnimatedFlatList = Animated.createAnimatedComponent<FlatListProps<StopPickerItem>>(FlatList);

type ScrollState = 'unknown' | 'idle' | 'scrolling';

type PointMeasurement = LayoutRectangle & { middleX: number };
type PickerItemProps = {
    item: StopPickerItem;
    index: number;
    scrollX: SharedValue<number>;
    activeIndex: SharedValue<number>;
    scrollState: SharedValue<ScrollState>;
    listOffset: number;
    measurements: PointMeasurement | undefined;
};

const PickerItem = memo(function PickerItem({
    item,
    index,
    scrollX,
    measurements,
    activeIndex,
    scrollState,
}: PickerItemProps) {
    const stylez = useAnimatedStyle(() => {
        if (scrollState.value !== 'scrolling' || !measurements) {
            return {
                opacity: withTiming(activeIndex.value === index ? 1 : 0.4),
            };
        }

        if (!measurements) {
            return { opacity: 0 };
        }
        return {
            opacity: interpolate(
                scrollX.value,
                [
                    measurements.middleX - measurements.width / 2 - _snapThreshold,
                    measurements.middleX,
                    measurements.middleX + measurements.width / 2 + _snapThreshold,
                ],
                [0.4, 1, 0.4],
                Extrapolation.CLAMP,
            ),
        };
    });
    return (
        <Animated.View style={stylez}>
            <Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-center text-[#F5F5F5] capitalize')}>
                {item.name}
            </Text>
        </Animated.View>
    );
});

export type StopPickerItem = {
    id: number;
    name: string;
    code: string | undefined;
};

type PickerProps = {
    data: StopPickerItem[];
    onChange: (item: StopPickerItem) => void;
    initialSelectedItem: StopPickerItem;
};

const _snapThreshold = 42;

export const StopPicker = memo(({ data, onChange, initialSelectedItem }: PickerProps) => {
    const { width } = useWindowDimensions();
    const [done, setDone] = useState(false);
    const positions = useRef(new Map<number, PointMeasurement>());
    const [listOffset, setListOffset] = useState(width / 2);
    const lastSelectedIndex = useRef<number | null>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const isInitialRender = useRef(true);

    const scrollOffsets = useMemo(() => {
        if (!done || !data.length) return;
        // We are sorting and mapping the values to get the middleX of each item
        // this is needed for the FlatList snap offsets.
        return [...positions.current.values()]
            .sort((a, b) => (a.middleX > b.middleX ? 1 : -1))
            .map(position => position.middleX - listOffset);
    }, [done, listOffset, data.length]);

    const flatListRef = useRef<FlatList>(null);

    const findSelectedItemIndex = useMemo(() => {
        if (!data.length || !initialSelectedItem) return 0;
        return data.findIndex(item => item.id === initialSelectedItem.id);
    }, [data, initialSelectedItem]);

    const initialIndex = findSelectedItemIndex !== -1 ? findSelectedItemIndex : 0;

    // Animations
    const scrollX = useSharedValue(0);
    const scrollState = useSharedValue<ScrollState>('unknown');
    const activeIndex = useSharedValue(initialIndex);

    // Ensure initial value is selected

    const debouncedOnChange = useCallback(
        (value: number) => {
            if (lastSelectedIndex.current === value) return;
            lastSelectedIndex.current = value;

            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            debounceTimeout.current = setTimeout(() => {
                if (value >= 0 && value < data.length && data[value]) {
                    onChange(data[value]);
                }
            }, 150); // 150ms debounce
        },
        [data, onChange],
    );

    useEffect(() => {
        if (!data.length) return;

        activeIndex.value = initialIndex;

        // Add null check before calling onChange
        if (initialSelectedItem) {
            debouncedOnChange(initialIndex);
        } else if (data.length > 0) {
            // Ensure we're passing a defined item

            debouncedOnChange(0);
        }
    }, [initialSelectedItem?.id, initialIndex, data.length]);

    useDerivedValue(() => {
        if (!scrollOffsets?.length) return;

        const activeItemIndex = scrollOffsets.findIndex(offset => {
            return scrollX.value < offset + _snapThreshold && scrollX.value > offset - _snapThreshold;
        });
        if (activeIndex.value !== activeItemIndex && activeItemIndex !== -1) {
            activeIndex.value = activeItemIndex ?? 0;
            runOnJS(debouncedOnChange)(activeIndex.value);
        }
    });

    useEffect(() => {
        if (!done || !scrollOffsets?.length) return;

        const scrollToIndex = Math.min(initialIndex, data.length - 1);
        const offset = scrollOffsets[scrollToIndex] ?? 0;

        if (isInitialRender.current) {
            flatListRef.current?.scrollToOffset({
                offset,
                animated: false,
            });
            isInitialRender.current = false;
        }

        const timer = setTimeout(() => {
            scrollState.value = 'idle';
            // Set the active index again to ensure it's reflected in the UI
            activeIndex.value = initialIndex;
            // Initial timer to show the items, before they "dissappear". This is
            // useful for the user to see the items before they are hidden, such
            // that they know they can scroll/swipe left or right
        }, 100);

        return () => {
            clearTimeout(timer);
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [done, scrollOffsets, initialIndex, data.length]);

    const onScroll = useAnimatedScrollHandler({
        onMomentumEnd: () => {
            scrollState.value = 'idle';
        },
        onScroll: e => {
            scrollState.value = 'scrolling';
            scrollX.value = e.contentOffset.x;
        },
    });

    return (
        <AnimatedFlatList
            bounces={false}
            ref={flatListRef}
            onScroll={onScroll}
            horizontal
            data={data}
            snapToOffsets={scrollOffsets}
            style={{
                flexGrow: 0,
            }}
            onLayout={e => {
                setListOffset(e.nativeEvent.layout.width / 2);
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                columnGap: _snapThreshold,
                paddingHorizontal: listOffset,
                paddingVertical: 12,
                marginTop: 12,
            }}
            CellRendererComponent={({ children, index, ...props }) => {
                return (
                    <Animated.View
                        {...props}
                        onLayout={e => {
                            const x = Math.floor(e.nativeEvent.layout.x);
                            const itemWidth = Math.floor(e.nativeEvent.layout.width);
                            positions.current.set(index, {
                                x,
                                middleX: x + itemWidth / 2,
                                y: Math.floor(e.nativeEvent.layout.y),
                                width: itemWidth,
                                height: Math.floor(e.nativeEvent.layout.height),
                            });
                            if (positions.current.size === data.length) {
                                setDone(true);
                            }
                        }}>
                        {children}
                    </Animated.View>
                );
            }}
            decelerationRate="fast"
            keyExtractor={item => String(item.id)}
            renderItem={({ item, index }) => (
                <PickerItem
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    activeIndex={activeIndex}
                    scrollState={scrollState}
                    listOffset={listOffset}
                    measurements={positions.current.get(index)}
                />
            )}
        />
    );
});
