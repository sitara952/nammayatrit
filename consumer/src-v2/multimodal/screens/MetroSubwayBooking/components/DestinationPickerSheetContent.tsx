import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import { Keyboard, TextInputProps, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';

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
                        placeholder={userLanguageStrings.Enterdestinationstop}
                        placeholderTextColor="#969696"
                        numberOfLines={1}
                        style={tailwind.style(
                            'flex-1 text-[15px] leading-[19px] font-areaNormal-extrabold text-[#3B3A3C] text-center translate-[0.2px]',
                        )}
                        value={value}
                        onChangeText={onChangeText}
                        {...textInputProps}
                    />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

interface DestinationPickerSheetContentProps {
    stationsList: transportStation[];
    selectedStation: transportStation | null;
    onSelectStation: (station: transportStation) => void;
    bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
    onClose?: () => void;
    sourceStation?: transportStation | null; // Optional source station to exclude from the list
    shouldRenderHeader?: boolean;
    accessibilityRef: React.RefObject<View> | undefined;
}

export const DestinationPickerSheetContent = ({
    stationsList,
    selectedStation,
    onSelectStation,
    bottomSheetRef,
    onClose,
    sourceStation,
    shouldRenderHeader = true,
    accessibilityRef,
}: DestinationPickerSheetContentProps) => {
    const { bottom } = useSafeAreaInsets();
    const [searchText, setSearchText] = useState('');
    const [filteredStations, setFilteredStations] = useState<transportStation[]>(stationsList);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
    };

    const handleStationSelect = (station: transportStation) => {
        // Update the parent component's state first
        onSelectStation(station);
        Keyboard.dismiss();
        // Log for debugging
        console.info('Destination station selected:', station);

        // Allow time for state to update before closing the sheet
        setTimeout(() => {
            // Use onClose if provided, otherwise fall back to bottomSheetRef
            if (onClose) {
                onClose();
            } else if (bottomSheetRef?.current) {
                bottomSheetRef.current.dismiss();
            }
        }, 100);
    };

    // Filter stations whenever searchText changes or source station changes
    useEffect(() => {
        // Start with all stations except the source station (if it exists)
        const filtered = sourceStation
            ? stationsList.filter(station => station.code !== sourceStation.code)
            : stationsList;

        // Then filter based on search text
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            const filtered2 = filtered.filter(
                station =>
                    station.name.toLowerCase().includes(searchLower) ||
                    station.code.toLowerCase().includes(searchLower),
            );
            setFilteredStations(filtered2);
        } else {
            setFilteredStations(filtered);
        }
    }, [searchText, stationsList, sourceStation]);

    return (
        <View ref={accessibilityRef}>
            <Animated.View style={tailwind.style('pb-4 mx-4 bg-[#F4F4F4] rounded-t-[20px]')}>
                {shouldRenderHeader ? (
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] text-center pt-6')}>
                        {userLanguageStrings.EditDestination}
                    </Animated.Text>
                ) : null}
                <Animated.View style={tailwind.style('pt-6')}>
                    <TransitCard
                        title={userLanguageStrings.Destinationstation}
                        value={searchText}
                        onChangeText={handleSearchTextChange}
                        textInputProps={{
                            placeholder: userLanguageStrings.EnterDestinationStation,
                            autoFocus: true,
                        }}
                    />
                </Animated.View>
            </Animated.View>
            <BottomSheetFlatList
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={'on-drag'}
                data={filteredStations}
                renderItem={({ item, index }) => {
                    const isSelected = item.code === selectedStation?.code;
                    return (
                        <Pressable
                            accessibilityLabel={`Select ${item.name} button`}
                            accessibilityRole="button"
                            testID={`destination-station-item-${index}`}
                            onPress={() => handleStationSelect(item)}
                            style={({ pressed }: { pressed: boolean }) => [
                                tailwind.style(
                                    'rounded-[16px] min-h-[55px] bg-white justify-center items-center px-2 mb-3',
                                    isSelected ? `bg-[${colors.Button_for_modes_bg}]` : '',
                                    pressed ? 'bg-[#D6D6D6]' : '',
                                ),
                            ]}>
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[15px] leading-[16px] font-areaNormal-extrabold capitalize',
                                    isSelected ? `text-[${colors.Button_for_modes_text}]` : 'text-[#3B3A3C]',
                                )}>
                                {item.name}
                            </Animated.Text>
                        </Pressable>
                    );
                }}
                contentContainerStyle={tailwind.style(`pb-[${bottom ? bottom + 200 : 24 + 200}px]`)}
                keyExtractor={item => item.code?.toString() ?? item.name}
                showsVerticalScrollIndicator={false}
                style={{ marginHorizontal: 16 }}
            />
        </View>
    );
};
