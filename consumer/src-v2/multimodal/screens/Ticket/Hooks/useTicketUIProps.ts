import { useMemo, useCallback } from 'react';
import { isEqual, isUndefined } from 'lodash';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectJourneyLegs,
    selectJourneyWithId,
    getTicketsFromLegs,
    LegTickets,
} from '@/typescript/state/client/journey';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen'; // Using @ alias

import { RootState } from '@/typescript/state/store'; // Using @ alias
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { createJourneyId, JourneyId } from '@/typescript/state/client/user';
import { JourneyStatus_journeyStatus } from '@/readOnly/api/types/Enums.gen';
import {
    TransitInfoCardProps,
    NewTicketUIProps,
    BaseTransitInfo,
    DirectMetroTransitInfo,
    SwitchMetroTransitInfo,
    DirectSubwayTransitInfo,
    SwitchSubwayTransitInfo,
    BusTransitInfo,
    TicketUIProps,
    RenderType,
} from '../SingleTicket/types';
import { expiryDateAndTime } from './useTicketData';
import { useTimetables } from '@/src-v2/multimodal/hooks/useTimetables';
import {
    createLegOrder,
    formatTime,
    getUserLanguageStringsForMetroLine,
} from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { TimeEntry } from '../../NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { strings } from 'config-types';
import { getRefundAmount, getSubLegOrder, mergeJourneyLegs } from '@/typescript/utils/MultiModal';
import { SuburbanInfoCardProps } from '../SingleTicket/components/SuburbanInfoCard';
import { createSubUrbanData, ticketHeader } from '../TicketUtils/utils';

import {
    mapLegInfoToTransitTypes,
    mapTransitTypesToTransitDetails,
    getRegionalStationName,
    getStationName,
} from '../TicketUtils/utils';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { extractCategories } from '@/src-v2/multimodal/utils/journeyTrackingUtils';

interface DeriveTicketUIPropsArgs {
    journeyLegs: legInfo[];
    journeyId: JourneyId | null;
    legTickets: LegTickets;
    transitTypes: ReturnType<typeof mapLegInfoToTransitTypes>;
    comboTicketText: string | undefined;
    ticketFare: number;
    paymentDetailsData: {
        orderId: string;
        totalAmount: string;
        dateAndTime: Date | undefined;
    };
    unifiedQR: journeyInfoResp['unifiedQRV2'];
    onClose?: () => void;
    onStartJourney?: () => void;
    onPress?: () => void;
    onPressBookAuto?: () => void;
    renderType: RenderType;
    timeTable: TimeEntry[] | undefined;
    // Add journeyStatus parameter
    journeyStatus?: JourneyStatus_journeyStatus | null;
    subUrbanData: SuburbanInfoCardProps | undefined;
    legsInfoFromRedux: legInfo[] | undefined;
    userLanguageStrings: strings;
    passEnabled: boolean;
}

const effectiveTicketLiveHours = (legs: legInfo[]) => {
    const allTicketValidities: string[] = legs.flatMap(transit => {
        const legExtraInfo = transit.legExtraInfo;
        if (
            'TAG' in legExtraInfo &&
            ['Metro', 'Bus', 'Subway'].includes(legExtraInfo.TAG) &&
            'ticketValidity' in legExtraInfo._0 &&
            legExtraInfo._0.ticketValidity
        ) {
            return legExtraInfo._0.ticketValidity;
        }
        return [];
    });

    type TicketValidity = { expiryDate: Date | null; remainingTime: number; original: string };
    const parseTicketValidity = (duration: string): TicketValidity => {
        try {
            const { expiryDate, remainingTime } = expiryDateAndTime(duration);
            return { expiryDate, remainingTime, original: duration };
        } catch {
            return { expiryDate: new Date(0), remainingTime: 0, original: duration };
        }
    };

    const minTicketValidity = allTicketValidities.reduce<TicketValidity>(
        (min, validity) => {
            const parsed = parseTicketValidity(validity);
            if (parsed.expiryDate && parsed.expiryDate.getTime() === 0) return min; // Skip invalid dates
            return !min.expiryDate || (parsed.expiryDate && parsed.expiryDate < min.expiryDate) ? parsed : min;
        },
        { expiryDate: null, remainingTime: 0, original: '' },
    );

    if (minTicketValidity.expiryDate) {
        return minTicketValidity.original;
    }
    return undefined;
};

const _deriveTicketUIProps = ({
    journeyLegs,
    journeyId,
    legTickets,
    transitTypes,
    paymentDetailsData,
    unifiedQR,
    onClose,
    renderType,
    timeTable,
    journeyStatus, // Add this parameter
    subUrbanData,
    legsInfoFromRedux,
    userLanguageStrings,
    passEnabled,
}: DeriveTicketUIPropsArgs): TicketUIProps => {
    const filteredLegs = journeyLegs.filter(
        leg =>
            leg?.travelMode &&
            ['Metro', 'Bus', 'Subway'].includes(leg.travelMode) &&
            (!passEnabled || !leg.hasApplicablePasses),
    );

    const newTicketUIProps: NewTicketUIProps | undefined = (() => {
        if (!filteredLegs || filteredLegs.length !== 1) {
            return undefined;
        }

        const currentTime = Date.now();
        const nextTime = timeTable?.find((entry: TimeEntry) => entry.time > currentTime);

        const singleLeg = filteredLegs.find(
            item => item?.travelMode && ['Metro', 'Bus', 'Subway'].includes(item.travelMode),
        );

        const reduxSingleLeg: legInfo | undefined =
            legsInfoFromRedux && singleLeg?.order ? legsInfoFromRedux[singleLeg?.order] : undefined;
        const legExtra = singleLeg?.legExtraInfo;

        const cancelledTicketRefundStatus = () => {
            if (legExtra?.TAG === 'Metro' && legExtra._0.refund && journeyStatus === 'CANCELLED') {
                switch (legExtra._0.refund.status) {
                    case 'SUCCESS':
                        return 'CANCELLED_PROCESSED_REFUND';
                    case 'MANUAL_REVIEW':
                    case 'PENDING':
                        return 'CANCELLED_PROCESSING_REFUND';
                    case 'FAILURE':
                        return 'CANCELLED_REFUND_FAILED';
                    default:
                        return undefined;
                }
            } else if (legExtra?.TAG === 'Metro' && journeyStatus === 'CANCELLED') {
                return undefined;
            }
            return undefined;
        };

        // TransitInfoCardProps
        const transitInfoCard: TransitInfoCardProps = (() => {
            // Use IIFE to assign const
            // Derive baseTransit properties from the first route info for Metro/Subway, or from busExtra for Bus
            const getLegOriginStop = (leg: legInfo) => {
                if (leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway') {
                    return leg.legExtraInfo._0.routeInfo?.[0]?.originStop;
                } else if (leg.legExtraInfo.TAG === 'Bus') {
                    return leg.legExtraInfo._0.originStop;
                }
                return undefined;
            };

            const getLegDestinationStop = (leg: legInfo) => {
                if (leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway') {
                    const routeInfos = leg.legExtraInfo._0.routeInfo;
                    return routeInfos?.[routeInfos.length - 1]?.destinationStop; // Get destination from the final route
                } else if (leg.legExtraInfo.TAG === 'Bus') {
                    return leg.legExtraInfo._0.destinationStop;
                }
                return undefined;
            };

            const derivedSource = singleLeg ? getStationName(getLegOriginStop(singleLeg)) : '';
            const derivedDestination = singleLeg ? getStationName(getLegDestinationStop(singleLeg)) : '';
            const derivedRegionalSource = singleLeg ? getRegionalStationName(getLegOriginStop(singleLeg)) : '';
            const derivedRegionalDestination = singleLeg
                ? getRegionalStationName(getLegDestinationStop(singleLeg))
                : '';

            const baseTransitProps: BaseTransitInfo = {
                source: derivedSource,
                destination: derivedDestination,
                regionalSourceTitle: derivedRegionalSource,
                regionalDestinationTitle: derivedRegionalDestination,
                nextArrivalTime: nextTime ? formatTime(nextTime?.time) : '',
                validTill: (() => {
                    const metroExtra =
                        legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway' ? legExtra?._0 : undefined;
                    const busExtra = legExtra?.TAG === 'Bus' ? legExtra?._0 : undefined;

                    const ticketValidity = metroExtra?.ticketValidity || busExtra?.ticketValidity;
                    const ticketValidityString = Array.isArray(ticketValidity)
                        ? ticketValidity[0] || ''
                        : ticketValidity || '';

                    return expiryDateAndTime(ticketValidityString).expiryDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                })(),

                transitMessage: userLanguageStrings.BoardModeFrom(
                    getUserLanguageStringsForMode(singleLeg?.travelMode ?? '', userLanguageStrings),
                    derivedSource,
                ), // Placeholder
                transitCost: singleLeg?.totalFare?.amount || 0,
                status: cancelledTicketRefundStatus() || 'ACTIVE',
                refundAmount: getRefundAmount(singleLeg),
            };

            if (legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway') {
                const metroExtra = legExtra?._0;
                const routeInfos = metroExtra.routeInfo;

                if (routeInfos && routeInfos.length > 1) {
                    // SWITCH Metro
                    const firstRoute = routeInfos[0];
                    const secondRoute = routeInfos[1];

                    const switchProps =
                        legExtra?.TAG === 'Subway'
                            ? ({
                                  ...baseTransitProps,
                                  mode: 'SUBWAY',
                                  subwayTransitType: 'SWITCH',
                                  gateNo: undefined,
                                  platformNo: undefined,
                                  sourceMessage: userLanguageStrings.BoardLineTrainFromPlatform(
                                      getUserLanguageStringsForMetroLine(
                                          firstRoute?.lineColor ?? '',
                                          userLanguageStrings,
                                      ) ?? '',
                                      firstRoute?.platformNumber || '',
                                  ),
                                  switchStation: getStationName(firstRoute?.destinationStop),
                                  switchStationRegionalTitle: getRegionalStationName(firstRoute?.destinationStop),
                                  sourceLine: firstRoute?.lineColor || '',
                                  sourceLineColorCode: '#' + firstRoute?.lineColorCode || '',
                                  switchPlatformNo: secondRoute?.platformNumber
                                      ? parseInt(secondRoute?.platformNumber)
                                      : undefined,
                                  destinationMessage: userLanguageStrings.BoardLineTrainFromPlatform(
                                      getUserLanguageStringsForMetroLine(
                                          secondRoute?.lineColor ?? '',
                                          userLanguageStrings,
                                      ) ?? '',
                                      secondRoute?.platformNumber || '',
                                  ),
                                  destinationLine: secondRoute?.lineColor || '',
                                  destinationLineColorCode: '#' + secondRoute?.lineColorCode || '',
                                  transitMetaInfo: 'SWITCH',
                                  transitMetaInfoDisplayName: 'SWITCH',
                                  ticketNumber: legExtra?._0.ticketNo?.at(0),
                              } satisfies SwitchSubwayTransitInfo)
                            : ({
                                  ...baseTransitProps,
                                  mode: 'METRO',
                                  metroTransitType: 'SWITCH',
                                  gateNo: undefined,
                                  platformNo: undefined,
                                  sourceMessage: userLanguageStrings.BoardLineMetroFromPlatform(
                                      getUserLanguageStringsForMetroLine(
                                          firstRoute?.lineColor ?? '',
                                          userLanguageStrings,
                                      ) ?? '',
                                      firstRoute?.platformNumber || '',
                                  ),
                                  switchStation: getStationName(firstRoute?.destinationStop),
                                  switchStationRegionalTitle: getRegionalStationName(firstRoute?.destinationStop),
                                  sourceLine: firstRoute?.lineColor || '',
                                  sourceLineColorCode: '#' + firstRoute?.lineColorCode || '',
                                  switchPlatformNo: secondRoute?.platformNumber
                                      ? parseInt(secondRoute?.platformNumber)
                                      : undefined,
                                  destinationMessage: userLanguageStrings.BoardLineMetroFromPlatform(
                                      getUserLanguageStringsForMetroLine(
                                          secondRoute?.lineColor ?? '',
                                          userLanguageStrings,
                                      ) ?? '',
                                      secondRoute?.platformNumber || '',
                                  ),
                                  destinationLine: secondRoute?.lineColor || '',
                                  destinationLineColorCode: '#' + secondRoute?.lineColorCode || '',
                                  transitMetaInfo: 'SWITCH',
                                  transitMetaInfoDisplayName: 'SWITCH',
                                  ticketNumber: legExtra?._0.ticketNo?.at(0),
                                  legInfo: singleLeg,
                              } satisfies SwitchMetroTransitInfo);
                    return switchProps;
                } else {
                    const directProps =
                        legExtra?.TAG === 'Subway'
                            ? ({
                                  ...baseTransitProps,
                                  mode: 'SUBWAY',
                                  subwayTransitType: 'DIRECT',
                                  gateNo: undefined,
                                  platformNo: routeInfos?.[0]?.platformNumber
                                      ? parseInt(routeInfos[0].platformNumber)
                                      : undefined,
                                  transitMessage: userLanguageStrings.BoardModeFrom(
                                      userLanguageStrings.Train,
                                      derivedSource,
                                  ),
                                  transitMetaInfo: 'DIRECT',
                                  transitMetaInfoDisplayName: 'DIRECT',
                                  ticketNumber: legExtra?._0.ticketNo?.at(0),
                              } satisfies DirectSubwayTransitInfo)
                            : ({
                                  ...baseTransitProps,
                                  mode: 'METRO',
                                  metroTransitType: 'DIRECT',
                                  gateNo: undefined,
                                  platformNo: routeInfos?.[0]?.platformNumber
                                      ? parseInt(routeInfos[0].platformNumber)
                                      : undefined, // Set platformNo for direct
                                  transitMessage: userLanguageStrings.BoardModeFrom(
                                      getUserLanguageStringsForMode(singleLeg?.travelMode ?? '', userLanguageStrings),
                                      derivedSource,
                                  ), // Re-use or refine message
                                  transitMetaInfo: 'DIRECT', // transitMetaInfo is part of BaseMetroTransitInfo
                                  transitMetaInfoDisplayName: 'DIRECT',
                                  ticketNumber: legExtra?._0.ticketNo?.at(0),
                                  legInfo: singleLeg,
                              } satisfies DirectMetroTransitInfo);
                    return directProps;
                }
            } else if (legExtra?.TAG === 'Bus') {
                const busExtra = legExtra?._0;
                const reduxBusExtraFleet =
                    reduxSingleLeg && reduxSingleLeg.legExtraInfo.TAG === 'Bus'
                        ? reduxSingleLeg.legExtraInfo._0.fleetNo
                        : undefined;
                const busTransitInfo: BusTransitInfo = {
                    ...baseTransitProps,
                    mode: 'BUS',
                    busNo: busExtra.routeName || '',
                    transitMetaInfo: busExtra.selectedServiceTier?.serviceTierType || 'ORDINARY',
                    transitMetaInfoDisplayName: busExtra.selectedServiceTier?.serviceTierName || 'ORDINARY',
                    availableBuses: busExtra.alternateShortNames
                        ? busExtra.alternateShortNames.map(name => ({
                              routeCode: name,
                              routeNumber: name,
                              handleOnPress: () => {},
                          }))
                        : [],
                    fleetNo: reduxBusExtraFleet ?? busExtra?.fleetNo,
                    activationProps: {
                        legInfo: singleLeg,
                        journeyId: journeyId?.toString() ?? '',
                        legOrder: singleLeg?.order ?? 0,
                        subLegOrder: singleLeg ? getSubLegOrder(singleLeg) : 0,
                        autoFillOtp: undefined,
                        type: 'Activate',
                    },
                    setTicketUIModalClosed: undefined,
                    navigation: undefined,
                };
                return busTransitInfo;
            } else {
                // Fallback for other travel modes not explicitly handled by NewTicketUI
                // This fallback should also conform to TransitInfoCardProps
                return {
                    ...baseTransitProps,
                    mode: 'BUS', // Defaulting to BUS for unhandled cases
                    busNo: '',
                    transitMetaInfo: 'ORDINARY',
                    transitMetaInfoDisplayName: 'ORDINARY',
                    availableBuses: [],
                    fleetNo: undefined,
                    activationProps: {
                        legInfo: singleLeg,
                        journeyId: '',
                        legOrder: 0,
                        subLegOrder: 0,
                        autoFillOtp: undefined,
                        type: 'Activate',
                    },
                    navigation: undefined,
                    setTicketUIModalClosed: undefined,
                };
            }
        })(); // IIFE ends here
        const singleModeTickets = singleLeg?.travelMode === 'Metro' ? legTickets.metro : legTickets.bus;
        const tickets = isUndefined(unifiedQR) ? singleModeTickets.at(0) : unifiedQR;
        const allTickets = isUndefined(unifiedQR) ? singleModeTickets : [unifiedQR];
        const qrCodesArray = allTickets.length > 0 ? allTickets : tickets ? [tickets] : [];
        return {
            ticketHeaderProps: ticketHeader(singleLeg, legExtra, paymentDetailsData),
            transitInfoCardProps: transitInfoCard,
            categories: journeyLegs?.map(leg => extractCategories(leg) ?? []),
            onClose: onClose || (() => {}),
            onPressCheckIn: () => {}, // No-op for pure function
            onPressSupport: () => {}, // No-op for pure function
            qrValue: tickets || '',
            duration: singleLeg ? effectiveTicketLiveHours([singleLeg]) : '',
            journeyId: journeyId,
            ticketType:
                singleLeg?.travelMode === 'Metro'
                    ? 'METRO'
                    : singleLeg?.travelMode === 'Subway'
                      ? 'TRAIN'
                      : singleLeg?.travelMode === 'Bus'
                        ? 'BUS'
                        : 'COMBO',
            renderType, // Ensure renderType is present
            qrCodeViewProps: {
                qrCodes: qrCodesArray,
                size: singleLeg?.travelMode === 'Bus' ? 160 : 175,
            },
            singleLeg: singleLeg,
            journeyStatus, // Add this line
            subUrbanData,
            ticketCreatedAt:
                singleLeg?.legExtraInfo.TAG === 'Bus' ? singleLeg?.legExtraInfo._0.ticketsCreatedAt?.at(0) : undefined,
        };
    })();

    // --- Final Return based on mode ---
    const finalOutput: TicketUIProps = (() => {
        if (filteredLegs && filteredLegs.length === 1 && newTicketUIProps) {
            return { tag: 'SINGLEMODE', data: newTicketUIProps };
        } else {
            // Use new MultiTransitTicketUI for multimodal journeys
            const renderQRValue = unifiedQR ?? '';
            const transitDetails = mapTransitTypesToTransitDetails(transitTypes, timeTable);

            // Get ticket header props from first filtered leg
            const firstLeg = filteredLegs[0];
            const legExtra = filteredLegs[0]?.legExtraInfo;
            const ticketHeaderProps = ticketHeader(firstLeg, legExtra, paymentDetailsData);

            return {
                tag: 'MULTIMODAL',
                data: {
                    transitInfoCardProps: undefined,
                    singleLeg: filteredLegs[0], // Required by NewTicketUIProps
                    ticketHeaderProps,
                    categories: journeyLegs?.map(leg => extractCategories(leg) ?? []),
                    onClose: onClose || (() => {}),
                    qrCodeViewProps: {
                        qrCodes: renderQRValue ? [renderQRValue] : [],
                        size: 175,
                    },
                    duration: effectiveTicketLiveHours(filteredLegs),
                    journeyId: journeyId,
                    renderType,
                    ticketType:
                        filteredLegs[0]?.travelMode === 'Metro'
                            ? 'METRO'
                            : filteredLegs[0]?.travelMode === 'Subway'
                              ? 'SUBWAY'
                              : 'BUS',
                    journeyStatus,
                    transitDetails,
                    subUrbanData: createSubUrbanData(filteredLegs),
                },
            };
        }
    })();

    return finalOutput;
};

export const getTicketUIPropsFromJourneyInfoResp = (
    journeyInfoResp: journeyInfoResp,
    renderType: RenderType,
    currentLegTimeTable: TimeEntry[] | undefined,
    legsInfoFromRedux: legInfo[] | undefined,
    userLanguageStrings: strings,
    passEnabled: boolean,
): TicketUIProps => {
    const journeyLegs = journeyInfoResp.legs;
    const journeyId = createJourneyId(journeyInfoResp.journeyId);

    const legTickets: LegTickets = getTicketsFromLegs(journeyLegs);

    const transitTypes = mapLegInfoToTransitTypes(journeyLegs);

    const comboTicketText =
        transitTypes.filter(item => item.title === 'Bus' || item.title === 'Metro').length > 1 ? undefined : 'Ticket';

    const ticketFare = journeyLegs.reduce((sum: number, leg: legInfo) => {
        if (leg?.travelMode && ['Metro', 'Subway', 'Bus'].includes(leg.travelMode) && leg.totalFare) {
            return sum + leg.totalFare.amount;
        }
        return sum;
    }, 0);

    const paymentDetailsData = {
        orderId: journeyInfoResp.paymentOrderShortId || '',
        totalAmount: ticketFare.toString(),
        dateAndTime: undefined,
    };

    const subUrbanData = createSubUrbanData(journeyLegs);

    return _deriveTicketUIProps({
        journeyLegs,
        journeyId,
        legTickets,
        transitTypes,
        comboTicketText,
        ticketFare,
        paymentDetailsData,
        unifiedQR: journeyInfoResp.unifiedQRV2,
        renderType,
        timeTable: currentLegTimeTable,
        journeyStatus: journeyInfoResp.journeyStatus,
        subUrbanData,
        legsInfoFromRedux,
        userLanguageStrings,
        passEnabled,
    });
};

export const useTicketUIProps = (journeyId: JourneyId | null, renderType: RenderType): TicketUIProps => {
    // All hooks must be called unconditionally at the top level
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;
    const journey = useAppSelector((state: RootState) => selectJourneyWithId(state, journeyId), isEqual);
    const journeyLegs = useAppSelector((state: RootState) => selectJourneyLegs(state, journeyId), isEqual);
    const { ticketUIRef } = useRefsContext();
    const { legTimetables } = useTimetables(journeyLegs, false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Merge journey legs if there are multiple and they are Metro/Subway
    const mergedLegs = useMemo(() => mergeJourneyLegs(journeyLegs), [journeyLegs]);

    const legTickets = useMemo(() => {
        if (journeyId === null || !mergedLegs) return { metro: [], bus: [] };
        return getTicketsFromLegs(mergedLegs);
    }, [mergedLegs, journeyId]);

    const transitTypes = useMemo(() => {
        if (journeyId === null || !mergedLegs) return [];
        return mapLegInfoToTransitTypes(mergedLegs);
    }, [mergedLegs, journeyId]);

    const comboTicketText = useMemo(() => {
        if (journeyId === null) return undefined;
        return transitTypes.filter(item => item.title === 'Bus' || item.title === 'Metro').length > 1
            ? undefined
            : 'Ticket';
    }, [transitTypes, journeyId]);

    const handleCloseTicket = useCallback(() => {
        ticketUIRef.current?.dismiss();
    }, []);

    const handleStartJourney = useCallback(() => {}, []);
    const handlePress = useCallback(() => {}, []);
    const handlePressBookAuto = useCallback(() => {}, []);
    const publicTransportLeg = mergedLegs.find(
        journey => journey?.travelMode && ['Metro', 'Subway', 'Bus'].includes(journey.travelMode),
    );

    const ticketFare = useMemo(() => {
        if (journeyId === null || !mergedLegs) return 0;
        return mergedLegs.reduce((sum: number, leg: legInfo) => {
            if (leg?.travelMode && ['Metro', 'Subway', 'Bus'].includes(leg.travelMode) && leg.totalFare) {
                return sum + leg.totalFare.amount;
            }
            return sum;
        }, 0);
    }, [mergedLegs, journeyId]);

    const paymentDetailsData = useMemo(() => {
        if (journeyId === null || !journey) {
            return {
                orderId: '',
                totalAmount: '0',
                dateAndTime: undefined,
            };
        }
        return {
            orderId: journey.paymentOrderShortId || '',
            totalAmount: ticketFare.toString(),
            dateAndTime: undefined,
        };
    }, [journeyId, journey, ticketFare]);

    const subUrbanData: SuburbanInfoCardProps | undefined = useMemo(() => {
        return createSubUrbanData(mergedLegs);
    }, [mergedLegs, journey]);

    return _deriveTicketUIProps({
        journeyLegs: mergedLegs,
        journeyId,
        legTickets,
        transitTypes,
        comboTicketText,
        ticketFare,
        paymentDetailsData,
        unifiedQR: journey?.unifiedQRV2,
        onClose: handleCloseTicket,
        onStartJourney: handleStartJourney,
        onPress: handlePress,
        onPressBookAuto: handlePressBookAuto,
        renderType,
        timeTable: publicTransportLeg ? legTimetables[createLegOrder(publicTransportLeg)] : [],
        subUrbanData,
        journeyStatus: journey?.status,
        legsInfoFromRedux: journeyLegs,
        userLanguageStrings,
        passEnabled: isPassEnabled,
    });
};
