import {
    type JourneyRule,
    type RuleHandlerParams,
    type DetailScreenRuleOutput,
    type OverviewScreenRuleOutput,
} from './JourneyRulesTypes';
import {
    buildDetailedLiveHeaderProps,
    getWalkTaxiPreboardingHeaderContent,
    getBusPreboardingHeaderContent,
    getInTransitHeaderContent,
    buildCurrentLegSplitUpProps,
    buildWalkTaxiLegSplitUpItems,
    buildMiniBusTrackingProps,
    buildAdditionalBusInfoProps,
    buildRateTransitProps,
    buildInStationZoneProps,
    getRideSkippedPreboardingHeaderContent,
    getVehicleMissedPreboardingHeaderContent,
    buildNextLegProps,
} from '@/src-v2/multimodal/screens/LiveJourneyDetail/FlowHelpers';
import { formatTime, getStopString } from './JourneyRuleHelpers';
import { BasePreboardingProps } from '../screens/LiveJourneyDetail/Types';
import {
    buildOverviewCommonProps,
    buildOverviewTwoTransits,
    mapLegToOverviewUITransitType,
} from '../screens/LiveJourneyOverview/FlowHelpers'; // Import buildOverviewTwoTransits from here
import { TransitType } from '../screens/NewLiveJourney/components/Iternary/types';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import {
    getNextLegOrder,
    parseExitGate,
    getPreviousLegOrder,
    calculateFullJourneyTime,
} from '../utils/journeyTrackingUtils';
import { castTransitModeToMultimodalTravelMode } from '@/src-v2/utils/common';
import { setJourneyRoute } from '@/typescript/state/client/search';
import { getUserLanguageStringsForMode } from '../utils/BusServiceUtils';
import { checkTaxiLeg } from '@/typescript/utils/common';

export const journeyRules: JourneyRule[] = [
    // --- Rules for LiveJourneyDetail ---
    {
        name: 'Detail_ChooseRide',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEBOOKINGPENDING'],
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, handlerContext } = params;
            const { navigation } = handlerContext;
            if (!navigation) return {};
            return {
                viewMode: 'chooseRide',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                chooseRideProps: {
                    navigation,
                    rideOptionsLeg: currentLeg,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingRideSkipped',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['RIDESKIPPED'],
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getRideSkippedPreboardingHeaderContent(
                currentLeg,
                allLegs,
                handlerContext.userLanguageStrings,
            );
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const isLiveTrackingNotAvailable =
                !nextLeg || ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState);
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                false,
            );
            const mode =
                nextLeg?.transitMode === 'METRO' ? 'metro' : nextLeg?.transitMode === 'SUBWAY' ? 'train' : 'bus';
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    status: 'rideSkipped',
                    isLastLeg: currentLeg.isLastLeg,
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    mode,
                    isBusTicketNotActivated: false,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    onPressRebookSkippedLeg: () => JourneyActionHandlers.rebookSkippedLeg(handlerContext, currentLeg),
                    onPressTrackMode,
                    isLoading: false,
                    isButtonLoading: currentLeg.staticInfo.isLoading,
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_WalkEnding',
        screenType: 'LiveJourneyDetail',
        userStates: ['WALK'],
        vehicleStates: undefined,
        transitModes: ['WALK'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return nextLeg?.transitMode === undefined;
        },
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getWalkTaxiPreboardingHeaderContent(
                currentLeg,
                allLegs,
                undefined,
                handlerContext.userLanguageStrings,
            );
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                false,
            );
            const isLiveTrackingNotAvailable = false;
            const mode = 'bus';

            const onPressSwitchToAuto = () => {
                if (currentLeg.distanceValue && currentLeg.distanceValue < 500) {
                    handlerContext.switchToAutoConfirmationModalRef?.present();
                } else {
                    JourneyActionHandlers.switchBetweenAutoAndWalk(handlerContext, currentLeg);
                }
            };

            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    status: 'walking',
                    isLastLeg: currentLeg.isLastLeg,
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    mode,
                    isLoading: false,
                    isBusTicketNotActivated: false,
                    hasApplicablePasses: false,
                    isInsideSpecialZone: currentLeg.insideSpecialZone,
                    isButtonLoading: currentLeg.staticInfo.isLoading,
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    onPressViewTicketButton: onPressTicket,
                    onPressSwitchToAuto: onPressSwitchToAuto,
                    onPressBookRide: () => {
                        JourneyActionHandlers.switchBetweenAutoAndWalk(handlerContext, currentLeg);
                    },
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                    onPressTrackMode,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingWalkTaxi_Bus',
        screenType: 'LiveJourneyDetail',
        userStates: ['WALK'],
        vehicleStates: undefined,
        transitModes: ['WALK'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return nextLeg?.transitMode === 'BUS' && !['VEHICLEARRIVED', 'NOLIVEDATA'].includes(nextLeg.vehicleState);
        },
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getWalkTaxiPreboardingHeaderContent(
                currentLeg,
                allLegs,
                undefined,
                handlerContext.userLanguageStrings,
            );
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                true,
            );
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            return {
                viewMode: 'intransit',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                inTransitProps: {
                    journeyId: handlerContext.journeyId,
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    status: 'inTransit',
                    mode,
                    miniBusTrackingProps: buildMiniBusTrackingProps(
                        nextLeg ?? currentLeg,
                        onPressTrackMode,
                        currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.Destination,
                        userLanguageStrings.BoardingStop('Bus'),
                        userLanguageStrings.CurrentStopName('Bus'),
                        undefined,
                        undefined,
                        userLanguageStrings,
                    ),
                    nextLegProps: undefined,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onVerifyPass: undefined,
                    onShowTicketPress: onPressTicket,
                    onPressExitStation: undefined,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingWalkTaxi_Metro_Subway',
        screenType: 'LiveJourneyDetail',
        userStates: ['WALK'],
        vehicleStates: undefined,
        transitModes: ['WALK'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return nextLeg?.transitMode === 'METRO' || nextLeg?.transitMode === 'SUBWAY';
        },
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getWalkTaxiPreboardingHeaderContent(
                currentLeg,
                allLegs,
                undefined,
                handlerContext.userLanguageStrings,
            );
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                false,
            );
            const isLiveTrackingNotAvailable =
                !nextLeg || ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState);

            const onPressUseAuto = () => {
                if (currentLeg.distanceValue && currentLeg.distanceValue < 500) {
                    handlerContext.switchToAutoConfirmationModalRef?.present();
                } else {
                    JourneyActionHandlers.switchBetweenAutoAndWalk(handlerContext, currentLeg);
                }
            };

            const useAutoHyperlink =
                currentLeg.vehicleState !== 'RIDECLOSETODESTINATION'
                    ? {
                          text: userLanguageStrings.UseAuto,
                          onPress: onPressUseAuto,
                          isLoading: currentLeg.staticInfo.isLoading,
                      }
                    : undefined;

            const mode =
                nextLeg?.transitMode === 'METRO' ? 'metro' : nextLeg?.transitMode === 'SUBWAY' ? 'train' : 'bus';
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    status: 'starting',
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    mode,
                    isLastLeg: currentLeg.isLastLeg,
                    isBusTicketNotActivated: false,
                    currentLegSplitUpProps: buildCurrentLegSplitUpProps(
                        currentLeg,
                        buildWalkTaxiLegSplitUpItems(handlerContext, currentLeg, allLegs, useAutoHyperlink),
                        userLanguageStrings,
                    ),
                    isLoading: false,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    handleOnPressViewTicketButton: onPressTicket,
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                    onPressBookRide: () => {
                        JourneyActionHandlers.switchBetweenAutoAndWalk(handlerContext, currentLeg);
                    },
                    onPressTrackMode,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingTaxiStarting',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: undefined,
        transitModes: ['AUTO', 'TAXI', 'BIKE'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getWalkTaxiPreboardingHeaderContent(
                currentLeg,
                allLegs,
                handlerContext.rideDistance,
                userLanguageStrings,
            );
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                false,
            );
            const isLiveTrackingNotAvailable =
                !nextLeg || ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState);

            const mode =
                nextLeg?.transitMode === 'METRO' ? 'metro' : nextLeg?.transitMode === 'SUBWAY' ? 'train' : 'bus';
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    status: 'taxiStarting',
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    mode,
                    isBusTicketNotActivated: false,
                    currentLegSplitUpProps: buildCurrentLegSplitUpProps(
                        currentLeg,
                        buildWalkTaxiLegSplitUpItems(handlerContext, currentLeg, allLegs, undefined),
                        userLanguageStrings,
                    ),
                    isLastLeg: currentLeg.isLastLeg,
                    isLoading: false,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onPressRideDetails: () => {
                        if (currentLeg.taxiBookingId) {
                            JourneyActionHandlers.navigateToRideTracking(handlerContext, currentLeg);
                        }
                    },
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    onPressTrackMode,
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingBusWaiting',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEISARRIVING'],
        transitModes: ['BUS'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, onPressTrackMode, handlerContext, allLegs } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getBusPreboardingHeaderContent(currentLeg, userLanguageStrings);
            const isLiveTrackingNotAvailable =
                !currentLeg ||
                ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(currentLeg.vehicleState);
            const isBusTicketNotActivated = !currentLeg?.realTimeInfo?.busFleetNumber;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const hasApplicablePasses =
                currentLeg.transitMode == 'BUS' ? currentLeg.hasApplicablePasses : nextLeg?.hasApplicablePasses;
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                        currentLeg,
                        headerContent.title,
                        headerContent.info,
                        false,
                    ),
                    isLastLeg: currentLeg.isLastLeg,
                    mode: 'bus',
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    isBusTicketNotActivated: isBusTicketNotActivated,
                    status: 'waiting',
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                    hasApplicablePasses: hasApplicablePasses,
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    miniBusTrackingProps: buildMiniBusTrackingProps(
                        currentLeg,
                        onPressTrackMode,
                        currentLeg.staticInfo.origin.stationName ?? userLanguageStrings.Destination,
                        userLanguageStrings.BoardingPoint,
                        userLanguageStrings.CurrentStopName(getStopString(currentLeg.transitMode, userLanguageStrings)),
                        undefined,
                        undefined,
                        userLanguageStrings,
                    ),
                    handleOnPressViewTicketButton: onPressTicket,
                    onPressTrackMode,
                    isLoading: false,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingBusAlmostArrived',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEALMOSTARRIVED'],
        transitModes: ['BUS'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, onPressTrackMode, handlerContext, allLegs } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getBusPreboardingHeaderContent(currentLeg, userLanguageStrings);
            const isBusTicketNotActivated = !currentLeg?.realTimeInfo?.busFleetNumber;
            const hasApplicablePasses =
                currentLeg.transitMode == 'BUS' ? currentLeg.hasApplicablePasses : nextLeg?.hasApplicablePasses;
            const basePreboardingProps: BasePreboardingProps = {
                detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                    currentLeg,
                    headerContent.title,
                    headerContent.info,
                    false,
                ),
                isLastLeg: currentLeg.isLastLeg,
                isLiveTrackingNotAvailable:
                    !currentLeg ||
                    ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(currentLeg.vehicleState),
                mode: 'bus',
                onPressTrackMode,
                isLoading: false,
                isBusTicketNotActivated: isBusTicketNotActivated,
                hasApplicablePasses: hasApplicablePasses,
                onPressVerifyPass: () => {
                    JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                },
                onPressBusOtpScreen: () => {
                    JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                },
            };
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    ...basePreboardingProps,
                    status: 'transitIsOneStopAway',
                    additionalBusInfoProps: buildAdditionalBusInfoProps(currentLeg, userLanguageStrings),
                    handleOnPressViewTicketButton: onPressTicket,
                    onPressTrackMode,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingBusArrived',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING', 'WALK'],
        vehicleStates: undefined,
        transitModes: ['BUS', 'WALK'],
        condition: (currentLeg, allLegs) => {
            if (currentLeg.transitMode === 'WALK') {
                const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
                return (
                    nextLeg?.transitMode === 'BUS' && ['VEHICLEARRIVED', 'NOLIVEDATA'].includes(nextLeg.vehicleState)
                );
            }
            return ['VEHICLEARRIVED', 'NOLIVEDATA'].includes(currentLeg.vehicleState);
        },
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, onPressTrackMode, handlerContext, allLegs } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const busLeg = currentLeg.transitMode === 'BUS' ? currentLeg : nextLeg;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getBusPreboardingHeaderContent(currentLeg, userLanguageStrings);
            const isBusTicketNotActivated = !busLeg?.realTimeInfo?.busFleetNumber;
            const hasApplicablePasses = busLeg?.hasApplicablePasses;
            const basePreboardingProps: BasePreboardingProps = {
                detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                    currentLeg,
                    headerContent.title,
                    headerContent.info,
                    false,
                ),
                isLastLeg: currentLeg.isLastLeg,
                isLiveTrackingNotAvailable:
                    !currentLeg ||
                    ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(currentLeg.vehicleState),
                mode: 'bus',
                onPressTrackMode,
                isLoading: false,
                isBusTicketNotActivated: isBusTicketNotActivated,
                hasApplicablePasses: hasApplicablePasses,
                onPressVerifyPass: () => {
                    JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                },
                onPressBusOtpScreen: () => {
                    JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                },
            };
            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    ...basePreboardingProps,
                    status: 'transitArrived',
                    additionalBusInfoProps: buildAdditionalBusInfoProps(currentLeg, userLanguageStrings),
                    handleOnPressViewTicketButton: onPressTicket,
                    onPressTrackMode,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingMetroSubwayWaiting',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEISARRIVING', 'NOLIVEDATA', 'VEHICLEALMOSTARRIVED', 'VEHICLEARRIVED'],
        transitModes: ['METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, onPressTrackMode, handlerContext, allLegs } = params;
            if (!onPressTicket || !onPressTrackMode) return {};
            const previousLeg = getPreviousLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return {
                viewMode: 'waitingStation',
                backgroundMode: 'inStationBackground',
                shouldShowBottomSheet: false,
                waitingStationProps: {
                    onPressShowTicket: onPressTicket,
                    onPressShowTimetable: () => {
                        handlerContext.timeTableRef?.current?.present();
                    },
                    onPressCheckIn: () => {
                        JourneyActionHandlers.onPressCheckIn(handlerContext);
                    },
                    platformNo: currentLeg.platformInfo ?? '',
                    towards: currentLeg.staticInfo.towardsStation ?? '',
                    times: currentLeg.staticInfo.timetable ?? [],
                    sourceStationName: currentLeg.staticInfo.origin.stationName ?? '',
                    fromTime: Date.now(),
                    isTransitLeg: previousLeg?.transitMode === currentLeg?.transitMode,
                    currentLegMetroLineColor: currentLeg.staticInfo.lineColor?.[0],
                    mode: castTransitModeToMultimodalTravelMode(currentLeg.transitMode),
                },
                inStationZoneProps: buildInStationZoneProps(handlerContext, currentLeg, 'waiting', {
                    onPressTicket,
                    onPressTrackMode,
                }),
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_PreboardingVehicleMissed',
        screenType: 'LiveJourneyDetail',
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'],
        transitModes: ['BUS', 'METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, onPressTrackMode, handlerContext, allLegs } = params;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getVehicleMissedPreboardingHeaderContent(
                currentLeg,
                handlerContext.userLanguageStrings,
            );
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                false,
            );
            const isLiveTrackingNotAvailable =
                !currentLeg ||
                ['NOLIVEDATA', 'VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(currentLeg.vehicleState);
            const mode =
                currentLeg.transitMode === 'METRO' ? 'metro' : currentLeg.transitMode === 'SUBWAY' ? 'train' : 'bus';
            const isBusTicketNotActivated = !currentLeg?.realTimeInfo?.busFleetNumber;
            const onPressRebookSkippedLeg = () => {
                const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
                if (nextLeg && checkTaxiLeg(nextLeg.transitMode)) {
                    JourneyActionHandlers.rebookSkippedLeg(handlerContext, nextLeg);
                }
            };
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const hasApplicablePasses =
                currentLeg.transitMode === 'BUS'
                    ? currentLeg.hasApplicablePasses
                    : nextLeg
                      ? nextLeg.hasApplicablePasses
                      : false;

            return {
                viewMode: 'preboarding',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                preboardingProps: {
                    status: 'rideSkipped',
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    isLiveTrackingNotAvailable: isLiveTrackingNotAvailable,
                    mode,
                    isLastLeg: currentLeg.isLastLeg,
                    isLoading: false,
                    isBusTicketNotActivated: isBusTicketNotActivated,
                    hasApplicablePasses: hasApplicablePasses,
                    onPressVerifyPass: () => {
                        JourneyActionHandlers.navigateToPassesScreen(handlerContext);
                    },
                    onPressBusOtpScreen: () => {
                        JourneyActionHandlers.onPressBusOtpScreen(handlerContext, allLegs);
                    },
                    isButtonLoading: currentLeg.staticInfo.isLoading,
                    onPressRebookSkippedLeg,
                    onPressTrackMode,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitBus',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: ['RIDESTARTED', 'RIDECLOSETODESTINATION'],
        transitModes: ['BUS'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getInTransitHeaderContent(currentLeg, allLegs, userLanguageStrings);
            const destinationTime = formatTime(
                Date.now() + (currentLeg.realTimeInfo.destinationStopETAInMinutes ?? 0) * 60 * 1000,
            );
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                true,
            );
            const nextLegProps = buildNextLegProps(currentLeg, allLegs, handlerContext, true);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            return {
                viewMode: 'intransit',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                inTransitProps: {
                    journeyId: handlerContext.journeyId,
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    status: 'inTransit',
                    mode,
                    miniBusTrackingProps: buildMiniBusTrackingProps(
                        currentLeg,
                        onPressTrackMode,
                        currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.Destination,
                        userLanguageStrings.DestinationStop(getStopString(currentLeg.transitMode, userLanguageStrings)),
                        userLanguageStrings.CurrentStopName(getStopString(currentLeg.transitMode, userLanguageStrings)),
                        destinationTime,
                        undefined,
                        userLanguageStrings,
                    ),
                    nextLegProps,
                    onShowTicketPress: onPressTicket,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onVerifyPass: currentLeg.hasApplicablePasses
                        ? () => JourneyActionHandlers.navigateToPassesScreen(handlerContext)
                        : undefined,
                    onPressExitStation: () =>
                        JourneyActionHandlers.onPressExitStation(handlerContext, currentLeg.staticInfo.legOrder),
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitBusReachedDestination',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: ['RIDEREACHEDDESTINATION'],
        transitModes: ['BUS'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket) return {};
            const headerContent = getInTransitHeaderContent(currentLeg, allLegs, userLanguageStrings);
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const isLastLegInJourney = currentLeg.isLastLeg || (nextLeg?.transitMode === 'WALK' && nextLeg?.isLastLeg);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            const nextLegProps = buildNextLegProps(currentLeg, allLegs, handlerContext, true);
            const detailInTransitProps: DetailScreenRuleOutput['inTransitProps'] = isLastLegInJourney
                ? {
                      detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                          currentLeg,
                          headerContent.title,
                          headerContent.info,
                          true,
                      ),
                      mode,
                      status: 'destinationReached',
                      isSingleMode: true,
                      nextLegProps,
                      rateTransitProps: buildRateTransitProps(currentLeg, userLanguageStrings),
                  }
                : {
                      detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                          currentLeg,
                          headerContent.title,
                          headerContent.info,
                          true,
                      ),
                      mode,
                      status: 'destinationReached',
                      isSingleMode: false,
                      nextLegProps,
                      nextTransitInfo: (() => {
                          const nextPTLeg = (() => {
                              if (nextLeg && ['METRO', 'SUBWAY', 'BUS'].includes(nextLeg.transitMode)) return nextLeg;
                              const nextToNextLeg = nextLeg?.staticInfo.legOrder
                                  ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                                  : null;
                              if (nextToNextLeg && ['METRO', 'SUBWAY', 'BUS'].includes(nextToNextLeg.transitMode))
                                  return nextToNextLeg;
                              return null;
                          })();
                          const nextLegTravelModeDisplay =
                              nextPTLeg?.staticInfo?.travelMode === 'Subway'
                                  ? 'Train'
                                  : nextPTLeg?.staticInfo?.travelMode;
                          return nextPTLeg
                              ? `${userLanguageStrings.YourVehicleArrivesInNextMinsStartsWalkingTowards} ${nextLegTravelModeDisplay ? getUserLanguageStringsForMode(nextLegTravelModeDisplay, userLanguageStrings) : ''} ${Math.max(nextPTLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) + (userLanguageStrings.Mins || userLanguageStrings.Few)} ${nextPTLeg.staticInfo.origin.entryGate ?? `${userLanguageStrings.Next} ${getStopString(nextPTLeg.transitMode, userLanguageStrings)}`}`
                              : userLanguageStrings.JourneyEnds;
                      })(),
                      handleOnPressGoToNextTransit: () => {
                          /* TODO: Implement for Detail if needed */
                      },
                  };
            return {
                viewMode: 'intransit',
                backgroundMode: 'map',
                shouldShowBottomSheet: true,
                inTransitProps: detailInTransitProps,
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitMetroSubwayRideStarted',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: ['RIDESTARTED'],
        transitModes: ['METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getInTransitHeaderContent(currentLeg, allLegs, userLanguageStrings);
            const destinationTime = formatTime(
                currentLeg.transitMode === 'METRO' &&
                    currentLeg.realTimeInfo.confirmedBoardingData?.confimationTimestamp
                    ? currentLeg.realTimeInfo.confirmedBoardingData.confimationTimestamp +
                          calculateFullJourneyTime(currentLeg.staticInfo.onRouteStops) * 1000
                    : Date.now() + (currentLeg.realTimeInfo.destinationStopETAInMinutes ?? 0) * 60 * 1000,
            );
            const detailedLiveHeaderProps = buildDetailedLiveHeaderProps(
                currentLeg,
                headerContent.title,
                headerContent.info,
                true,
            );
            const nextLegProps = buildNextLegProps(currentLeg, allLegs, handlerContext, true);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return {
                viewMode: 'intransit',
                backgroundMode: 'inTransitBackground',
                shouldShowBottomSheet: true,
                inTransitProps: {
                    journeyId: handlerContext.journeyId,
                    mode,
                    detailedLiveHeaderProps: detailedLiveHeaderProps,
                    status: 'inTransit',
                    miniBusTrackingProps: buildMiniBusTrackingProps(
                        currentLeg,
                        onPressTrackMode,
                        currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.Destination,
                        userLanguageStrings.DestinationStop(getStopString(currentLeg.transitMode, userLanguageStrings)),
                        userLanguageStrings.CurrentStopName(getStopString(currentLeg.transitMode, userLanguageStrings)),
                        destinationTime,
                        nextLeg?.staticInfo.lineColor?.[0] ?? undefined,
                        userLanguageStrings,
                    ),
                    nextLegProps,
                    onShowTicketPress: onPressTicket,
                    hasApplicablePasses: currentLeg.hasApplicablePasses,
                    onVerifyPass: undefined,
                    onPressExitStation: () =>
                        JourneyActionHandlers.onPressExitStation(handlerContext, currentLeg.staticInfo.legOrder),
                },
                inStationZoneProps: buildInStationZoneProps(handlerContext, currentLeg, 'inTransit', {
                    onPressTicket,
                    onPressTrackMode,
                }),
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitMetroSubwayRideCloseToDestination',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: ['RIDECLOSETODESTINATION'],
        transitModes: ['METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const title = `${currentLeg.staticInfo.destination.stationName} ${userLanguageStrings.WillArriveSoon}`;
            const info = userLanguageStrings.IfYouHaveArrivedAlreadyYouCanManuallyExit;
            const detailedLiveHeaderProps = {
                isInTransitHeader: true,
                title,
                icon: currentLeg.staticInfo.travelMode,
                info,
                noOfStops: 0,
                isLoading: false,
                status: 'closeToDestination',
            };
            const nextLegProps = buildNextLegProps(currentLeg, allLegs, handlerContext, false);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            return {
                viewMode: 'intransit',
                backgroundMode: 'inTransitBackground',
                shouldShowBottomSheet: true,
                inTransitProps: {
                    journeyId: handlerContext.journeyId,
                    detailedLiveHeaderProps,
                    nextLegProps,
                    status: 'closeToDestination',
                    onPressExitStation: () =>
                        JourneyActionHandlers.onPressExitStation(handlerContext, currentLeg.staticInfo.legOrder),
                    mode,
                    onShowTicketPress: onPressTicket,
                },
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitMetroSubwayRideCloseToDestination',
        screenType: 'LiveJourneyDetail',
        userStates: ['EXITSTATION'],
        vehicleStates: ['ARRIVEDATSTATIONPLATFORM'],
        transitModes: ['METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, onPressTicket, allLegs, onPressTrackMode, handlerContext } = params;
            const userLanguageStrings = handlerContext.userLanguageStrings;
            if (!onPressTicket || !onPressTrackMode) return {};
            const title = `${userLanguageStrings.YouHaveReached} ${currentLeg.staticInfo.destination.stationName}`;
            const info = currentLeg.transitMode === 'SUBWAY' ? '' : userLanguageStrings.ScanTicketOnYourExit;
            const detailedLiveHeaderProps = {
                isInTransitHeader: true,
                title,
                icon: currentLeg.staticInfo.travelMode,
                info,
                noOfStops: 0,
                isLoading: false,
                status: 'exitStation',
            };
            const { gateNo, gateSide } = parseExitGate(currentLeg.staticInfo.destination.exitGate);
            const nextLegProps = buildNextLegProps(currentLeg, allLegs, handlerContext, false);
            const mode = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
            return {
                viewMode: 'intransit',
                backgroundMode: 'inTransitBackground',
                shouldShowBottomSheet: true,
                inTransitProps: {
                    journeyId: handlerContext.journeyId,
                    detailedLiveHeaderProps,
                    exitGateNo: gateNo,
                    exitGateSide: gateSide,
                    onCompleteJourney: async () => await JourneyActionHandlers.completeJourney(handlerContext),
                    onMarkLegComplete: () =>
                        JourneyActionHandlers.markLegComplete(handlerContext, currentLeg.staticInfo.legOrder),
                    nextLegProps,
                    mode,
                    status: 'exitStation',
                    onShowTicketPress: onPressTicket,
                    hasNextLeg: Boolean(getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder)),
                },
                inStationZoneProps: buildInStationZoneProps(handlerContext, currentLeg, 'inTransit', {
                    onPressTicket,
                    onPressTrackMode,
                }),
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },
    {
        name: 'Detail_InTransitMetroSubwayReachedDestination',
        screenType: 'LiveJourneyDetail',
        userStates: ['INVEHICLE'],
        vehicleStates: ['RIDEREACHEDDESTINATION'],
        transitModes: ['METRO', 'SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): DetailScreenRuleOutput => {
            const { currentLeg, allLegs, onPressTicket, onPressTrackMode, handlerContext } = params;
            if (!onPressTicket || !onPressTrackMode) return {};
            const headerContent = getInTransitHeaderContent(currentLeg, allLegs, handlerContext.userLanguageStrings);
            return {
                viewMode: 'intransit',
                backgroundMode: 'inTransitBackground',
                shouldShowBottomSheet: false,
                detailedLiveHeaderProps: buildDetailedLiveHeaderProps(
                    currentLeg,
                    headerContent.title,
                    headerContent.info,
                    true,
                ),
                onPressExit: () => JourneyActionHandlers.navigateToOverviewScreen(handlerContext),
                onPressSafety: () => JourneyActionHandlers.showSafetyFeatures(handlerContext),
            };
        },
    },

    // --- Rules for LiveJourneyOverview ---

    // Rule 1: TAXI - Navigate to Choose Ride
    {
        name: 'Overview_Taxi_NavigateToChooseRide',
        screenType: 'LiveJourneyOverview',
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        userStates: ['WAITING'],
        vehicleStates: ['VEHICLEBOOKINGPENDING'],
        condition: undefined,
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const commonCardProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonCardProps) return null;
            const twoTransits = buildOverviewTwoTransits(currentLeg, allLegs);
            const onPressDetails = () => {
                if (currentLeg.staticInfo.selectedQuoteId) {
                    handlerContext.actions.selectPricingId(
                        currentLeg.staticInfo.legOrder,
                        currentLeg.staticInfo.selectedQuoteId,
                    );
                    JourneyActionHandlers.navigateToLookingForRides(
                        handlerContext,
                        currentLeg.staticInfo.searchId,
                        currentLeg.staticInfo.legOrder,
                    );
                    if (currentLeg?.staticInfo.searchId && currentLeg?.staticInfo) {
                        handlerContext.dispatch(
                            setJourneyRoute({
                                id: currentLeg.staticInfo.searchId,
                                payload: currentLeg.staticInfo,
                            }),
                        );
                    }
                } else {
                    console.error('No selected quote ID found for current leg');
                }
            };
            return { ...commonCardProps, twoTransits, onPressDetails, onPressSafety: () => {} };
        },
    },

    // Rule 2: TAXI - Navigate to Looking for Rides
    {
        name: 'Overview_Taxi_NavigateToLookingForRides',
        screenType: 'LiveJourneyOverview',
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        userStates: ['WAITING'],
        vehicleStates: ['SEARCHINGFORVEHICLE', 'NODRIVERFOUND'],
        condition: undefined,
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const commonCardProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonCardProps) return null;

            const onPressDetails = () => {
                JourneyActionHandlers.navigateToLookingForRides(
                    handlerContext,
                    currentLeg.staticInfo.searchId,
                    currentLeg.staticInfo.legOrder,
                );
            };

            const twoTransits = buildOverviewTwoTransits(currentLeg, allLegs);
            return { ...commonCardProps, onPressDetails, twoTransits, onPressSafety: () => {} };
        },
    },

    // Rule 3: TAXI - Navigate to journey details
    {
        name: 'Overview_Taxi_NavigateToJourneyDetails',
        screenType: 'LiveJourneyOverview',
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        userStates: ['WAITING', 'WALK'],
        vehicleStates: ['RIDESKIPPED'],
        condition: undefined,
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const commonCardProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonCardProps) return null;
            const twoTransits = buildOverviewTwoTransits(currentLeg, allLegs);
            const onPressDetails = () => {
                JourneyActionHandlers.navigateToLiveJourneyDetail(handlerContext);
            };
            return { ...commonCardProps, twoTransits, onPressDetails, onPressSafety: () => {} };
        },
    },

    // Rule 4: TAXI - Navigate to Ride Tracking
    {
        name: 'Overview_Taxi_NavigateToRideTracking',
        screenType: 'LiveJourneyOverview',
        transitModes: ['TAXI', 'AUTO', 'BIKE'],
        userStates: ['WAITING', 'INVEHICLE'],
        vehicleStates: [
            'VEHICLEISARRIVING',
            'VEHICLEALMOSTARRIVED',
            'VEHICLEARRIVED',
            'RIDESTARTED',
            'RIDECLOSETODESTINATION',
            'RIDEREACHEDDESTINATION',
            'VEHICLEWASMISSED',
            'VEHICLEWILLBEMISSED',
        ],
        condition: undefined,
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const commonCardProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonCardProps) return null;

            const onPressDetails = () => {
                if (currentLeg.taxiBookingId) {
                    if (currentLeg.userState === 'WAITING' || currentLeg.isLastLeg) {
                        JourneyActionHandlers.navigateToRideTracking(handlerContext, currentLeg);
                    } else {
                        JourneyActionHandlers.navigateToLiveJourneyDetail(handlerContext);
                    }
                } else {
                    console.info(
                        'Overview_Taxi_NavigateToRideTracking: taxiBookingId is missing for leg:',
                        currentLeg.staticInfo.legOrder,
                    );
                }
            };
            const onPressSafety = () => {
                JourneyActionHandlers.showSafetyFeatures(handlerContext);
            };
            const twoTransits = buildOverviewTwoTransits(currentLeg, allLegs);
            return { ...commonCardProps, onPressDetails, twoTransits, onPressSafety };
        },
    },

    {
        name: 'Overview_WalkFarawayWithNextLeg',
        screenType: 'LiveJourneyOverview',
        userStates: ['FARAWAY'],
        vehicleStates: undefined,
        transitModes: ['WALK'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return Boolean(nextLeg);
        },
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs } = params;
            const commonProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonProps) return null;

            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const afterNextLeg = nextLeg?.staticInfo.legOrder
                ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                : null;
            const twoTransits: TransitType[] = (() => {
                if (nextLeg) {
                    const firstTransit = mapLegToOverviewUITransitType(
                        currentLeg,
                        allLegs,
                        'FARAWAY',
                        nextLeg.displayTransitType,
                        'DURATION',
                        undefined,
                    );
                    const secondTransit = mapLegToOverviewUITransitType(
                        nextLeg,
                        allLegs,
                        undefined,
                        afterNextLeg?.displayTransitType || 'DESTINATION',
                        'ETA',
                        undefined,
                    );
                    return [firstTransit, secondTransit];
                }
                return [];
            })();
            return { ...commonProps, twoTransits, onPressSafety: () => {} };
        },
    },
    {
        name: 'Overview_PublicTransitToWalkToNextPublicTransit',
        screenType: 'LiveJourneyOverview',
        userStates: ['INVEHICLE'],
        vehicleStates: undefined,
        transitModes: ['BUS', 'METRO', 'SUBWAY'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const afterNextLeg = nextLeg?.staticInfo.legOrder
                ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                : null;
            return nextLeg?.transitMode === 'WALK' && Boolean(afterNextLeg);
        },
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs } = params;
            const commonProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonProps) return null;

            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const afterNextLeg = nextLeg?.staticInfo.legOrder
                ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                : null;
            const legAfterAfterNext = afterNextLeg?.staticInfo.legOrder
                ? getNextLegOrder(allLegs, afterNextLeg.staticInfo.legOrder)
                : null;

            const twoTransits: TransitType[] = (() => {
                if (afterNextLeg) {
                    const firstTransit = mapLegToOverviewUITransitType(
                        currentLeg,
                        allLegs,
                        undefined,
                        afterNextLeg.displayTransitType,
                        'DURATION',
                        undefined,
                    );
                    const secondTransit = mapLegToOverviewUITransitType(
                        afterNextLeg,
                        allLegs,
                        undefined,
                        legAfterAfterNext?.displayTransitType || 'DESTINATION',
                        'ETA',
                        undefined,
                    );
                    return [firstTransit, secondTransit];
                }
                return [];
            })();
            return { ...commonProps, twoTransits, onPressSafety: () => {} };
        },
    },
    {
        name: 'Overview_WaitingOrFarawayGeneral',
        screenType: 'LiveJourneyOverview',
        userStates: ['WAITING', 'FARAWAY'],
        vehicleStates: undefined,
        transitModes: ['BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'WALK', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            if (currentLeg.transitMode === 'WALK' && currentLeg.userState === 'FARAWAY') {
                const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
                return !nextLeg;
            }
            return true;
        },
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs } = params;
            const commonProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonProps) return null;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const waitingFarawayType = currentLeg.userState === 'WAITING' ? 'WAITING' : 'FARAWAY';

            const firstOfPair = mapLegToOverviewUITransitType(
                currentLeg,
                allLegs,
                waitingFarawayType,
                currentLeg.displayTransitType,
                'ETA',
                undefined,
            );
            const secondOfPairInitial = mapLegToOverviewUITransitType(
                currentLeg,
                allLegs,
                undefined,
                nextLeg?.displayTransitType || 'DESTINATION',
                'ETA',
                undefined,
            );
            const isSecondOfPairLastLeg = firstOfPair.isLastLeg ? true : !nextLeg;
            const secondOfPair = { ...secondOfPairInitial, isFirstLeg: false, isLastLeg: isSecondOfPairLastLeg };
            const twoTransits: TransitType[] = [firstOfPair, secondOfPair];

            return { ...commonProps, twoTransits, onPressSafety: () => {} };
        },
    },
    {
        name: 'Overview_GenericNextLegExists',
        screenType: 'LiveJourneyOverview',
        userStates: ['WALK', 'INVEHICLE', 'EXITSTATION', 'NONE'],
        vehicleStates: undefined,
        transitModes: ['WALK', 'BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            if (
                ['BUS', 'METRO', 'SUBWAY'].includes(currentLeg.transitMode) &&
                currentLeg.userState === 'INVEHICLE' &&
                nextLeg?.transitMode === 'WALK'
            ) {
                const afterNextLeg = nextLeg?.staticInfo.legOrder
                    ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                    : null;
                if (afterNextLeg) return false;
            }
            return Boolean(nextLeg);
        },
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs } = params;
            const commonProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonProps) return null;

            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const afterNextLeg = nextLeg?.staticInfo.legOrder
                ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
                : null;

            const twoTransits: TransitType[] = (() => {
                if (nextLeg) {
                    const firstTransit = mapLegToOverviewUITransitType(
                        currentLeg,
                        allLegs,
                        currentLeg.userState === 'EXITSTATION' ? 'EXITSTATION' : undefined,
                        nextLeg.displayTransitType,
                        'DURATION',
                        undefined,
                    );
                    const secondTransit = mapLegToOverviewUITransitType(
                        nextLeg,
                        allLegs,
                        undefined,
                        afterNextLeg?.displayTransitType || 'DESTINATION',
                        nextLeg.transitMode === 'WALK' ? 'DURATION' : 'ETA',
                        undefined,
                    );
                    return [firstTransit, secondTransit];
                }
                return [];
            })();
            return { ...commonProps, twoTransits, onPressSafety: () => {} };
        },
    },
    {
        name: 'Overview_GenericLastLegOrNoNextLeg',
        screenType: 'LiveJourneyOverview',
        userStates: ['WALK', 'INVEHICLE', 'EXITSTATION', 'NONE'],
        vehicleStates: undefined,
        transitModes: ['WALK', 'BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return !nextLeg;
        },
        handler: (params: RuleHandlerParams): OverviewScreenRuleOutput => {
            const { currentLeg, allLegs } = params;
            const commonProps = buildOverviewCommonProps(currentLeg, allLegs, params);
            if (!commonProps) return null;

            const firstTransit = mapLegToOverviewUITransitType(
                currentLeg,
                allLegs,
                currentLeg.userState === 'EXITSTATION' ? 'EXITSTATION' : undefined,
                'DESTINATION',
                'DURATION',
                undefined,
            );
            const secondTransit = mapLegToOverviewUITransitType(
                currentLeg,
                allLegs,
                'DESTINATION',
                'DESTINATION',
                'DURATION',
                undefined,
            );
            const twoTransits: TransitType[] = [firstTransit, secondTransit];

            return { ...commonProps, twoTransits, onPressSafety: () => {} };
        },
    },
];
