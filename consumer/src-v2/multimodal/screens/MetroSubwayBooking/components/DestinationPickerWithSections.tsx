import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { BottomSheetModal, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Keyboard, StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOut,
    interpolateColor,
    LinearTransition,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { DESTINATION_METRO_STATION_TOTAL_ITEM_HEIGHT } from '@/typescript/constants/common';
import { ScrollView } from 'react-native-gesture-handler';
import { isUndefined } from 'lodash';
import {
    createStationWithSectionFuse,
    searchStationsWithSection,
    StationWithSection,
} from '../utils/stationFuzzySearch';

const ToggleBusRoute = () => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.216 6.9866L14.2118 2.98242L13.1512 4.04308L16.114 7.00589H5.10571V8.50589H16.1105L13.1512 11.4653L14.2118 12.5259L18.216 8.52174C18.642 8.09576 18.642 7.41258 18.216 6.9866ZM7.88856 15.495H18.8945V16.995H7.88822L10.8495 19.9562L9.78881 21.0169L5.78464 17.0127C5.35866 16.5868 5.35866 15.9036 5.78464 15.4776L9.78881 11.4734L10.8495 12.5341L7.88856 15.495Z"
                fill={'#016ACD'}
            />
        </Svg>
    );
};

/**
 * SVG icon component for edit functionality
 */
const EditIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.47645 12.2343C2.28855 12.2343 2.10065 12.1621 1.96334 12.0248C1.80435 11.8658 1.73208 11.6562 1.75376 11.4321L2.06452 8.59923C2.0862 8.43301 2.15847 8.28125 2.2741 8.16562L8.25069 2.18903C8.83606 1.60366 9.79 1.60366 10.3754 2.18903L11.7991 3.61272C12.0809 3.89456 12.2399 4.27036 12.2399 4.67506C12.2399 5.07976 12.0809 5.45556 11.7991 5.73741L5.82247 11.7068C5.69961 11.8224 5.54785 11.9019 5.38886 11.9163L2.55594 12.2271H2.47645V12.2343ZM3.13409 8.83772L2.88838 11.0997L5.15037 10.854L9.17647 6.82296L7.16019 4.80667L3.13409 8.83772ZM11.033 4.96413L9.94252 6.05597L7.92624 4.03968L9.01673 2.94785C9.18295 2.78163 9.45034 2.78163 9.60933 2.94785L11.033 4.37153C11.1125 4.45103 11.1559 4.5522 11.1559 4.66783C11.1559 4.78346 11.1125 4.88464 11.033 4.96413ZM8.59766 12.2417V11.1576L12.2491 11.1582V12.2422L8.59766 12.2417Z"
            fill="#656565"
        />
    </Svg>
);

const NoToggleBusRoute = () => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.7064 11.152L15.3395 5.78516L14.2789 6.84582L18.6857 11.2526H3.31519V12.7526H18.681L14.2789 17.1547L15.3395 18.2154L20.7064 12.8486C21.1776 12.3773 21.1776 11.6232 20.7064 11.152ZM19.4001 12.0335L19.4333 12.0003L19.4001 11.9671V12.0335Z"
                fill="#0356CA"
            />
        </Svg>
    );
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
    const inputRef = useRef<TextInput>(null);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        if (value) {
            inputRef.current?.setSelection(0, value.length);
        }
    }, [value]);

    return (
        <Animated.View style={tailwind.style('bg-white min-h-[78px] rounded-[20px]')}>
            <Animated.View style={tailwind.style('pt-[14px] items-center')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-xs leading-[13px] font-areaNormal-extrabold text-[#656565] translate-[0.2px]',
                    )}>
                    {title}
                </Animated.Text>
                <Animated.View style={tailwind.style('flex-row justify-center items-center pt-3 w-full')}>
                    <Animated.View style={tailwind.style('flex-row justify-center items-center flex-1')}>
                        {!isFocused && (
                            <Animated.View style={tailwind.style('pr-2')}>
                                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <Path
                                        d="M14 12.9423L11.5652 10.5075C12.4433 9.39986 12.9722 8.00285 12.9722 6.4861C12.9722 2.91376 10.0584 0 6.4861 0C2.91376 0 0 2.91376 0 6.4861C0 10.0584 2.91376 12.9722 6.4861 12.9722C8.00285 12.9722 9.39986 12.4433 10.5075 11.5652L12.9423 14L14 12.9423ZM1.49679 6.4861C1.49679 3.732 3.732 1.49679 6.4861 1.49679C9.2402 1.49679 11.4754 3.732 11.4754 6.4861C11.4754 9.2402 9.2402 11.4754 6.4861 11.4754C3.732 11.4754 1.49679 9.2402 1.49679 6.4861Z"
                                        fill="#7E7E7E"
                                    />
                                </Svg>
                            </Animated.View>
                        )}
                        <TextInput
                            ref={inputRef}
                            style={tailwind.style(
                                'text-[15px] leading-[19px] font-areaNormal-extrabold text-[#3B3A3C] text-center translate-[0.2px]',
                            )}
                            value={value}
                            onChangeText={onChangeText}
                            onFocus={handleFocus}
                            onBlur={() => setIsFocused(false)}
                            {...textInputProps}
                            placeholder={
                                !isFocused ? textInputProps.placeholder || userLanguageStrings.Enterdestinationstop : ''
                            }
                            placeholderTextColor="#969696"
                            numberOfLines={1}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export enum StationType {
    FrequentlyVisitedDestinations = 'Frequently Visited Destinations',
    Towards = 'Towards',
    Other = 'Other',
}

export interface StationSection {
    title: string;
    stations: transportStation[];
    routeCode: string | undefined;
    type: StationType;
}

interface DestinationPickerWithSectionsProps {
    stationSections: StationSection[];
    selectedStation: transportStation | null;
    onSelectStation: (station: transportStation, isExpanded: boolean, routeCode: string | undefined) => void;
    bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
    onClose?: () => void;
    title: string;
    isRouteToggleEnabled: boolean;
    sourceStation?: transportStation | null; // Optional source station to exclude from the list
    handleRouteToggle?: () => void;
    accessibilityRef: React.RefObject<View | null> | undefined;
    showSearchBar?: boolean;
    initialExpanded?: boolean;
    shouldCollapseAfterSelect?: boolean;
    onSwitchOrSelectRoute?: () => void;
    otherContentHeight?: number;
    routeStartStation?: string;
    showRouteToggle?: boolean;
    searchInputStyle?: StyleProp<ViewStyle>;
}

export const DestinationPickerWithSections = ({
    stationSections,
    selectedStation,
    onSelectStation,
    bottomSheetRef,
    onClose,
    sourceStation,
    isRouteToggleEnabled,
    handleRouteToggle,
    accessibilityRef,
    title,
    showSearchBar = true,
    initialExpanded = true,
    shouldCollapseAfterSelect = false,
    onSwitchOrSelectRoute,
    otherContentHeight = 0,
    routeStartStation,
    showRouteToggle = true,
    searchInputStyle,
}: DestinationPickerWithSectionsProps) => {
    const { bottom, top } = useSafeAreaInsets();
    const [searchText, setSearchText] = useState('');
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const [filteredSections, setFilteredSections] = useState<StationSection[]>(stationSections || []);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scrollRef = useRef<ScrollView>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldScroll, setShouldScroll] = useState(true);

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
    };

    useEffect(() => {
        setIsExpanded(initialExpanded);
    }, [initialExpanded]);

    const fuse = useMemo(() => {
        if (!stationSections || stationSections.length === 0) {
            return null;
        }

        const allStations: StationWithSection[] = stationSections.flatMap(section =>
            section.stations.map(station => ({
                ...station,
                sectionTitle: section.title,
                sectionRouteCode: section.routeCode,
                sectionType: section.type,
            })),
        );

        return createStationWithSectionFuse(allStations);
    }, [stationSections]);

    const handleStationSelect = (station: transportStation, routeCode: string | undefined) => {
        // Update the parent component's state first
        onSelectStation(station, isExpanded, routeCode);
        Keyboard.dismiss();
        if (shouldCollapseAfterSelect) {
            setIsExpanded(false);
            setShouldScroll(true);
        }

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

    useEffect(() => {
        if (!stationSections || stationSections.length === 0) {
            setFilteredSections([]);
            return;
        }

        if (!searchText.trim()) {
            const newFilteredSections = stationSections.map(section => ({
                ...section,
                stations: sourceStation
                    ? section.stations.filter(station => station.code !== sourceStation.code)
                    : section.stations,
            }));
            setFilteredSections(newFilteredSections);
            return;
        }

        if (!fuse) {
            setFilteredSections([]);
            return;
        }

        const searchResults = searchStationsWithSection(fuse, searchText);
        const filteredResults = sourceStation
            ? searchResults.filter(station => station.code !== sourceStation.code)
            : searchResults;

        const stationsBySection = filteredResults.reduce<
            Record<string, { stations: transportStation[]; bestScore: number }>
        >((acc, station) => {
            const sectionTitle = station.sectionTitle;
            const existing = acc[sectionTitle] || { stations: [], bestScore: 1 };
            return {
                ...acc,
                [sectionTitle]: {
                    stations: [...existing.stations, station],
                    bestScore: Math.min(existing.bestScore, station.searchScore),
                },
            };
        }, {});

        const newFilteredSections = stationSections
            .map(originalSection => {
                const matchedData = stationsBySection[originalSection.title];
                if (!matchedData || matchedData.stations.length === 0) {
                    return null;
                }
                return {
                    ...originalSection,
                    stations: matchedData.stations,
                    bestScore: matchedData.bestScore,
                };
            })
            .filter((section): section is StationSection & { bestScore: number } => section !== null)
            .sort((a, b) => a.bestScore - b.bestScore);

        setFilteredSections(newFilteredSections);
    }, [searchText, stationSections, sourceStation, fuse]);

    const frequentVisitDestinationsSection = filteredSections.find(s =>
        s.title.includes('Frequently Visited Destinations'),
    );
    const towardsSections = filteredSections.filter(s => s.title.includes('towards'));
    const otherSection = filteredSections.find(
        s => !s.title.includes('towards') && !s.title.includes('Frequently Visited Destinations'),
    );

    useEffect(() => {
        if (isExpanded && selectedStation && filteredSections.length > 0) {
            const sectionContainingStation = filteredSections.find(s =>
                s.stations.some(st => st.code === selectedStation.code),
            );
            if (!sectionContainingStation) return;

            const stationIndexInSection = sectionContainingStation.stations.findIndex(
                s => s.code === selectedStation.code,
            );

            const offsetInCurrentSection =
                (sectionContainingStation.title ? 32 : 0) +
                stationIndexInSection * DESTINATION_METRO_STATION_TOTAL_ITEM_HEIGHT;

            // Calculate preceding offset based on interleaved layout
            const sectionIndex = towardsSections.findIndex(s => s.title === sectionContainingStation.title);

            const precedingOffset =
                sectionIndex !== -1
                    ? // Offset for sections before the target
                      Math.floor(sectionIndex / 2) * 54 +
                      towardsSections
                          .slice(0, sectionIndex)
                          .reduce(
                              (acc, section) =>
                                  acc +
                                  (section.title ? 32 : 0) +
                                  section.stations.length * DESTINATION_METRO_STATION_TOTAL_ITEM_HEIGHT +
                                  16,
                              0,
                          )
                    : // Offset for when station is in "other" section
                      Math.floor(towardsSections.length / 2) * 54 +
                      towardsSections.reduce(
                          (acc, section) =>
                              acc +
                              (section.title ? 32 : 0) +
                              section.stations.length * DESTINATION_METRO_STATION_TOTAL_ITEM_HEIGHT +
                              16,
                          0,
                      );

            const initialOffset = 0;
            const totalOffset = initialOffset + precedingOffset + offsetInCurrentSection;

            timeoutRef.current = setTimeout(() => {
                if (shouldScroll) {
                    scrollRef.current?.scrollTo({
                        y: totalOffset,
                        animated: true,
                    });
                    setShouldScroll(false);
                }
            }, 800);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [selectedStation, filteredSections, towardsSections]);

    const renderSection = (section: StationSection, key: string | number) => {
        if (!section || section.stations.length === 0) {
            return null;
        }
        return (
            <Animated.View key={`section-${key}`} style={tailwind.style('mb-4')}>
                {section.title && (
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] text-center pb-4 px-4',
                        )}>
                        {section.title}
                    </Animated.Text>
                )}
                <Animated.View>
                    {section.stations.map((item, index) => {
                        const isSelected = item.code === selectedStation?.code;
                        return (
                            <Pressable
                                accessibilityLabel={`Select ${item.name} button`}
                                accessibilityRole="button"
                                key={item.code?.toString() ?? item.name}
                                testID={`destination-station-item-${key}-${index}`}
                                onPress={() => handleStationSelect(item, section.routeCode)}
                                style={({ pressed }: { pressed: boolean }) => [
                                    tailwind.style(
                                        'rounded-[16px] min-h-14 bg-white justify-center items-center px-2 mb-3',
                                        isSelected ? `bg-[#3A3B3C]` : '',
                                        pressed ? 'bg-[#D6D6D6]' : '',
                                    ),
                                ]}>
                                <Animated.Text
                                    numberOfLines={1}
                                    style={tailwind.style(
                                        'text-[15px] leading-[20px] font-areaNormal-extrabold capitalize',
                                        isSelected ? `text-[#FFFFFF]` : 'text-[#3B3A3C]',
                                    )}>
                                    {item.name.toLowerCase()}
                                </Animated.Text>
                            </Pressable>
                        );
                    })}
                </Animated.View>
            </Animated.View>
        );
    };

    // Toggle expanded/collapsed state
    const toggleExpanded = () => {
        if (selectedStation) {
            onSelectStation(selectedStation, !isExpanded, undefined);
        }
        setIsExpanded(!isExpanded);
    };

    // Animation values for smooth transitions
    const expandedValueForAnimation = useDerivedValue(() => {
        return isExpanded ? withSpring(1) : withSpring(0);
    }, [isExpanded]);

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(expandedValueForAnimation.value, [0, 1], ['#FFFFFF', '#E6E6E6']),
    }));

    const titleView = useMemo(() => {
        if (!title) return null;
        return (
            <Animated.View style={tailwind.style('pt-[14px] items-center')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[12px] leading-[13px] font-areaNormal-extrabold text-[#969696] translate-[0.2px]',
                    )}>
                    {isExpanded ? `Select ${title}` : title}
                </Animated.Text>
            </Animated.View>
        );
    }, [title, isExpanded]); // Add expandedTitle to dependency array

    // Renders the selected item view when collapsed (not expanded)
    const renderSelectedItemView = useCallback(
        () => (
            <Animated.View
                entering={FadeInDown}
                exiting={FadeOut.duration(200)}
                style={tailwind.style('items-center pt-[14px] pb-[18px] overflow-hidden')}>
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        'text-[15px] leading-[16px] font-areaNormal-extrabold text-[#3B3A3C] w-3/4 capitalize text-center',
                        selectedStation?.name ? '' : 'text-[#C9C9C9]',
                    )}
                    accessibilityRole="text"
                    accessibilityLabel={`Selected ${title}: ${selectedStation?.name}`}>
                    {selectedStation?.name.toLowerCase() || `Enter ${title}`}
                </Animated.Text>
                <Animated.View style={tailwind.style('absolute right-4 top-[10px] items-end')}>
                    <Animated.View
                        style={tailwind.style(
                            `bg-[${colors.CrossButton_bg}] w-6 h-6 justify-center items-center rounded-full`,
                        )}>
                        <EditIcon />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        ),
        [selectedStation?.name],
    );
    const otherComponentTotalHeight = otherContentHeight || 40 + 32 + 118 + 78 + 32;
    return (
        <View ref={accessibilityRef}>
            {showSearchBar && isExpanded ? (
                <Animated.View style={tailwind.style('pb-4 bg-[#F4F4F4] rounded-t-[20px]')}>
                    <Animated.View style={!isUndefined(searchInputStyle) ? searchInputStyle : tailwind.style('pt-6')}>
                        <TransitCard
                            title={userLanguageStrings.Destinationstation}
                            value={searchText}
                            onChangeText={handleSearchTextChange}
                            textInputProps={{
                                placeholder: userLanguageStrings.Enterdestinationstop,
                                autoFocus: false,
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            ) : null}
            <Animated.View layout={LinearTransition.springify().damping(34).stiffness(240)}>
                <Animated.View
                    style={[tailwind.style(isExpanded ? '-mt-1' : '', 'rounded-[24px]'), animatedBackgroundStyle]}>
                    <Pressable
                        testID={`7e969413-67b7-4786-86a6-35c84cc7bceb`}
                        onPress={toggleExpanded}
                        accessibilityRole="button"
                        accessibilityLabel={
                            isExpanded
                                ? `Expanded list to select ${title}`
                                : `Currently selected ${title} is ${selectedStation?.name}. Double tap to change`
                        }>
                        {titleView}
                        {!isExpanded && renderSelectedItemView()}
                    </Pressable>

                    {/* https://github.com/gorhom/react-native-bottom-sheet/issues/1697#issuecomment-2052680627 */}
                    {isExpanded ? (
                        <Animated.View
                            entering={FadeInUp}
                            exiting={FadeOut.duration(200)}
                            layout={LinearTransition.springify().damping(34).stiffness(240)}
                            style={tailwind.style(
                                `bg-[#E6E6E6] relative mx-4 mt-4 mb-4 max-h-[${SCREEN_HEIGHT - top - bottom - otherComponentTotalHeight}px]`,
                            )}>
                            <ScrollView
                                ref={scrollRef}
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode={'on-drag'}
                                contentContainerStyle={tailwind.style(`gap-y-3`)}
                                showsVerticalScrollIndicator={false}>
                                {searchText.trim() ? (
                                    <>
                                        {filteredSections.map((section, index) => renderSection(section, index))}
                                        {filteredSections.length === 0 ? (
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[13px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] text-center pb-5',
                                                )}>
                                                {userLanguageStrings.NoStationsFound}
                                            </Animated.Text>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        {towardsSections.map((section, index) => {
                                            // If it's an even index, it's the start of a potential pair
                                            if (index % 2 === 0) {
                                                const section1 = section;
                                                const section2 = towardsSections[index + 1]; // Check for the next section

                                                // If a pair exists, render the toggle UI and both sections
                                                if (section2 || routeStartStation) {
                                                    const endStation = section1.stations[section1.stations.length - 1];
                                                    const startStation = section2
                                                        ? section2.stations[section2.stations.length - 1]
                                                        : { name: routeStartStation };

                                                    return (
                                                        <React.Fragment key={`pair-${index}`}>
                                                            {showRouteToggle && (
                                                                <Animated.View style={tailwind.style('pb-4')}>
                                                                    <Pressable
                                                                        accessibilityRole="button"
                                                                        accessibilityLabel={`${startStation?.name} to ${endStation?.name} button`}
                                                                        onPress={() =>
                                                                            isRouteToggleEnabled
                                                                                ? handleRouteToggle?.()
                                                                                : null
                                                                        }
                                                                        testID={`route-toggle-${index}`}>
                                                                        <Animated.View
                                                                            style={tailwind.style(
                                                                                'flex-row justify-between items-center bg-[#FFFFFF] rounded-[12px] min-h-[38px] px-3',
                                                                            )}>
                                                                            <Animated.View
                                                                                style={tailwind.style(
                                                                                    'flex-1 justify-center items-center overflow-hidden',
                                                                                )}>
                                                                                <Animated.Text
                                                                                    entering={SlideInRight}
                                                                                    exiting={SlideOutRight}
                                                                                    numberOfLines={1}
                                                                                    style={tailwind.style(
                                                                                        'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] text-center capitalize',
                                                                                    )}>
                                                                                    {startStation?.name}
                                                                                </Animated.Text>
                                                                            </Animated.View>
                                                                            <Animated.View
                                                                                style={tailwind.style(
                                                                                    'bg-[#F4F4F4] rounded-[12px] justify-center items-center w-[38px] h-9 mx-3',
                                                                                )}>
                                                                                <Icon
                                                                                    icon={
                                                                                        isRouteToggleEnabled ? (
                                                                                            <ToggleBusRoute />
                                                                                        ) : (
                                                                                            <NoToggleBusRoute />
                                                                                        )
                                                                                    }
                                                                                    size={24}
                                                                                />
                                                                            </Animated.View>
                                                                            <Animated.View
                                                                                style={tailwind.style(
                                                                                    'flex-1 justify-center items-center overflow-hidden',
                                                                                )}>
                                                                                <Animated.Text
                                                                                    entering={SlideInLeft}
                                                                                    exiting={SlideOutLeft}
                                                                                    numberOfLines={1}
                                                                                    style={tailwind.style(
                                                                                        'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] text-center capitalize',
                                                                                    )}>
                                                                                    {endStation?.name}
                                                                                </Animated.Text>
                                                                            </Animated.View>
                                                                        </Animated.View>
                                                                    </Pressable>
                                                                </Animated.View>
                                                            )}
                                                            {frequentVisitDestinationsSection &&
                                                                renderSection(
                                                                    frequentVisitDestinationsSection,
                                                                    'frequentVisitDestinations',
                                                                )}
                                                            {renderSection(section1, `${index}-0`)}
                                                            {section2 && renderSection(section2, `${index}-1`)}
                                                        </React.Fragment>
                                                    );
                                                } else {
                                                    // If it's a single, unpaired section, render it directly
                                                    return (
                                                        <>
                                                            {frequentVisitDestinationsSection &&
                                                                renderSection(
                                                                    frequentVisitDestinationsSection,
                                                                    'frequentVisitDestinations',
                                                                )}
                                                            {renderSection(section1, `${index}-0`)}
                                                        </>
                                                    );
                                                }
                                            }
                                            // Odd-indexed sections are handled within their pair, so return null
                                            return null;
                                        })}
                                        {otherSection && renderSection(otherSection, 'other')}
                                        {filteredSections.length === 0 ? (
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[13px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] text-center pb-5',
                                                )}>
                                                {userLanguageStrings.NoStationsFound}
                                            </Animated.Text>
                                        ) : null}
                                    </>
                                )}
                                {onSwitchOrSelectRoute && (
                                    <Animated.View style={tailwind.style('pt-2 pb-6 px-4 bg-[#E6E6E6]')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-center text-[14px] font-areaNormal-extrabold text-[#7E7E7E] mb-4',
                                            )}>
                                            {userLanguageStrings.CouldntFindDestinationOrStops}
                                        </Animated.Text>
                                        <Pressable
                                            onPress={onSwitchOrSelectRoute}
                                            testID="switch-and-book-button"
                                            accessibilityRole="button"
                                            accessibilityLabel="Switch source and destination and book"
                                            style={({ pressed }) => [
                                                tailwind.style(
                                                    'bg-white rounded-[16px] min-h-14 flex-row items-center justify-center gap-2 mx-4',
                                                    pressed ? 'opacity-80' : '',
                                                ),
                                            ]}>
                                            <ToggleBusRoute />
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[#016ACD] text-[15px] font-areaNormal-extrabold',
                                                )}>
                                                {userLanguageStrings.SwitchFindStop}
                                            </Animated.Text>
                                        </Pressable>
                                    </Animated.View>
                                )}
                            </ScrollView>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </Animated.View>
        </View>
    );
};
