import { setJourneyRoute } from '@/typescript/state/client/search';
import { PopupDismissalTracker } from '../screens/LiveJourneyDetail/LiveJourneyPopupManager';
import { ProcessedLegInfo } from '../types/journeyTracking';
import { getNextLegOrder, getPreviousLegOrder, mapTransitModeToAutoCab } from '../utils/journeyTrackingUtils';
import {
    navigateToRateRide,
    navigateToLiveJourneyDetail,
    onPressSkipAndTakeNext,
    navigateToRideTracking,
    showTicket,
    navigateToLookingForRides,
} from './JourneyActionHandlers';
import { type JourneyRule, type RuleHandlerParams, type PopupRuleOutput } from './JourneyRulesTypes';
import { isBookingStatusConfirmed } from '@/typescript/utils/LegStatusUtils';
import { checkTaxiLeg } from '@/typescript/utils/common';

export const journeyPopupRules: JourneyRule[] = [
    // --- Rules for Popups ---
    {
        name: 'Popup_UserWillMissBus',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'FARAWAY', 'WAITING', 'INVEHICLE'],
        vehicleStates: undefined,
        transitModes: ['WALK', 'BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            // Check if there's a next leg that is a bus and has missed vehicle states
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return Boolean(
                nextLeg &&
                    nextLeg.transitMode === 'BUS' &&
                    ['VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState),
            );
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const popupType = 'UserWillMissBusWithNoOptions';
            const popupId = `${params.handlerContext.journeyId}-${nextLeg?.staticInfo.legOrder}-${popupType}-${nextLeg?.vehicleState}`;

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            return {
                id: popupId,
                type: popupType,
                props: {
                    userHasMissed: nextLeg?.vehicleState === 'VEHICLEWASMISSED',
                    currentBusNumber: nextLeg?.vehicleIdentifier || '',
                    bookDirectRide: () => {},
                    onClosePress: () => handleClosePopup(popupId),
                    onOtherOptionsPress: () => {},
                },
            };
        },
    },
    {
        name: 'Popup_UserWillMissMetro',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'FARAWAY', 'WAITING', 'INVEHICLE'],
        vehicleStates: undefined,
        transitModes: ['WALK', 'BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return Boolean(
                nextLeg &&
                    nextLeg.transitMode === 'METRO' &&
                    ['VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState),
            );
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const popupType = 'UserWillMissMetro';
            const popupId = `${params.handlerContext.journeyId}-${nextLeg?.staticInfo.legOrder}-${popupType}-${nextLeg?.vehicleState}`;

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onSkipAndTakeNextPress = () => {
                nextLeg && onPressSkipAndTakeNext(handlerContext, nextLeg.staticInfo.legOrder);
                handleClosePopup(popupId);
            };

            return {
                id: popupId,
                type: popupType,
                props: {
                    userHasMissed: nextLeg?.vehicleState === 'VEHICLEWASMISSED',
                    destination: nextLeg?.staticInfo.destination.stationName || 'Destination Metro Station',
                    nextTrainArrivalTime: '',
                    onSkipAndTakeNextPress,
                    onOtherOptionsPress: () => {},
                    onClosePress: () => handleClosePopup(popupId),
                    onTimerEnd: () => {},
                },
            };
        },
    },
    {
        name: 'Popup_UserWillMissSuburban',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'FARAWAY', 'WAITING', 'INVEHICLE'],
        vehicleStates: undefined,
        transitModes: ['WALK', 'BUS', 'METRO', 'SUBWAY', 'TAXI', 'AUTO', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return Boolean(
                nextLeg &&
                    nextLeg.transitMode === 'SUBWAY' &&
                    ['VEHICLEWILLBEMISSED', 'VEHICLEWASMISSED'].includes(nextLeg.vehicleState),
            );
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const popupType = 'UserWillMissSuburban';
            const popupId = `${params.handlerContext.journeyId}-${nextLeg?.staticInfo.legOrder}-${popupType}-${nextLeg?.vehicleState}`;

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onSkipAndTakeNextPress = () => {
                nextLeg && onPressSkipAndTakeNext(handlerContext, nextLeg.staticInfo.legOrder);
                handleClosePopup(popupId);
            };

            return {
                id: popupId,
                type: popupType,
                props: {
                    userHasMissed: nextLeg?.vehicleState === 'VEHICLEWASMISSED',
                    destination: nextLeg?.staticInfo.destination.stationName || 'Destination Train Station',
                    nextTrainArrivalTime: '',
                    onSkipAndTakeNextPress,
                    onOtherOptionsPress: () => {},
                    onClosePress: () => handleClosePopup(popupId),
                    onTimerEnd: () => {},
                },
            };
        },
    },
    {
        name: 'Popup_BusStatus',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WAITING', 'INVEHICLE'],
        vehicleStates: [
            'VEHICLEISARRIVING',
            'VEHICLEALMOSTARRIVED',
            'VEHICLEARRIVED',
            'RIDECLOSETODESTINATION',
            'ARRIVEDATSTATIONPLATFORM',
        ],
        transitModes: ['BUS'],
        condition: currentLeg => !currentLeg.isFirstLeg,
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, handlerContext } = params;

            const statusForBus = (() => {
                if (currentLeg.userState === 'WAITING') {
                    switch (currentLeg.vehicleState) {
                        case 'VEHICLEISARRIVING':
                            return 'userReachedPickupZone';
                        case 'VEHICLEALMOSTARRIVED':
                            return 'arrivingToPickupZone';
                        case 'VEHICLEARRIVED':
                            return 'busArrivedToPickupZone';
                        default:
                            return 'userReachedPickupZone';
                    }
                } else {
                    switch (currentLeg.vehicleState) {
                        case 'RIDECLOSETODESTINATION':
                            return 'getDownInNextStop';
                        case 'ARRIVEDATSTATIONPLATFORM':
                            return 'arrivedDestination';
                        default:
                            return 'busArrivedToPickupZone';
                    }
                }
            })();
            const popupType = 'BusStatus';
            const popupId = `${params.handlerContext.journeyId}-${currentLeg.staticInfo.legOrder}-${popupType}-${statusForBus}`;
            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onShowTicketPress = () => {
                showTicket(handlerContext);
                handleClosePopup(popupId);
            };

            const onSecondaryOptionButtonPress = () => {
                onPressSkipAndTakeNext(handlerContext, currentLeg.staticInfo.legOrder);
                handleClosePopup(popupId);
            };

            const onTrackVehiclePress = () => {
                navigateToLiveJourneyDetail(handlerContext);
                handleClosePopup(popupId);
            };

            const nextBusesList = params.currentLeg.staticInfo.alternateRoutesNames || [];

            return {
                id: popupId,
                type: popupType,
                props: {
                    journeyId: params.handlerContext.journeyId,
                    status: statusForBus,
                    busNumber: currentLeg.vehicleIdentifier || 'Bus',
                    arrivalTime: (
                        Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) || ' few mins '
                    ).toString(),
                    nextBuses: nextBusesList,
                    destinationStop: currentLeg.staticInfo.destination.stationName || 'Destination Bus Stop',
                    originStop: currentLeg.staticInfo.origin.stationName || 'Origin Bus Stop',
                    originTime: (
                        Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) || ' few mins '
                    ).toString(),
                    destinationTime: (currentLeg.realTimeInfo.destinationStopETAInMinutes || ' few mins ').toString(),
                    numberOfStopsAwayFromPickupZone: currentLeg.realTimeInfo.remainingStops ?? 0,
                    onShowTicketPress,
                    onSecondaryOptionButtonPress,
                    onClosePress: () => handleClosePopup(popupId),
                    onCheckInPress: () => {},
                    onTrackVehiclePress,
                    previousStationName: currentLeg.staticInfo.preDestination.name || 'Previous Station',
                },
            };
        },
    },
    {
        name: 'Popup_MetroStatus',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WAITING', 'INVEHICLE'],
        vehicleStates: [
            'VEHICLEISARRIVING',
            'VEHICLEALMOSTARRIVED',
            'VEHICLEARRIVED',
            'RIDECLOSETODESTINATION',
            'ARRIVEDATSTATIONPLATFORM',
        ],
        transitModes: ['METRO'],
        condition: undefined,
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, handlerContext } = params;

            const statusForMetro = (() => {
                if (currentLeg.userState === 'WAITING') {
                    switch (currentLeg.vehicleState) {
                        case 'VEHICLEISARRIVING':
                            return 'userReachedPickupZone';
                        case 'VEHICLEALMOSTARRIVED':
                            return 'arrivingToPickupZone';
                        case 'VEHICLEARRIVED':
                            return 'metroArrivedToPickupZone';
                        default:
                            return 'userReachedPickupZone';
                    }
                } else {
                    switch (currentLeg.vehicleState) {
                        case 'RIDECLOSETODESTINATION':
                            return 'getDownInNextStop';
                        case 'ARRIVEDATSTATIONPLATFORM':
                            return 'arrivedDestination';
                        default:
                            return 'metroArrivedToPickupZone';
                    }
                }
            })();
            const popupId = `${params.handlerContext.journeyId}-${currentLeg.staticInfo.legOrder}-MetroStatus-${statusForMetro}`;
            const popupType = 'MetroStatus';

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onShowTicketPress = () => {
                showTicket(handlerContext);
                handleClosePopup(popupId);
            };

            const onSecondaryOptionButtonPress = () => {
                onPressSkipAndTakeNext(handlerContext, currentLeg.staticInfo.legOrder);
                handleClosePopup(popupId);
            };

            const onTrackVehiclePress = () => {
                navigateToLiveJourneyDetail(handlerContext);
                handleClosePopup(popupId);
            };

            return {
                id: `${params.handlerContext.journeyId}-${currentLeg.staticInfo.legOrder}-MetroStatus-${statusForMetro}`,
                type: 'MetroStatus',
                props: {
                    journeyId: params.handlerContext.journeyId,
                    status: statusForMetro,
                    originStop: currentLeg.staticInfo.origin.stationName || 'Origin Metro Station',
                    destinationStop: currentLeg.staticInfo.destination.stationName || 'Destination Metro Station',
                    originTime: (
                        Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) || ' few mins '
                    ).toString(),
                    destinationTime: (currentLeg.realTimeInfo.destinationStopETAInMinutes || ' few mins ').toString(),
                    nextTransitArrivalTime: currentLeg.realTimeInfo.upcomingVehicleArrivals[1] ?? null,
                    trainNumber: currentLeg.vehicleIdentifier || '',
                    numberOfStopsAwayFromPickupZone: currentLeg.realTimeInfo.remainingStops ?? 0,
                    onShowTicketPress,
                    onSecondaryOptionButtonPress,
                    onClosePress: () => handleClosePopup(popupId),
                    onTrackVehiclePress,
                    previousStationName: currentLeg.staticInfo.preDestination.name || 'Previous Station',
                },
            };
        },
    },
    {
        name: 'Popup_SuburbanStatus',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WAITING', 'INVEHICLE'],
        vehicleStates: [
            'VEHICLEISARRIVING',
            'VEHICLEALMOSTARRIVED',
            'VEHICLEARRIVED',
            'RIDECLOSETODESTINATION',
            'ARRIVEDATSTATIONPLATFORM',
        ],
        transitModes: ['SUBWAY'],
        condition: undefined,
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, handlerContext } = params;

            const statusForSuburban = (() => {
                if (currentLeg.userState === 'WAITING') {
                    switch (currentLeg.vehicleState) {
                        case 'VEHICLEISARRIVING':
                            return 'userReachedPickupZone';
                        case 'VEHICLEALMOSTARRIVED':
                            return 'arrivingToPickupZone';
                        case 'VEHICLEARRIVED':
                            return 'trainArrivedToPickupZone';
                        default:
                            return 'userReachedPickupZone';
                    }
                } else {
                    switch (currentLeg.vehicleState) {
                        case 'RIDECLOSETODESTINATION':
                            return 'getDownInNextStop';
                        case 'ARRIVEDATSTATIONPLATFORM':
                            return 'arrivedDestination';
                        default:
                            return 'trainArrivedToPickupZone';
                    }
                }
            })();
            const popupId = `${params.handlerContext.journeyId}-${currentLeg.staticInfo.legOrder}-SuburbanStatus-${statusForSuburban}`;
            const popupType = 'SuburbanStatus';

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onShowTicketPress = () => {
                showTicket(handlerContext);
                handleClosePopup(popupId);
            };

            const onSecondaryOptionButtonPress = () => {
                onPressSkipAndTakeNext(handlerContext, currentLeg.staticInfo.legOrder);
                handleClosePopup(popupId);
            };

            const onTrackVehiclePress = () => {
                navigateToLiveJourneyDetail(handlerContext);
                handleClosePopup(popupId);
            };

            const nextLeg = getNextLegOrder(params.allLegs, currentLeg.staticInfo.legOrder);
            return {
                id: popupId,
                type: popupType,
                props: {
                    journeyId: params.handlerContext.journeyId,
                    status: statusForSuburban,
                    destinationStop: currentLeg.staticInfo.destination.stationName || 'Destination Train Station',
                    originStop: currentLeg.staticInfo.origin.stationName || 'Origin Train Station',
                    originTime: (
                        Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) || ' few mins '
                    ).toString(),
                    destinationTime: (currentLeg.realTimeInfo.destinationStopETAInMinutes || ' few mins ').toString(),
                    destinationArrivedWalkTime:
                        nextLeg?.transitMode === 'WALK' ? nextLeg?.durationInMinutes.toString() : null,
                    nextTransitArrivalTime: currentLeg.realTimeInfo.upcomingVehicleArrivals[1] ?? null,
                    destinationArrivedWalkInstruction: `Walk to ${nextLeg?.staticInfo.destination.stationName || 'Destination'}`,
                    trainNumber: currentLeg.vehicleIdentifier || '',
                    numberOfStopsAwayFromPickupZone: currentLeg.realTimeInfo.remainingStops ?? 0,
                    onShowTicketPress,
                    onSecondaryOptionButtonPress,
                    onClosePress: () => handleClosePopup(popupId),
                    onTrackVehiclePress,
                    previousStationName: currentLeg.staticInfo.preDestination.name || 'Previous Station',
                },
            };
        },
    },
    {
        name: 'Popup_AutoAndCabStatusCompleted',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'WAITING', 'INVEHICLE', 'FARAWAY', 'NONE'],
        vehicleStates: undefined,
        transitModes: ['TAXI', 'AUTO', 'WALK', 'BUS', 'METRO', 'SUBWAY', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const isCompletedTaxiLeg = (leg: ProcessedLegInfo) => {
                return (
                    leg.staticInfo.bookingId != undefined &&
                    checkTaxiLeg(leg.transitMode) &&
                    leg.vehicleState === 'RIDEREACHEDDESTINATION'
                );
            };
            const previousLeg = getPreviousLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return isCompletedTaxiLeg(currentLeg) || Boolean(previousLeg && isCompletedTaxiLeg(previousLeg));
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const previousLeg = getPreviousLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            const taxiLeg = checkTaxiLeg(currentLeg.transitMode) ? currentLeg : previousLeg;

            const taxiStatus = 'ride-complete';
            const popupType = 'AutoAndCabStatus';
            const popupId = `${params.handlerContext.journeyId}-${taxiLeg?.staticInfo.legOrder}-${taxiStatus}-${popupType}`;

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onRateThisRidePress = () => {
                navigateToRateRide(handlerContext, taxiLeg);
                handleClosePopup(popupId);
            };

            return {
                id: popupId,
                type: popupType,
                props: {
                    mode: mapTransitModeToAutoCab(taxiLeg?.transitMode) ?? 'cab',
                    status: taxiStatus,
                    onRateThisRidePress,
                    onGoToNextTransitPress: () => handleClosePopup(popupId),
                    onClosePress: () => handleClosePopup(popupId),
                    fare: taxiLeg?.staticInfo.fare?.amount ? Math.round(taxiLeg.staticInfo.fare.amount) : undefined,
                    vehicleIconUrl: taxiLeg?.vehicleIconUrl,
                },
            };
        },
    },
    {
        name: 'Popup_AutoAndCabStatus',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'WAITING', 'INVEHICLE', 'FARAWAY', 'NONE'],
        vehicleStates: undefined,
        transitModes: ['TAXI', 'AUTO', 'WALK', 'BUS', 'METRO', 'SUBWAY', 'BIKE'],
        condition: (currentLeg, allLegs) => {
            const isBeforeStartTaxiLeg = (leg: ProcessedLegInfo) => {
                return (
                    checkTaxiLeg(leg.transitMode) &&
                    ['VEHICLEARRIVED', 'VEHICLEISARRIVING', 'VEHICLEALMOSTARRIVED'].includes(leg.vehicleState)
                );
            };
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            return isBeforeStartTaxiLeg(currentLeg) || Boolean(nextLeg && isBeforeStartTaxiLeg(nextLeg));
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, allLegs, handlerContext } = params;
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);

            const taxiLeg = checkTaxiLeg(currentLeg.transitMode) ? currentLeg : nextLeg;

            const popupType = 'AutoAndCabStatus';
            const taxiStatus = taxiLeg?.vehicleState === 'VEHICLEARRIVED' ? 'driver-arrived' : 'driver-assigned';

            const popupId = `${params.handlerContext.journeyId}-${taxiLeg?.staticInfo.legOrder}-${taxiStatus}-AutoAndCabStatus`;

            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onTripDetailsPress = () => {
                if (taxiLeg?.taxiBookingId) {
                    navigateToRideTracking(handlerContext, taxiLeg);
                }
                handleClosePopup(popupId);
            };

            return {
                id: popupId,
                type: 'AutoAndCabStatus',
                props: {
                    mode: mapTransitModeToAutoCab(taxiLeg?.transitMode) ?? 'cab',
                    status: taxiStatus,
                    otpValue: taxiLeg?.staticInfo.otp,
                    vehicleNumber: taxiLeg?.vehicleIdentifier ?? undefined,
                    onTripDetailsPress,
                    onClosePress: () => handleClosePopup(popupId),
                    vehicleIconUrl: taxiLeg?.vehicleIconUrl,
                },
            };
        },
    },
    {
        name: 'Popup_StartJourney',
        screenType: ['LiveJourneyOverview'],
        userStates: ['WALK', 'WAITING', 'INVEHICLE', 'FARAWAY', 'NONE'],
        vehicleStates: undefined,
        transitModes: ['BUS', 'METRO', 'SUBWAY', 'AUTO', 'TAXI', 'WALK', 'BIKE'],
        condition: (_currentLeg, allLegs) => {
            // Show only for the very first public-transport leg in a journey
            // const legOrder = getOrder(currentLeg.staticInfo.legOrder);
            // const legSuborder = getSubOrder(currentLeg.staticInfo.legOrder);
            const firstCondition = false; //legOrder === 0 && (legSuborder ? legSuborder === 1 : true);

            // Do not show popup for Track Without Booking
            const secondCondition = allLegs.some(
                leg =>
                    ['METRO', 'BUS', 'SUBWAY'].includes(leg.transitMode) && isBookingStatusConfirmed(leg.bookingStatus),
            );

            return firstCondition && secondCondition;
        },
        handler: (params: RuleHandlerParams): PopupRuleOutput => {
            const { currentLeg, handlerContext } = params;

            const popupId = `${params.handlerContext.journeyId}-${currentLeg.staticInfo.legOrder}-StartJourney`;
            const popupType = 'StartJourney';
            const handleClosePopup = (popupId: string) => {
                PopupDismissalTracker.dismiss(popupId);
                handlerContext.dismissPopup?.(popupType);
            };

            const onPressBookRide = () => {
                if (currentLeg.staticInfo.selectedQuoteId) {
                    handlerContext.actions.selectPricingId(
                        currentLeg.staticInfo.legOrder,
                        currentLeg.staticInfo.selectedQuoteId,
                    );
                    navigateToLookingForRides(
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
                handleClosePopup(popupId);
            };

            const onShowTicketPress = () => {
                showTicket(handlerContext);
                handleClosePopup(popupId);
            };

            return {
                id: popupId,
                type: popupType,
                props: {
                    journeyId: params.handlerContext.journeyId,
                    transportType: currentLeg.transitMode.toLowerCase(),
                    arrivalTime: (
                        Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0) || ' few mins '
                    ).toString(),
                    onClosePress: () => handleClosePopup(popupId),
                    onPressBookRide,
                    onShowTicketPress,
                },
            };
        },
    },
];
