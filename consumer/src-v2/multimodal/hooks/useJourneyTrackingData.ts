import { useMemo, useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useMultimodalJourneyIdBookingInfoGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet';
import { getConfirmedBoardingDataFromCache } from '../utils/cache';
import { useNetworkAware } from './useNetworkAware';
import { useRiderLocation } from './useRiderLocation';
import { type vehiclePosition } from '@/readOnly/api/types/VehiclePosition.gen';
import { type latLong as LatLongType } from '@/readOnly/api/types/LatLong.gen';
import { selectSearchId, setSearchId, type JourneyId } from '@/typescript/state/client/user';
import {
    selectJourneyLegs,
    selectVehiclePositions,
    setJourneyResp,
    clearAllLegLoading,
    selectLegLoadingStatus,
    selectJourneyRefreshStatus,
    setJourneyRefreshFlag,
    setLegIsLoading,
    clearJourneyData,
} from '@/typescript/state/client/journey';
import { MOCKDATA } from './mockData/journeyTrackingMockData';
import {
    localMapHookTransitModeToDomainTransit,
    mapTravelModeToTransitMode,
    extractOriginName,
    extractOriginStopCode,
    extractOriginLatLong,
    extractDestinationName,
    extractDestinationStopCode,
    extractDestinationLatLong,
    extractVehicleName,
    extractTickets,
    extractAlternateRouteNames,
    extractPlatform,
    extractBookingId,
    extractDriverNumber,
    extractExoNumber,
    extractFrequency,
    getOnRouteStops,
    splitConnectedLeg,
    createLegOrder,
    getOrder,
    getSubOrder,
    mapBackendStatusToUserState,
    extractLegStartTime,
    getNextLegOrder,
    extractTicketCreatedAt,
    extractCategories,
} from '../utils/journeyTrackingUtils';
import { processJourneyData } from '../rules/journeyLogic';
import {
    type ProcessedLegInfo,
    type StopType,
    type TrackedLegInfoRealTimeInfo,
    type TrackedLegInfoStaticInfo,
    type LiveVehicleData,
    type StopsInformationItem,
} from '../types/journeyTracking';
import { useJourneyWaypoints } from './useJourneyWaypoints';
import { useTimetables } from './useTimetables';
import { shallowEqual } from 'react-redux';
import { isEqual } from 'lodash';
import {
    isLegOngoing,
    isLegCompleted,
    mapLegToVehicleState,
    getTrackingStatusForLeg,
    isBookingStatusConfirmed,
} from '@/typescript/utils/LegStatusUtils';

export type { LatLongType as latLong };
import { VehicleState } from '../types/journeyTracking';
import { filterExtraStops } from '../utils/journeyTrackingUtils';
import { filterExtraWaypoints } from '../utils/locationUtils';
import { useOfflineTickets } from './useOfflineTickets';
import { selectToken } from '@/typescript/state/client/auth';
import { logger } from '@/src-v2/systems/logger';
import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { getArrayItem, MMKVKey } from '@/typescript/utils/MMKV';
import { checkTaxiLeg } from '@/typescript/utils/common';

export interface JourneyTrackingDataOptions {
    mockMode?: boolean;
    isFocused: boolean;
    onLegStatusChange: ((legOrder: string, newStatus: VehicleState) => Promise<void> | undefined) | undefined;
}

export const useJourneyTrackingData = (
    journeyId: JourneyId | null,
    options: JourneyTrackingDataOptions | undefined,
): {
    data: ProcessedLegInfo[];
    isLoading: boolean;
    error: unknown;
    updateLocationManually: (location: latLong) => void;
} => {
    const { mockMode = false, isFocused, onLegStatusChange = () => {} } = options || {};
    const { shouldMakeApiCalls } = useNetworkAware();

    const DEFAULT_POLLING_INTERVAL = 10000;
    const FAST_POLLING_INTERVAL = 2000;

    const [pollingInterval, setPollingInterval] = useState<number>(DEFAULT_POLLING_INTERVAL);
    const riderLocationHistory = useRiderLocation({
        journeyId,
        mock: mockMode,
        isFocused: isFocused ?? false,
        pollingInterval,
    });
    const dispatch = useAppDispatch();
    const [fetchJourneyMeta, { isLoading: isLoadingMeta, error: errorMeta }] =
        useMultimodalJourneyIdBookingInfoGetMutation();
    const rawJourneyLegsInfo = useAppSelector(state => selectJourneyLegs(state, journeyId), shallowEqual);
    const legLoadingStatus = useAppSelector(state => selectLegLoadingStatus(state, journeyId), shallowEqual);
    const journeyRefresh = useAppSelector(state => selectJourneyRefreshStatus(state, journeyId));
    const rawVehiclePositionsData = useAppSelector(state => selectVehiclePositions(state, journeyId), shallowEqual);
    const legWaypoints = useJourneyWaypoints(journeyId, rawJourneyLegsInfo, mockMode);

    const customerTags = getArrayItem(MMKVKey.CUSTOMER_NAMMA_TAGS);

    const {
        legTimetables,
        isLoading: isLoadingTimetables,
        error: errorTimetables,
    } = useTimetables(rawJourneyLegsInfo, mockMode);

    const { addJourneyToMMKV } = useOfflineTickets();

    useEffect(() => {
        if (mockMode || !journeyId || !isFocused) return;

        const hasDataInStore = rawJourneyLegsInfo && rawJourneyLegsInfo.length > 0;

        const loadJourneyMeta = async () => {
            // If we have data in the store and no refresh is requested, or if we are offline, we don't need to fetch.
            if ((hasDataInStore && !journeyRefresh) || !shouldMakeApiCalls) {
                if (!shouldMakeApiCalls) {
                    console.info(`[JourneyMeta] Offline mode: using Redux-persisted data for journey ${journeyId}`);
                }
                return;
            }

            // Proceed with API call
            try {
                const freshData = await fetchJourneyMeta({ journeyId: journeyId }).unwrap();
                if (freshData.journeyStatus == 'CANCELLED') {
                    dispatch(clearJourneyData({ id: journeyId }));
                    return;
                }
                const processedLegs = freshData.legs
                    .slice()
                    .sort((leg1, leg2) => leg1.order - leg2.order)
                    .flatMap(leg => splitConnectedLeg(leg));
                dispatch(setJourneyResp({ id: journeyId, payload: { ...freshData, legs: processedLegs } }));
                addJourneyToMMKV(freshData); // This seems to be for offline tickets, so we keep it.
                dispatch(clearAllLegLoading({ id: journeyId, payload: undefined }));
                dispatch(setJourneyRefreshFlag({ id: journeyId, payload: false }));
            } catch (error) {
                console.error(`[JourneyMeta] API failed for journey ${journeyId}:`, error);
                dispatch(clearAllLegLoading({ id: journeyId, payload: undefined }));
                // Error is handled by the errorMeta variable from the hook
            }
        };

        loadJourneyMeta();
    }, [journeyId, mockMode, shouldMakeApiCalls, isFocused, rawJourneyLegsInfo, journeyRefresh]);

    const finalIsLoading = useMemo(() => {
        if (mockMode || !isFocused) return false;

        // In offline mode, don't show loading if we have any cached data
        if (!shouldMakeApiCalls) {
            return false; // Rely on cached data, don't show loading indefinitely
        }

        return (
            (isLoadingMeta && (!rawJourneyLegsInfo || rawJourneyLegsInfo.length === 0)) ||
            isLoadingTimetables ||
            !riderLocationHistory.currentLocation ||
            Boolean(
                journeyId &&
                    !errorMeta &&
                    (!rawJourneyLegsInfo ||
                        rawJourneyLegsInfo.length === 0 ||
                        (rawJourneyLegsInfo.length > 0 &&
                            Object.keys(legWaypoints).length < rawJourneyLegsInfo.length)),
            )
        );
    }, [
        mockMode,
        isFocused,
        isLoadingMeta,
        rawJourneyLegsInfo,
        journeyId,
        errorMeta,
        legWaypoints,
        isLoadingTimetables,
        riderLocationHistory.currentLocation,
        shouldMakeApiCalls,
    ]);

    const staticLegData = useMemo(() => {
        if (mockMode || !isFocused || !rawJourneyLegsInfo || finalIsLoading) return [];

        return rawJourneyLegsInfo.map((metaLeg, index) => {
            const transitMode = mapTravelModeToTransitMode(
                metaLeg?.travelMode,
                metaLeg.legExtraInfo?.TAG === 'Taxi' ? metaLeg.legExtraInfo?._0?.serviceTierName : undefined,
            );
            const legOrder = createLegOrder(metaLeg);
            const waypointInfo = legWaypoints[legOrder];
            const routeWaypointsData: LatLongType[] = waypointInfo?.data?.waypoints || [];

            // Get previous and next leg for continuity
            const previousLeg = index > 0 ? rawJourneyLegsInfo[index - 1] : undefined;
            const nextLeg = index < rawJourneyLegsInfo.length - 1 ? rawJourneyLegsInfo[index + 1] : undefined;

            const originStop = waypointInfo?.data?.stops.find(stop => stop.stopCode === extractOriginStopCode(metaLeg));
            const destinationStop = waypointInfo?.data?.stops.find(
                stop => stop.stopCode === extractDestinationStopCode(metaLeg),
            );

            // Get previous leg destination stop info if this is a Taxi/Walk leg
            const previousLegDestinationStop =
                previousLeg && (metaLeg?.travelMode === 'Walk' || metaLeg?.travelMode === 'Taxi')
                    ? legWaypoints[createLegOrder(previousLeg)]?.data?.stops.find(
                          stop => stop.stopCode === extractDestinationStopCode(previousLeg),
                      )
                    : undefined;

            const {
                exitGate,
                entryGate: destinationEntryGate,
                stationName: destinationStationName,
            } = extractDestinationName(metaLeg, nextLeg);
            const destination = {
                exitGate: exitGate,
                entryGate: destinationEntryGate,
                stopCode: destinationStop?.stopCode,
                stationName: destinationStationName,
                latLong: extractDestinationLatLong(metaLeg, nextLeg),
                geoJson: destinationStop?.parsedGeoJson,
                gatesInfo: destinationStop?.parsedGatesInfo,
                regionalName:
                    metaLeg?.legExtraInfo?.TAG === 'Bus'
                        ? metaLeg?.legExtraInfo?._0?.destinationStop?.regionalName
                        : undefined,
            };
            const {
                entryGate,
                exitGate: originExitGate,
                stationName: originStationName,
            } = extractOriginName(metaLeg, previousLeg);
            const origin = {
                entryGate: entryGate,
                exitGate: originExitGate,
                stopCode: originStop?.stopCode,
                stationName: originStationName,
                latLong: extractOriginLatLong(metaLeg, previousLeg),
                geoJson:
                    metaLeg?.travelMode === 'Walk' || metaLeg?.travelMode === 'Taxi'
                        ? previousLegDestinationStop?.parsedGeoJson || originStop?.parsedGeoJson
                        : originStop?.parsedGeoJson,
                gatesInfo:
                    metaLeg?.travelMode === 'Walk' || metaLeg?.travelMode === 'Taxi'
                        ? previousLegDestinationStop?.parsedGatesInfo || originStop?.parsedGatesInfo
                        : originStop?.parsedGatesInfo,
                regionalName:
                    metaLeg?.legExtraInfo?.TAG === 'Bus'
                        ? metaLeg?.legExtraInfo?._0?.originStop?.regionalName
                        : undefined,
            };
            const preDestinationStop = destinationStop
                ? waypointInfo?.data?.stops.find(stop => stop.sequenceNum === destinationStop.sequenceNum - 1)
                : undefined;
            const stopsData: StopType =
                waypointInfo?.data?.stops &&
                (transitMode === 'BUS' || transitMode === 'METRO' || transitMode === 'SUBWAY')
                    ? filterExtraStops(waypointInfo.data.stops, destination.stopCode)
                    : [];
            const timetableData = legTimetables[legOrder];
            const onRouteStops = getOnRouteStops(stopsData, origin.stopCode);
            const staticInfo: TrackedLegInfoStaticInfo = {
                categories: extractCategories(metaLeg),
                busConductorId:
                    metaLeg.legExtraInfo?.TAG === 'Bus' ? metaLeg.legExtraInfo?._0?.busConductorId : undefined,
                busDriverId: metaLeg.legExtraInfo?.TAG === 'Bus' ? metaLeg.legExtraInfo?._0?.busDriverId : undefined,
                isLoading: legLoadingStatus[legOrder] ?? false,
                timetable: timetableData,
                searchId: metaLeg.searchId,
                selectedQuoteId: metaLeg.pricingId,
                duration: metaLeg.estimatedDuration,
                distance: metaLeg.estimatedDistance?.value,
                legOrder,
                stops: stopsData,
                onRouteStops,
                routeWaypoints: routeWaypointsData,
                filteredRouteWaypoints: filterExtraWaypoints(
                    routeWaypointsData,
                    origin.latLong,
                    destination.latLong,
                    onRouteStops,
                ),
                travelMode: metaLeg.travelMode,
                towardsStation: waypointInfo?.data?.stops[waypointInfo?.data?.stops?.length - 1]?.name,
                origin,
                destination,
                preDestination: {
                    stopCode: preDestinationStop?.stopCode,
                    name: preDestinationStop?.name,
                },
                vehicleName: extractVehicleName(metaLeg, transitMode),
                tickets: extractTickets(metaLeg, transitMode),
                ticketCreatedAt: extractTicketCreatedAt(metaLeg, transitMode),
                alternateRoutesNames: extractAlternateRouteNames(metaLeg, transitMode),
                platform: extractPlatform(metaLeg, transitMode),
                bookingId: extractBookingId(metaLeg),
                driverNumber: extractDriverNumber(metaLeg),
                exoNumber: extractExoNumber(metaLeg),
                startTime: extractLegStartTime(metaLeg),
                otp: metaLeg.legExtraInfo?.TAG === 'Taxi' ? metaLeg.legExtraInfo?._0?.otp : undefined,
                fare: metaLeg.estimatedMaxFare,
                vehicleIconUrl:
                    metaLeg.legExtraInfo?.TAG === 'Taxi' ? metaLeg.legExtraInfo?._0?.vehicleIconUrl : undefined,
                lineColor:
                    metaLeg.legExtraInfo?.TAG === 'Metro'
                        ? metaLeg.legExtraInfo._0.routeInfo
                              ?.map(route => route.lineColor)
                              .filter((color): color is string => color !== undefined)
                        : undefined,
                bookingStatus: metaLeg?.bookingStatus ?? { TAG: 'Initial', _0: 'BOOKING_PENDING' },
                ticketNumber:
                    metaLeg.legExtraInfo?.TAG === 'Metro' ||
                    metaLeg.legExtraInfo?.TAG === 'Subway' ||
                    metaLeg.legExtraInfo?.TAG === 'Bus'
                        ? metaLeg.legExtraInfo?._0?.ticketNo?.[0]
                        : undefined,
                allSourceStations: [],
                allDestinationStations: [],
                allTowardsStations: [],
                allLineColors: [],
            };
            return {
                staticInfo,
                transitMode,
            };
        });
    }, [mockMode, legTimetables, finalIsLoading, isFocused, legLoadingStatus]);

    const baseProcessedData = useMemo((): ProcessedLegInfo[] => {
        const riderLocation = riderLocationHistory.currentLocation;
        if (
            finalIsLoading ||
            !riderLocation ||
            !isFocused ||
            !rawJourneyLegsInfo ||
            rawJourneyLegsInfo.length === 0 ||
            !journeyId
        )
            return [];
        if (mockMode) return MOCKDATA;

        const currentVehiclePositionsData = rawVehiclePositionsData;

        const firstLegOrderInJourney = staticLegData[0]?.staticInfo.legOrder;
        const lastLegOrderInJourney = staticLegData[staticLegData.length - 1]?.staticInfo.legOrder;

        return staticLegData.map((staticLeg, index): ProcessedLegInfo => {
            const order = getOrder(staticLeg.staticInfo.legOrder);
            const subOrder = getSubOrder(staticLeg.staticInfo.legOrder);
            const metaLeg = rawJourneyLegsInfo[index];
            const previousLeg = index > 0 ? staticLegData[index - 1] : undefined;
            const previousMetaLeg = index > 0 ? rawJourneyLegsInfo[index - 1] : undefined;
            const previousLegOrderTravelMode = previousLeg?.staticInfo.travelMode
                ? previousLeg.staticInfo.travelMode
                : undefined;
            const previousLegBookingStatus = previousMetaLeg?.bookingStatus ?? {
                TAG: 'Initial',
                _0: 'BOOKING_PENDING',
            };
            const previousLegOrderTravelModeStatusConfirmed =
                previousLeg?.staticInfo.travelMode === 'Metro'
                    ? isBookingStatusConfirmed(previousLegBookingStatus)
                    : undefined;
            if (!metaLeg) {
                logger.logDebug(`Journery id not found`, 'MultimodalTracking');
                return {
                    vehicleIconUrl: staticLeg.staticInfo.vehicleIconUrl,
                    insideSpecialZone: false,
                    vehicleState: 'NOLIVEDATA',
                    transitMode: staticLeg.transitMode,
                    userState: 'NONE',
                    riderLocation: riderLocation,
                    riderLocationHistory: riderLocationHistory.history,
                    currentLeg: '',
                    staticInfo: staticLeg.staticInfo,
                    realTimeInfo: {
                        frequency: undefined,
                        liveVehicleData: [],
                        currentLiveVehicle: undefined,
                        possibleCheckInStations: [],
                        currentStop: undefined,
                        originStopETAInMinutes: undefined,
                        destinationStopETAInMinutes: undefined,
                        upcomingVehicleArrivals: [],
                        remainingStops: undefined,
                        confirmedBoardingData: undefined,
                        busFleetNumber: undefined,
                    },
                    displayTransitType: localMapHookTransitModeToDomainTransit(staticLeg.transitMode),
                    vehicleIdentifier: staticLeg.staticInfo.vehicleName || staticLeg.transitMode,
                    durationInMinutes: Math.round((staticLeg.staticInfo.duration || 0) / 60),
                    distanceValue: staticLeg.staticInfo.distance ? Math.round(staticLeg.staticInfo.distance) : null,
                    isFirstLeg: staticLeg.staticInfo.legOrder === firstLegOrderInJourney,
                    isLastLeg: staticLeg.staticInfo.legOrder === lastLegOrderInJourney,
                    platformInfo: staticLeg.staticInfo.platform,
                    taxiBookingId: staticLeg.staticInfo.bookingId,
                    splitUpOrientation: 'vertical',
                    isPotentialCurrentLeg: false,
                    hasApplicablePasses: rawJourneyLegsInfo[index]?.hasApplicablePasses,
                    confirmationCount: 0,
                    bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
                    trackingStatus: 'InPlan',
                    previousTravelMode: previousLegOrderTravelMode,
                    previousTravelModeStatusConfirmed: previousLegOrderTravelModeStatusConfirmed,
                    farawayTarget: undefined,
                };
            }

            const realTimeLegInfo = rawJourneyLegsInfo.find(
                l =>
                    l.order === order &&
                    (l.legExtraInfo?.TAG === 'Metro' || l.legExtraInfo?.TAG === 'Subway'
                        ? l.legExtraInfo?._0?.routeInfo?.[0]?.subOrder === subOrder
                        : true),
            );

            const vehicleState = realTimeLegInfo ? mapLegToVehicleState(realTimeLegInfo, undefined) : 'NOLIVEDATA';

            const legVehiclePositionsSource = currentVehiclePositionsData?.[order]?.[subOrder ?? 1] || [];

            const liveVehicleData: LiveVehicleData[] = legVehiclePositionsSource.map(
                (vp: vehiclePosition): LiveVehicleData => {
                    const stopsInformation: StopsInformationItem[] = (vp.upcomingStops || []).map(stop => ({
                        sequenceNumber: stop.sequenceNumber,
                        stopCode: stop.stopCode,
                        eta: stop.travelTime ?? 0,
                    }));

                    return {
                        id: vp.vehicleId,
                        loc:
                            staticLeg.transitMode === 'BUS' &&
                            realTimeLegInfo &&
                            (isLegOngoing(realTimeLegInfo) || isLegCompleted(realTimeLegInfo))
                                ? riderLocation
                                : vp.position,
                        stopsInformation,
                    };
                },
            );
            const durationInMinutes = Math.round((staticLeg.staticInfo.duration || 0) / 60);
            const confirmedBoardingData = getConfirmedBoardingDataFromCache(journeyId, staticLeg.staticInfo.legOrder);
            const realTimeInfo: TrackedLegInfoRealTimeInfo = {
                frequency: extractFrequency(metaLeg, staticLeg.transitMode),
                liveVehicleData,
                currentLiveVehicle: undefined, // populated in the processJourneyData function
                possibleCheckInStations: [],
                currentStop: undefined, // populated in the processJourneyData function
                originStopETAInMinutes: undefined, // populated in the processJourneyData function
                destinationStopETAInMinutes: metaLeg && metaLeg?.travelMode === 'Walk' ? durationInMinutes : undefined, // populated in the processJourneyData function
                upcomingVehicleArrivals: [], // populated in the processJourneyData function
                remainingStops: undefined, // populated in the processJourneyData function
                confirmedBoardingData, // populated in the processJourneyData function
                busFleetNumber: metaLeg.legExtraInfo?.TAG === 'Bus' ? metaLeg.legExtraInfo?._0?.fleetNo : undefined,
            };

            return {
                vehicleIconUrl: staticLeg.staticInfo.vehicleIconUrl,
                insideSpecialZone: false,
                vehicleState,
                transitMode: staticLeg.transitMode,
                userState: mapBackendStatusToUserState(realTimeLegInfo, staticLeg.transitMode), // populated in the processJourneyData function
                riderLocation: riderLocation,
                riderLocationHistory: riderLocationHistory.history,
                currentLeg: '', // populated in the processJourneyData function
                staticInfo: staticLeg.staticInfo,
                realTimeInfo,
                displayTransitType: localMapHookTransitModeToDomainTransit(staticLeg.transitMode),
                vehicleIdentifier:
                    staticLeg.staticInfo.vehicleName ||
                    (staticLeg.transitMode === 'WALK' ? 'Walking' : staticLeg.transitMode),
                durationInMinutes,
                distanceValue: staticLeg.staticInfo.distance ? Math.round(staticLeg.staticInfo.distance) : null,
                isFirstLeg: staticLeg.staticInfo.legOrder === firstLegOrderInJourney,
                isLastLeg: staticLeg.staticInfo.legOrder === lastLegOrderInJourney,
                platformInfo: staticLeg.staticInfo.platform,
                taxiBookingId: staticLeg.staticInfo.bookingId,
                splitUpOrientation: 'vertical',
                isPotentialCurrentLeg: false,
                hasApplicablePasses: rawJourneyLegsInfo[index]?.hasApplicablePasses,
                confirmationCount: 0,
                bookingStatus: metaLeg?.bookingStatus ?? { TAG: 'Initial', _0: 'BOOKING_PENDING' },
                trackingStatus: getTrackingStatusForLeg(metaLeg, subOrder) ?? 'InPlan',
                previousTravelMode: previousLegOrderTravelMode,
                previousTravelModeStatusConfirmed: previousLegOrderTravelModeStatusConfirmed,
                farawayTarget: undefined,
            };
        });
    }, [
        journeyId,
        rawJourneyLegsInfo,
        legWaypoints,
        rawVehiclePositionsData,
        mockMode,
        staticLegData,
        riderLocationHistory.currentLocation,
        finalIsLoading,
        isFocused,
    ]);

    // Optimised gating: only run expensive processing when baseData changes or after 1 minute
    const prevBaseRef = useRef<ProcessedLegInfo[]>([]);
    const prevProcessedRef = useRef<ProcessedLegInfo[]>([]);
    const processedData = useMemo((): ProcessedLegInfo[] => {
        if (mockMode) return MOCKDATA;
        if (finalIsLoading || !baseProcessedData.length || !journeyId || !isFocused) return baseProcessedData;

        if (!isEqual(baseProcessedData, prevBaseRef.current)) {
            const newData = processJourneyData(
                journeyId,
                baseProcessedData,
                onLegStatusChange,
                riderLocationHistory.history,
                customerTags,
            );

            // update farawayTarget based on previous processed snapshot
            const updatedNewData = newData.map((leg): ProcessedLegInfo => {
                const prevLeg = prevProcessedRef.current.find(p => p.staticInfo.legOrder === leg.staticInfo.legOrder);
                const isFaraway = leg.userState === 'FARAWAY';
                const hasCrossedOrigin =
                    prevLeg && (prevLeg.userState === 'INVEHICLE' || prevLeg.userState === 'EXITSTATION');
                const farawayTarget = isFaraway ? (hasCrossedOrigin ? 'destination' : 'origin') : undefined;
                return { ...leg, farawayTarget };
            });

            prevBaseRef.current = baseProcessedData;
            prevProcessedRef.current = updatedNewData;

            return updatedNewData;
        }

        return prevProcessedRef.current;
    }, [baseProcessedData, mockMode, finalIsLoading, onLegStatusChange, riderLocationHistory.history, isFocused]);

    // Update polling interval based on presence of auto/taxi leg
    useEffect(() => {
        if (!isFocused || mockMode || !journeyId) return;

        const currentLegIndex = processedData.findIndex(l => l.currentLeg === l.staticInfo.legOrder);
        if (currentLegIndex === -1) return;

        const currentLeg = processedData[currentLegIndex];
        if (!currentLeg) return;
        const nextLeg = processedData[currentLegIndex + 1];

        const isAutoOrTaxiLeg = (leg: ProcessedLegInfo) => checkTaxiLeg(leg.transitMode);
        const isFastPollLeg = (leg: ProcessedLegInfo) =>
            !['RIDESTARTED', 'VEHICLEBOOKINGPENDING', 'RIDESKIPPED', 'NODRIVERFOUND'].includes(leg.vehicleState) ||
            !leg.staticInfo.selectedQuoteId;

        const shouldFastPoll =
            (isAutoOrTaxiLeg(currentLeg) && isFastPollLeg(currentLeg)) ||
            (nextLeg && isAutoOrTaxiLeg(nextLeg) && isFastPollLeg(nextLeg));

        const currentPollingInterval = shouldFastPoll ? FAST_POLLING_INTERVAL : DEFAULT_POLLING_INTERVAL;

        if (currentPollingInterval !== pollingInterval) {
            setPollingInterval(currentPollingInterval);
        }
    }, [processedData, isFocused, mockMode, pollingInterval]);

    const searchId = useAppSelector(state => selectSearchId(state, null));
    const userToken = useAppSelector(selectToken);

    useEffect(() => {
        if (!journeyId || mockMode || finalIsLoading || !isFocused) return;

        const statesHavingBookingId: VehicleState[] = [
            'VEHICLEISARRIVING',
            'VEHICLEALMOSTARRIVED',
            'VEHICLEARRIVED',
            'RIDESTARTED',
            'RIDECLOSETODESTINATION',
            'ARRIVEDATSTATIONPLATFORM',
            'RIDEREACHEDDESTINATION',
        ];

        const currentLegIndex = processedData.findIndex(l => l.currentLeg === l.staticInfo.legOrder);
        if (currentLegIndex === -1) return;

        const currentLeg = processedData[currentLegIndex];
        if (!currentLeg) return;

        const runValidation = (leg: ProcessedLegInfo) => {
            if (!checkTaxiLeg(leg.transitMode)) return;
            if (
                (leg.staticInfo.legOrder == currentLeg.staticInfo.legOrder ||
                    leg.staticInfo.legOrder ==
                        getNextLegOrder(processedData, currentLeg.staticInfo.legOrder)?.staticInfo.legOrder) &&
                searchId != leg.staticInfo.searchId
            ) {
                dispatch(setSearchId({ id: userToken, payload: leg.staticInfo.searchId || searchId }));
            }

            if (
                (!leg.staticInfo.bookingId && statesHavingBookingId.includes(leg.vehicleState)) ||
                !leg.staticInfo.selectedQuoteId
            ) {
                dispatch(
                    setLegIsLoading({
                        id: journeyId,
                        payload: { legOrder: leg.staticInfo.legOrder, journeyRefresh: true },
                    }),
                );
            }
        };
        processedData
            .filter(leg => leg.staticInfo.legOrder >= currentLeg.staticInfo.legOrder)
            .forEach(leg => {
                if (checkTaxiLeg(leg.transitMode)) {
                    runValidation(leg);
                }
            });
    }, [processedData, journeyId, mockMode, finalIsLoading, isFocused]);

    const overallError = useMemo(() => {
        if (mockMode || !isFocused) return null;

        // In offline mode, only show error if we don't have any cached data
        if (!shouldMakeApiCalls) {
            const hasAnyData = rawJourneyLegsInfo && rawJourneyLegsInfo.length > 0;
            return hasAnyData ? null : new Error('No internet connection and no cached data available');
        }

        return errorMeta || Object.values(legWaypoints).find(wp => wp.error)?.error || errorTimetables;
    }, [mockMode, errorMeta, legWaypoints, errorTimetables, shouldMakeApiCalls, rawJourneyLegsInfo, isFocused]);

    const result = useMemo(() => {
        if (mockMode)
            return {
                data: MOCKDATA,
                isLoading: false,
                error: null,
                updateLocationManually: () => {},
            };
        return {
            data: processedData,
            isLoading: finalIsLoading,
            error: overallError,
            updateLocationManually: riderLocationHistory.updateLocationManually,
        };
    }, [processedData, mockMode, finalIsLoading, overallError, riderLocationHistory.updateLocationManually]);

    return result;
};
