import { useEffect, useMemo } from 'react';
import { JourneyPaymentUI } from './UI';
import { JourneyPaymentFlowProps } from './Types';
import { useJourneyInfoPolling } from '../../hooks/useJourneyInfoPolling';
import { canBookLeg } from '@/typescript/utils/LegStatusUtils';
import { isUndefined } from 'lodash';
import { useJourneyPayment } from './hooks/useJourneyPayment';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setSearchedServiceTier } from '../../screens/BusOtpFlow/busOtp';

export const JourneyPaymentFlow = (props: JourneyPaymentFlowProps) => {
    const {
        currentJourney,
        setLoadingDataForLeg,
        currentLocation,
        source,
        destination,
        publicTransportSearch,
        searchId,
        isSingleMode,
        otp,
        isJourneyConfirmed,
        loadingDataForLeg,
        setIsJourneyConfirmed,
        navigation,
        onMoreOptions,
        loadingTrainViaPoints,
        isViaModalShown,
        legRideOptionsPopup,
        setIsTicketModalOpen,
        utsError,
        suggestedBusData,
    } = props;

    const dispatch = useAppDispatch();

    // Journey logic
    const { journeyInfoData, initiateJourneySearch } = useJourneyInfoPolling({
        currentJourney,
        setLoadingDataForLeg,
        currentLocation,
        source,
        destination,
        publicTransportSearch,
        searchId,
        isSingleMode,
        otp,
        onNoJourneysFound: undefined,
        suggestedBusData,
    });

    const correctedJourneyInfoData = useMemo(() => {
        if (!journeyInfoData?.legs) {
            return journeyInfoData;
        }

        return {
            ...journeyInfoData,
        };
    }, [journeyInfoData]);

    const fetchingLegsFare = useMemo(
        () =>
            correctedJourneyInfoData?.legs?.some(
                item => canBookLeg(item) && item.bookingAllowed && isUndefined(item.pricingId),
            ) || false,
        [correctedJourneyInfoData],
    );

    useEffect(() => {
        if (correctedJourneyInfoData) {
            setLoadingDataForLeg(null);
        }
    }, [correctedJourneyInfoData]);

    const journeyId = useMemo(() => correctedJourneyInfoData?.journeyId, [correctedJourneyInfoData]);

    // Memoized values for dependencies
    const originStopCode = useMemo(
        () => publicTransportSearch?.originStop?.code,
        [publicTransportSearch?.originStop?.code],
    );
    const destinationStopCode = useMemo(
        () => publicTransportSearch?.destinationStop?.code,
        [publicTransportSearch?.destinationStop?.code],
    );
    const sourceId = useMemo(
        () => source?.placeId || source?.lat + ',' + source?.lng,
        [source?.placeId, source?.lat, source?.lng],
    );
    const destinationId = useMemo(
        () => destination?.placeId || destination?.lat + ',' + destination?.lng,
        [destination?.placeId, destination?.lat, destination?.lng],
    );

    useEffect(() => {
        if (journeyId) {
            setIsJourneyConfirmed(false);
        }
    }, [journeyId]);

    useEffect(() => {
        if (correctedJourneyInfoData?.legs) {
            const firstBusLeg = correctedJourneyInfoData.legs.find(leg => leg.travelMode === 'Bus');
            if (firstBusLeg && firstBusLeg.legExtraInfo.TAG === 'Bus' && '_0' in firstBusLeg.legExtraInfo) {
                const busExtraInfo = firstBusLeg.legExtraInfo._0;

                if (!isUndefined(otp) && busExtraInfo.selectedServiceTier?.serviceTierType) {
                    dispatch(
                        setSearchedServiceTier({
                            otp: otp,
                            payload: { serviceTierInfo: busExtraInfo.selectedServiceTier },
                        }),
                    );
                }
            }
        }
    }, [correctedJourneyInfoData]);

    // Trigger journey search when source, destination, or publicTransportSearch changes
    useEffect(() => {
        if (source && destination && publicTransportSearch) {
            initiateJourneySearch();
        }
    }, [sourceId, destinationId, originStopCode, destinationStopCode]);

    const paymentProps = {
        legs: correctedJourneyInfoData?.legs ?? [],
        journeyId: correctedJourneyInfoData?.journeyId,
        offer: journeyInfoData?.offer,
        fetchingLegsFare,
        isJourneyConfirmed,
        loadingDataForLeg,
        handledQuoteExpiry: initiateJourneySearch,
        setIsJourneyConfirmed,
        navigation,
        onMoreOptions,
        isSingleMode,
    };

    // Use the journey payment hook to get payment state
    const paymentState = useJourneyPayment(paymentProps);

    const uiProps = {
        ...paymentProps,
        ...paymentState,
        fetchingLegsFare: fetchingLegsFare || paymentState.totalPayableFare == 0,
        loadingTrainViaPoints,
        isViaModalShown,
        legRideOptionsPopup,
        setIsTicketModalOpen,
        utsError,
        alwaysShowPaymentFooter: true,
        isJourneyInfoModalVisible: false,
        setIsJourneyInfoModalVisible: undefined,
        onGoBack: () => {},
    };

    return <JourneyPaymentUI {...uiProps} />;
};
