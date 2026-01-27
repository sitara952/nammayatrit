import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    clearJourneyData,
    selectJourneyLegs,
    selectJourneyWithId,
    selectOnGoingLeg,
    selectMetroTicketCancellationStepForJourney,
    setMetroTicketCancellationStepForJourney,
} from '@/typescript/state/client/journey';
import { JourneyId, createJourneyId } from '@/typescript/state/client/user';
import { multimodalCancelStatusResp } from '@/readOnly/api/types/MultimodalCancelStatusResp.gen';
import { getJourneyLegDestination } from '@/typescript/utils/MultiModal';
import { useMultimodalJourneyIdOrderLegOrderSoftCancelPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSoftCancelPost';
import { useMultimodalJourneyIdOrderLegOrderCancelPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderCancelPost';
import { useMultimodalJourneyIdOrderLegOrderCancelStatusGetQuery } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderCancelStatusGet';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { isEqual, isUndefined } from 'lodash';
import { setLiveJourneyId, selectAppConfig } from '@/typescript/state/client/session';
import { removeJourneyFromMMKV } from './useOfflineTickets';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useMultimodalJourneyIdBookingInfoGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet';
import { isLegOngoing } from '@/typescript/utils/LegStatusUtils';

export type CancellationStep =
    | 'notInitialized'
    | 'initial'
    | 'checking'
    | 'showingCharges'
    | 'cancelling'
    | 'cancelled'
    | 'notCancellable'
    | 'journeyStarted';

interface TicketInfo {
    destination: string;
    date: string;
}

interface MetroLegInfo {
    legOrder: number | null;
    hasStarted: boolean;
}

export interface UseMetroTicketCancellationReturn {
    metroTicketCancellationStep: CancellationStep;
    ticketInfo: TicketInfo;
    metroLegInfo: MetroLegInfo;
    cancelStatusData: multimodalCancelStatusResp | undefined;
    handleSoftCancel: () => void;
    handleFinalCancel: () => void;
    setCancellationStep: (s: CancellationStep) => void;
    resetCancellationStep: () => void;
}

export const useMetroTicketCancellation = (journeyId: string | undefined): UseMetroTicketCancellationReturn => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();

    const dispatch = useAppDispatch();

    const appConfig = useAppSelector(selectAppConfig);

    const [statusPolling, setStatusPolling] = useState(false);
    const [isCancelConfirmed, setIsCancelConfirmed] = useState(false);
    const [softCancelApiCall] = useMultimodalJourneyIdOrderLegOrderSoftCancelPostMutation();
    const [cancelApiCall] = useMultimodalJourneyIdOrderLegOrderCancelPostMutation();

    const validJourneyId: JourneyId | null = journeyId ? createJourneyId(journeyId) : null;
    const legs = useAppSelector(state => (validJourneyId ? selectJourneyLegs(state, validJourneyId) : []));
    const journey = useAppSelector(state => (validJourneyId ? selectJourneyWithId(state, validJourneyId) : null));
    const ongoingLeg = useAppSelector(state => selectOnGoingLeg(state, validJourneyId), isEqual);
    const [getJourneyInfoApiCall] = useMultimodalJourneyIdBookingInfoGetMutation();

    const metroTicketCancellationStep = useAppSelector(state =>
        selectMetroTicketCancellationStepForJourney(state, validJourneyId),
    );

    const setCancellationStep = useCallback(
        (s: CancellationStep) => {
            if (!validJourneyId) return;
            dispatch(setMetroTicketCancellationStepForJourney({ id: validJourneyId, payload: { step: s } }));
        },
        [dispatch, validJourneyId],
    );

    const resetCancellationStep = useCallback(() => {
        setCancellationStep('initial');
    }, [setCancellationStep]);

    const ticketInfo = useMemo<TicketInfo>(() => {
        const metroLegs = legs?.filter(leg => leg.legExtraInfo.TAG === 'Metro') || [];
        const lastMetroLeg = metroLegs[metroLegs.length - 1];
        const destination = lastMetroLeg ? getJourneyLegDestination(lastMetroLeg) : 'your destination';

        const formattedDate = (() => {
            if (journey?.startTime) {
                try {
                    const date = new Date(journey.startTime);
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                } catch {
                    return 'Today';
                }
            }
            return 'Today';
        })();

        return {
            destination: `Metro ticket to ${destination}`,
            date: `Date: ${formattedDate}`,
        };
    }, [legs, journey?.startTime]);

    const metroLegInfo = useMemo<MetroLegInfo>(() => {
        const metroLeg = legs.find(leg => leg.legExtraInfo.TAG === 'Metro') || null;
        if (!metroLeg) {
            return { legOrder: null, hasStarted: false };
        }
        if (ongoingLeg && ongoingLeg.travelMode === 'Taxi') {
            return { legOrder: null, hasStarted: true };
        }
        const ongoingMetroLeg = isLegOngoing(metroLeg);

        if (ongoingMetroLeg) {
            return { legOrder: metroLeg?.order, hasStarted: true };
        }

        return { legOrder: metroLeg?.order, hasStarted: false };
    }, [legs, ongoingLeg]);

    const handleSoftCancel = useCallback(async () => {
        if (!journeyId || isUndefined(metroLegInfo.legOrder) || metroLegInfo.legOrder === null) return;
        if (metroLegInfo.hasStarted) {
            setCancellationStep('journeyStarted');
            return;
        }
        setCancellationStep('checking');
        try {
            await softCancelApiCall({ journeyId, legOrder: metroLegInfo.legOrder }).unwrap();
            setStatusPolling(true);
            setCancellationStep('showingCharges');
        } catch {
            setCancellationStep('initial');
        }
    }, [journeyId, metroLegInfo, softCancelApiCall, setCancellationStep]);

    const handleFinalCancel = useCallback(async () => {
        if (!journeyId || isUndefined(metroLegInfo.legOrder) || metroLegInfo.legOrder === null) return;
        setCancellationStep('cancelling');
        try {
            await cancelApiCall({ journeyId, legOrder: metroLegInfo.legOrder })
                .unwrap()
                .then(() => {
                    removeJourneyFromMMKV(journeyId);
                    setIsCancelConfirmed(true);
                    setStatusPolling(true);
                })
                .catch(error => {
                    console.info('cannot able to cancel journey. error:', error);
                    setCancellationStep('showingCharges');
                });
        } catch {
            setCancellationStep('showingCharges');
        }
    }, [journeyId, metroLegInfo, cancelApiCall, setCancellationStep]);

    const {
        data: cancelStatusData,
        isFetching,
        isLoading,
    } = useMultimodalJourneyIdOrderLegOrderCancelStatusGetQuery(
        {
            journeyId: journeyId || '',
            legOrder: metroLegInfo.legOrder || 0,
        },
        {
            skip: metroLegInfo.legOrder === null || !statusPolling,
            pollingInterval: statusPolling ? 2000 : 0,
        },
    );

    useEffect(() => {
        if (cancelStatusData) {
            if (
                !isCancelConfirmed &&
                cancelStatusData.cancellationCharges !== null &&
                cancelStatusData.refundAmount !== undefined &&
                cancelStatusData.isCancellable === true
            ) {
                setStatusPolling(false);
            }
            if (
                (cancelStatusData.bookingStatus === 'CANCELLED' ||
                    (cancelStatusData.bookingStatus === 'CANCEL_INITIATED' &&
                        metroTicketCancellationStep === 'cancelling')) &&
                isCancelConfirmed
            ) {
                setStatusPolling(false);
                setCancellationStep('cancelled');
                logEvent(EventName.NAMMA_TRANSIT_BOOKING_CANCELLED);
                if (journeyId) {
                    getJourneyInfoApiCall({ journeyId }).then(data => {
                        dispatch(clearJourneyData({ id: createJourneyId(journeyId) }));
                        dispatch(setLiveJourneyId(null));
                        if (data.data) {
                            navigation.navigate('TicketsTab', {
                                screen: 'showTicketScreen',
                                params: {
                                    journey: data.data,
                                    fromCancelledJourney: true,
                                },
                            });
                        }
                    });
                }
            } else if (cancelStatusData.isCancellable === false) {
                setCancellationStep('notCancellable');
            }
        }
    }, [
        cancelStatusData,
        dispatch,
        isCancelConfirmed,
        isFetching,
        isLoading,
        metroTicketCancellationStep,
        journeyId,
        navigation,
    ]);

    useEffect(() => {
        if (metroTicketCancellationStep !== 'initial') return;

        if (metroLegInfo.hasStarted) {
            setCancellationStep('journeyStarted');
        }
    }, [metroLegInfo.hasStarted, metroTicketCancellationStep]);

    if (!appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable) {
        return {
            metroTicketCancellationStep: 'initial',
            ticketInfo: { destination: '', date: '' },
            metroLegInfo: { legOrder: null, hasStarted: false },
            cancelStatusData: undefined,
            handleSoftCancel: () => {},
            handleFinalCancel: () => {},
            setCancellationStep: () => {},
            resetCancellationStep: () => {},
        };
    }

    return {
        metroTicketCancellationStep,
        ticketInfo,
        metroLegInfo,
        cancelStatusData,
        handleSoftCancel,
        handleFinalCancel,
        setCancellationStep,
        resetCancellationStep,
    };
};
