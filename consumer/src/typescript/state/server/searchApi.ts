/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { api } from './../api';
import { autoCompleteReq } from '../../../readOnly/api/types/AutoCompleteReq.gen.tsx';
import { ServiceTierType_serviceTierType } from '../../../readOnly/api/types/Enums.gen';
import { getLocationsFromPredictions } from '../../../api/autoComplete/AutoComplete.bs';
import { mkRideSearchReq, searchReqTypeToJson } from '../../../api/apiTypes/RideSearch.bs';
import { decodeGetQuotesRes } from '@/readOnly/api/types/GetQuotesRes.bs';
import { setSearchId } from '../client/user';
import {
    setRetrySearch,
    setSearchFailed,
    setSystemError,
    selectSearchedStops,
    addSearchedStop,
    emptyAllSearchedStops,
    setSearchedSource,
    selectSearchedSource,
    setToastProps,
    selectSelectedOneClickRide,
} from '../client/session';
import { autoCompleteResp } from '../../../readOnly/api/types/AutoCompleteResp.gen';
import {
    PricingItemType,
    selectSelectedJourney,
    selectSelectedPricingItems,
    setJourneys,
    setPricingItems,
    setSearchRequest,
    setSelectedPricingItems,
    setShowPetRideTopBanner,
    setBoostPreSelectedVariants,
    setSearchResults,
    TripCategory,
    TripMode,
} from '../client/search';
import { getQuotesRes } from '@/readOnly/api/types/GetQuotesRes.gen';
import { estimateAPIEntity } from '@/readOnly/api/types/EstimateAPIEntity.gen';
import { estimateFares } from '@/api/apiTypes/SearchResults.gen';
import { isNull } from 'lodash';
import { RootState } from '../store';
import { transformLocationApiEntityToLocation } from '@/typescript/utils/placeUtils';
import { selectToken } from '../client/auth';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { handleSmartTipSuggestion } from '@/src-v2/utils/common';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { selectNewFeatureFlags } from '../../state/client/session';
import { offerRes } from '@/readOnly/api/types/OfferRes.gen';

enum SourceType {
    AC,
    NonAC,
    Both,
}

const getSourceType = (source: location | null): SourceType => {
    if ((source?.title?.search('(AC Only)') || -1) >= 0) {
        return SourceType.AC;
    } else if ((source?.title?.search('(Non-AC Only)') || -1) >= 0) {
        return SourceType.NonAC;
    } else {
        return SourceType.Both;
    }
};

const processPricingItems = (
    source: location | null,
    pricingItems: PricingItemType[],
    selectedOneClickRide: tripLocationObject | undefined,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    toastMessage: string,
): PricingItemType[] => {
    const sourceType = getSourceType(source);
    const pricingItemsIsValueAddNP = pricingItems.filter(val => val.isValueAddNP === true);
    const pricingItemsSortedWithOneClick = (() => {
        if (!selectedOneClickRide) return pricingItemsIsValueAddNP;

        const vehicleVariant = selectedOneClickRide.vehicleVariant ?? '';
        const index = pricingItemsIsValueAddNP.findIndex(
            (item: PricingItemType) => item.vehicleVariant === vehicleVariant,
        );

        if (index === -1) {
            dispatch(
                setToastProps({
                    message: toastMessage,
                    backgroundColor: `#000000`,
                    autoDismissAfter: 2000,
                    visible: true,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            return pricingItemsIsValueAddNP;
        }

        const item = pricingItemsIsValueAddNP[index];
        if (!item) return pricingItemsIsValueAddNP;

        return [item, ...pricingItemsIsValueAddNP.slice(0, index), ...pricingItemsIsValueAddNP.slice(index + 1)];
    })();

    if (sourceType == SourceType.AC) {
        return pricingItemsSortedWithOneClick?.filter(items => items?.isAirConditioned);
    } else if (sourceType == SourceType.NonAC) {
        return pricingItemsSortedWithOneClick?.filter(items => !items?.isAirConditioned);
    } else {
        return pricingItemsSortedWithOneClick;
    }
};

const getCurrentTimePlusNmin = (n: number): string => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + n);
    return currentTime.toISOString();
};

interface SearchApiErrorResponse {
    error: {
        status: number;
        data: {
            errorCode: string;
            errorMessage: string;
            errorPayload: null;
        };
    };
    isUnhandledError: boolean;
    meta: {
        request: {
            url: string;
            headers: {
                map: Record<string, string>;
            };
            method: string;
            body: string;
        };
        response: {
            status: number;
            headers: {
                map: Record<string, string>;
            };
        };
    };
}

export const searchApi = api.injectEndpoints({
    endpoints: build => ({
        autoComplete: build.mutation({
            query: request => ({
                url: '/maps/autoComplete',
                method: 'POST',
                body: {
                    autoCompleteType: request.isPickup ? 'PICKUP' : 'DROP',
                    input: request.input,
                    language: 'ENGLISH',
                    location: request?.lat + ',' + request?.lng,
                    origin: {
                        lat: request?.lat,
                        lon: request?.lng,
                    },
                    radius: 50000,
                    radiusWithUnit: {
                        unit: 'Meter',
                        value: 50000.0,
                    },
                    sessionToken: undefined,
                    strictbounds: false,
                    types_: undefined,
                } satisfies autoCompleteReq,
            }),
            transformResponse(baseQueryReturnValue: autoCompleteResp, _meta, _arg) {
                const sortedPredictions = [...baseQueryReturnValue.predictions].sort(
                    (a, b) => (a.distance ?? 0) - (b.distance ?? 0),
                );
                return getLocationsFromPredictions(sortedPredictions);
            },
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        search: build.mutation({
            query: request => ({
                url: '/rideSearch',
                method: 'POST',
                body: (() => {
                    const currentTime = new Date().toISOString();
                    const startTime =
                        request.pickupTime && request.pickupTime < currentTime ? currentTime : request.pickupTime;
                    const payload = searchReqTypeToJson(
                        mkRideSearchReq(
                            request.source,
                            request.stops[request.stops.length - 1],
                            request.stops.slice(0, -1),
                            request.isFareProductOneway,
                            startTime,
                            request.dropTime,
                            request.isInterCity,
                            getCurrentTimePlusNmin(1),
                            request.rentalDuration,
                            request.rentalDistance,
                            undefined,
                            request.isAmbulance,
                        ),
                    );
                    return payload;
                })(),
            }),
            onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                try {
                    const { data } = await queryFulfilled;

                    const state = getState() as RootState;
                    const userToken = selectToken(state);
                    dispatch(setSearchRequest(data));
                    dispatch(setSearchId({ id: userToken, payload: data.searchId }));
                    dispatch(setRetrySearch(false));
                } catch (err) {
                    console.error('xyz Search API failed: ', err);

                    const searchError = err as SearchApiErrorResponse;
                    const errorMessage = searchError?.error?.data?.errorMessage;
                    if (errorMessage?.includes('Ride time should only be future time')) {
                        dispatch(setSystemError(true));
                    }
                    dispatch(setSearchFailed(true));
                }
            },
            invalidatesTags: () => [{ type: 'RideBookingList', id: 'LIST' }],
            onCacheEntryAdded: undefined,
        }),
        searchResults: build.query({
            query: ({ searchId }) => ({
                url: `/rideSearch/${searchId}/results?allowMultiple=true`,
            }),
            transformResponse: data => {
                const eitherSearchResults = decodeGetQuotesRes(data);

                if (eitherSearchResults.TAG === 'Error') {
                    throw new Error(eitherSearchResults._0);
                }

                return {
                    data: eitherSearchResults._0 as getQuotesRes,
                    apiTime: Date.now(),
                };
            },
            onQueryStarted: async ({ searchId, toastMessage }, { queryFulfilled, dispatch, getState }) => {
                try {
                    const result = await queryFulfilled;
                    const searchResults = result.data.data;
                    if (!searchResults.estimates) return;

                    const condition = searchResults?.quotes.length > 0 || searchResults?.estimates.length > 0;

                    const state = getState() as RootState;
                    const stateStops = selectSearchedStops(state);
                    const source = selectSearchedSource(state);
                    const selectedOneClickRide = selectSelectedOneClickRide(state);
                    const selectedJourney = selectSelectedJourney(state, searchId);
                    const transformedStops = searchResults.stops.map(stop => {
                        return transformLocationApiEntityToLocation(stop);
                    });
                    const searchResultsDestination = searchResults.toLocation;
                    const searchResultsFromLocation = searchResults.fromLocation;
                    const stateStopsHasNull = stateStops.every(item => item === null);
                    const updatedTransformedStops = searchResultsDestination
                        ? [...transformedStops, transformLocationApiEntityToLocation(searchResultsDestination)]
                        : transformedStops;

                    const estimatePricingItems: PricingItemType[] = condition
                        ? searchResults?.estimates.map(convertEstimateToPricingItem)
                        : [];
                    const quotePricingItems: PricingItemType[] = condition
                        ? searchResults?.quotes
                              .map(convertQuoteToPricingItem)
                              ?.filter((value): value is PricingItemType => !isNull(value))
                        : [];
                    const items = condition
                        ? processPricingItems(
                              source,
                              estimatePricingItems.concat(quotePricingItems),
                              selectedOneClickRide,
                              dispatch,
                              toastMessage,
                          )
                        : [];
                    const showPetRideTopBanner = condition
                        ? estimatePricingItems.some(estimate =>
                              estimate.fareBreakup?.some(fare => fare.title.includes('PET_CHARGES')),
                          )
                        : false;

                    if (stateStopsHasNull || stateStops.length === 0) {
                        dispatch(emptyAllSearchedStops());
                        if (searchResultsFromLocation) {
                            dispatch(
                                setSearchedSource(transformLocationApiEntityToLocation(searchResultsFromLocation)),
                            );
                        }

                        if (updatedTransformedStops.length === 0) {
                            dispatch(addSearchedStop(null));
                        } else {
                            updatedTransformedStops.forEach(stop => {
                                dispatch(addSearchedStop(stop));
                            });
                        }
                    }

                    // Handle pricing and search results updates
                    if (condition) {
                        logEvent(EventName.NY_USER_QUOTE, { search_id: searchId });
                        dispatch(setShowPetRideTopBanner({ id: searchId, payload: showPetRideTopBanner }));
                        dispatch(setPricingItems({ id: searchId, payload: items }));
                        dispatch(setSearchResults({ id: searchId, payload: searchResults }));
                        dispatch(setBoostPreSelectedVariants({ id: searchId, payload: null }));

                        if (
                            items?.[0] &&
                            selectSelectedPricingItems(state, null).length == 0 &&
                            isNull(selectedJourney)
                        ) {
                            const featureFlags = selectNewFeatureFlags(state);
                            handleSmartTipSuggestion(dispatch, searchId, items?.[0], featureFlags.preSelectedSmartTip);
                            dispatch(setSelectedPricingItems({ id: searchId, payload: [items?.[0]] }));
                        }
                    }

                    // Handle journey updates
                    if (searchResults.journey && searchResults.journey.length > 0) {
                        dispatch(setJourneys({ id: searchId, payload: searchResults.journey }));
                    }
                } catch (err) {
                    console.error('Search Results API failed: ', err);
                    dispatch(setSearchFailed(true));
                }
            },
            merge: undefined,
            onCacheEntryAdded: undefined,
            forceRefetch: () => {
                return true;
            },
        }),
        searchResultsOnly: build.query({
            query: searchId => ({
                url: `/rideSearch/${searchId}/results?allowMultiple=true`,
            }),
        }),
    }),
    overrideExisting: false,
});

export const convertEstimateToPricingItem = (estimate: estimateAPIEntity): PricingItemType => {
    return {
        id: estimate?.id,
        tripMode: TripMode.DynamicOffer,
        tripCategory: TripCategory.OneWay,
        serviceTierName: estimate?.serviceTierName,
        smartTipSuggestion: {
            value: estimate?.smartTipSuggestion,
            description: estimate?.smartTipReason,
        },
        tipOptions: estimate.tipOptions,
        cost: estimate?.totalFareRange?.minFare ? estimate?.totalFareRange?.minFare : estimate?.estimatedFare,
        toCost: estimate?.totalFareRange?.maxFare ? estimate?.totalFareRange?.maxFare : estimate?.estimatedFare,
        vehicleIconUrl: estimate?.vehicleIconUrl,
        serviceTierShortDesc: estimate?.serviceTierShortDesc ? estimate?.serviceTierShortDesc : '',
        minVehicleServiceTierSeatingCapacity: estimate?.vehicleServiceTierSeatingCapacity
            ? estimate?.vehicleServiceTierSeatingCapacity
            : 4,
        maxVehicleServiceTierSeatingCapacity: estimate?.vehicleServiceTierSeatingCapacity
            ? estimate?.vehicleServiceTierSeatingCapacity
            : 4,
        estimatedFareWithCurrency: estimate?.estimatedFareWithCurrency,
        isValueAddNP: estimate?.isValueAddNP,
        validTill: estimate?.validTill,
        fareBreakup: estimate?.estimateFareBreakup,
        isAirConditioned: estimate?.isAirConditioned,
        isRoundTrip: false,
        expandedData: undefined,
        vehicleVariant: estimate?.vehicleVariant,
        serviceTierType: estimate?.serviceTierType,
        isInsured: estimate.isInsured || false,
        businessDiscountInfo: estimate?.businessDiscountInfo
            ? { ...estimate.businessDiscountInfo, maxBusinessDiscount: undefined }
            : undefined,
    };
};

export const convertQuoteToPricingItem = (quote: offerRes): PricingItemType | null => {
    // TODO: Fix any type once generators are done
    const respondedQuote = quote.TAG == 'OnDemandCab' ? quote._0 : quote.TAG == 'OnRentalCab' ? quote._0 : null;
    if (!respondedQuote) return null;

    const { tripCategory, tripMode } = (() => {
        switch (respondedQuote?.tripCategory?.TAG) {
            case 'OneWay':
            case 'Delivery':
                switch (respondedQuote?.tripCategory?._0) {
                    case 'OneWayRideOtp':
                        return {
                            tripMode: TripMode.RideOtp,
                            tripCategory: TripCategory.OneWay,
                        };
                    case 'OneWayOnDemandStaticOffer':
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.OneWay,
                        };
                    case 'OneWayOnDemandDynamicOffer':
                        return {
                            tripMode: TripMode.DynamicOffer,
                            tripCategory: TripCategory.OneWay,
                        };
                    default:
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.OneWay,
                        };
                }
            case 'Ambulance':
                switch (respondedQuote?.tripCategory?._0) {
                    case 'OneWayRideOtp':
                        return {
                            tripMode: TripMode.RideOtp,
                            tripCategory: TripCategory.Ambulance,
                        };
                    case 'OneWayOnDemandStaticOffer':
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.Ambulance,
                        };
                    case 'OneWayOnDemandDynamicOffer':
                        return {
                            tripMode: TripMode.DynamicOffer,
                            tripCategory: TripCategory.Ambulance,
                        };
                    default:
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.Ambulance,
                        };
                }
            case 'CrossCity':
            case 'InterCity':
                switch (respondedQuote?.tripCategory?._0.contents) {
                    case 'OneWayRideOtp':
                        return {
                            tripMode: TripMode.RideOtp,
                            tripCategory: TripCategory.InterCity,
                        };
                    case 'OneWayOnDemandStaticOffer':
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.InterCity,
                        };
                    case 'OneWayOnDemandDynamicOffer':
                        return {
                            tripMode: TripMode.DynamicOffer,
                            tripCategory: TripCategory.InterCity,
                        };
                    default:
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.InterCity,
                        };
                }
            case 'RideShare':
            case 'Rental':
                switch (respondedQuote?.tripCategory?._0) {
                    case 'RideOtp':
                        return {
                            tripMode: TripMode.RideOtp,
                            tripCategory: TripCategory.Rental,
                        };
                    case 'OnDemandStaticOffer':
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.Rental,
                        };
                    default:
                        return {
                            tripMode: TripMode.StaticOffer,
                            tripCategory: TripCategory.Rental,
                        };
                }
            default: {
                const fareProductTypeMapping: Record<string, { tripMode: TripMode; tripCategory: TripCategory }> = {
                    ONE_WAY: { tripMode: TripMode.StaticOffer, tripCategory: TripCategory.OneWay },
                    AMBULANCE: { tripMode: TripMode.StaticOffer, tripCategory: TripCategory.Ambulance },
                    INTER_CITY: { tripMode: TripMode.StaticOffer, tripCategory: TripCategory.InterCity },
                    RENTAL: { tripMode: TripMode.StaticOffer, tripCategory: TripCategory.Rental },
                    OneWaySpecialZoneAPIDetails: { tripMode: TripMode.RideOtp, tripCategory: TripCategory.OneWay },
                };

                return (
                    fareProductTypeMapping[respondedQuote.quoteDetails.TAG] || {
                        tripMode: TripMode.StaticOffer,
                        tripCategory: TripCategory.OneWay,
                    }
                );
            }
        }
    })();

    const isRoundTrip = (() => {
        switch (respondedQuote?.quoteDetails.TAG) {
            case 'INTER_CITY':
                return respondedQuote?.quoteDetails._0.roundTrip ?? false;
            default:
                return false;
        }
    })();

    return {
        id: respondedQuote?.id,
        tripMode,
        tripCategory,
        serviceTierName: respondedQuote?.serviceTierName,
        cost: respondedQuote?.estimatedFare,
        toCost: respondedQuote?.estimatedFare,
        vehicleIconUrl: respondedQuote?.vehicleIconUrl,
        serviceTierShortDesc: respondedQuote?.serviceTierShortDesc ?? '',
        validTill: respondedQuote?.validTill,
        minVehicleServiceTierSeatingCapacity: respondedQuote?.vehicleServiceTierSeatingCapacity ?? 4,
        maxVehicleServiceTierSeatingCapacity: respondedQuote?.vehicleServiceTierSeatingCapacity ?? 4,
        estimatedFareWithCurrency: respondedQuote?.estimatedFareWithCurrency,
        isValueAddNP: respondedQuote?.isValueAddNP,

        fareBreakup: respondedQuote?.quoteFareBreakup as estimateFares[] | undefined,
        isAirConditioned: respondedQuote?.isAirConditioned,
        isRoundTrip,
        smartTipSuggestion: {
            value: undefined,
            description: undefined,
        },
        tipOptions: undefined,
        expandedData: undefined,
        vehicleVariant: respondedQuote?.vehicleVariant,
        isInsured: false,
        serviceTierType: respondedQuote?.vehicleVariant,
        businessDiscountInfo: undefined,
    };
};

export const extractBoostPreSelectedVariants = (
    searchResults: getQuotesRes,
    estimatePricingItems: PricingItemType[],
    selectedPricingItems: PricingItemType[],
): string[] | null => {
    if (selectedPricingItems.length === 0) {
        return null;
    }

    const userSelectedItem = selectedPricingItems[0];
    if (!userSelectedItem) {
        return null;
    }

    const userSelectedServiceTier = userSelectedItem.serviceTierType || userSelectedItem.vehicleVariant;

    if (!userSelectedServiceTier) {
        return null;
    }

    const matchingEstimate = searchResults.estimates.find(estimate => {
        const estimateServiceTier = estimate.serviceTierType || estimate.vehicleVariant;
        return estimateServiceTier === userSelectedServiceTier;
    });

    if (!matchingEstimate) {
        return null;
    }

    if (
        !matchingEstimate.boostSearchPreSelectionServiceTierConfig ||
        !Array.isArray(matchingEstimate.boostSearchPreSelectionServiceTierConfig)
    ) {
        return null;
    }

    const serviceTierTypes: ServiceTierType_serviceTierType[] =
        matchingEstimate.boostSearchPreSelectionServiceTierConfig;

    const matchingVariants = estimatePricingItems.filter(item => {
        const itemServiceTier = item.serviceTierType || item.vehicleVariant;
        return itemServiceTier && serviceTierTypes.some(tierType => tierType === itemServiceTier);
    });

    return matchingVariants.length > 0 ? matchingVariants.map(item => item.id) : null;
};

export const {
    useAutoCompleteMutation,
    useSearchMutation,
    useSearchResultsQuery,
    useLazySearchResultsQuery,
    useSearchResultsOnlyQuery,
} = searchApi;
