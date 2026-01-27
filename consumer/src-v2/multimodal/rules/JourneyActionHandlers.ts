import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { type MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { type AppDispatch } from '@/typescript/state/store';
import {
    createJourneyId,
    type JourneyId,
    setSearchId,
    setBookingId,
    createBookingId,
} from '@/typescript/state/client/user';
import { BottomSheetStage, setBottomSheetStage } from '@/typescript/state/client/session';
import { type useLazySearchResultsQuery } from '@/typescript/state/server/searchApi';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { handleEditDestinationFunc, JourneyActions } from '../hooks/useJourneyActions';
import { ProcessedLegInfo } from '../types/journeyTracking';
import { getOrder, getSubOrder, isLegOrderGreaterThan, isLegOrderLessThan } from '../utils/journeyTrackingUtils';
import { identifyTrain, identifyTrainFromStation } from './strategies/common';
import { removeConfirmedBoardingTimeFromCache, setConfirmedBoardingDataInCache } from '../utils/cache';
import { LiveJourneyPopupType } from '../screens/LiveJourneyDetail/LiveJourneyPopupManager';
import { LocationWithTimestamp } from '../hooks/useRiderLocation';
import { LegUpdateType } from '../screens/NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import { type latLong, Stop } from '../types/journeyTracking';
import { isUndefined } from 'lodash';
import { predictCurrentLegByInaccurateLocation } from '../utils/locationUtils';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { flowStatusApi } from '@/typescript/state/server/flowStatusApi';
import { BusOtpActivateFlowProps } from '../screens/BusOtpFlow/Types';
import { strings } from 'config-types';
import { checkTaxiLeg } from '@/typescript/utils/common';

const JOURNEY_HANDLER_LOGGING_ENABLED = false;

const logJourneyHandler = (
    functionName: string,
    _action: string | undefined = undefined,
    _data: unknown | undefined = undefined,
) => {
    if (!JOURNEY_HANDLER_LOGGING_ENABLED) return;

    const timestamp = new Date().toISOString();

    // Note -- Uncomment below lines get the data as well -
    // const logData = data ? JSON.stringify(data, null, 2) : '';
    // console.log(`[JourneyHandler] ${timestamp} - ${functionName}: ${action}${logData ? `\nData: ${logData}` : ''}`);
    console.info(`[JourneyHandler] ${timestamp} - ${functionName}`);
};

// Define a context object for handlers
export interface HandlerContext {
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    dispatch: AppDispatch;
    journeyId: JourneyId;
    userId: string | null;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null> | undefined;
    liveJourneyMetroConfirmLocationBottomSheetRef: React.RefObject<BottomSheetModal | null> | undefined;
    liveJourneyTransitCheckInModalRef: React.RefObject<BottomSheetModal | null> | null;
    liveJourneyListBottomSheetRef: React.RefObject<BottomSheetModal | null> | null;
    liveJourneyListDetailBottomSheetRef: React.RefObject<BottomSheetModal | null> | null;
    liveJourneyUpdateTransitBottomSheetRef: React.RefObject<BottomSheetModal | null> | null;
    switchToAutoConfirmationModalRef: BottomSheetModal | null;
    triggerSearchResultsQuery?: ReturnType<typeof useLazySearchResultsQuery>[0];
    actions: JourneyActions;
    currentLeg: ProcessedLegInfo | undefined;
    ticketUIRef: BottomSheetModal | null;
    timeTableRef: React.RefObject<BottomSheetModal | null> | null;
    dismissPopup: ((popupType: LiveJourneyPopupType) => void) | undefined;
    rideDistance: number | undefined;
    // Add other shared context as needed
    otpModalRef: React.RefObject<BottomSheetModal | null> | undefined;
    userLanguageStrings: strings;
    showDetailedTransitTrackingForLeg: ((leg: ProcessedLegInfo) => void) | undefined;
    showTimeTableForLeg: ((leg: ProcessedLegInfo) => void) | undefined;
    allLegs: ProcessedLegInfo[] | undefined;
}

export const navigateToOverviewScreen = (context: HandlerContext) => {
    if (!context.journeyId || !context.currentLeg?.currentLeg) {
        return;
    }

    if (context.navigation.canGoBack()) {
        console.info('[JourneyHandler] can go back to journey overview screen');
        context.navigation.goBack();
    } else {
        console.info('[JourneyHandler] cannot go back to journey overview screen, replacing with mainTabNavigation');
        context.navigation.popTo('mainTabNavigation', {
            screen: 'liveTab_homeScreen',
            params: {
                journeyId: null,
                multimodalProps: {
                    journeyId: createJourneyId(context.journeyId),
                    isLastMile: false,
                    currentLegOrder: context.currentLeg?.currentLeg,
                    previousLegOrderTravelMode: context.currentLeg?.previousTravelMode,
                    previousLegOrderTravelModeStatusConfirmed: context.currentLeg?.previousTravelModeStatusConfirmed,
                },
            },
        });
    }
};

export const showSafetyFeatures = (context: HandlerContext) => {
    if (!context.currentLeg?.staticInfo.bookingId) {
        return;
    }
    logJourneyHandler('showSafetyFeatures', 'Safety features requested', {
        journeyId: context.journeyId,
        userId: context.userId,
    });
    // TODO: Implement safety features
    console.info('Safety features pressed for journey:', context.journeyId);
    context.navigation.navigate('safetyTools', {
        bookingId: createBookingId(context.currentLeg?.staticInfo.bookingId),
        isRideEnded: false,
    });
};

export const showCallDriverBottomsheet = (context: HandlerContext) => {
    logJourneyHandler('showCallDriverBottomsheet', 'Attempting to show call driver bottomsheet', {
        hasModalRef: !!context.callDriverBottomsheetModalRef,
        journeyId: context.journeyId,
    });

    if (!context.callDriverBottomsheetModalRef) {
        logJourneyHandler('showCallDriverBottomsheet', 'Early return - missing callDriverBottomsheetModalRef');
        return;
    }

    context.callDriverBottomsheetModalRef.current?.present();
    logJourneyHandler('showCallDriverBottomsheet', 'Call driver bottomsheet presented successfully');
};

export const navigateToTicketScreen = (context: HandlerContext) => {
    logJourneyHandler('navigateToTicketScreen', 'Starting navigation to ticket screen', {
        journeyId: context.journeyId,
        userId: context.userId,
    });

    if (!context.journeyId) {
        logJourneyHandler('navigateToTicketScreen', 'Early return - missing journeyId');
        return;
    }

    const navigationParams = {
        screen: 'ticketsTab_homeScreen' as const,
    };

    logJourneyHandler('navigateToTicketScreen', 'Navigating to TicketsTab', navigationParams);
    context.navigation.popTo('mainTabNavigation', { screen: 'ticketsTab_homeScreen' });
    logJourneyHandler('navigateToTicketScreen', 'Navigation completed successfully');
};

export const navigateToPassesScreen = (context: HandlerContext) => {
    logJourneyHandler('navigateToPassesScreen', 'Starting navigation to passes screen', {
        journeyId: context.journeyId,
        userId: context.userId,
    });

    const navigationParams = {
        screen: 'PassesTab_homeScreen' as const,
    };
    logJourneyHandler('navigateToPassesScreen', 'Navigating to PassesTab', navigationParams);
    context.navigation.popTo('mainTabNavigation', { screen: 'passesTab_homeScreen' });
    logJourneyHandler('navigateToPassesScreen', 'Navigation completed successfully');
};

export const navigateToLiveJourneyDetail = (context: HandlerContext) => {
    if (!context.journeyId) {
        return;
    }
    context.navigation.navigate('LiveTab', {
        screen: 'liveJourneyDetail',
        params: { journeyId: null, multimodalProps: undefined },
    });
};

export const navigateToChooseRide = (context: HandlerContext, searchId: string) => {
    if (!context.journeyId) {
        return;
    }
    context.dispatch(setSearchId({ id: context.userId, payload: searchId }));
    navigateToLiveJourneyDetail(context);
};

export const navigateToLookingForRides = (context: HandlerContext, searchId: string, legOrder: string) => {
    if (!context.userId || !context.triggerSearchResultsQuery) {
        return;
    }

    context.dispatch(setSearchId({ id: context.userId, payload: searchId }));

    context.triggerSearchResultsQuery({ searchId: searchId }).finally(() => {
        if (context.journeyId) {
            context.dispatch(setBottomSheetStage({ src: 'overview', stage: BottomSheetStage.LookingForRides }));
            const previousLegOrderTravelMode = context.currentLeg?.previousTravelMode;
            const previousLegOrderTravelModeStatusConfirmed = context.currentLeg?.previousTravelModeStatusConfirmed;
            const multimodalProps = {
                journeyId: createJourneyId(context.journeyId),
                isLastMile: false,
                currentLegOrder: legOrder,
                previousLegOrderTravelMode: previousLegOrderTravelMode,
                previousLegOrderTravelModeStatusConfirmed: previousLegOrderTravelModeStatusConfirmed,
            };

            context.navigation.popTo('mainTabNavigation', {
                screen: 'homeTab_homeScreen',
                params: {
                    multimodalProps: multimodalProps,
                    journeyDetailsProps: undefined,
                },
            });
        }
    });
};

export const navigateToRideTracking = (context: HandlerContext, taxiLeg: ProcessedLegInfo | undefined) => {
    if (!context.userId || !context.journeyId || !taxiLeg || !taxiLeg.taxiBookingId) {
        return;
    }

    const bookingId = createBookingId(taxiLeg.taxiBookingId);

    context.dispatch(
        setBookingId({
            id: context.userId,
            payload: bookingId,
        }),
    );

    context.navigation.navigate('LiveTab', {
        screen: 'taxiRideTracking',
        params: {
            bookingId: bookingId,
            multimodalProps: {
                journeyId: context.journeyId,
                isLastMile: taxiLeg.isLastLeg,
                currentLegOrder: taxiLeg.staticInfo.legOrder,
                previousLegOrderTravelMode: taxiLeg.previousTravelMode,
                previousLegOrderTravelModeStatusConfirmed: taxiLeg.previousTravelModeStatusConfirmed,
            },
        },
    });
};

export const muteJourney = (context: HandlerContext) => {
    logJourneyHandler('muteJourney', 'Muting journey', {
        journeyId: context.journeyId,
        userId: context.userId,
    });
    // TODO: Implement mute journey
    console.info('Mute journey for journey:', context.journeyId);
};

export const completeJourney = async (context: HandlerContext) => {
    logJourneyHandler('completeJourney', 'Starting journey completion', {
        journeyId: context.journeyId,
        userId: context.userId,
    });

    if (!context.journeyId) {
        logJourneyHandler('completeJourney', 'Early return - missing journeyId');
        return;
    }

    try {
        logJourneyHandler('completeJourney', 'Calling actions.completeJourney');
        await context.actions.completeJourney();
        logJourneyHandler('completeJourney', 'Journey completion action completed successfully');
        logEvent(EventName.NAMMA_TRANSIT_RIDE_COMPLETED);

        const isPublicTransportOnly = context.allLegs?.every(
            leg =>
                leg.transitMode === 'BUS' ||
                leg.transitMode === 'METRO' ||
                leg.transitMode === 'SUBWAY' ||
                leg.transitMode === 'WALK',
        );

        if (isPublicTransportOnly) {
            context.dispatch(flowStatusApi.endpoints.skipFeedback.initiate(undefined));
            context.navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
        } else {
            const navigationParams = { journeyId: createJourneyId(context.journeyId), multimodalProps: undefined };
            logJourneyHandler('completeJourney', 'Navigating to multiTransitFeedback', navigationParams);
            context.navigation.popTo('LiveTab', {
                screen: 'multiTransitFeedback',
                params: navigationParams,
            });
            logJourneyHandler('completeJourney', 'Navigation completed successfully');
        }
    } catch (error) {
        logJourneyHandler('completeJourney', 'Error completing journey', { error: error?.toString() });
        throw error;
    }
};

export const navigateToJourneyPlan = (context: HandlerContext) => {
    logJourneyHandler('navigateToJourneyPlan', 'Starting navigation to journey plan', {
        journeyId: context.journeyId,
        userId: context.userId,
    });

    if (!context.journeyId) {
        logJourneyHandler('navigateToJourneyPlan', 'Early return - missing journeyId');
        return;
    }

    const navigationParams = { journeyId: context.journeyId };
    logJourneyHandler('navigateToJourneyPlan', 'Navigating to journeyPlanScreen', navigationParams);
    context.navigation.navigate('LiveTab', {
        screen: 'journeyPlanScreen',
        params: navigationParams,
    });
    logJourneyHandler('navigateToJourneyPlan', 'Navigation completed successfully');
};

export const markLegComplete = async (context: HandlerContext, legOrder: string) => {
    logJourneyHandler('markLegComplete', 'Marking leg as complete', {
        legOrder,
        journeyId: context.journeyId,
        userId: context.userId,
    });

    context.actions.markLegComplete(legOrder);
    logJourneyHandler('markLegComplete', 'Leg marked as complete successfully', { legOrder });
};

export const onDirectRidePress = (
    context: HandlerContext,
    onGoingLeg: ProcessedLegInfo | null,
    journeyLegs: ProcessedLegInfo[],
) => {
    // Find the last leg from the journey
    const lastLeg = journeyLegs[journeyLegs.length - 1] || null;
    // Use handleEditDestinationFunc directly with skipEditLocation=true for direct booking auto-fill destination
    const result = handleEditDestinationFunc(
        onGoingLeg?.currentLeg ? getOrder(onGoingLeg.currentLeg) : null, // legOrder
        onGoingLeg, // onGoingLeg (ProcessedLegInfo)
        lastLeg, // rideOptionsLeg (ProcessedLegInfo)
        context.journeyId || null, // journeyId
        journeyLegs, // journeyLegs (ProcessedLegInfo[])
        onGoingLeg?.riderLocation || null, // currentLocation
        context.navigation, // navigation
        null, // rideOptionsModalRef
        null, // journeyOptionsModalRef
        true, // skipEditLocation = true for direct booking
    );

    return result;
};

export const rebookSkippedLeg = async (context: HandlerContext, leg: ProcessedLegInfo) => {
    if (!context.journeyId || !leg) {
        return;
    }
    await context.actions.rebookSkippedLeg(leg.staticInfo.legOrder, context.journeyId);
};

export const switchBetweenAutoAndWalk = (context: HandlerContext, legToBeSwitched: ProcessedLegInfo) => {
    if (!context.journeyId || !legToBeSwitched || !context.currentLeg) {
        return;
    }

    if (!legToBeSwitched || !checkTaxiLeg(legToBeSwitched.transitMode, true)) {
        return;
    }

    const newMode = checkTaxiLeg(legToBeSwitched.transitMode) ? 'Walk' : 'Taxi';

    context.actions.switchBetweenAutoAndWalk(
        getOrder(legToBeSwitched.staticInfo.legOrder),
        newMode,
        legToBeSwitched.staticInfo.legOrder === context.currentLeg.staticInfo.legOrder
            ? context.currentLeg.riderLocation
            : undefined, // use current location for origin if switch is for current leg else use the origin of the leg
    );
};

export const navigateToTimetable = (context: HandlerContext) => {
    if (!context.timeTableRef) {
        return;
    }

    context.timeTableRef?.current?.present();
};

export const onPressBusOtpScreen = (context: HandlerContext, allLegs: ProcessedLegInfo[]) => {
    if (!context.otpModalRef) {
        return;
    }
    const legOrder =
        context.currentLeg?.staticInfo.travelMode === 'Bus'
            ? context.currentLeg?.staticInfo.legOrder
            : allLegs.find(
                  item =>
                      item.transitMode === 'BUS' &&
                      item.staticInfo.legOrder > (context.currentLeg?.staticInfo.legOrder ?? '0'),
              )?.staticInfo.legOrder;

    const navigationParams: BusOtpActivateFlowProps = {
        legInfo: context.currentLeg,
        journeyId: context.journeyId,
        legOrder: getOrder(legOrder ?? '0'),
        subLegOrder: getSubOrder(legOrder ?? '0') ?? 0,
        autoFillOtp: undefined,
        type: 'Activate',
    };
    context.navigation.navigate('HomeTab', {
        screen: 'busOtpFlow',
        params: {
            state: 'Activate',
            params: navigationParams,
            displaySearchBar: false,
            activePassId: undefined,
            locationData: undefined,
        },
    });
};

export const onPressCheckIn = (context: HandlerContext) => {
    if (!context.liveJourneyTransitCheckInModalRef) {
        return;
    }

    context.liveJourneyTransitCheckInModalRef?.current?.present();
};

export const onCheckInConfirmation = (
    context: HandlerContext,
    checkedInLeg: ProcessedLegInfo,
    checkInStation: Stop | undefined,
    locationHistory: LocationWithTimestamp[] | undefined,
) => {
    if (checkedInLeg && context.journeyId) {
        const confirmedBoardingTime = checkInStation
            ? identifyTrainFromStation(checkInStation.stopCode, checkedInLeg, new Date().getTime())
            : (identifyTrain(checkedInLeg.riderLocation, checkedInLeg, new Date().getTime(), locationHistory) ??
              new Date().getTime());
        setConfirmedBoardingDataInCache(context.journeyId, checkedInLeg.staticInfo.legOrder, {
            confimationTimestamp: confirmedBoardingTime,
            lastCrossedStopCode: checkInStation?.stopCode,
            detectedWithSuperReliableLocation: false,
        });
    }
    context.actions.checkIn(checkedInLeg.staticInfo.legOrder);
};

export const onPressExitStation = (context: HandlerContext, legOrder: string) => {
    context.actions.reachedStation(legOrder);
};

export const onPressSkipAndTakeNext = (context: HandlerContext, legOrder: string) => {
    context.actions.skipCurrentVehicle(legOrder);
};

export const navigateToRateRide = (context: HandlerContext, taxiLeg: ProcessedLegInfo | undefined) => {
    if (!context.journeyId || !taxiLeg || !taxiLeg.staticInfo.bookingId) {
        return;
    }

    const navigationParams = {
        bookingId: createBookingId(taxiLeg.staticInfo.bookingId),
        multimodalProps: {
            journeyId: context.journeyId,
            isLastMile: taxiLeg.isLastLeg,
            currentLegOrder: taxiLeg.staticInfo.legOrder,
            previousLegOrderTravelMode: taxiLeg.previousTravelMode,
            previousLegOrderTravelModeStatusConfirmed: taxiLeg.previousTravelModeStatusConfirmed,
        },
    };

    context.navigation.navigate('HomeTab', {
        screen: 'reviewAndFeedback',
        params: navigationParams,
    });
};

export const goToNextTransit = (context: HandlerContext) => {
    logJourneyHandler('goToNextTransit', 'Going to next transit', {
        journeyId: context.journeyId,
        userId: context.userId,
    });

    if (!context.journeyId) {
        logJourneyHandler('goToNextTransit', 'Early return - missing journeyId');
        return;
    }

    logJourneyHandler('goToNextTransit', 'Calling navigateToOverviewScreen');
    navigateToOverviewScreen(context);
    logJourneyHandler('goToNextTransit', 'Go to next transit completed successfully');
};

export const showTicket = (context: HandlerContext) => {
    context.ticketUIRef?.present();
};

export const onPressStatusBadge = (
    context: HandlerContext,
    allLegs: ProcessedLegInfo[],
    setPredictedLeg: (leg: ProcessedLegInfo | undefined) => void,
    setShouldAutoOpenUpdateTransit: (shouldAutoOpen: boolean) => void,
    fallbackBottomSheetRef: React.RefObject<BottomSheetModal | null>,
) => {
    const currentLocation = context.currentLeg?.riderLocation;

    const predictedLeg = predictCurrentLegByInaccurateLocation(
        currentLocation,
        allLegs,
        context.currentLeg?.staticInfo.legOrder,
    );
    if (predictedLeg) {
        // Set the predicted leg for UpdateTransitBottomSheet to use
        setPredictedLeg(predictedLeg);
        setShouldAutoOpenUpdateTransit(true);
    }
    fallbackBottomSheetRef?.current?.present();
};

export const onLegManualUpdate = (context: HandlerContext, allLegs: ProcessedLegInfo[], legUpdate: LegUpdateType) => {
    const { legOrder, status } = legUpdate;
    const activeLeg = allLegs.find(leg => leg.staticInfo.legOrder === legOrder);
    if (!activeLeg) {
        return;
    }

    // Mark all previous incomplete legs as complete
    const allPreviousIncompleteLegs = allLegs.filter(
        leg => isLegOrderLessThan(leg.staticInfo.legOrder, legOrder) && leg.vehicleState !== 'RIDEREACHEDDESTINATION',
    );
    const allFutureLegs = allLegs.filter(leg => isLegOrderGreaterThan(leg.staticInfo.legOrder, legOrder));
    if (allPreviousIncompleteLegs.length > 0) {
        allPreviousIncompleteLegs.forEach(leg => {
            context.actions.markLegComplete(leg.staticInfo.legOrder);
        });
    }

    if (allFutureLegs.length > 0) {
        allFutureLegs.forEach(leg => {
            if (context.journeyId) {
                removeConfirmedBoardingTimeFromCache(context.journeyId, leg.staticInfo.legOrder);
            }
            context.actions.updateLegStatus(leg.staticInfo.legOrder, 'VEHICLEBOOKINGPENDING');
        });
    }

    const isAutoOrTaxi = checkTaxiLeg(activeLeg.transitMode);
    const isPublicTransport =
        activeLeg.transitMode === 'BUS' || activeLeg.transitMode === 'METRO' || activeLeg.transitMode === 'SUBWAY';
    switch (status) {
        case 'WAITING':
            if (isPublicTransport) {
                context.actions.updateLegStatus(legOrder, 'VEHICLEISARRIVING');
            } else if (activeLeg.transitMode === 'WALK') {
                context.actions.updateLegStatus(legOrder, 'VEHICLEBOOKINGPENDING');
            } else {
                if (isUndefined(activeLeg.taxiBookingId)) {
                    context.actions.updateLegStatus(legOrder, 'VEHICLEBOOKINGPENDING');
                }
            }
            break;
        case 'INVEHICLE':
            if (isAutoOrTaxi) {
                console.error('Cannot check in auto or taxi or walk leg', legOrder);
                return;
            }
            if (isPublicTransport) {
                if (activeLeg.transitMode === 'METRO' || activeLeg.transitMode === 'SUBWAY') {
                    context.liveJourneyMetroConfirmLocationBottomSheetRef?.current?.present();
                } else {
                    context.actions.checkIn(legOrder);
                }
            } else {
                context.actions.updateLegStatus(legOrder, 'VEHICLEBOOKINGPENDING');
            }
            break;
        case 'EXITSTATION':
            context.actions.reachedStation(legOrder);
            break;
        case 'COMPLETED': {
            if (isAutoOrTaxi && !['VEHICLEBOOKINGPENDING', 'RIDESKIPPED'].includes(activeLeg.vehicleState)) {
                console.error(
                    'Cannot mark auto or taxi leg, please either cancel or ask driver to complete the leg',
                    legOrder,
                );
                return;
            }
            if (activeLeg.transitMode === 'METRO' || activeLeg.transitMode === 'SUBWAY') {
                logEvent(EventName.METRO_TICKET_RIDE_COMPLETED);
            }
            context.actions.markLegComplete(legOrder);
            break;
        }
    }
};

export const handleMetroStationConfirm = (
    legOrder: string,
    station: Stop,
    allLegs: ProcessedLegInfo[],
    updateLocationManually: (location: latLong) => void,
    handlerContext: HandlerContext,
) => {
    const selectedLeg = allLegs.find(leg => leg.staticInfo.legOrder === legOrder);
    if (selectedLeg) {
        if (station.lat !== undefined && station.lon !== undefined) {
            updateLocationManually({
                lat: station.lat,
                lon: station.lon,
            });
        }
        onCheckInConfirmation(handlerContext, selectedLeg, station, selectedLeg.riderLocationHistory);
        handlerContext.liveJourneyMetroConfirmLocationBottomSheetRef?.current?.dismiss();
    }
};

export const handleLegUpdate = (
    legToUpdateType: LegUpdateType,
    legToUpdate: ProcessedLegInfo | undefined,
    allLegs: ProcessedLegInfo[],
    updateLocationManually: (location: latLong) => void,
    handlerContext: HandlerContext,
) => {
    if (
        legToUpdateType.status === 'WAITING' ||
        (legToUpdate?.transitMode === 'WALK' && legToUpdateType.status === 'INVEHICLE')
    ) {
        if (legToUpdate?.staticInfo.origin.latLong !== undefined) {
            updateLocationManually(legToUpdate.staticInfo.origin.latLong);
        }
    } else if (
        legToUpdateType.status === 'EXITSTATION' ||
        (legToUpdate?.transitMode === 'WALK' && legToUpdateType.status === 'COMPLETED')
    ) {
        if (legToUpdate?.staticInfo.destination.latLong !== undefined) {
            updateLocationManually(legToUpdate.staticInfo.destination.latLong);
        }
    }
    onLegManualUpdate(handlerContext, allLegs, legToUpdateType);
    handlerContext.liveJourneyUpdateTransitBottomSheetRef?.current?.dismiss();
    handlerContext.liveJourneyListBottomSheetRef?.current?.dismiss();
    handlerContext.liveJourneyListDetailBottomSheetRef?.current?.dismiss();
};
