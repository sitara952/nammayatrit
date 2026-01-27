/* eslint-disable functional/immutable-data */
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createJourneyId, JourneyId } from './user';
import { cloneDeep, isNull } from 'lodash';
import { priceAPIEntity } from '../../../readOnly/api/types/PriceAPIEntity.gen';
import type { legInfo, legInfo as LegInfo_legInfo } from '../../../readOnly/api/types/LegInfo.gen';
import type { journeyInfoResp } from '../../../readOnly/api/types/JourneyInfoResp.gen';
import { legStatus } from '@/readOnly/api/types/LegStatus.gen';
import { latLong } from '@/api/apiTypes/GetPlaceNameApi.gen';
import {
    JourneyStatus_journeyStatus,
    FRFSBookingPaymentStatusAPI_fRFSBookingPaymentStatusAPI,
    TrackingStatus_trackingStatus,
} from '@/readOnly/api/types/Enums.gen';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen';
import { rateMultiModelTravelModes } from '@/readOnly/api/types/RateMultiModelTravelModes.gen';
import { isLegOngoing } from '@/typescript/utils/LegStatusUtils';
import { vehiclePosition } from '@/readOnly/api/types/VehiclePosition.gen';
import { splitConnectedLeg } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';

const safeSet = (stateObj: JourneyDict, id: JourneyId) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptyJourney);
    return stateObj[id];
};

export type RouteStop = {
    name: string;
};

export type RouteDetailsData = {
    start: string;
    end: string;
    stops: RouteStop[];
    busNumber: string;
    acType: string;
    totalStops: number;
};

export type Journey = {
    estimatedDuration: number | null;
    estimatedMinFare: priceAPIEntity | null;
    estimatedMaxFare: priceAPIEntity | null;
    estimatedDistance: number | null;
    legs: LegInfo_legInfo[];
    vehiclePositions: Record<number, Record<number, vehiclePosition[] | undefined>>;
    status: JourneyStatus_journeyStatus | null;
    metroAndBusStation: Record<number, Record<number, TrackingData>>;
    nextStops: Record<number, Record<number, NextStopData>> | undefined;
    paymentStatus: FRFSBookingPaymentStatusAPI_fRFSBookingPaymentStatusAPI | null;
    journeyFeedBack: journeyFeedBackForm | null;
    unifiedQRV2: string | undefined;
    merchantOperatingCityName: string | undefined;
    distances: Record<number, Record<number, number>>;
    initialDistances: Record<number, Record<number, number>>;
    routeDetails: RouteDetailsData | null;
    paymentOrderShortId: string | undefined;
    startTime: string | undefined;
    journeyId: JourneyId | undefined;
    legLoadingStatus: Record<string, boolean>;
    journeyRefresh: boolean | undefined;
    metroTicketCancellationStep: CancellationStep;
    createdAt: string;
};

const emptyJourney: Journey = {
    estimatedDuration: null,
    estimatedMinFare: null,
    estimatedMaxFare: null,
    estimatedDistance: null,
    legs: [],
    vehiclePositions: {},
    status: null,
    metroAndBusStation: {},
    nextStops: undefined,
    paymentStatus: null,
    journeyFeedBack: null,
    unifiedQRV2: undefined,
    merchantOperatingCityName: undefined,
    distances: {},
    initialDistances: {},
    routeDetails: null,
    paymentOrderShortId: undefined,
    startTime: undefined,
    journeyId: undefined,
    legLoadingStatus: {},
    journeyRefresh: false,
    metroTicketCancellationStep: 'notInitialized',
    createdAt: '',
};

export type NextStopData = {
    nextStopCode: string | undefined;
};

export type CancellationStep =
    | 'notInitialized'
    | 'initial'
    | 'checking'
    | 'showingCharges'
    | 'cancelling'
    | 'cancelled'
    | 'notCancellable'
    | 'journeyStarted';

type JourneyDict = {
    [journeyId: JourneyId]: Journey;
};

type JourneyPayload<T> = {
    id: JourneyId | null;
    payload: T;
};
type JourneyPayloadAction<T> = PayloadAction<JourneyPayload<T>>;

type MetroAndBusStationType = {
    legOrder: number;
    subLegOrder: number;
    stops: StopsData[];
    wayPoints: latLong[] | undefined;
};

export type StopsData = {
    stop: fRFSStationAPI;
    number: number;
};

export type LegTickets = {
    metro: string[];
    bus: string[];
};

type ProcessedJourneyInfo = {
    legStatusInfo: legInfo[];
};

export type TrackingData = {
    stops: StopsData[];
    wayPoints: latLong[] | undefined;
};

/**
 * Common function to check if the new tracking status should be updated based on timestamp comparison
 * @param currentLastUpdatedAt - Current timestamp string (optional)
 * @param newLastUpdatedAt - New timestamp string (optional)
 * @param newTrackingStatus - New tracking status to potentially update
 * @param currentTrackingStatus - Current tracking status
 * @returns Object with shouldUpdate flag and values to use
 */
const shouldUpdateTrackingStatus = (
    currentLastUpdatedAt: string | undefined,
    newLastUpdatedAt: string | undefined,
    newTrackingStatus: TrackingStatus_trackingStatus | undefined,
    currentTrackingStatus: TrackingStatus_trackingStatus | undefined,
) => {
    // If either timestamp is undefined, update with new values
    if (currentLastUpdatedAt === undefined || newLastUpdatedAt === undefined) {
        return {
            shouldUpdate: true,
            trackingStatus: newTrackingStatus,
            trackingStatusLastUpdatedAt: newLastUpdatedAt,
        };
    }

    // Parse timestamps and compare
    const currentTime = new Date(currentLastUpdatedAt).getTime();
    const newTime = new Date(newLastUpdatedAt).getTime();

    // If new timestamp is greater than current, update
    if (newTime > currentTime) {
        return {
            shouldUpdate: true,
            trackingStatus: newTrackingStatus,
            trackingStatusLastUpdatedAt: newLastUpdatedAt,
        };
    }

    // Otherwise, keep current values
    return {
        shouldUpdate: false,
        trackingStatus: currentTrackingStatus,
        trackingStatusLastUpdatedAt: currentLastUpdatedAt,
    };
};

const REDUCER_NAME: string = 'journey';

const INITIAL_STATE: JourneyDict = {};

export const journeySlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setJourneyResp: (state, action: JourneyPayloadAction<journeyInfoResp>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).status = action.payload.payload.journeyStatus ?? undefined;
            safeSet(state, action.payload.id).estimatedMaxFare = action.payload.payload.estimatedMaxFare ?? null;
            safeSet(state, action.payload.id).estimatedMinFare = action.payload.payload.estimatedMinFare ?? null;
            safeSet(state, action.payload.id).estimatedDistance = action.payload.payload.estimatedDistance.value;
            safeSet(state, action.payload.id).unifiedQRV2 = action.payload.payload.unifiedQRV2 ?? undefined;
            safeSet(state, action.payload.id).startTime = action.payload.payload.startTime ?? undefined;
            safeSet(state, action.payload.id).journeyId = createJourneyId(action.payload.payload.journeyId);
            safeSet(state, action.payload.id).createdAt = action.payload.payload.createdAt ?? '';
            safeSet(state, action.payload.id).paymentOrderShortId =
                action.payload.payload.paymentOrderShortId ?? undefined;
            safeSet(state, action.payload.id).merchantOperatingCityName =
                action.payload.payload.merchantOperatingCityName;
            const processedLegs: legInfo[] = [];
            action.payload.payload.legs
                .slice()
                .sort((leg1, leg2) => leg1.order - leg2.order)
                .forEach(leg => {
                    splitConnectedLeg(leg).forEach(leg => {
                        processedLegs.push(leg);
                    });
                });
            safeSet(state, action.payload.id).legs = processedLegs;
            safeSet(state, action.payload.id).estimatedDuration = action.payload.payload.estimatedDuration ?? null;
            return undefined;
        },
        updateJourneyLegStatus: (
            state,
            action: JourneyPayloadAction<{
                legOrder: number;
                mbSubLegOrder: number | undefined;
                trackingStatus: TrackingStatus_trackingStatus | undefined;
                trackingStatusLastUpdatedAt: string | undefined;
            }>,
        ) => {
            if (isNull(action.payload.id)) return state;
            const { legOrder, mbSubLegOrder, trackingStatus, trackingStatusLastUpdatedAt } = action.payload.payload;
            const subLegOrder = mbSubLegOrder ?? 1;

            return {
                ...state,
                [action.payload.id]: {
                    ...state[action.payload.id],
                    legs: state[action.payload.id]?.legs?.map(leg => {
                        if (leg.order === legOrder) {
                            // Handle Metro and Subway legs
                            if (leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway') {
                                if (leg.legExtraInfo._0.routeInfo[0]?.subOrder === subLegOrder) {
                                    const currentRouteInfo = leg.legExtraInfo._0.routeInfo[0];
                                    const updateResult = shouldUpdateTrackingStatus(
                                        currentRouteInfo?.trackingStatusLastUpdatedAt,
                                        trackingStatusLastUpdatedAt,
                                        trackingStatus,
                                        currentRouteInfo?.trackingStatus,
                                    );

                                    if (updateResult.shouldUpdate) {
                                        const updatedRouteInfo = {
                                            ...currentRouteInfo,
                                            trackingStatus: updateResult.trackingStatus,
                                            trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                        };
                                        if (leg.legExtraInfo.TAG === 'Metro') {
                                            return {
                                                ...leg,
                                                legExtraInfo: {
                                                    TAG: 'Metro',
                                                    _0: {
                                                        ...leg.legExtraInfo._0,
                                                        routeInfo: [updatedRouteInfo],
                                                    },
                                                },
                                            };
                                        } else {
                                            return {
                                                ...leg,
                                                legExtraInfo: {
                                                    TAG: 'Subway',
                                                    _0: {
                                                        ...leg.legExtraInfo._0,
                                                        routeInfo: [updatedRouteInfo],
                                                    },
                                                },
                                            };
                                        }
                                    }
                                }
                            } else if (leg.legExtraInfo.TAG === 'Bus') {
                                const updateResult = shouldUpdateTrackingStatus(
                                    leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                    trackingStatusLastUpdatedAt,
                                    trackingStatus,
                                    leg.legExtraInfo._0.trackingStatus,
                                );

                                if (updateResult.shouldUpdate) {
                                    return {
                                        ...leg,
                                        legExtraInfo: {
                                            TAG: 'Bus',
                                            _0: {
                                                ...leg.legExtraInfo._0,
                                                trackingStatus: updateResult.trackingStatus,
                                                trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                            },
                                        },
                                    };
                                }
                            }
                            // Handle Taxi legs
                            else if (leg.legExtraInfo.TAG === 'Taxi') {
                                const updateResult = shouldUpdateTrackingStatus(
                                    leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                    trackingStatusLastUpdatedAt,
                                    trackingStatus,
                                    leg.legExtraInfo._0.trackingStatus,
                                );

                                if (updateResult.shouldUpdate) {
                                    return {
                                        ...leg,
                                        legExtraInfo: {
                                            TAG: 'Taxi',
                                            _0: {
                                                ...leg.legExtraInfo._0,
                                                trackingStatus: updateResult.trackingStatus,
                                                trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                            },
                                        },
                                    };
                                }
                            }
                            // Handle Walk legs
                            else if (leg.legExtraInfo.TAG === 'Walk') {
                                const updateResult = shouldUpdateTrackingStatus(
                                    leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                    trackingStatusLastUpdatedAt,
                                    trackingStatus,
                                    leg.legExtraInfo._0.trackingStatus,
                                );

                                if (updateResult.shouldUpdate) {
                                    return {
                                        ...leg,
                                        legExtraInfo: {
                                            TAG: 'Walk',
                                            _0: {
                                                ...leg.legExtraInfo._0,
                                                trackingStatus: updateResult.trackingStatus,
                                                trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                            },
                                        },
                                    };
                                }
                            }
                        }
                        return leg;
                    }),
                },
            };
        },
        updateLegsStatus: (state, action: JourneyPayloadAction<legStatus[]>) => {
            if (isNull(action.payload.id)) return state;

            const currentState = safeSet(state, action.payload.id);
            const { legs } = currentState;

            const initialAcc: ProcessedJourneyInfo = { legStatusInfo: [] };

            const { legStatusInfo } = legs.reduce<ProcessedJourneyInfo>((acc, leg) => {
                const legStatus = action.payload.payload.find(
                    ls =>
                        ls.legOrder == leg.order &&
                        (leg.legExtraInfo.TAG == 'Metro' || leg.legExtraInfo.TAG == 'Subway'
                            ? ls.subLegOrder === leg.legExtraInfo._0.routeInfo[0]?.subOrder
                            : 1),
                );

                const legExtraInfo: legExtraInfo = (() => {
                    switch (leg.legExtraInfo.TAG) {
                        case 'Metro':
                            return {
                                TAG: 'Metro',
                                _0: {
                                    ...leg.legExtraInfo._0,
                                    routeInfo: leg.legExtraInfo._0.routeInfo.map(routeInfo => {
                                        const updateResult = shouldUpdateTrackingStatus(
                                            routeInfo.trackingStatusLastUpdatedAt,
                                            legStatus?.trackingStatusLastUpdatedAt,
                                            legStatus?.trackingStatus,
                                            routeInfo.trackingStatus,
                                        );
                                        return {
                                            ...routeInfo,
                                            trackingStatus: updateResult.trackingStatus,
                                            trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                        };
                                    }),
                                },
                            };
                        case 'Subway':
                            return {
                                TAG: 'Subway',
                                _0: {
                                    ...leg.legExtraInfo._0,
                                    routeInfo: leg.legExtraInfo._0.routeInfo.map(routeInfo => {
                                        const updateResult = shouldUpdateTrackingStatus(
                                            routeInfo.trackingStatusLastUpdatedAt,
                                            legStatus?.trackingStatusLastUpdatedAt,
                                            legStatus?.trackingStatus,
                                            routeInfo.trackingStatus,
                                        );
                                        return {
                                            ...routeInfo,
                                            trackingStatus: updateResult.trackingStatus,
                                            trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                        };
                                    }),
                                },
                            };
                        case 'Bus': {
                            const updateResult = shouldUpdateTrackingStatus(
                                leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatus,
                                leg.legExtraInfo._0.trackingStatus,
                            );
                            return {
                                TAG: 'Bus',
                                _0: {
                                    ...leg.legExtraInfo._0,
                                    trackingStatus: updateResult.trackingStatus,
                                    trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                },
                            };
                        }
                        case 'Taxi': {
                            const updateResult = shouldUpdateTrackingStatus(
                                leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatus,
                                leg.legExtraInfo._0.trackingStatus,
                            );
                            return {
                                TAG: 'Taxi',
                                _0: {
                                    ...leg.legExtraInfo._0,
                                    trackingStatus: updateResult.trackingStatus,
                                    trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                },
                            };
                        }
                        case 'Walk': {
                            const updateResult = shouldUpdateTrackingStatus(
                                leg.legExtraInfo._0.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatusLastUpdatedAt,
                                legStatus?.trackingStatus,
                                leg.legExtraInfo._0.trackingStatus,
                            );
                            return {
                                TAG: 'Walk',
                                _0: {
                                    ...leg.legExtraInfo._0,
                                    trackingStatus: updateResult.trackingStatus,
                                    trackingStatusLastUpdatedAt: updateResult.trackingStatusLastUpdatedAt,
                                },
                            };
                        }
                        default:
                            return leg.legExtraInfo;
                    }
                })();

                const processedLeg: legInfo = {
                    ...leg,
                    legExtraInfo,
                    bookingStatus: legStatus?.bookingStatus ?? leg.bookingStatus,
                };

                return { legStatusInfo: [...acc.legStatusInfo, processedLeg] };
            }, initialAcc);

            const journeyStatusInfo = [...legStatusInfo].sort((leg1, leg2) => leg1.order - leg2.order);

            return {
                ...state,
                [action.payload.id]: {
                    ...currentState,
                    legs: journeyStatusInfo,
                },
            };
        },
        updateJourneyStatus: (state, action: JourneyPayloadAction<JourneyStatus_journeyStatus>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).status = action.payload.payload;
            return undefined;
        },
        updateJourneyPaymentStatus: (
            state,
            action: JourneyPayloadAction<FRFSBookingPaymentStatusAPI_fRFSBookingPaymentStatusAPI | null>,
        ) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).paymentStatus = action.payload.payload;
            return undefined;
        },
        updateVehiclePosition: (state, action: JourneyPayloadAction<legStatus[]>) => {
            if (isNull(action.payload.id)) return state;
            const vehiclePositions: Record<number, Record<number, vehiclePosition[] | undefined>> = {};

            action.payload.payload.slice().forEach(item => {
                const { legOrder, subLegOrder, vehiclePositions: vp } = item;
                vehiclePositions[legOrder] = {
                    ...vehiclePositions[legOrder],
                    [subLegOrder]: vp,
                };
            });
            safeSet(state, action.payload.id).vehiclePositions = vehiclePositions;
            return undefined;
        },
        setMetroAndBusStations: (state, action: JourneyPayloadAction<MetroAndBusStationType>) => {
            if (isNull(action.payload.id)) return state;

            if (
                action.payload.payload.legOrder !== undefined &&
                action.payload.payload.stops &&
                action.payload.payload.wayPoints
            ) {
                const records = safeSet(state, action.payload.id).metroAndBusStation;
                const { legOrder, subLegOrder, stops, wayPoints } = action.payload.payload;
                safeSet(state, action.payload.id).metroAndBusStation = {
                    ...records,
                    [legOrder]: {
                        ...records[legOrder],
                        [subLegOrder]: { stops, wayPoints },
                    },
                };
            }

            return undefined;
        },
        updateNextStops: (state, action: JourneyPayloadAction<legStatus[]>) => {
            if (isNull(action.payload.id)) return state;

            const map: Record<number, Record<number, NextStopData>> = {};
            const leg = action.payload.payload;
            leg.forEach(currentLeg => {
                const nextStop = currentLeg.vehiclePositions[0]?.upcomingStops.at(0);
                if (currentLeg?.legOrder !== undefined && nextStop?.stopCode) {
                    map[currentLeg?.legOrder] = {
                        ...map[currentLeg?.legOrder],
                        [currentLeg.subLegOrder ?? 1]: {
                            nextStopCode: nextStop.stopCode,
                        },
                    };
                }
            });
            safeSet(state, action.payload.id).nextStops = map;
            return undefined;
        },
        setJourneyFeedBack: (state, action: JourneyPayloadAction<journeyFeedBackForm>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).journeyFeedBack = action.payload.payload;
            return undefined;
        },
        setSubAutoJourneyFeedBack: (state, action: JourneyPayloadAction<rateMultiModelTravelModes>) => {
            if (isNull(action.payload.id)) return state;
            const JourneyFeedBack = safeSet(state, action.payload.id).journeyFeedBack;
            const journeyFeedBackState = JourneyFeedBack ?? {
                additionalFeedBack: undefined,
                rating: undefined,
                rateTravelMode: [],
            };
            const filteredJourneyOrders = journeyFeedBackState.rateTravelMode
                .slice()
                .filter(item => item.legOrder !== action.payload.payload?.legOrder);
            filteredJourneyOrders.push(action.payload.payload);
            safeSet(state, action.payload.id).journeyFeedBack = {
                ...journeyFeedBackState,
                rateTravelMode: filteredJourneyOrders,
            };
            return undefined;
        },
        setLegDistances: (
            state,
            action: JourneyPayloadAction<{ legOrder: number; subLegOrder: number; distance: number }[]>,
        ) => {
            if (isNull(action.payload.id)) return state;
            const distances = safeSet(state, action.payload.id).distances;
            action.payload.payload.forEach(({ legOrder, subLegOrder, distance }) => {
                distances[legOrder] = {
                    ...(distances[legOrder] ?? {}),
                    [subLegOrder]: distance,
                };
            });
            return undefined;
        },
        setInitialLegDistances: (
            state,
            action: JourneyPayloadAction<{ legOrder: number; subLegOrder: number; distance: number }[]>,
        ) => {
            if (isNull(action.payload.id)) return state;
            const initialDistances = safeSet(state, action.payload.id).initialDistances;
            action.payload.payload.forEach(({ legOrder, subLegOrder, distance }) => {
                initialDistances[legOrder] = {
                    ...(initialDistances[legOrder] ?? {}),
                    [subLegOrder]: distance,
                };
            });
            return undefined;
        },
        setRouteDetails: (state, action: JourneyPayloadAction<RouteDetailsData>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).routeDetails = action.payload.payload;
            return undefined;
        },
        setPaymentOrderId: (state, action: JourneyPayloadAction<{ paymentOrderShortId: string }>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).paymentOrderShortId = action.payload.payload.paymentOrderShortId;
            return undefined;
        },
        clearAllJourneyState: () => {
            return INITIAL_STATE;
        },
        clearJourneyData: (state, action: PayloadAction<{ id: JourneyId }>) => {
            if (state[action.payload.id]) {
                delete state[action.payload.id];
            }
            return undefined;
        },
        setJourneyRefreshFlag: (state, action: JourneyPayloadAction<boolean | undefined>) => {
            if (isNull(action.payload.id)) return state;
            const journey = safeSet(state, action.payload.id);
            journey.journeyRefresh = action.payload.payload;
            return undefined;
        },
        setBusFleetNumber: (state, action: JourneyPayloadAction<{ legOrder: number; fleetNumber: string }>) => {
            if (isNull(action.payload.id)) return state;
            const journey = safeSet(state, action.payload.id);
            const legs = journey.legs;
            const updatedLegs = legs.map(leg => {
                if (leg.order === action.payload.payload.legOrder && leg.legExtraInfo.TAG === 'Bus') {
                    return {
                        ...leg,
                        legExtraInfo: {
                            ...leg.legExtraInfo,
                            _0: { ...leg.legExtraInfo._0, fleetNo: action.payload.payload.fleetNumber },
                        },
                    };
                }
                return leg;
            });
            safeSet(state, action.payload.id).legs = updatedLegs;
            return undefined;
        },
        setLegIsLoading: (
            state,
            action: JourneyPayloadAction<{ legOrder: string; journeyRefresh: boolean | undefined }>,
        ) => {
            if (isNull(action.payload.id)) return state;
            const journey = safeSet(state, action.payload.id);
            journey.legLoadingStatus[action.payload.payload.legOrder] = true;
            if (action.payload.payload.journeyRefresh) {
                journey.journeyRefresh = true;
            }
            return undefined;
        },
        clearLegIsLoading: (state, action: JourneyPayloadAction<{ legOrder: string }>) => {
            if (isNull(action.payload.id)) return state;
            const journey = safeSet(state, action.payload.id);
            delete journey.legLoadingStatus[action.payload.payload.legOrder];
            return undefined;
        },
        clearAllLegLoading: (state, action: JourneyPayloadAction<void>) => {
            if (isNull(action.payload.id)) return state;
            const journey = safeSet(state, action.payload.id);
            journey.legLoadingStatus = {};
            return undefined;
        },
        setMetroTicketCancellationStepForJourney: (state, action: JourneyPayloadAction<{ step: CancellationStep }>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).metroTicketCancellationStep = action.payload.payload.step;
            return undefined;
        },
        resetMetroTicketCancellationStepForJourney: (state, action: JourneyPayloadAction<void>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).metroTicketCancellationStep = 'initial';
            return undefined;
        },
    },
});

export const selectAllJourney = (state: RootState) => {
    const journey: JourneyDict | undefined = state.journey;
    return journey;
};

export const selectJourneyWithId = (state: RootState, journeyId: JourneyId | null) => {
    const journeyDict = state.journey;
    if (!isNull(journeyId) && journeyDict && journeyDict[journeyId]) {
        const journey: Journey = journeyDict[journeyId];
        return journey;
    }
    return emptyJourney;
};

export const selectMerchantOperatingCityName = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).merchantOperatingCityName;

export const selectJourneyLegs = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).legs;

export const selectLegLoadingStatus = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).legLoadingStatus;

export const selectJourneyRefreshStatus = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).journeyRefresh;

export const selectJourneyEstimatedDuration = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).estimatedDuration;

export const selectJourneyFeedBack = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).journeyFeedBack;

export const selectJourneyEstimatedFare = (state: RootState, journeyId: JourneyId | null) => [
    selectJourneyWithId(state, journeyId).estimatedMinFare,
    selectJourneyWithId(state, journeyId).estimatedMaxFare,
];

export const selectJourneyEstimatedDistance = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).estimatedDistance;

export const selectUnifiedQR = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).unifiedQRV2;

export const selectOnGoingLeg = (state: RootState, journeyId: JourneyId | null): LegInfo_legInfo | null => {
    if (!journeyId) return null;
    const legs = selectJourneyWithId(state, journeyId)?.legs;
    if (!legs) return null;
    // Find the first leg that is currently ongoing
    return legs.find(item => isLegOngoing(item)) || null;
};

export const selectVehiclePositions = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).vehiclePositions;

export const selectJourneyStatus = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).status;

export const selectMetroAndbusStation = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).metroAndBusStation;

export const selectNextStops = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).nextStops;

export const selectLegTickets = (state: RootState, journeyId: JourneyId | null): LegTickets => {
    const legs = selectJourneyWithId(state, journeyId)?.legs ?? [];
    return getTicketsFromLegs(legs);
};

export const selectJourneyPaymentStatus = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).paymentStatus;

export const selectJourneyPaymentOrderId = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).paymentOrderShortId;

export const selectLegDistances = (state: RootState, journeyId: JourneyId | null) => {
    const journey = selectJourneyWithId(state, journeyId);
    return journey ? journey.distances : [];
};
export const selectInitialLegDistances = (state: RootState, journeyId: JourneyId | null) => {
    const journey = selectJourneyWithId(state, journeyId);
    return journey ? journey.initialDistances : [];
};

export const selectRouteDetails = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).routeDetails;

export const selectLatestInprogressJourney = (state: RootState): Journey | null => {
    const allJourneys = selectAllJourney(state);
    if (!allJourneys) {
        return null;
    }

    const inProgressJourneys = Object.values(allJourneys).filter(journey => journey && journey.status === 'INPROGRESS');

    if (inProgressJourneys.length === 0) {
        return null;
    }

    // Sort by startTime of the first leg in descending order to get the latest
    inProgressJourneys.sort((a, b) => {
        const aStartTime = a?.createdAt;
        const bStartTime = b?.createdAt;

        if (!aStartTime && !bStartTime) return 0;
        if (!aStartTime) return 1; // b is later if a has no start time
        if (!bStartTime) return -1; // a is later if b has no start time

        return new Date(bStartTime).getTime() - new Date(aStartTime).getTime();
    });

    const latestJourney = inProgressJourneys[0];
    return latestJourney || null;
};

export const selectLatestInprogressJourneyId = createSelector([selectAllJourney], (allJourneys): JourneyId | null => {
    if (!allJourneys) {
        return null;
    }

    const inProgressJourneys = Object.values(allJourneys).filter(journey => journey && journey.status === 'INPROGRESS');

    if (inProgressJourneys.length === 0) {
        return null;
    }

    // Sort by createdAt in descending order to get the latest
    inProgressJourneys.sort((a, b) => {
        const aStartTime = a?.createdAt;
        const bStartTime = b?.createdAt;

        if (!aStartTime && !bStartTime) return 0;
        if (!aStartTime) return 1; // b is later if a has no start time
        if (!bStartTime) return -1; // a is later if b has no start time

        return new Date(bStartTime).getTime() - new Date(aStartTime).getTime();
    });

    const latestJourney = inProgressJourneys[0];
    return latestJourney?.journeyId || null;
});

export const selectPaymentOrderId = (state: RootState, journeyId: JourneyId | null) =>
    selectJourneyWithId(state, journeyId).paymentOrderShortId;

export const getTicketsFromLegs = (legs: legInfo[]): LegTickets => {
    const processedLegOrders = new Set<number>();
    return legs.reduce<LegTickets>(
        (acc, leg) => {
            // Skip if we've already processed this leg order
            if (leg.order !== undefined && processedLegOrders.has(leg.order)) {
                return acc;
            }

            if (leg?.legExtraInfo?.TAG === 'Metro') {
                acc.metro.push(...(leg?.legExtraInfo?._0?.tickets ?? []));
            } else if (leg?.legExtraInfo?.TAG === 'Bus') {
                acc.bus.push(...(leg?.legExtraInfo?._0?.tickets ?? []));
            }
            if (leg.order !== undefined) {
                processedLegOrders.add(leg.order);
            }
            return acc;
        },
        { metro: [], bus: [] },
    );
};

export const selectMetroTicketCancellationStepForJourney = (
    state: RootState,
    journeyId: JourneyId | null,
): CancellationStep => {
    if (isNull(journeyId)) return 'initial';
    return selectJourneyWithId(state, journeyId).metroTicketCancellationStep ?? 'initial';
};

export const {
    setJourneyResp,
    updateLegsStatus,
    updateVehiclePosition,
    updateJourneyStatus,
    updateJourneyLegStatus,
    setMetroAndBusStations,
    setSubAutoJourneyFeedBack,
    setJourneyFeedBack,
    updateNextStops,
    updateJourneyPaymentStatus,
    setLegDistances,
    setInitialLegDistances,
    setPaymentOrderId,
    setRouteDetails,
    clearAllJourneyState,
    clearJourneyData,
    setJourneyRefreshFlag,
    setLegIsLoading,
    clearLegIsLoading,
    clearAllLegLoading,
    setMetroTicketCancellationStepForJourney,
    resetMetroTicketCancellationStepForJourney,
    setBusFleetNumber,
} = journeySlice.actions;

export default journeySlice;
