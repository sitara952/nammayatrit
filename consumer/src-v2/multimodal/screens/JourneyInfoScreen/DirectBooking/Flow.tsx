import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { TransitType } from '../../../components/PublicTransportCard/types';
import { TransitSummaryType } from '../components/TransitSummary';
import { convertFrfsStationToLocation, convertFrfsStationToTransportStation } from '@/typescript/utils/MultiModal';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType.tsx';
import { upcomingVehicleInfo } from '@/readOnly/api/types/UpcomingVehicleInfo.gen';
import DirectBookingUI from './UI';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';
import { useLiveOrGTFS } from '../../../hooks/useLiveOrGTFS.ts';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen.tsx';
import { JourneyDetailScreenAction } from '../Types.ts';
import { createAction, Resolver } from '@/typescript/utils/common.ts';
import { findNextAvailableTime } from '../utils.ts';
import { useAppDispatch } from '../../../../../../consumer/src/typescript/state/hooks';
import { setRouteDetails } from '@/typescript/state/client/journey.ts';
import { createJourneyId } from '@/typescript/state/client/user.ts';
import { RouteDetailsData } from '@/typescript/state/client/journey';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppName, setSearchedSource } from '@/typescript/state/client/session';
import { isUndefined } from 'lodash';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { JourneyId } from '@/typescript/state/client/user.ts';
import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen.tsx';
import { RouteOptionCardProps } from '../components/RouteOptionCard.tsx';
import { availableRoutesInfo } from '@/readOnly/api/types/AvailableRoutesInfo.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen.tsx';
import { useUpcomingVehicle } from '@/src-v2/multimodal/hooks/useUpcomingVehicle.ts';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';

export type DirectBusBookingProps = {
    source: string;
    destination: string;
    fare: number | undefined;
    duration: string | undefined;
    routeCode: string;
    transitMode: TransitType;
    moreOptionsPress: () => void;
    getRouteByCode: (code: string) => transportRoute | undefined;
    time: string | undefined;
    otherVehicleOptions: availableRoutesInfo[] | undefined;
    onChangeBusType: () => void;
    legInfo: legInfo | undefined;
    journeyTypes: TransitSummaryType[] | undefined;
    mpDispatch: Resolver<JourneyDetailScreenAction>;
    legOrder: number;
    nextAvailableTimings: string[][] | undefined;
    vehicleTierOptionsResp: legServiceTierOptionsResp | undefined;
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>;
    journeyId: JourneyId | undefined;
    nextTwoArrivalTimes: number[] | undefined;
    firstArrivalTime: string | undefined;
    onViewTimetable: (mode: VehicleCategory_vehicleCategory | undefined) => void;
    timeTableData: NewTimeTableUIProps | undefined;
    isSingleMode: boolean;
    isLoadingData: boolean;
    transformViaPointName: (via: string | undefined) => string | undefined;
    transformedRouteOptions: RouteOptionCardProps[] | undefined;
    handleOnConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    serviceableStartTime: string | undefined;
    isConfirmingJourney: boolean;
    sourceInfo: transportStation | undefined;
    isLoading: boolean;
    onBusRouteSwitch: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
};

const DirectBusBookingFlow: React.FC<DirectBusBookingProps> = props => {
    const transitModalRef = React.useRef<BottomSheetModal>(null);
    const [selectedBusRoutes, setSelectedBusRoutes] = useState<string[]>([]);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const appName = useAppSelector(selectAppName);
    const [showSourceChangePopup, setShowSourceChangePopup] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Transform journeyMapData to RouteDetails format
    const transformedRouteDetails = useMemo(() => {
        const routeData = props.journeyMapData[props.legOrder];
        if (!routeData || Array.isArray(routeData) || !routeData.stops || routeData.stops.length < 2) return null;

        const sourceStop = routeData.stops[0];
        const destinationStop = routeData.stops[routeData.stops.length - 1];

        if (!sourceStop?.name || !destinationStop?.name) return null;

        const intermediateStops = routeData.stops.slice(1, -1);

        const routeDetails: RouteDetailsData = {
            start: sourceStop.name,
            end: destinationStop.name,
            stops: intermediateStops.map((stop: { name: string | undefined }) => ({ name: stop.name || '' })),
            busNumber: props.getRouteByCode(props.routeCode)?.shortName || '',
            acType: 'Non AC', // for now, hardcoded, when backend supports, this can be dynamic
            totalStops: intermediateStops.length,
        };

        return routeDetails;
    }, [props.journeyMapData, props.routeCode, props.getRouteByCode, props.legOrder]);

    useEffect(() => {
        if (transformedRouteDetails && props.journeyId) {
            const journeyPayload = {
                id: createJourneyId(props.journeyId),
                payload: transformedRouteDetails,
            };
            dispatch(setRouteDetails(journeyPayload));
        }
    }, [transformedRouteDetails, props.journeyId, dispatch]);

    const selectedServiceTier = useMemo(() => {
        return props.legInfo?.legExtraInfo.TAG === 'Bus'
            ? props.legInfo?.legExtraInfo._0.selectedServiceTier
            : undefined;
    }, [props.legInfo]);

    const description = useMemo(() => {
        switch (props.transitMode) {
            case 'bus':
                return props.otherVehicleOptions && props.otherVehicleOptions.length > 0
                    ? userLanguageStrings.TicketWorksForMoreBuses(
                          props.otherVehicleOptions.length,
                          selectedServiceTier?.serviceTierName || '',
                      )
                    : userLanguageStrings.TicketWorksForAllBuses;
            case 'train':
                return userLanguageStrings.TicketWorksForAllTrains;
            case 'metro':
                return userLanguageStrings.TicketWorksForAllMetros;
            default:
                return '';
        }
    }, [props.transitMode, props.otherVehicleOptions, selectedServiceTier, userLanguageStrings]);

    // Get source stop code and convert it to transport station format
    const sourceStop = useMemo(() => {
        if (props.legInfo?.legExtraInfo.TAG === 'Bus') {
            const originStop = props.legInfo.legExtraInfo._0.originStop;
            return originStop ? convertFrfsStationToTransportStation(originStop, 'BUS') : undefined;
        }
        return undefined;
    }, [props.legInfo]);

    const sourceStopLocation = useMemo(() => convertFrfsStationToLocation(sourceStop), [sourceStop]);
    const isSourceChanged = useMemo(() => {
        if (!props || !props.sourceInfo || !sourceStop) return false;
        return (
            props.sourceInfo.code !== sourceStop?.code &&
            props.sourceInfo.name.toLowerCase() !== sourceStop.name.toLowerCase()
        );
    }, [props?.sourceInfo?.code, sourceStop?.code, props.sourceInfo?.name, sourceStop?.name]);
    const handleOnConfirm = useMemo(
        () => () => {
            if (sourceStopLocation) {
                dispatch(setSearchedSource(sourceStopLocation));
            }
            return undefined;
        },
        [sourceStopLocation, dispatch],
    );

    const handleEditPress = useCallback(() => {
        navigation.navigate('ServicesTab', {
            screen: 'singleModeBookingNavigator',
            params: {
                screen: 'metroSubwayBooking',
                params: {
                    vehicleType: 'METRO',
                    station: undefined,
                    triggerEditDestination: true,
                },
                pop: true,
            },
        });
    }, [navigation]);

    const destinationStop = useMemo(() => {
        if (props.legInfo?.legExtraInfo.TAG === 'Bus') {
            const destStop = props.legInfo.legExtraInfo._0.destinationStop;
            return destStop ? convertFrfsStationToTransportStation(destStop, 'BUS') : undefined;
        }
        return undefined;
    }, [props.legInfo]);

    const routeData = useMemo(() => {
        return props.getRouteByCode(props.routeCode);
    }, [props.getRouteByCode, props.routeCode]);

    const legOrder = props.legOrder;

    // Wrap the callback to include leg order
    const wrappedOnBusRouteSwitch = useMemo(() => {
        if (!props.onBusRouteSwitch) {
            return undefined;
        }
        const callback = props.onBusRouteSwitch;
        return async (routeInfo: availableRoute) => {
            return await callback(routeInfo, legOrder);
        };
    }, [props.onBusRouteSwitch, legOrder]);

    const { handleLiveOrGTFS, getTimeTableTimes } = useLiveOrGTFS({
        navigation,
        route: props.routeCode,
        routeName: routeData?.shortName,
        sourceStop,
        destinationStop,
        routeStops: undefined,
        vehicleType: 'BUS',
        waypoints: undefined,
        fromJourneyInfoScreen: true,
        fromSingleModeSearch: false,
        onBusRouteSwitch: wrappedOnBusRouteSwitch,
        journeyId: props.journeyId,
        legOrder: props.legOrder,
    });

    const {
        upcomingVehicleInfo: upcomingBusInfo,
        allUpcomingVehicles,
        isLoading: _isUpcomingBusLoading,
    } = useUpcomingVehicle({
        routeCode: props.routeCode ?? '',
        stopCode: sourceStop?.code || '',
        vehicleType: 'BUS',
        serviceTierType: selectedServiceTier?.serviceTierType,
        enabled: props.transitMode === 'bus',
    });

    const liveOrGTFSData = useMemo(() => {
        return {
            source: upcomingBusInfo?.source || 'LIVE',
            nextAvailableTimings: undefined,
            upcomingVehicles: allUpcomingVehicles,
        };
    }, [props.vehicleTierOptionsResp?.options, upcomingBusInfo?.source, allUpcomingVehicles]);

    const timeTableTimes = useMemo(() => {
        if (!liveOrGTFSData) return [];
        return getTimeTableTimes(liveOrGTFSData);
    }, [liveOrGTFSData, getTimeTableTimes]);

    const handleTrackBusOrTimeTable = useCallback(() => {
        if (liveOrGTFSData) {
            handleLiveOrGTFS(timeTableTimes, liveOrGTFSData.source, true);
        }
    }, [liveOrGTFSData, handleLiveOrGTFS, timeTableTimes]);

    const busTimeTableData = useMemo(() => {
        if (!liveOrGTFSData) return undefined;
        return {
            times: timeTableTimes,
            source: sourceStop?.name ?? '',
            sheetRef: undefined,
            mode: props.legInfo?.travelMode,
            towardsStation: undefined,
            onDismiss: undefined,
            allTowardsStation: undefined,
        };
    }, [timeTableTimes, liveOrGTFSData, sourceStop?.name]);

    const handleOnClassTypePress = useCallback(() => {
        props.mpDispatch(createAction('SHOW_VEHICLE_TIER_OPTIONS', { legOrder: props.legOrder }));
    }, [props.mpDispatch, props.legOrder]);

    const singleTransitLegSpecificProps = useMemo(() => {
        if (props.legInfo?.legExtraInfo.TAG === 'Subway') {
            const extraInfo = props.legInfo?.legExtraInfo._0;

            const nextAvailableTime = findNextAvailableTime(props.nextAvailableTimings ?? []);
            const routeShortName = extraInfo.routeInfo[0]?.routeCode
                ? props.getRouteByCode(extraInfo.routeInfo[0]?.routeCode)?.shortName || ''
                : '';
            const sortedRouteDetails = extraInfo.routeInfo
                .slice()
                .sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));
            return {
                trainData: {
                    typeText: userLanguageStrings.Ordinary,
                    codeText: extraInfo.routeInfo[0]?.trainNumber || '',
                    arrivalText: userLanguageStrings.Arrival + `: ${nextAvailableTime?.[0] || ''}`,
                    departureText: userLanguageStrings.Departure + `: ${nextAvailableTime?.[1] || ''}`,
                    classTypeText: extraInfo.selectedServiceTier?.serviceTierName || '',
                    onClassTypePress: (legTier: availableRoutesByTier) =>
                        props.mpDispatch(
                            createAction('SELECT_AND_CHANGE_VEHICLE_TIER', {
                                legOrder: props.legOrder,
                                quoteId: legTier?.quoteId,
                            }),
                        ),
                    routeShortName: routeShortName,
                    sourceStation: extraInfo.routeInfo[0]?.originStop.name || '',
                    selectedServiceTier: extraInfo.selectedServiceTier,
                    transformViaPointName: props.transformViaPointName,
                    onViaChangePress: () =>
                        props.mpDispatch(createAction('SHOW_VIA_POINTS_MODAL', { legOrder: props.legOrder })),
                    routeDetails: sortedRouteDetails,
                },
                metroData: undefined,
            };
        } else if (props.legInfo?.legExtraInfo.TAG === 'Metro') {
            const extraInfo = props.legInfo?.legExtraInfo._0;

            return {
                trainData: undefined,
                metroData: {
                    lineType: extraInfo.routeInfo[0]?.lineColor || '',
                    time: extraInfo.routeInfo[0]?.frequency?.toString() || '',
                    stationName: extraInfo.routeInfo[0]?.originStop.name || '',
                    lineColor: isUndefined(extraInfo.routeInfo[0]?.lineColorCode)
                        ? extraInfo.routeInfo[0]?.lineColor?.toLowerCase()
                        : `#${extraInfo.routeInfo[0]?.lineColorCode}`,
                },
            };
        } else {
            return {
                trainData: undefined,
                metroData: undefined,
            };
        }
    }, [props.legInfo, props.routeCode, userLanguageStrings, handleOnClassTypePress]);

    useEffect(() => {
        if (isSourceChanged && props.transitMode === 'bus') {
            timerRef.current = setTimeout(() => setShowSourceChangePopup(true), 500);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isSourceChanged, props.transitMode]);

    return (
        <DirectBookingUI
            {...props}
            routeShortName={routeData?.shortName}
            selectedServiceTier={selectedServiceTier}
            description={description}
            onTrackBusOrTimeTable={handleTrackBusOrTimeTable}
            singleTransitLegSpecificProps={singleTransitLegSpecificProps}
            userLanguageStrings={userLanguageStrings}
            transitModalRef={transitModalRef}
            selectedBusRoutes={selectedBusRoutes}
            onBusRoutePress={setSelectedBusRoutes}
            onEditTransitConfirmPress={() => transitModalRef.current?.dismiss()}
            sourceType={upcomingBusInfo?.source}
            nextArrivalTimeInSeconds={allUpcomingVehicles.map((item: upcomingVehicleInfo) => item.arrivalTimeInSeconds)}
            vehicleTierOptionsResp={props.vehicleTierOptionsResp}
            sourceStopName={sourceStop?.name}
            additionalBusOptions={props.otherVehicleOptions?.filter(route => route.routeCode !== props.routeCode)}
            estimatedMinFare={props.legInfo?.estimatedMinFare?.amount}
            routeDetails={transformedRouteDetails}
            appName={appName}
            journeyId={props.journeyId}
            onViewTimetable={props.onViewTimetable}
            nextTwoArrivalTimes={props.nextTwoArrivalTimes}
            firstArrivalTime={props.firstArrivalTime}
            busTimeTableData={busTimeTableData}
            timeTableData={props.timeTableData}
            mode={props.legInfo?.travelMode}
            legInfo={props.legInfo}
            isSingleMode={props.isSingleMode}
            onTrainClassChange={(legOrder: number, legTier: availableRoutesByTier) =>
                props.mpDispatch(
                    createAction('SELECT_AND_CHANGE_VEHICLE_TIER', {
                        legOrder,
                        quoteId: legTier.quoteId,
                    }),
                )
            }
            isLoadingData={props.isLoadingData}
            transformedRouteOptions={props.transformedRouteOptions}
            onConfirmRoute={props.handleOnConfirmRoute}
            journeyMapData={props.journeyMapData}
            serviceableStartTime={props.serviceableStartTime}
            isConfirmingJourney={props.isConfirmingJourney}
            handleOnConfirm={handleOnConfirm}
            showSourceChangePopup={showSourceChangePopup}
            setShowSourceChangePopup={setShowSourceChangePopup}
            isLoading={props.isLoading}
            handleEditPress={handleEditPress}
        />
    );
};
export default DirectBusBookingFlow;
