import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { isNull, isUndefined } from 'lodash';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen.tsx';
import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen.tsx';
import { useMultimodalJourneyIdOrderLegOrderGetBusTierOptionsGetQuery } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderGetBusTierOptionsGet.ts';
import {
    multimodalJourneyIdOrderLegOrderSwitchFRFSTierPostWithParams,
    useMultimodalJourneyIdOrderLegOrderSwitchFRFSTierPostMutation,
} from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSwitchFRFSTierPost.ts';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { SwitchType } from '../components/RouteOptionCard';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useMultimodalJourneyIdOrderLegOrderSimilarJourneyLegsGetQuery } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSimilarJourneyLegsGet';
import {
    multimodalJourneyIdOrderLegOrderSwitchJourneyLegPostWithParams,
    useMultimodalJourneyIdOrderLegOrderSwitchJourneyLegPostMutation,
} from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSwitchJourneyLegPost';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType';
import { availableRoutesInfo } from '@/readOnly/api/types/AvailableRoutesInfo.gen';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { useMultimodalRouteAvailabilityPostMutation } from '@/api/integrations/rtk/MultimodalRouteAvailabilityPost';
import { useMultimodalSwitchRoutePostMutation } from '@/api/integrations/rtk/MultimodalSwitchRoutePost';
import { sortRoutes } from '@/typescript/utils/MultiModal';
import { useFrfsRouteRouteCodeGetMutation } from '@/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { setRouteDetails, RouteDetailsData } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { useAppDispatch as useReduxDispatch } from '@/typescript/state/hooks';
import { getWaypointsWithFallback, processWaypoints } from '@/typescript/utils/MultiModal';
import { getMmStrokeColor } from '@/typescript/utils/common';
import { mapCityToFrfsCityType } from '@/src-v2/utils/common';
import { AppDispatch } from '@/typescript/state/store';
import { fRFSRouteAPI } from '@/readOnly/api/types/FRFSRouteAPI.gen.tsx';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen.tsx';

const isBusLeg = (journeyLeg: legInfo | undefined): boolean => {
    return journeyLeg?.legExtraInfo.TAG === 'Bus';
};

const hasValidStops = (stops: fRFSStationAPI[] | undefined): boolean => {
    return !!stops && stops.length >= 2;
};

const areValidStopIndices = (sourceIndex: number, destIndex: number): boolean => {
    return sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex;
};

const extractBusLegInfo = (journeyLeg: legInfo) => {
    if (!isBusLeg(journeyLeg) || journeyLeg.legExtraInfo.TAG !== 'Bus') return null;

    const legExtraInfo = journeyLeg.legExtraInfo._0;
    return {
        startStopCode: legExtraInfo.originStop.code,
        endStopCode: legExtraInfo.destinationStop.code,
        legExtraInfo,
    };
};

const findStopIndices = (stops: fRFSStationAPI[], startCode: string, endCode: string) => {
    const sourceStopIndex = stops.findIndex(stop => stop.code === startCode);
    const destStopIndex = stops.findIndex(stop => stop.code === endCode);
    return { sourceStopIndex, destStopIndex };
};

const buildRouteDetails = (
    sourceStop: fRFSStationAPI,
    destinationStop: fRFSStationAPI,
    intermediateStops: fRFSStationAPI[],
    routeInfo: availableRoute,
    frfsData: fRFSRouteAPI,
): RouteDetailsData => {
    return {
        start: sourceStop.name ?? '',
        end: destinationStop.name ?? '',
        stops: intermediateStops.map(stop => ({ name: stop.name || '' })),
        busNumber: routeInfo.routeShortName || frfsData.shortName || '',
        acType: 'Non AC',
        totalStops: intermediateStops.length,
    };
};

const processRouteDataAndUpdateMap = ({
    journeyLeg,
    routeInfo,
    journeyId,
    frfsRouteData,
    reduxDispatch,
    setJourneyMapData,
}: {
    journeyLeg: legInfo;
    routeInfo: availableRoute;
    journeyId: string;
    frfsRouteData: fRFSRouteAPI;
    reduxDispatch: AppDispatch;
    setJourneyMapData: React.Dispatch<
        React.SetStateAction<Record<number, mmEstimateRouteType | mmEstimateRouteType[]>>
    >;
}) => {
    const busLegInfo = extractBusLegInfo(journeyLeg);
    if (!busLegInfo) {
        console.warn('Journey leg is not a valid bus leg');
        return;
    }

    const { startStopCode, endStopCode, legExtraInfo } = busLegInfo;

    if (!frfsRouteData.stops || !hasValidStops(frfsRouteData.stops)) {
        console.warn('Invalid or insufficient stops data from FRFS route');
        return;
    }

    const stops = frfsRouteData.stops;
    const { sourceStopIndex, destStopIndex } = findStopIndices(stops, startStopCode, endStopCode);

    if (!areValidStopIndices(sourceStopIndex, destStopIndex)) {
        console.warn('Could not find valid source and destination stops in route');
        return;
    }

    const sourceStop = stops[sourceStopIndex];
    const destinationStop = stops[destStopIndex];

    if (!sourceStop?.name || !destinationStop?.name) {
        console.warn('Source or destination stop missing name');
        return;
    }

    const intermediateStops = stops.slice(sourceStopIndex + 1, destStopIndex);
    const routeDetails = buildRouteDetails(sourceStop, destinationStop, intermediateStops, routeInfo, frfsRouteData);

    const journeyPayload = {
        id: createJourneyId(journeyId),
        payload: routeDetails,
    };
    reduxDispatch(setRouteDetails(journeyPayload));

    const routeDataForProcessing = {
        wayPoints: frfsRouteData.waypoints,
        stops: frfsRouteData.stops,
    };
    const finalLatLongArray = getWaypointsWithFallback(routeDataForProcessing);
    const journeyData = processWaypoints(
        journeyLeg.travelMode,
        finalLatLongArray,
        { lat: legExtraInfo.originStop.lat ?? 0, lon: legExtraInfo.originStop.lon ?? 0 },
        { lat: legExtraInfo.destinationStop.lat ?? 0, lon: legExtraInfo.destinationStop.lon ?? 0 },
    );

    const filteredStops = stops.slice(sourceStopIndex, destStopIndex + 1);
    const updatedMapData: mmEstimateRouteType = {
        ...journeyData,
        journeyLegOrder: journeyLeg.order,
        color: getMmStrokeColor(journeyLeg.travelMode),
        marker: undefined,
        stops: filteredStops,
        lastStop: undefined,
        lineDashPattern: undefined,
        fullStopsList: undefined,
        wayPoints: frfsRouteData.waypoints?.map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        })),
    };

    setJourneyMapData(prevData => ({
        ...prevData,
        [journeyLeg.order]: updatedMapData,
    }));
};

const getQuoteId = (leg: legInfo | undefined) => {
    if (!leg) return null;
    switch (leg.legExtraInfo.TAG) {
        case 'Bus':
            return leg?.legExtraInfo._0?.selectedServiceTier?.quoteId;
        case 'Subway':
            return leg?.legExtraInfo._0?.selectedServiceTier?.quoteId;
        default:
            return null;
    }
};

const getServiceTier = (leg: legInfo | undefined) => {
    if (!leg) return null;
    switch (leg.legExtraInfo.TAG) {
        case 'Bus':
            return leg?.legExtraInfo._0?.selectedServiceTier?.serviceTierType;
        case 'Subway':
            return leg?.legExtraInfo._0?.selectedServiceTier?.serviceTierType;
        default:
            return null;
    }
};

interface UseVehicleTierOptionsProps {
    journeyId?: string;
    journeyInfoData: journeyInfoResp | null;
    setJourneyInfoData: (data: journeyInfoResp) => void;
    setPollJourneyInfo: (pollJourneyInfo: boolean) => void;
    setLoadingDataForLeg: (legOrder: number | null) => void;
    getStationByCode: (code: string) => transportStation | undefined;
    setJourneyMapData: React.Dispatch<
        React.SetStateAction<Record<number, mmEstimateRouteType | mmEstimateRouteType[]>>
    >;
    isMapDataLoaded: React.MutableRefObject<boolean>;
    pollJourneyInfo: boolean;
    setBusTrackingRouteInfo: (routeInfo: availableRoute | undefined) => void;
    allFareLoaded: boolean;
}

export const useVehicleTierOptions = ({
    journeyId,
    journeyInfoData,
    setJourneyInfoData,
    setLoadingDataForLeg,
    setPollJourneyInfo,
    getStationByCode,
    setJourneyMapData,
    isMapDataLoaded,
    pollJourneyInfo,
    setBusTrackingRouteInfo,
    allFareLoaded,
}: UseVehicleTierOptionsProps) => {
    const [vehicleLegToSwitch, setVehicleLegToSwitch] = useState<number | null>(null);
    const [legForViaChange, setLegForViaChange] = useState<number | null>(null);
    const [selectedVehicleTier, setSelectedVehicleTier] = useState<availableRoutesByTier | null>(null);
    const { viaPointsModalRef, busRouteSelectionModalRef, multimodalJourneyInfoSheetRef } = useRefsContext();
    const initiatingSwitchLeg = useRef<boolean>(false);
    const [similarJourneysLoaded, setSimilarJourneysLoaded] = useState(false);
    const reduxDispatch = useReduxDispatch();

    const conditionToSkip = allFareLoaded ? vehicleLegToSwitch === null || isUndefined(journeyId) : true;

    // API for getting vehicle tier options
    const {
        data: vehicleTierOptionsResp,
        refetch: refetchVehicleTierOptions,
        isLoading: isLoadingVehicleOptions,
        isFetching: isFetchingVehicleTierOptions,
    } = useMultimodalJourneyIdOrderLegOrderGetBusTierOptionsGetQuery(
        {
            journeyId: journeyId ?? '',
            legOrder: vehicleLegToSwitch || 0,
        },
        { skip: conditionToSkip },
    );

    const { data: similarJourneyLegs, isFetching: isFetchingSimilarJourneyLegs } =
        useMultimodalJourneyIdOrderLegOrderSimilarJourneyLegsGetQuery(
            {
                journeyId: journeyId ?? '',
                legOrder: legForViaChange ?? 0,
            },
            {
                skip: isUndefined(journeyId) || isUndefined(legForViaChange) || similarJourneysLoaded,
                pollingInterval: similarJourneysLoaded ? 0 : 1000,
            },
        );

    const [getRouteAvailability, { data: availableRoutesResp }] = useMultimodalRouteAvailabilityPostMutation();
    const [switchRoute] = useMultimodalSwitchRoutePostMutation();
    const [getFrfsRoute] = useFrfsRouteRouteCodeGetMutation();
    useEffect(() => {
        if (similarJourneyLegs?.allLegsLoaded) {
            setSimilarJourneysLoaded(true);
        }
    }, [similarJourneyLegs?.allLegsLoaded]);

    const transformViaPointName = useCallback(
        (via: string | undefined) => {
            const viaPoints = via?.split('-');
            return viaPoints?.map(point => getStationByCode(point)?.name).join('-');
        },
        [getStationByCode],
    );

    // API for changing vehicle class
    const [changeVehicleClassApiCall, { isLoading: isChangingVehicleClass }] =
        useMultimodalJourneyIdOrderLegOrderSwitchFRFSTierPostMutation();

    // API for changing alternate journey leg
    const [changeAlternateJourneyLegApiCall] = useMultimodalJourneyIdOrderLegOrderSwitchJourneyLegPostMutation();

    // Update selected vehicle tier when leg changes or options are fetched
    useEffect(() => {
        const vehicleLeg = journeyInfoData?.legs?.find(leg => leg.order === vehicleLegToSwitch);
        const quoteId = getQuoteId(vehicleLeg);
        const serviceTier = getServiceTier(vehicleLeg);
        const isQuoteIdPresent = vehicleTierOptionsResp?.options.some(option => option.quoteId === quoteId);

        const currentTierOption = isQuoteIdPresent
            ? vehicleTierOptionsResp?.options.find(option => option.quoteId === quoteId)
            : vehicleTierOptionsResp?.options.find(option => option.serviceTier === serviceTier);

        setSelectedVehicleTier(currentTierOption ?? null);
    }, [vehicleTierOptionsResp, vehicleLegToSwitch, journeyInfoData]);

    // Get other available vehicle options for single mode journeys
    const getOtherVehicleOptions = useCallback(
        (
            isSingleMode: boolean,
            travelMode: MultimodalTravelMode_multimodalTravelMode,
        ): availableRoutesInfo[] | undefined => {
            if (!isSingleMode) return undefined;
            const vehicleLeg = journeyInfoData?.legs?.find(leg => leg.travelMode === travelMode);
            const quoteId = getQuoteId(vehicleLeg);
            const currentRoute =
                vehicleLeg?.legExtraInfo.TAG === 'Bus'
                    ? {
                          shortName: vehicleLeg?.legExtraInfo._0.routeName ?? '',
                          routeCode: vehicleLeg?.legExtraInfo._0.routeCode,
                          isLiveTrackingAvailable: true,
                      }
                    : undefined;
            const currentTierOption = vehicleTierOptionsResp?.options.find(option => option.quoteId === quoteId);
            const allAvailableRoutes = currentTierOption?.availableRoutesInfo
                ? currentTierOption?.availableRoutesInfo
                : undefined;
            return currentRoute ? [currentRoute, ...(allAvailableRoutes ?? [])] : allAvailableRoutes;
        },
        [vehicleTierOptionsResp, journeyInfoData],
    );

    const handleSelectAndChangeVehicleTier = useCallback(
        async (legOrder: number, newQuoteId: string | undefined) => {
            if (!journeyId) {
                logger.logInfo(`Journey Id is Undefined`, 'BookingFlow');
                return;
            }

            if (!newQuoteId || isNull(legOrder)) {
                logger.logInfo(
                    `Either Selected Vehicle Tier or Vehicle Leg is Undefined. Selected Vehicle Tier Quote Id = ${newQuoteId} , Vehicle Leg To Switch = ${legOrder}`,
                    'BookingFlow',
                );

                return;
            }
            setLoadingDataForLeg(legOrder);
            viaPointsModalRef.current?.close();

            const confirmReq: multimodalJourneyIdOrderLegOrderSwitchFRFSTierPostWithParams = {
                journeyId: journeyId,
                legOrder: legOrder,
                body: { quoteId: newQuoteId },
            };

            const resp = await changeVehicleClassApiCall(confirmReq);
            if (resp.error) {
                setLoadingDataForLeg(null);
                return;
            }

            // Update journey info with new data
            if (resp.data) {
                setJourneyInfoData(resp.data);
            }

            setLoadingDataForLeg(null);
            return resp;
        },
        [journeyId, changeVehicleClassApiCall, setJourneyInfoData, setLoadingDataForLeg],
    );

    const handleChangeAlternateJourneyLeg = useCallback(
        async (legOrder: number, newLegId: string | undefined) => {
            if (!journeyId || !newLegId || isNull(legOrder)) {
                return;
            }
            initiatingSwitchLeg.current = true;
            setLoadingDataForLeg(legOrder);
            viaPointsModalRef.current?.close();

            const confirmReq: multimodalJourneyIdOrderLegOrderSwitchJourneyLegPostWithParams = {
                journeyId: journeyId,
                legOrder: legOrder,
                body: { journeyLegId: newLegId },
            };

            const resp = await changeAlternateJourneyLegApiCall(confirmReq);
            if (resp.error) {
                setLoadingDataForLeg(null);
                return;
            }
            setPollJourneyInfo(true);
            setJourneyMapData({});
            isMapDataLoaded.current = false;

            return resp;
        },
        [
            journeyId,
            changeAlternateJourneyLegApiCall,
            setJourneyInfoData,
            setLoadingDataForLeg,
            setPollJourneyInfo,
            setJourneyMapData,
            isMapDataLoaded.current,
            refetchVehicleTierOptions,
        ],
    );

    useEffect(() => {
        if (initiatingSwitchLeg.current && !pollJourneyInfo) {
            try {
                refetchVehicleTierOptions();
            } catch (error) {
                console.info('error', error);
            }
            initiatingSwitchLeg.current = false;
        }
    }, [pollJourneyInfo]);

    const handleChangeVehicleClass = useCallback(async () => {
        if (selectedVehicleTier && !isNull(vehicleLegToSwitch)) {
            await handleSelectAndChangeVehicleTier(vehicleLegToSwitch, selectedVehicleTier.quoteId);
        } else {
            logger.logInfo(
                `JourneyId: ${journeyId || 'No Journey Id'} - Cannot change vehicle class: selectedVehicleTier or vehicleLegToSwitch is null.`,
                'BookingFlow',
            );
        }
    }, [selectedVehicleTier, vehicleLegToSwitch, handleSelectAndChangeVehicleTier, journeyId]);

    // Handle showing vehicle tier options
    const handleShowVehicleTierOptions = useCallback(
        (legOrder: number | null) => {
            setVehicleLegToSwitch(legOrder);
            // refresh vehicle tier options when the modal is opened only if it is already fetched
            if (vehicleTierOptionsResp) {
                refetchVehicleTierOptions();
            }
        },
        [vehicleTierOptionsResp, refetchVehicleTierOptions],
    );

    const transformedRouteOptions = useMemo(() => {
        return similarJourneyLegs?.journeyLegsInfo.map(journeyOption => {
            const arrivalTimes = journeyOption.arrivalTimes
                .map((seconds: number) => {
                    const minutes = Math.round(seconds / 60);
                    if (minutes <= 0) {
                        return 'Now';
                    } else if (minutes < 60) {
                        return `${minutes} min`;
                    } else {
                        const hrs = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        return `${hrs} hr ${mins} min`;
                    }
                })
                .slice(0, 2);
            const sortedRouteDetails = journeyOption.routeDetails
                ?.slice()
                .sort((a, b) => a.subLegOrder - b.subLegOrder);
            const viaPoints = sortedRouteDetails?.reduce((acc: string[], routeDetails, index) => {
                const fromStopName = getStationByCode(routeDetails.fromStopCode)?.name.trim();
                const toStationName = getStationByCode(routeDetails.toStopCode)?.name.trim();
                const nextStopFrom = sortedRouteDetails?.at(index + 1)?.fromStopCode;
                if (fromStopName && index !== 0) {
                    acc = [...acc, fromStopName];
                }
                if (
                    toStationName &&
                    routeDetails.toStopCode !== nextStopFrom &&
                    index !== (sortedRouteDetails?.length ?? 0) - 1
                ) {
                    acc = [...acc, toStationName];
                }
                return acc;
            }, []);
            const viaPointName = viaPoints?.join('-');

            const isStationSwitch =
                sortedRouteDetails?.length === 1
                    ? false
                    : sortedRouteDetails?.some((routeDetail, index) => {
                          if (index === 0) return false;
                          const prevRouteDetail = sortedRouteDetails?.at(index - 1);
                          return prevRouteDetail?.toStopCode !== routeDetail.fromStopCode;
                      });

            const switchType: SwitchType =
                sortedRouteDetails?.length === 1 ? 'Direct Train' : isStationSwitch ? 'Station Switch' : 'Train Switch';

            const currentLeg = journeyInfoData?.legs?.find(leg => leg.order === legForViaChange);

            return {
                viaPointName: viaPointName,
                switchType: switchType,
                arrivalTimes: arrivalTimes,
                price: journeyOption.fare,
                distance: journeyOption.distance?.value,
                quoteId: journeyOption.journeyLegId,
                onPress: undefined,
                isSelected: journeyOption.journeyLegId === currentLeg?.journeyLegId,
            };
        });
    }, [similarJourneyLegs, getStationByCode, journeyInfoData, isFetchingSimilarJourneyLegs]);

    const handleShowBusRouteSelection = useCallback(
        (legOrder: number) => {
            busRouteSelectionModalRef.current?.present();
            multimodalJourneyInfoSheetRef.current?.snapToIndex(0);
            setVehicleLegToSwitch(legOrder);

            const journeyLeg = journeyInfoData?.legs?.find(leg => leg.order === legOrder);
            if (!journeyLeg || journeyLeg.legExtraInfo.TAG !== 'Bus') return;
            const startStopCode = journeyLeg.legExtraInfo._0.originStop.code;
            const endStopCode = journeyLeg.legExtraInfo._0.destinationStop.code;

            getRouteAvailability({
                body: {
                    startStopCode,
                    endStopCode,
                    onlyLive: false,
                    journeyId: journeyId,
                    legOrder: legOrder,
                },
            });
        },
        [journeyInfoData, getRouteAvailability],
    );

    const handleConfirmBusChange = useCallback(
        async (routeInfo: availableRoute, legOrder?: number) => {
            // Use provided legOrder or fall back to vehicleLegToSwitch state
            const targetLegOrder = legOrder ?? vehicleLegToSwitch ?? 0;
            setBusTrackingRouteInfo(routeInfo);
            busRouteSelectionModalRef.current?.dismiss();
            setLoadingDataForLeg(targetLegOrder);

            const resp = await switchRoute({
                body: {
                    journeyId: journeyId ?? '',
                    legOrder: targetLegOrder,
                    quoteId: routeInfo.quoteId ?? '',
                    routeCode: routeInfo.routeCode ?? '',
                    routeLongName: routeInfo.routeLongName ?? '',
                    routeShortName: routeInfo.routeShortName ?? '',
                },
            });
            if (resp.error) {
                setLoadingDataForLeg(null);
                return;
            }
            setJourneyInfoData(resp.data);

            // Fetch route details if route got changed and update map waypoints for the new route
            try {
                const journeyLeg = resp.data?.legs?.find(leg => leg.order === targetLegOrder);

                if (!journeyLeg) {
                    console.warn('Journey leg not found after route switch');
                    return;
                }

                //FRFS route API call
                const frfsRouteResp = await getFrfsRoute({
                    routeCode: routeInfo.routeCode ?? '',
                    platformType: 'MULTIMODAL',
                    city: mapCityToFrfsCityType(resp.data?.merchantOperatingCityName || 'Bhubaneshwar'),
                    vehicleType: 'BUS',
                });

                if (!frfsRouteResp.data) {
                    console.warn('Failed to fetch FRFS route data');
                    return;
                }

                // Process route data and update map
                processRouteDataAndUpdateMap({
                    journeyLeg,
                    routeInfo,
                    journeyId: journeyId || '',
                    frfsRouteData: frfsRouteResp.data,
                    reduxDispatch,
                    setJourneyMapData,
                });
            } catch (error) {
                console.error('Failed to fetch route details for new bus route:', error);
            } finally {
                setLoadingDataForLeg(null);
            }
            return resp;
        },
        [
            setBusTrackingRouteInfo,
            busRouteSelectionModalRef,
            journeyId,
            vehicleLegToSwitch,
            switchRoute,
            setJourneyInfoData,
            getFrfsRoute,
            reduxDispatch,
            setLoadingDataForLeg,
            setJourneyMapData,
        ],
    );
    const sortedRoutes = sortRoutes(availableRoutesResp);
    return {
        vehicleLegToSwitch,
        setVehicleLegToSwitch,
        legForViaChange,
        setLegForViaChange,
        selectedVehicleTier,
        setSelectedVehicleTier,
        vehicleTierOptionsResp,
        refetchVehicleTierOptions,
        isLoadingVehicleOptions,
        isFetchingVehicleTierOptions,
        isChangingVehicleClass,
        handleChangeVehicleClass,
        handleSelectAndChangeVehicleTier,
        handleShowVehicleTierOptions,
        getOtherVehicleOptions,
        transformedRouteOptions,
        transformViaPointName,
        handleChangeAlternateJourneyLeg,
        isFetchingSimilarJourneyLegs: isFetchingSimilarJourneyLegs || !similarJourneysLoaded,
        sortedRoutes,
        handleShowBusRouteSelection,
        handleConfirmBusChange,
        similarJourneysLoaded,
    };
};
