import React, { useCallback, useMemo, useRef } from 'react';
import { JourneyId } from '../../../../src/typescript/state/client/user';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { formatTimeFromSeconds } from '../../../../src-v2/utils/common';
import { journeyInfoResp } from '../../../../src/readOnly/api/types/JourneyInfoResp.gen';
import { getlocationAPIEntitySourceOrDestination } from '../../../../src/typescript/utils/MultiModal';
import { getPlaceArea } from '../../../../src/typescript/utils/placeUtils';
import { useAppSelector, useAppDispatch } from '../../../../src/typescript/state/hooks';
import { MainNavigationParamList } from '../../../../src/typescript/navigation/globalParamList';
import { selectNewFeatureFlags } from '../../../../src/typescript/state/client/session';
import { JourneyCompleteProps } from './types';
import type { TransitSummaryType } from '../JourneyInfoScreen/components/TransitSummaryChennaiOne';
import { JourneyCompleteUI } from './UI';
import {
    buildJourneySegments,
    computeJourneySavings,
    hasUserBoardedTaxi,
    formatNumber,
} from '../JourneyInfoScreen/utils';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { getTicketUIPropsFromJourneyInfoResp } from '../Ticket/Hooks/useTicketUIProps';
import TicketUI from '../Ticket/UI';
import { useMultimodalJourneyIdJourneyFeedbackPostMutation } from '../../../../src/api/integrations/rtk/MultimodalJourneyIdJourneyFeedbackPost';
import {
    useFrontendNotifyEventPostMutation,
    frontendNotifyEventPostWithParams,
} from '../../../../src/api/integrations/rtk/FrontendNotifyEventPost';
import {
    setJourneyFeedBack,
    clearJourneyData,
    selectJourneyFeedBack,
} from '../../../../src/typescript/state/client/journey';
import { clearSession } from '../../../../src/typescript/state/client/session';
import { resetIdsAndPurge } from '../../../../src/typescript/state/sharedReducer';
import { selectToken } from '../../../../src/typescript/state/client/auth';
import { clearAllMapSnapshots } from '../../utils/mapSnapshotUtils';
import { journeyFeedBackForm } from '../../../../src/readOnly/api/types/JourneyFeedBackForm.gen';
import { NativeModules } from 'react-native';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';

type JourneyCompleteFlowProps = {
    journeyId: JourneyId | null;
    journeyResp: journeyInfoResp | undefined;
};

export const JourneyCompleteFlow: React.FC<JourneyCompleteFlowProps> = props => {
    const { journeyId, journeyResp } = props;
    const configManger = useConfigContext();
    const userLanguageStrings = configManger.get('userLanguageStrings');
    const navigation = useNavigation<StackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const { ticketUIRef } = useRefsContext();
    const [submitFeedbackApiCall] = useMultimodalJourneyIdJourneyFeedbackPostMutation();
    const [updateFrontendNotifyEvent] = useFrontendNotifyEventPostMutation();
    const userToken = useAppSelector(selectToken);
    const hasNavigated = useRef<boolean>(false);
    const feedbackPresent = useAppSelector(state => selectJourneyFeedBack(state, journeyId));
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;
    const { getRouteByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const selectedTicketProps = useMemo(
        () =>
            journeyResp
                ? getTicketUIPropsFromJourneyInfoResp(
                      journeyResp,
                      'bottomSheetModal',
                      undefined,
                      undefined,
                      userLanguageStrings,
                      isPassEnabled,
                  )
                : undefined,
        [journeyResp, isPassEnabled],
    );

    const journeySegments = useMemo(() => {
        return buildJourneySegments(journeyResp?.legs, undefined, getRouteByCode, false);
    }, [journeyResp?.legs, getRouteByCode]);

    const includeAutoTaxiSegment = useCallback(
        (segment: TransitSummaryType, singleMode: boolean): boolean => {
            if (segment.type === 'walk') {
                return !singleMode;
            }
            if (segment.type !== 'auto' && segment.type !== 'taxi') {
                return true;
            }
            const leg = journeyResp?.legs?.find(l => l.order === segment.legOrder);
            if (!leg || leg.legExtraInfo.TAG !== 'Taxi') return false;
            const boarded = hasUserBoardedTaxi(leg.legExtraInfo._0?.trackingStatus);
            if (!boarded) return false;
            const hasBooking = leg.legExtraInfo._0?.bookingId != null;
            return hasBooking;
        },
        [journeyResp?.legs],
    );

    const filteredJourneySegments = useMemo(() => {
        if (journeyResp?.isSingleMode !== true) {
            return journeySegments;
        }

        return journeySegments.filter(segment => includeAutoTaxiSegment(segment, true));
    }, [journeySegments, journeyResp, includeAutoTaxiSegment]);

    const transitData = useMemo(() => {
        const segmentsForTransit = journeySegments.filter(segment =>
            includeAutoTaxiSegment(segment, journeyResp?.isSingleMode ?? false),
        );

        const transitTypes = Array.from(
            new Set(
                segmentsForTransit
                    .map(item => item.type)
                    .filter(type => type && type !== 'walk' && type !== 'metroNoleaf'),
            ),
        );

        const firstPublicTransportLeg = segmentsForTransit.find(
            item => item.type === 'metro' || item.type === 'bus' || item.type === 'train',
        )?.type;

        const primaryMode =
            firstPublicTransportLeg === 'metro' ||
            firstPublicTransportLeg === 'bus' ||
            firstPublicTransportLeg === 'train'
                ? firstPublicTransportLeg
                : undefined;

        return { primaryMode, transitTypes };
    }, [journeySegments, journeyResp, includeAutoTaxiSegment]);

    const calculateTaxiLegCost = useCallback(
        (leg: legInfo, isSingleMode: boolean) => {
            const segment = journeySegments.find(s => s.legOrder === leg.order);
            if (!segment) return 0;

            const shouldInclude = includeAutoTaxiSegment(segment, isSingleMode);
            return shouldInclude ? (segment.cost ?? 0) : 0;
        },
        [journeySegments, includeAutoTaxiSegment],
    );

    const journeyCost = useMemo(() => {
        return parseFloat(
            (
                journeyResp?.legs?.reduce((sum, leg) => {
                    const legCost =
                        leg.travelMode === 'Taxi'
                            ? calculateTaxiLegCost(leg, journeyResp?.isSingleMode ?? false)
                            : leg.travelMode === 'Bus' && leg.hasApplicablePasses
                              ? 0
                              : leg.totalFare?.amount || leg.estimatedMinFare?.amount || 0;
                    return sum + legCost;
                }, 0) ?? 0
            ).toFixed(2),
        );
    }, [journeyResp, calculateTaxiLegCost]);

    const { costSaved, timeSaved } = useMemo(() => {
        return computeJourneySavings(journeyResp, journeySegments, journeyCost);
    }, [journeyResp, journeySegments, journeyCost]);

    const journeyTotalTimeInSec = useMemo(() => {
        return journeySegments.reduce((sum, segment) => {
            if (!includeAutoTaxiSegment(segment, journeyResp?.isSingleMode ?? false)) return sum;
            const totalSeconds = segment.time || 0;
            if (totalSeconds < 0) return sum;
            return sum + Math.round(totalSeconds / 60) * 60;
        }, 0);
    }, [journeySegments, journeyResp, includeAutoTaxiSegment]);

    const destination = useMemo(() => {
        if (!journeyResp?.legs || journeyResp.legs.length === 0) return '';
        const lastLeg = journeyResp.legs[journeyResp.legs.length - 1];
        return getPlaceArea(getlocationAPIEntitySourceOrDestination(lastLeg, false));
    }, [journeyResp]);

    const costBreakdown = useMemo(() => {
        const publicTransportCost = formatNumber(
            journeyResp?.legs
                ?.filter(
                    leg =>
                        (leg.travelMode === 'Bus' && !leg.hasApplicablePasses) ||
                        leg.travelMode === 'Metro' ||
                        leg.travelMode === 'Subway',
                )
                .reduce((sum, leg) => sum + formatNumber(leg.totalFare?.amount || 0), 0) ?? 0,
        );

        const visibleAutoTaxiSegments = journeySegments.filter(
            segment =>
                (segment.type === 'auto' || segment.type === 'taxi') &&
                includeAutoTaxiSegment(segment, journeyResp?.isSingleMode ?? false),
        );

        const autoCost = formatNumber(
            visibleAutoTaxiSegments.reduce((sum, leg) => sum + formatNumber(leg.cost || 0), 0),
        );

        return {
            publicTransportCost,
            autoCost,
            tollCharges: 0,
            surgeCharges: 0,
        };
    }, [journeySegments, journeyResp, includeAutoTaxiSegment]);

    const handleGoBack = () => {
        handleSkipToHome();
    };

    const handleShowTicket = () => {
        if (ticketUIRef.current) {
            ticketUIRef.current.present();
        }
    };

    const callClearSession = useCallback(() => {
        dispatch(clearSession());
        resetIdsAndPurge(userToken, null, dispatch);
    }, [dispatch, userToken]);

    const handleSubmitFeedback = async (rating: number, feedback: string) => {
        if (!journeyId) return;

        const feedbackReq: journeyFeedBackForm =
            feedbackPresent == null
                ? {
                      additionalFeedBack: feedback,
                      rateTravelMode:
                          journeyResp?.legs?.map(leg => ({
                              isExperienceGood: rating > 2 && rating < 6,
                              legOrder: leg.order,
                              travelMode: leg.travelMode,
                              rating: rating,
                          })) || [],
                      rating: rating,
                  }
                : feedbackPresent;

        try {
            const resp = await submitFeedbackApiCall({
                journeyId: journeyId,
                body: feedbackReq,
            });
            if (resp.error) return;

            if (rating >= 4) {
                const { AppRatings } = NativeModules;
                AppRatings.callAppRatings();
            }
            dispatch(setJourneyFeedBack({ id: journeyId, payload: feedbackReq }));
            callClearSession();
            clearAllMapSnapshots();
            if (journeyId) {
                dispatch(clearJourneyData({ id: journeyId }));
            }

            if (!hasNavigated.current) {
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                hasNavigated.current = true;
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
        }
    };

    const handleSkipToHome = useCallback(async () => {
        try {
            callClearSession();
            const ratingSkipEventReq: frontendNotifyEventPostWithParams = {
                body: { event: 'RATE_DRIVER_SKIPPED' },
            };

            await updateFrontendNotifyEvent(ratingSkipEventReq).unwrap();
            if (journeyId) {
                dispatch(clearJourneyData({ id: journeyId }));
            }
            if (!hasNavigated.current) {
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                hasNavigated.current = true;
            }
        } catch (err) {
            console.error('Skip to home error:', err);
            if (!hasNavigated.current) {
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                hasNavigated.current = true;
            }
        }
    }, [callClearSession, updateFrontendNotifyEvent, journeyId, dispatch, navigation]);

    const viewState: JourneyCompleteProps = {
        primaryMode: transitData.primaryMode,
        timeSaved: timeSaved,
        costSaved: costSaved,
        journeyModes: transitData.transitTypes,
        destination: destination,
        totalJourneyCost: journeyCost ?? 0,
        journeyLegs: filteredJourneySegments,
        journeyTime: formatTimeFromSeconds(journeyTotalTimeInSec, true, userLanguageStrings),
        publicTransportCost: costBreakdown.publicTransportCost,
        autoCost: costBreakdown.autoCost,
        tollCharges: costBreakdown.tollCharges,
        surgeCharges: costBreakdown.surgeCharges,
        initialRating: 0,
        onGoBack: handleGoBack,
        onShowTicket: handleShowTicket,
        onSubmitFeedback: handleSubmitFeedback,
    };

    return (
        <>
            <JourneyCompleteUI {...viewState} />
            {selectedTicketProps && <TicketUI {...selectedTicketProps} />}
        </>
    );
};
