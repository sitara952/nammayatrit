import React, { useMemo, useEffect, useRef, useState } from 'react';
import { isUndefined } from 'lodash';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    type UserState,
    type VehicleState,
    type TransitMode,
    type ProcessedLegInfo,
} from '@/src-v2/multimodal/types/journeyTracking';
import { useJourney } from '@/src-v2/multimodal/hooks/useJourney';
import { LiveJourneyOverviewUI, type LiveJourneyOverviewUIProps } from './UI';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { type JourneyId } from '@/typescript/state/client/user';
import { journeyRules } from '@/src-v2/multimodal/rules/JourneyRules';
import {
    type RuleHandlerParams,
    type OverviewScreenRuleOutput,
    type PopupRuleOutput,
} from '@/src-v2/multimodal/rules/JourneyRulesTypes';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useLazySearchResultsQuery } from '@/typescript/state/server/searchApi';
import { useSkipFeedbackMutation } from '@/typescript/state/server/flowStatusApi';
import { selectToken } from '@/typescript/state/client/auth';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopupDismissalTracker, useLiveJourneyPopupModalManager } from '../LiveJourneyDetail/LiveJourneyPopupManager';
import { journeyPopupRules } from '../../rules/JourneyPopupRules';
import { NoJourneyPlaceholder } from '../LiveJourneyTracking/components/NoJourneyPlaceholder';
import { buildTrackLostJourneyProps, buildTransitCheckInProps } from '../../rules/JourneyRuleHelpers';
import { getBusFleetInfo } from './FlowHelpers';
import { TransitType } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types';
import { useTicketUIProps } from '../Ticket/Hooks/useTicketUIProps';
import { getNextLegOrder } from '../../utils/journeyTrackingUtils';
import { LegUpdateType } from '../NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { Stop } from '@/src-v2/multimodal/types/journeyTracking';
import { createRideId } from '@/typescript/state/client/booking';
import { selectPickupDistanceWithid } from '@/typescript/state/client/ride';
import { selectAppConfig } from '@/typescript/state/client/session';
import { clearAllJourneyState, selectJourneyStatus } from '@/typescript/state/client/journey';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface LiveJourneyOverviewFlowProps {
    journeyId: JourneyId | null;
}

const emptyTransit: TransitType = {
    type: 'WALK',
    time: 0,
    distance: null,
    exitGate: undefined,
    vehicleDetail: null,
    place: '',
    isFirstLeg: false,
    isLastLeg: false,
    state: 'NOLIVEDATA',
    NextLeg: 'WALK',
    NoOfStops: 0,
    scheduledArrivalTime: undefined,
    isJourneyComplete: false,
    fromLocation: undefined,
    toLocation: undefined,
    legOrder: '0',
    isShowUpdate: false,
    transitMode: 'WALK',
};
const iternaryCardLoadingProps: OverviewScreenRuleOutput = {
    callDriverProps: null,
    twoTransits: [
        { ...emptyTransit, isFirstLeg: true },
        { ...emptyTransit, isLastLeg: true },
    ],
    entireJourney: [],
    currentStatus: 'LIVE',
    onPressDetails: () => {},
    onPressStatusBadge: () => {},
    onPressViewTicket: () => {},
    destination: '',
    onPressSwitchToWalk: () => {},
    onPressCallRide: () => {},
    onPressBoostRide: () => {},
    onPressMarkLegComplete: () => Promise.resolve(),
    onPressViewTimetable: () => {},
    onPressCheckIn: () => {},
    onMuteJourney: () => {},
    onCompleteJourney: () => Promise.resolve(),
    onDirectRidePress: () => {},
    onViewJourneyPlan: () => {},
    isLoading: true,
    currentLegBookingId: undefined,
    currentLegMode: 'WALK',
    currentLegOrder: '0',
    onRetryBooking: () => Promise.resolve(),
    onPressSafety: () => {},
    currentLegStatus: undefined,
    currentLegBookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
    locationStatus: 'success',
    busFleetNumber: undefined,
    busLegData: undefined,
};

// Memoized rule finder functions to avoid re-filtering rules on every render
const findActiveJourneyRule = (
    userState: UserState,
    vehicleState: VehicleState,
    transitMode: TransitMode,
    currentLegDataForStatus: ProcessedLegInfo,
    trackedData: ProcessedLegInfo[],
) => {
    return journeyRules.find(
        rule =>
            rule.screenType === 'LiveJourneyOverview' &&
            currentLegDataForStatus &&
            rule.userStates.includes(userState) &&
            (!rule.vehicleStates || rule.vehicleStates.includes(vehicleState)) &&
            rule.transitModes.includes(transitMode) &&
            (!rule.condition || rule.condition(currentLegDataForStatus, trackedData ?? [])),
    );
};

const findActivePopupRule = (
    userState: UserState,
    vehicleState: VehicleState,
    transitMode: TransitMode,
    currentLegDataForStatus: ProcessedLegInfo,
    trackedData: ProcessedLegInfo[],
) => {
    return journeyPopupRules.find(
        rule =>
            rule.screenType.includes('LiveJourneyOverview') &&
            currentLegDataForStatus &&
            rule.userStates.includes(userState) &&
            (!rule.vehicleStates || rule.vehicleStates.includes(vehicleState)) &&
            rule.transitModes.includes(transitMode) &&
            (!rule.condition || rule.condition(currentLegDataForStatus, trackedData ?? [])),
    );
};

export const LiveJourneyOverviewFlowInternal: React.FC<{ journeyId: JourneyId }> = ({ journeyId }) => {
    const userId = useAppSelector(selectToken);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { callDriverBottomsheetModalRef } = useRefsContext();
    const {
        liveJourneyTransitCheckInModalRef,
        ticketUIRef,
        timeTableBottomSheetModalRef,
        liveJourneyListBottomSheetRef,
        liveJourneyListDetailBottomSheetRef,
        liveJourneyUpdateTransitBottomSheetRef,
        switchToAutoConfirmationModalRef,
        liveJourneyMetroConfirmLocationBottomSheetRef,
        otpModalRef,
    } = useRefsContext();
    const { dismiss } = useLiveJourneyPopupModalManager();
    const [triggerSearchResultsQuery] = useLazySearchResultsQuery();
    const dispatch = useAppDispatch();
    const isScreenFocused = useIsFocused();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const {
        data: trackedData,
        isLoading,
        error,
        actions,
        updateLocationManually,
    } = useJourney(journeyId, isScreenFocused);
    const hasNavigatedToFeedback = useRef(false);
    const ticketUIProps = useTicketUIProps(journeyId, 'bottomSheetModal');
    const [predictedLeg, setPredictedLeg] = useState<ProcessedLegInfo | undefined>(undefined);
    const [shouldAutoOpenUpdateTransit, setShouldAutoOpenUpdateTransit] = useState<boolean>(false);

    // Memoize journey completion check
    const isJourneyCompleted = useMemo(() => {
        return trackedData?.length > 0 && trackedData?.every(leg => leg.vehicleState === 'RIDEREACHEDDESTINATION');
    }, [trackedData]);

    const journeyStatus = useAppSelector(state => selectJourneyStatus(state, journeyId));

    const [skipFeedback] = useSkipFeedbackMutation();

    // Handle navigation to feedback screen when journey is completed or expired
    useEffect(() => {
        if (!hasNavigatedToFeedback.current && (isJourneyCompleted || journeyStatus === 'EXPIRED')) {
            const isPublicTransportOnly = trackedData?.every(
                leg =>
                    leg.transitMode === 'BUS' ||
                    leg.transitMode === 'METRO' ||
                    leg.transitMode === 'SUBWAY' ||
                    leg.transitMode === 'WALK',
            );

            dispatch(clearAllJourneyState());
            hasNavigatedToFeedback.current = true;

            if (isPublicTransportOnly) {
                skipFeedback(undefined);
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            } else {
                navigation.navigate('LiveTab', {
                    screen: 'multiTransitFeedback',
                    params: { journeyId: journeyId, multimodalProps: undefined },
                });
            }
        }
    }, [isJourneyCompleted, journeyStatus, navigation, journeyId, trackedData]);

    const trackLostJourneyProps = useMemo(() => {
        return buildTrackLostJourneyProps(trackedData ?? []);
    }, [trackedData]);
    // console.error(
    //     'trackedData',
    //     JSON.stringify(
    //         trackedData.map(t => ({
    //             currentLeg: t.currentLeg,
    //             legOrder: t.staticInfo.legOrder,
    //             transitMode: t.transitMode,
    //             vehicleState: t.vehicleState,
    //             userState: t.userState,
    //             routeWaypointsCount: t.staticInfo.filteredRouteWaypoints.length,
    //             stopsCount: t.staticInfo.stops.length,
    //             originStopETAInMinutes: t.realTimeInfo.originStopETAInMinutes,
    //             destinationStopETAInMinutes: t.realTimeInfo.destinationStopETAInMinutes,
    //             journeyId: journeyId,
    //             origin: t.staticInfo.origin,
    //         })),
    //         null,
    //         2,
    //     ),
    // );

    const currentGlobalLegOrder = useMemo(() => trackedData?.[0]?.currentLeg, [trackedData]);

    const currentLegDataForStatus = useMemo((): ProcessedLegInfo | undefined => {
        if (!trackedData || isUndefined(currentGlobalLegOrder)) return undefined;
        return trackedData.find(leg => leg.staticInfo.legOrder === currentGlobalLegOrder);
    }, [trackedData, currentGlobalLegOrder]);
    const rideId = currentLegDataForStatus?.taxiBookingId ? createRideId(currentLegDataForStatus.taxiBookingId) : null;
    const distance = useAppSelector(state => (rideId ? selectPickupDistanceWithid(state, rideId) : undefined));

    // Memoize handler context to prevent recreation
    const handlerContext = useMemo(
        (): JourneyActionHandlers.HandlerContext => ({
            navigation,
            dispatch,
            journeyId,
            userId: userId ?? null,
            callDriverBottomsheetModalRef,
            triggerSearchResultsQuery,
            liveJourneyTransitCheckInModalRef: liveJourneyTransitCheckInModalRef,
            liveJourneyListBottomSheetRef: liveJourneyListBottomSheetRef,
            liveJourneyListDetailBottomSheetRef: liveJourneyListDetailBottomSheetRef,
            liveJourneyUpdateTransitBottomSheetRef: liveJourneyUpdateTransitBottomSheetRef,
            switchToAutoConfirmationModalRef: switchToAutoConfirmationModalRef.current,
            currentLeg: currentLegDataForStatus,
            dismissPopup: dismiss,
            actions,
            ticketUIRef: ticketUIRef.current,
            timeTableRef: timeTableBottomSheetModalRef,
            liveJourneyMetroConfirmLocationBottomSheetRef: liveJourneyMetroConfirmLocationBottomSheetRef,
            rideDistance: distance,
            otpModalRef: otpModalRef,
            userLanguageStrings,
            showDetailedTransitTrackingForLeg: undefined,
            showTimeTableForLeg: undefined,
            allLegs: trackedData,
        }),
        [
            navigation,
            dispatch,
            journeyId,
            userId,
            callDriverBottomsheetModalRef,
            currentLegDataForStatus?.isLastLeg,
            triggerSearchResultsQuery,
            liveJourneyTransitCheckInModalRef,
            liveJourneyListBottomSheetRef,
            liveJourneyUpdateTransitBottomSheetRef,
            currentLegDataForStatus,
            actions,
            ticketUIRef,
            liveJourneyTransitCheckInModalRef.current,
            timeTableBottomSheetModalRef.current,
            switchToAutoConfirmationModalRef.current,
            distance,
            otpModalRef,
            userLanguageStrings,
        ],
    );

    const checkInStations: transportStation[] = useMemo(() => [], []); // TO BE IMPLEMENTED

    // Memoize transit check-in props
    const transitCheckInProps = useMemo(() => {
        if (!currentLegDataForStatus) return null;
        return buildTransitCheckInProps(currentLegDataForStatus, handlerContext);
    }, [currentLegDataForStatus, handlerContext, checkInStations]);
    const metroConfirmProps = useMemo(() => {
        if (!trackedData || trackedData.length === 0) return null;

        return {
            allLegs: trackedData,
            onMetroStationConfirm: (legOrder: string, station: Stop) => {
                JourneyActionHandlers.handleMetroStationConfirm(
                    legOrder,
                    station,
                    trackedData,
                    updateLocationManually,
                    handlerContext,
                );
            },
        };
    }, [trackedData, updateLocationManually, handlerContext]);

    // Memoize rule evaluation inputs to reduce computation
    const ruleEvaluationInputs = useMemo(() => {
        if (!currentLegDataForStatus || !trackedData) return null;
        return {
            userState: currentLegDataForStatus.userState,
            vehicleState: currentLegDataForStatus.vehicleState,
            transitMode: currentLegDataForStatus.transitMode,
            currentLeg: currentLegDataForStatus,
            allLegs: trackedData,
        };
    }, [currentLegDataForStatus, trackedData]);

    const itineraryCardProps = useMemo((): OverviewScreenRuleOutput => {
        //return null;

        // If we're loading and have no previous data, return null (will use dummy data)
        if (isLoading || error || !ruleEvaluationInputs) {
            return null;
        }

        const { userState, vehicleState, transitMode, currentLeg, allLegs } = ruleEvaluationInputs;
        const activeRule = findActiveJourneyRule(userState, vehicleState, transitMode, currentLeg, allLegs);

        console.info('[Journey Overview] Active Rule:', activeRule);

        if (activeRule && currentLeg) {
            const ruleHandlerParams: RuleHandlerParams = {
                currentLeg,
                allLegs,
                onPressTicket: () => JourneyActionHandlers.showTicket(handlerContext),
                onPressTrackMode: undefined,
                handlerContext,
            };
            const result = activeRule.handler(ruleHandlerParams);

            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            const finalResult = {
                ...result,
                currentLegBookingStatus: currentLeg.bookingStatus,
                isLoading: false,
                onPressViewTicket: () => {
                    // Present the ticket UI when view ticket button is clicked
                    if (ticketUIRef.current) {
                        ticketUIRef.current.present();
                    }
                },
                onPressStatusBadge: () => {
                    JourneyActionHandlers.onPressStatusBadge(
                        handlerContext,
                        trackedData,
                        setPredictedLeg,
                        setShouldAutoOpenUpdateTransit,
                        liveJourneyListBottomSheetRef,
                    );
                },
            } as OverviewScreenRuleOutput;

            return finalResult;
        }

        return null;
    }, [isLoading, error, ruleEvaluationInputs, handlerContext, trackedData, setPredictedLeg]);

    const popupProps = useMemo(() => {
        // Don't show popups if screen is not focused
        if (!isScreenFocused || isLoading || error || !ruleEvaluationInputs) {
            return undefined;
        }

        const { userState, vehicleState, transitMode, currentLeg, allLegs } = ruleEvaluationInputs;
        const popupRule = findActivePopupRule(userState, vehicleState, transitMode, currentLeg, allLegs);

        const ruleHandlerParams: RuleHandlerParams = {
            currentLeg,
            allLegs,
            onPressTicket: () => JourneyActionHandlers.showTicket(handlerContext),
            onPressTrackMode: undefined,
            handlerContext,
        };
        const popupRuleResult: PopupRuleOutput | undefined = popupRule
            ? /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
              (popupRule.handler(ruleHandlerParams) as PopupRuleOutput)
            : undefined;

        const finalPopupProps =
            popupRuleResult && !PopupDismissalTracker.isDismissed(popupRuleResult.id) ? popupRuleResult : undefined;

        return finalPopupProps;
    }, [isScreenFocused, isLoading, error, ruleEvaluationInputs, handlerContext, dismiss]);

    const getLegForTimeTable: ProcessedLegInfo | undefined = useMemo(() => {
        const allLegs = ruleEvaluationInputs?.allLegs ?? [];
        const currentLeg = handlerContext.currentLeg;
        if (!currentLeg) return undefined;
        const isCurrentLegActive =
            ['INVEHICLE', 'EXITSTATION'].includes(currentLeg.userState) ||
            [
                'RIDESTARTED',
                'RIDECLOSETODESTINATION',
                'RIDEREACHEDDESTINATION',
                'ARRIVEDATSTATIONPLATFORM',
                'RIDESKIPPED',
            ].includes(currentLeg.vehicleState);
        if (['BUS', 'METRO', 'SUBWAY'].includes(currentLeg.transitMode) && !isCurrentLegActive) {
            return currentLeg;
        }
        const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
        if (nextLeg && ['BUS', 'METRO', 'SUBWAY'].includes(nextLeg.transitMode)) {
            return nextLeg;
        }
        return undefined;
    }, [handlerContext.currentLeg, ruleEvaluationInputs?.allLegs]);

    const timeTableData = useMemo(() => {
        if (getLegForTimeTable?.staticInfo.timetable && getLegForTimeTable?.staticInfo.origin.stationName) {
            return {
                times: getLegForTimeTable.staticInfo.timetable,
                source: getLegForTimeTable.staticInfo.origin.stationName,
                sheetRef: undefined,
                mode: getLegForTimeTable.staticInfo.travelMode,
                towardsStation: getLegForTimeTable.staticInfo.towardsStation,
                allTowardsStation: undefined,
                onDismiss: undefined,
            };
        }
        return undefined;
    }, [
        getLegForTimeTable?.staticInfo.timetable,
        getLegForTimeTable?.staticInfo.origin.stationName,
        getLegForTimeTable?.staticInfo.travelMode,
    ]);

    const { busFleetNumber, busLegData } = getBusFleetInfo(trackedData);

    const uiProps: LiveJourneyOverviewUIProps = useMemo(
        () => ({
            isLoading,
            error: error ? 'An error occurred' : null,
            itineraryCardProps: itineraryCardProps ?? iternaryCardLoadingProps,
            callDriverProps: itineraryCardProps?.callDriverProps ?? null,
            transitCheckInProps: transitCheckInProps,
            popupProps: popupProps,
            journeyId: journeyId,
            riderLocation: currentLegDataForStatus?.riderLocation || null,
            callDriverBottomsheetModalRef,
            ticketUIProps,
            lastUpdatedAt: currentLegDataForStatus?.riderLocation?.timestamp ?? Date.now(),
            trackLostJourneyProps: trackLostJourneyProps,
            timeTableData,
            onLegUpdate: (props: LegUpdateType) => {
                if (trackedData) {
                    const legToUpdate = trackedData.find(leg => leg.staticInfo.legOrder === props.legOrder);
                    JourneyActionHandlers.handleLegUpdate(
                        props,
                        legToUpdate,
                        trackedData,
                        updateLocationManually,
                        handlerContext,
                    );
                }
            },
            metroConfirmProps,
            predictedLeg,
            shouldAutoOpenUpdateTransit,
            setShouldAutoOpenUpdateTransit,
            busFleetNumber,
            busLegData,
        }),
        [
            isLoading,
            error,
            itineraryCardProps,
            transitCheckInProps,
            popupProps,
            journeyId,
            currentLegDataForStatus?.riderLocation,
            callDriverBottomsheetModalRef,
            ticketUIProps,
            currentLegDataForStatus?.riderLocation?.timestamp,
            trackLostJourneyProps,
            timeTableData,
            metroConfirmProps,
            predictedLeg,
            shouldAutoOpenUpdateTransit,
            busFleetNumber,
            busLegData,
        ],
    );

    return <LiveJourneyOverviewUI {...uiProps} />;
};

export const LiveJourneyOverviewFlow: React.FC<LiveJourneyOverviewFlowProps> = ({ journeyId }) => {
    const appSystemConfig = useAppSelector(selectAppConfig);
    if (!journeyId || !appSystemConfig.flowConfig.enableLiveTracking) {
        return <NoJourneyPlaceholder />;
    }
    return <LiveJourneyOverviewFlowInternal journeyId={journeyId} />;
};
