import React from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import TriangleArrowUp from '@/src-v2/assets/svg/TriangleArrowUp';
import { Pressable } from '@/src-v2/primitives/Pressable';

interface BusSelectorItemProps {
    busNumber: string;
    index: number;
    selectedIndex: number;
    onChangeBusPress: (index: number) => void;
    serviceTierName: string | undefined;
}

const BusSelectorItem: React.FC<BusSelectorItemProps> = ({ busNumber, index, selectedIndex, onChangeBusPress }) => {
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        const isSelected = index === selectedIndex;
        return {
            backgroundColor: withTiming(isSelected ? '#3B3A3C' : '#FFFFFF', { duration: 300 }),
        };
    }, [selectedIndex, index]);

    const animatedTextStyle = useAnimatedStyle(() => {
        const isSelected = index === selectedIndex;
        return {
            color: withTiming(isSelected ? '#FFFFFF' : '#3B3A3C', { duration: 300 }),
        };
    }, [selectedIndex, index]);

    return (
        <>
            <Pressable
                accessibilityRole="button"
                key={busNumber}
                accessibilityLabel={`Select bus ${busNumber} button`}
                testID={`select-bus-button-${busNumber}`}
                onPress={() => onChangeBusPress(index)}>
                <Animated.View style={tailwind.style('flex-col items-center gap-[5px] pb-4')}>
                    <Animated.View
                        style={[
                            tailwind.style(
                                'h-[45px] min-w-[75px] px-[12px] flex-row items-center rounded-[10px] border border-[#F1F2F2] justify-center',
                            ),
                            animatedBackgroundStyle,
                        ]}>
                        <Animated.Text
                            style={[tailwind.style('text-[15px] font-areaNormal-extrabold'), animatedTextStyle]}>
                            {busNumber}
                            {/* {serviceTierName ? `- ${getTransitMetaInfoLabel(serviceTierName, userLanguageStrings)}` : ''} */}
                        </Animated.Text>
                    </Animated.View>
                    {index === selectedIndex && (
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style('absolute bottom-0 left-1/2 -translate-x-1.5 z-10 size-3')}>
                            <TriangleArrowUp fill="#3B3A3C" />
                        </Animated.View>
                    )}
                </Animated.View>
            </Pressable>
        </>
    );
};

interface BusItem {
    busNumber: string;
    serviceTierName: string | undefined;
    onChangeBusPress: () => void;
}

interface BusSelectorListProps {
    busList: BusItem[];
    selectedIndex: number | null;
    selectedBusNumber: string | null;
    extendedContentContainerStyle?: string;
}

export const BusSelectorList: React.FC<BusSelectorListProps> = ({
    busList,
    extendedContentContainerStyle = '',
    selectedIndex,
    selectedBusNumber,
}) => {
    // Resolve selectedIndex from selectedBusNumber if provided
    const resolvedSelectedIndex =
        typeof selectedBusNumber === 'string'
            ? busList.findIndex(bus => bus.busNumber === selectedBusNumber)
            : (selectedIndex ?? 0);

    const renderItem = React.useCallback(
        ({ item: bus, index }: { item: BusItem; index: number }) => (
            <BusSelectorItem
                key={index}
                busNumber={bus.busNumber}
                serviceTierName={bus.serviceTierName}
                index={index}
                selectedIndex={resolvedSelectedIndex}
                onChangeBusPress={() => bus.onChangeBusPress()}
            />
        ),
        [resolvedSelectedIndex],
    );

    const keyExtractor = React.useCallback((_: BusItem, index: number) => index.toString(), []);

    return (
        <Animated.View style={tailwind.style('w-full')}>
            <FlatList
                data={busList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tailwind.style(`items-center gap-[10px] ${extendedContentContainerStyle}`)}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
            />
        </Animated.View>
    );
};
