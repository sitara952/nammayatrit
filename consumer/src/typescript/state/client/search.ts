/* eslint-disable functional/immutable-data */
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { searchResp } from '../../../readOnly/api/types/SearchResp.gen';
import { selectSearchId } from './user';
import { RootState } from '../store';
import { priceAPIEntity } from '../../../readOnly/api/types/PriceAPIEntity.gen';
import { estimateFares } from '../../../api/apiTypes/SearchResults.gen';
import { cloneDeep, isNull } from 'lodash';
import { transformSnappedToRouteLatLon } from '@/typescript/utils/common';
import { PURGE } from 'redux-persist';
import {
    MultimodalTravelMode_multimodalTravelMode,
    ServiceTierType_serviceTierType,
} from '@/readOnly/api/types/Enums.gen.tsx';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen.tsx';
import { JourneyFilterOptions } from '@/src-v2/multimodal/screens/PublicTransitList/Types.ts';
import { getWalkingDistance } from '@/typescript/utils/MultiModal.ts';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { getQuotesRes } from '@/readOnly/api/types/GetQuotesRes.gen';
import { businessDiscountInfoAPIEntity } from '@/readOnly/api/types/BusinessDiscountInfoAPIEntity.gen';

const safeSet = (stateObj: SearchDict, id: string) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptySearch);

    return stateObj[id];
};
export enum TripMode {
    DynamicOffer,
    StaticOffer,
    RideOtp,
}

export enum TripCategory {
    Rental,
    InterCity,
    OneWay,
    Ambulance,
}

export type PricingItemType = {
    readonly id: string;
    readonly tripMode: TripMode;
    readonly tripCategory: TripCategory;
    readonly serviceTierName: undefined | string;
    readonly cost: number;
    readonly toCost: number | undefined;
    readonly validTill: string;
    readonly vehicleIconUrl: undefined | string;
    readonly serviceTierShortDesc: string;
    readonly smartTipSuggestion: {
        value: number | undefined;
        description: string | undefined;
    };
    readonly tipOptions: number[] | undefined;
    readonly minVehicleServiceTierSeatingCapacity: number;
    readonly maxVehicleServiceTierSeatingCapacity: number;
    readonly estimatedFareWithCurrency: priceAPIEntity;
    readonly isValueAddNP: boolean;
    readonly expandedData:
        | undefined
        | {
              name: string;
              value: string;
              isAc: boolean;
              service: ServiceTierType_serviceTierType;
              description: string | undefined;
              cost: number | undefined;
              toCost: number | undefined;
              currency: string | undefined;
              vehicleIconUrl: string | undefined;
          }[];
    readonly fareBreakup: undefined | estimateFares[];
    readonly isAirConditioned: undefined | boolean;
    readonly isRoundTrip: boolean;
    readonly isInsured: boolean;
    readonly vehicleVariant: undefined | string;
    readonly serviceTierType: undefined | string;
    readonly businessDiscountInfo:
        | undefined
        | (businessDiscountInfoAPIEntity & { maxBusinessDiscount: number | undefined });
};

export type TripTypeSelection = 'PERSONAL' | 'BUSINESS';

export type Search = {
    customerTip: number | undefined;
    isCustomTip: boolean;
    vehicleChanged: boolean;
    isAddTipSelected: boolean;
    searchRequest: searchResp | null;
    pricingItems: PricingItemType[];
    selectedPricingItems: PricingItemType[];
    estimatesStarted: boolean; // Fix this
    isSearchBoosted: boolean;
    isSearchCancelled: boolean;
    isEditClicked: boolean;
    useTipSlider: boolean;
    escalatedTime: number | undefined;
    isEditButtonDisabled: Record<string, boolean>;
    showPetRideTopBanner: boolean;
    isPetRide: boolean;
    journeys: journeyData[];
    selectedJourneyFilter: JourneyFilterOptions;
    selectedJourney: journeyData | null;
    selectedModesFilter: MultimodalTravelMode_multimodalTravelMode[];
    journeyRoute: TrackedLegInfoStaticInfo | null;
    boostPreSelectedVariants: string[] | null;
    searchResults: getQuotesRes | null;
    persistedTipOptions: number[] | null;
    persistedSmartTipValue: number | null;
    tripTypeSelection: TripTypeSelection;
};

const emptySearch: Search = {
    customerTip: undefined,
    isCustomTip: false,
    vehicleChanged: false,
    isAddTipSelected: false,
    searchRequest: null,
    pricingItems: [],
    selectedPricingItems: [],
    estimatesStarted: false,
    isSearchBoosted: false,
    isSearchCancelled: false,
    isEditClicked: false,
    useTipSlider: true,
    escalatedTime: undefined,
    isEditButtonDisabled: {},
    showPetRideTopBanner: false,
    isPetRide: false,
    journeys: [],
    selectedJourneyFilter: JourneyFilterOptions.Most_Relevant,
    selectedJourney: null,
    selectedModesFilter: ['Bus', 'Metro', 'Subway', 'Taxi', 'Walk'],
    journeyRoute: null,
    boostPreSelectedVariants: null,
    searchResults: null,
    persistedTipOptions: null,
    persistedSmartTipValue: null,
    tripTypeSelection: 'PERSONAL',
};

type SearchDict = {
    [searchId: string]: Search;
};

type SearchPayload<T> = {
    id: string | null;
    payload: T;
};
type SearchPayloadAction<T> = PayloadAction<SearchPayload<T>>;

const REDUCER_NAME: string = 'search';

const INITIAL_STATE: SearchDict = {};

export const searchSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setCustomerTip: (state, action: SearchPayloadAction<number | undefined>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).customerTip = action.payload.payload;
            return undefined;
        },
        setIsCustomTip: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isCustomTip = action.payload.payload;
            return undefined;
        },
        setVehicleChanged: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).vehicleChanged = action.payload.payload;
            return undefined;
        },
        setIsAddTipSelected: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isAddTipSelected = action.payload.payload;
            return undefined;
        },
        setEstimatesStarted: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).estimatesStarted = action.payload.payload;
            return undefined;
        },
        setIsSearchBoosted: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isSearchBoosted = action.payload.payload;
            return undefined;
        },
        setPricingItems: (state, action: SearchPayloadAction<PricingItemType[]>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).pricingItems = action.payload.payload.filter(
                (item, index, self) => index === self.findIndex(t => t.serviceTierType === item.serviceTierType),
            );
            return undefined;
        },
        setTripTypeSelection: (state, action: SearchPayloadAction<TripTypeSelection>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).tripTypeSelection = action.payload.payload;
            return undefined;
        },
        setSelectedPricingItems: (state, action: SearchPayloadAction<PricingItemType[]>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).selectedPricingItems = action.payload.payload;
            if (action.payload.payload) {
                safeSet(state, action.payload.id).selectedJourney = null;
            }
            safeSet(state, action.payload.id).persistedTipOptions = null;
            safeSet(state, action.payload.id).persistedSmartTipValue = null;
            return undefined;
        },
        setSearchRequest: (state, action: PayloadAction<searchResp>) => {
            if (isNull(action.payload.searchId)) {
                return state;
            }
            safeSet(state, action.payload.searchId).searchRequest = action.payload;
            return undefined;
        },
        setIsSearchCancelled: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isSearchCancelled = action.payload.payload;
            return undefined;
        },
        setIsEditClicked: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isEditClicked = action.payload.payload;
            return undefined;
        },
        setUseTipSlider: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).useTipSlider = action.payload.payload;
            return undefined;
        },
        setEscalatedTime: (state, action: SearchPayloadAction<number | undefined>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).escalatedTime = action.payload.payload;
            return undefined;
        },
        setIsEditButtonDisabled: (state, action: PayloadAction<{ id: string | null; payload: boolean }>) => {
            if (action.payload.id) {
                const searchState = safeSet(state, action.payload.id);
                if (!searchState.isEditButtonDisabled) {
                    searchState.isEditButtonDisabled = {};
                }
                const id = action.payload.id;
                const isEditButtonDisabled = searchState.isEditButtonDisabled;
                isEditButtonDisabled[id] = action.payload.payload;
            }
            return undefined;
        },
        setIsPetRide: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isPetRide = action.payload.payload;
            return undefined;
        },
        setShowPetRideTopBanner: (state, action: SearchPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).showPetRideTopBanner = action.payload.payload;
            return undefined;
        },
        setSelectedModesFilter: (state, action: SearchPayloadAction<MultimodalTravelMode_multimodalTravelMode[]>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).selectedModesFilter = action.payload.payload;
            return undefined;
        },
        setSelectedJourneyFilter: (state, action: SearchPayloadAction<JourneyFilterOptions>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            const journeyOptions = safeSet(state, action.payload.id).journeys;

            safeSet(state, action.payload.id).selectedJourneyFilter = action.payload.payload;
            switch (action.payload.payload) {
                case JourneyFilterOptions.Quickest:
                    safeSet(state, action.payload.id).journeys = [...journeyOptions].sort((a, b) =>
                        a.duration === undefined && b.duration === undefined
                            ? 0
                            : a.duration === undefined
                              ? 1
                              : b.duration === undefined
                                ? -1
                                : a.duration - b.duration,
                    );
                    break;
                case JourneyFilterOptions.Cheapest:
                    console.info('Sorting by cheapest', [...journeyOptions]);
                    safeSet(state, action.payload.id).journeys = [...journeyOptions].sort((a, b) =>
                        a.totalMinFare === undefined && b.totalMinFare === undefined
                            ? Infinity
                            : a.totalMinFare === undefined
                              ? 1
                              : b.totalMinFare === undefined
                                ? -1
                                : a.totalMinFare - b.totalMinFare,
                    );
                    console.info('Sorting by cheapest-1,', safeSet(state, action.payload.id).journeys);
                    break;
                case JourneyFilterOptions.Fewest_Transfers:
                    safeSet(state, action.payload.id).journeys = [...journeyOptions].sort(
                        (a, b) => a.journeyLegs.length - b.journeyLegs.length,
                    );
                    break;
                case JourneyFilterOptions.Least_Walking:
                    safeSet(state, action.payload.id).journeys = [...journeyOptions].sort(
                        (a, b) => getWalkingDistance(a.journeyLegs)[0] - getWalkingDistance(b.journeyLegs)[0],
                    );
                    break;
                case JourneyFilterOptions.Most_Relevant:
                    safeSet(state, action.payload.id).journeys = [...journeyOptions].sort(
                        (a, b) => a.relevanceScore - b.relevanceScore,
                    );
                    break;
            }
            const sortedJourney = safeSet(state, action.payload.id).journeys;
            safeSet(state, action.payload.id).selectedJourney = sortedJourney[0] ?? null;
            return undefined;
        },
        setJourneys: (state, action: SearchPayloadAction<journeyData[]>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).journeys = action.payload.payload;
            return undefined;
        },
        setSelectedJourney: (state, action: SearchPayloadAction<journeyData | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).selectedJourney = action.payload.payload;

            return undefined;
        },
        setJourneyUpdates: (state, action: SearchPayloadAction<journeyData | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }

            const searchId = action.payload.id;
            const updatedJourney = action.payload.payload;

            safeSet(state, searchId).selectedJourney = updatedJourney;

            const journeys = safeSet(state, searchId).journeys;
            if (journeys) {
                safeSet(state, searchId).journeys = journeys.map(journey =>
                    journey.journeyId === updatedJourney?.journeyId ? updatedJourney : journey,
                );
            }

            return undefined;
        },
        setJourneyRoute: (state, action: SearchPayloadAction<TrackedLegInfoStaticInfo | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).journeyRoute = action.payload.payload;
            return undefined;
        },
        setBoostPreSelectedVariants: (state, action: SearchPayloadAction<string[] | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).boostPreSelectedVariants = action.payload.payload;
            return undefined;
        },
        setSearchResults: (state, action: SearchPayloadAction<getQuotesRes | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).searchResults = action.payload.payload;
            return undefined;
        },
        setPersistedTipOptions: (state, action: SearchPayloadAction<number[] | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).persistedTipOptions = action.payload.payload;
            return undefined;
        },
        setPersistedSmartTipValue: (state, action: SearchPayloadAction<number | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).persistedSmartTipValue = action.payload.payload;
            return undefined;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, _state => {
            return INITIAL_STATE;
        });
    },
});

const selectSearch = (state: RootState, searchId: string | null) => {
    const currentSearchId = selectSearchId(state, searchId);
    const searchDict = state.search;
    if (currentSearchId && searchDict && searchDict[currentSearchId]) {
        return searchDict[currentSearchId] || emptySearch;
    }
    return emptySearch;
};

export const selectTripDistance = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).searchRequest?.routeInfo?.distance;
export const selectRouteInfo = createSelector(
    [(state: RootState, searchId: string | null) => selectSearch(state, searchId).searchRequest?.routeInfo],
    routeInfo => transformSnappedToRouteLatLon(routeInfo),
);
export const selectJourneyRoute = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).journeyRoute;
export const selectCompleteRouteInfo = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).searchRequest?.routeInfo;
export const selectPricingItems = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).pricingItems;
export const selectSelectedPricingItems = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).selectedPricingItems;
export const selectCustomerTip = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).customerTip;
export const selectVehicleChanged = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).vehicleChanged;
export const selectIsAddTipSelected = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).isAddTipSelected;
export const selectEstimatesStarted = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).estimatesStarted;
export const selectIsSearchBoosted = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).isSearchBoosted;
export const selectIsSearchCancelled = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).isSearchCancelled;
export const selectJourneys = (state: RootState, searchId: string | null) => selectSearch(state, searchId).journeys;
export const selectJourneyFilter = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).selectedJourneyFilter;
export const selectSelectedJourney = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).selectedJourney;
export const selectIsEditClicked = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).isEditClicked;
export const selectUseTipSlider = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).useTipSlider;
export const selectEscalatedTime = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).escalatedTime;
export const selectSelectedModesFilter = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).selectedModesFilter;
export const selectIsEditButtonDisabled = (state: RootState): boolean => {
    const searchId = selectSearchId(state, null);
    if (!searchId) return false;

    const searchState = selectSearch(state, searchId);
    return (searchState.isEditButtonDisabled && searchState.isEditButtonDisabled[searchId]) || false;
};
export const selectBoostPreSelectedVariants = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).boostPreSelectedVariants;
export const selectSearchResults = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).searchResults;
export const selectPersistedTipOptions = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).persistedTipOptions;

export const selectPersistedSmartTipValue = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).persistedSmartTipValue;

export const selectTripTypeSelection = (state: RootState, searchId: string | null): TripTypeSelection =>
    selectSearch(state, searchId).tripTypeSelection;

export const selectIsPetRide = (state: RootState, searchId: string | null) => selectSearch(state, searchId).isPetRide;
export const selectShowPetRideTopBanner = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).showPetRideTopBanner;
export const selectIsCustomTip = (state: RootState, searchId: string | null) =>
    selectSearch(state, searchId).isCustomTip;

export const {
    setCustomerTip,
    setIsCustomTip,
    setVehicleChanged,
    setIsAddTipSelected,
    setEstimatesStarted,
    setIsSearchBoosted,
    setPricingItems,
    setSelectedPricingItems,
    setSearchRequest,
    setIsSearchCancelled,
    setIsEditClicked,
    setUseTipSlider,
    setEscalatedTime,
    setIsEditButtonDisabled,
    setIsPetRide,
    setShowPetRideTopBanner,
    setJourneys,
    setSelectedJourneyFilter,
    setSelectedModesFilter,
    setSelectedJourney,
    setJourneyUpdates,
    setJourneyRoute,
    setBoostPreSelectedVariants,
    setSearchResults,
    setPersistedTipOptions,
    setPersistedSmartTipValue,
    setTripTypeSelection,
} = searchSlice.actions;

export default searchSlice;
