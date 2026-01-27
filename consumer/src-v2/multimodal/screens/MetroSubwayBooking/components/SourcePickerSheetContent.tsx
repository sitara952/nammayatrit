import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useEffect, useState, useRef, useImperativeHandle, useMemo } from 'react';
import { Keyboard, TextInput, TextInputProps, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { FlatList } from 'react-native-gesture-handler';
import CrossIcon from '../../Search/components/svg/CloseIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SOURCE_METRO_STATION_TOTAL_ITEM_HEIGHT } from '@/typescript/constants/common';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';
import { createStationFuse, searchStations } from '../utils/stationFuzzySearch';

// Item type definition
export type StationItem = {
    id: number;
    name: string;
    code: string;
};

// Transit Card component
const TransitCard = ({
    textInputProps,
    title,
    value,
    onChangeText,
}: {
    textInputProps: TextInputProps;
    title: string;
    value: string;
    onChangeText: (text: string) => void;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Animated.View style={tailwind.style('bg-white min-h-[78px] rounded-[20px]')}>
            <Animated.View style={tailwind.style('pt-[14px] items-center')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-xs leading-[13px] font-areaNormal-extrabold text-[#656565] translate-[0.2px]',
                    )}>
                    {title}
                </Animated.Text>
                <Animated.View style={tailwind.style('flex-row items-center pt-3 w-full')}>
                    <TextInput
                        style={tailwind.style(
                            'flex-1 text-[15px] leading-[19px] font-areaNormal-extrabold text-[#3B3A3C] text-center translate-[0.2px]',
                        )}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...textInputProps}
                        placeholder={
                            !isFocused ? textInputProps.placeholder || userLanguageStrings.Entersourcestation : ''
                        }
                        placeholderTextColor="#969696"
                        numberOfLines={1}
                    />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

interface SourcePickerSheetContentProps {
    stationsList: transportStation[];
    selectedStation: transportStation | null;
    onSelectStation: (station: transportStation) => void;
    _onBlur?: () => void;
    bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
    accessibilityRef: React.RefObject<View | null> | undefined;
}

interface StationsListProps {
    stations: transportStation[];
    selectedStation: transportStation | null;
    onStationSelect: (station: transportStation) => void;
    bottomInset: number;
    selectedColor: string | undefined;
    initialScrollIndex: number | undefined;
}

export const StationsList = React.forwardRef<FlatList<transportStation>, StationsListProps>(
    ({ stations, selectedStation, onStationSelect, bottomInset, selectedColor, initialScrollIndex }, ref) => {
        const configManager = useConfigContext();
        const colors = configManager.get('themeColors');
        const flatListRef = useRef<FlatList<transportStation>>(null);
        const { setAutoClearTimeout } = useAutoClearTimeout();
        useEffect(() => {
            if (typeof initialScrollIndex === 'number' && initialScrollIndex > -1) {
                setAutoClearTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: initialScrollIndex,
                        animated: true,
                        viewPosition: 0, // Align to top
                    });
                }, 500); // Delay to ensure the list has rendered
            }
        }, [initialScrollIndex]);

        // Expose the ref to the parent component, required for scroll to index

        /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
        useImperativeHandle(ref, () => flatListRef.current as FlatList<transportStation>);

        return (
            <FlatList
                ref={flatListRef}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={'on-drag'}
                data={stations}
                getItemLayout={(_, index) => ({
                    length: SOURCE_METRO_STATION_TOTAL_ITEM_HEIGHT,
                    offset: SOURCE_METRO_STATION_TOTAL_ITEM_HEIGHT * index,
                    index,
                })}
                renderItem={({ item, index }) => {
                    const isSelected = item.code === selectedStation?.code;
                    return (
                        <Pressable
                            accessibilityLabel={`Select ${item.name} button`}
                            accessibilityRole="button"
                            testID={`source-station-item-${index}`}
                            onPress={() => onStationSelect(item)}
                            style={({ pressed }) => [
                                tailwind.style(
                                    'rounded-[16px] min-h-[55px] bg-white justify-center items-center px-[16px] mb-3',
                                    isSelected ? selectedColor || `bg-[${colors.Button_for_modes_bg}]` : '',
                                    pressed ? 'bg-[#D6D6D6]' : '',
                                ),
                            ]}>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[15px] leading-[20px] font-areaNormal-extrabold capitalize',
                                    isSelected ? `text-[${colors.Button_for_modes_text}]` : 'text-[#3B3A3C]',
                                )}>
                                {item.name}
                            </Animated.Text>
                        </Pressable>
                    );
                }}
                windowSize={4}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                contentContainerStyle={tailwind.style(`pb-[${bottomInset ? bottomInset + 320 : 45}px]`)}
                keyExtractor={item => item.code?.toString() ?? item.name}
                showsVerticalScrollIndicator={false}
                style={{ marginHorizontal: 16 }}
            />
        );
    },
);

export const SourcePickerSheetContent = ({
    stationsList,
    selectedStation,
    onSelectStation,
    bottomSheetRef,
    accessibilityRef,
}: SourcePickerSheetContentProps) => {
    const { bottom } = useSafeAreaInsets();
    const [searchText, setSearchText] = useState('');
    const [filteredStations, setFilteredStations] = useState<transportStation[]>(stationsList);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const flatListRef = useRef<FlatList<transportStation>>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fuse = useMemo(() => {
        return createStationFuse(stationsList);
    }, [stationsList]);

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
    };

    const handleStationSelect = (station: transportStation) => {
        onSelectStation(station);
        Keyboard.dismiss();
        console.info('Source station selected:', station);

        setTimeout(() => {
            bottomSheetRef?.current?.dismiss();
        }, 100);
    };

    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredStations(stationsList);
        } else {
            const filtered = searchStations(fuse, searchText);
            setFilteredStations(filtered);
        }
    }, [searchText, stationsList, fuse]);

    useEffect(() => {
        if (selectedStation) {
            const index = filteredStations.findIndex(station => station.code === selectedStation.code);
            if (index !== -1) {
                timeoutRef.current = setTimeout(() => {
                    try {
                        flatListRef.current?.scrollToIndex({
                            index,
                            animated: true,
                        });
                    } catch (error) {
                        console.warn('Failed to scroll to station:', error);
                    }
                }, 800);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [selectedStation, filteredStations]);

    return (
        <BottomSheetView>
            <View ref={accessibilityRef}>
                <Pressable
                    accessibilityLabel="Close button"
                    accessibilityRole="button"
                    onPress={() => {
                        Keyboard.dismiss();
                        bottomSheetRef?.current?.dismiss();
                    }}
                    testID="metro-subway-close-source-picker"
                    style={tailwind.style('z-99 ')}>
                    <Animated.View
                        style={tailwind.style(
                            'absolute left-4 top-4 bg-[#E6E6E6] w-[37px] h-9 justify-center items-center rounded-full ',
                        )}>
                        <CrossIcon />
                    </Animated.View>
                </Pressable>
                <Animated.View style={tailwind.style('pb-4 pt-6 mx-4 bg-[#F4F4F4] rounded-t-[20px]')}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] text-center')}>
                        {userLanguageStrings.EditSource}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('pt-6')}>
                        <TransitCard
                            title={userLanguageStrings.Sourcestop}
                            value={searchText}
                            onChangeText={handleSearchTextChange}
                            textInputProps={{
                                placeholder: userLanguageStrings.Entersourcestation,
                                autoFocus: false,
                            }}
                        />
                    </Animated.View>
                </Animated.View>
                <StationsList
                    ref={flatListRef}
                    stations={filteredStations}
                    selectedStation={selectedStation}
                    onStationSelect={handleStationSelect}
                    bottomInset={bottom}
                    selectedColor={undefined}
                    initialScrollIndex={undefined}
                />
            </View>
        </BottomSheetView>
    );
};
