import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectJourneyFilter, selectSelectedModesFilter } from '@/typescript/state/client/search';
import {
    FilterItemType,
    JourneyFilterOptions,
    JourneyFilterProps,
    JourneyOptionsScreenAction,
    TransitTypeLocal,
} from '@/src-v2/multimodal/screens/PublicTransitList/Types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import MoreOptions from '@/src-v2/multimodal/screens/PublicTransitList/components/MoreOptions';
import { useRefsContext } from '@/typescript/context/RefsContext';
import OtherFilters, { FilterType } from '@/src-v2/multimodal/screens/PublicTransitList/components/OtherFilters';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { selectSearchId } from '@/typescript/state/client/user';
import FilterPillButton from '@/src-v2/multimodal/components/FilterPillButton';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Resolver } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';

/**
 * Custom hook for managing transit type state
 */
const useTransitTypes = (initialTypes: MultimodalTravelMode_multimodalTravelMode[]) => {
    const [transitState, setTransitState] = useState<TransitTypeLocal>({
        Bus: initialTypes.includes('Bus'),
        Metro: initialTypes.includes('Metro'),
        Subway: initialTypes.includes('Subway'),
        Taxi: initialTypes.includes('Taxi'),
        Walk: true,
    });

    // useEffect to sync with Redux state changes
    useEffect(() => {
        setTransitState({
            Bus: initialTypes.includes('Bus'),
            Metro: initialTypes.includes('Metro'),
            Subway: initialTypes.includes('Subway'),
            Taxi: initialTypes.includes('Taxi'),
            Walk: true,
        });
    }, [initialTypes]);

    const setAllTransitTypesTrue = useCallback(() => {
        setTransitState({
            Bus: true,
            Metro: true,
            Subway: true,
            Taxi: true,
            Walk: true,
        });
    }, []);

    const toggleTransitType = useCallback((type: MultimodalTravelMode_multimodalTravelMode) => {
        setTransitState(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    }, []);

    return {
        transitState,
        toggleTransitType,
        setTransitState,
        busEnabled: transitState.Bus,
        metroEnabled: transitState.Metro,
        trainEnabled: transitState.Subway,
        lastMileEnabled: transitState.Taxi,
        setBusEnabled: (value: boolean) => setTransitState(prev => ({ ...prev, Bus: value })),
        setMetroEnabled: (value: boolean) => setTransitState(prev => ({ ...prev, Metro: value })),
        setTrainEnabled: (value: boolean) => setTransitState(prev => ({ ...prev, Subway: value })),
        setLastMileEnabled: (value: boolean) => setTransitState(prev => ({ ...prev, Taxi: value })),
        setAllTransitTypesTrue,
    };
};

/**
 * Custom hook for journey filter management
 */
const useJourneyFilters = (initialMode: JourneyFilterOptions) => {
    const getInitialFilter = (): FilterType => {
        switch (initialMode) {
            case JourneyFilterOptions.Fewest_Transfers:
                return 'fewerTransfers';
            case JourneyFilterOptions.Least_Walking:
                return 'lessWalking';
            case JourneyFilterOptions.Cheapest:
                return 'Cheapest';
            default:
                return 'bestRoute';
        }
    };

    const [selectedFilter, setSelectedFilter] = useState<FilterType>(getInitialFilter());

    const selectedModeValue = useMemo(() => {
        switch (selectedFilter) {
            case 'fewerTransfers':
                return JourneyFilterOptions.Fewest_Transfers;
            case 'lessWalking':
                return JourneyFilterOptions.Least_Walking;
            case 'Cheapest':
                return JourneyFilterOptions.Cheapest;
            default:
                return JourneyFilterOptions.Most_Relevant;
        }
    }, [selectedFilter]);

    return {
        selectedFilter,
        setSelectedFilter,
        selectedModeValue,
    };
};

/**
 * Custom hook for filter handlers
 */
const useFilterActions = (
    selectedFilterLeg: (option: JourneyFilterOptions) => void,
    mbDispatch: Resolver<JourneyOptionsScreenAction> | undefined,
    searchId: string | null,
    selectedModeValue: JourneyFilterOptions,
    transitState: TransitTypeLocal,
    multimodalModesFilterRef: React.RefObject<BottomSheetModal | null>,
    multimodalOtherFiltersRef: React.RefObject<BottomSheetModal | null>,
) => {
    const applyJourneyFilter = useCallback(() => {
        if (searchId) {
            selectedFilterLeg(selectedModeValue);
        }
    }, [searchId, selectedModeValue, selectJourneyFilter]);

    const handleOtherFiltersConfirm = useCallback(() => {
        if (multimodalOtherFiltersRef.current) {
            multimodalOtherFiltersRef.current.dismiss();
            applyJourneyFilter();
        }
    }, [multimodalOtherFiltersRef, applyJourneyFilter]);

    const handleModeConfirm = useCallback(
        (updatedTransitState: TransitTypeLocal = transitState) => {
            if (multimodalModesFilterRef.current) {
                multimodalModesFilterRef.current.dismiss();
            }

            if (searchId) {
                const updatedSelectedTypes = Object.entries(updatedTransitState)
                    .filter(([_, value]) => value)
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    .map(([key]) => key as MultimodalTravelMode_multimodalTravelMode);
                if (mbDispatch) {
                    mbDispatch({
                        type: 'FILTER_MODE',
                        payload: { options: updatedSelectedTypes },
                    });
                }
                applyJourneyFilter();
            }
        },
        [multimodalModesFilterRef, searchId, transitState, mbDispatch, applyJourneyFilter],
    );

    return {
        applyJourneyFilter,
        handleOtherFiltersConfirm,
        handleModeConfirm,
    };
};

/**
 * Main component for journey filter options
 */
export const JourneyFilterOption: React.FC<JourneyFilterProps> = props => {
    const { multimodalModesFilterRef, multimodalOtherFiltersRef } = useRefsContext();
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Get state from redux
    const transitTypesFromRedux = useAppSelector(state => selectSelectedModesFilter(state, null)) || [];
    const filterResult = useAppSelector(state => selectJourneyFilter(state, null));
    const currentFilterMode = filterResult || JourneyFilterOptions.Most_Relevant;

    // Use custom hooks
    const {
        transitState,
        toggleTransitType,
        busEnabled,
        metroEnabled,
        trainEnabled,
        lastMileEnabled,
        setBusEnabled,
        setMetroEnabled,
        setTrainEnabled,
        setLastMileEnabled,
        setAllTransitTypesTrue,
    } = useTransitTypes(transitTypesFromRedux);

    const { selectedFilter, setSelectedFilter, selectedModeValue } = useJourneyFilters(currentFilterMode);

    const { handleOtherFiltersConfirm, handleModeConfirm } = useFilterActions(
        props.selectJourneyFilter,
        props.dispatch,
        searchId,
        selectedModeValue,
        transitState,
        multimodalModesFilterRef,
        multimodalOtherFiltersRef,
    );

    // Filter options data
    const filterOptions = useMemo(
        (): FilterItemType[] => [
            {
                id: 'mode-button',
                type: 'popUp',
                name: userLanguageStrings.Mode,
                onPress: () => {
                    if (multimodalModesFilterRef.current) {
                        multimodalModesFilterRef.current.present();
                    }
                },
            },
            {
                id: 'transit-button',
                type: 'popUp',
                name: userLanguageStrings.SortBy,
                onPress: () => {
                    if (multimodalOtherFiltersRef.current) {
                        multimodalOtherFiltersRef.current.present();
                    }
                },
            },
            ...transitTypesFromRedux.map(item => ({
                id: item,

                type: 'transit-type' as const,
                value: item,
            })),
        ],
        [transitTypesFromRedux, multimodalModesFilterRef, multimodalOtherFiltersRef],
    );

    // Only render pill buttons when exactly one transit type is enabled
    const renderJourneyOption = useCallback(
        (option: MultimodalTravelMode_multimodalTravelMode) => {
            // Check if option is enabled
            const isOptionEnabled = transitState[option];
            if (!isOptionEnabled) return null;

            const enabledCount = Object.values(transitState).filter(Boolean).length;
            if (enabledCount === 5) return null;

            const handleOptionToggle = (enableCount: number) => {
                if (enableCount === 2) {
                    const updatedState = { Bus: true, Metro: true, Subway: true, Taxi: true, Walk: true };
                    setAllTransitTypesTrue();
                    handleModeConfirm(updatedState);
                } else {
                    const updatedState = { ...transitState, [option]: !transitState[option] };
                    toggleTransitType(option);
                    handleModeConfirm(updatedState);
                }
            };

            const handlePress = () => {
                toggleTransitType(option);
            };

            if (option === 'Walk') return null;

            return (
                <TouchableOpacity
                    accessibilityRole="button"
                    style={{ gap: 8, paddingHorizontal: 8 }}
                    onPress={handlePress}
                    testID="33715d40-1f7f-11f0-946d-325096b39r47">
                    <FilterPillButton
                        isClose={isOptionEnabled}
                        name={`${option} ${enabledCount === 2 ? 'only' : ''}`}
                        onPress={() => {
                            handleOptionToggle(enabledCount);
                        }}
                    />
                </TouchableOpacity>
            );
        },
        [transitState, toggleTransitType, handleModeConfirm],
    );

    // FlatList item renderer
    const renderFilterItem = useCallback(
        ({ item }: { item: FilterItemType }) => {
            if (item.type === 'popUp') {
                return (
                    <View style={{ marginRight: 8 }}>
                        <FilterPillButton isClose={false} name={item.name} onPress={item.onPress} />
                    </View>
                );
            }

            if (item.type === 'transit-type') {
                return renderJourneyOption(item.value);
            }

            return null;
        },
        [renderJourneyOption],
    );

    return (
        <>
            <View
                style={{
                    paddingBottom: 12,
                    paddingLeft: 15,
                    borderBottomColor: '#E6E6E6',
                    borderBottomWidth: 1,
                }}>
                <FlatList
                    accessible={true}
                    accessibilityLabel="Journey filter options"
                    accessibilityRole="list"
                    data={filterOptions}
                    renderItem={renderFilterItem}
                    keyExtractor={item => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <PopUpModal
                sheetRef={multimodalModesFilterRef}
                isScrollable={false}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                enableDynamicSizing={true}>
                <View style={{ paddingBottom: bottom }}>
                    <MoreOptions
                        busEnabled={busEnabled}
                        setBusEnabled={setBusEnabled}
                        metroEnabled={metroEnabled}
                        setMetroEnabled={setMetroEnabled}
                        trainEnabled={trainEnabled}
                        setTrainEnabled={setTrainEnabled}
                        lastMileEnabled={lastMileEnabled}
                        setLastMileEnabled={setLastMileEnabled}
                        busSubOptions={[]}
                        metroSubOptions={[]}
                        trainSubOptions={[]}
                        lastMileSubOptions={[]}
                        onConfirmPress={() => handleModeConfirm(transitState)}
                    />
                </View>
            </PopUpModal>

            <PopUpModal
                sheetRef={multimodalOtherFiltersRef}
                isScrollable={false}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                enableDynamicSizing={true}
                style={{ marginBottom: bottom + 24, paddingBottom: bottom }}>
                <View style={{ paddingBottom: bottom + 24 }}>
                    <OtherFilters
                        onConfirmPress={handleOtherFiltersConfirm}
                        selectedFilter={selectedFilter}
                        onFilterSelect={setSelectedFilter}
                    />
                </View>
            </PopUpModal>
        </>
    );
};
