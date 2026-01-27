import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';

import { SuburbanInfoCardProps } from '../SingleTicket/components/SuburbanInfoCard';
// import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';
import { legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';
import { TransitDetail } from '../MultiModeTicket/UI';
import {
    BusTransitInfo,
    DirectMetroTransitInfo,
    SwitchMetroTransitInfo,
    TransitInfoCardProps,
    TicketHeaderProps,
} from '../SingleTicket/types';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { createJourneyId, JourneyId } from '@/typescript/state/client/user';
import { TicketDetailsPopUpProps } from '../TicketDetailsPopUp';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { TimeEntry } from '@/src-v2/multimodal/types/journeyTracking';
import { expiryDateAndTime } from '../Hooks/useTicketData';
import { strings } from 'config-types';
import { getRefundAmount, getSubLegOrder } from '@/typescript/utils/MultiModal';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { calculateTotalTicketsFromExtraInfo } from '@/src-v2/multimodal/components/JourneyPayment/Types';
import { APP_CONFIG } from '@/typescript/state/client/session';

export const isSubwayLegExtraInfo = (
    legExtraInfo: legExtraInfo,
): legExtraInfo is { TAG: 'Subway'; _0: subwayLegExtraInfo } => {
    return legExtraInfo.TAG === 'Subway';
};

export const createSubUrbanData = (journeyLegs: legInfo[]): SuburbanInfoCardProps | undefined => {
    const subwayLeg = journeyLegs.find(leg => leg?.travelMode === 'Subway');

    if (!subwayLeg) {
        return undefined;
    }

    const legExtraInfo = subwayLeg?.legExtraInfo;

    if (!legExtraInfo || !isSubwayLegExtraInfo(legExtraInfo)) {
        return undefined;
    }
    const subwayLegExtraInfo = legExtraInfo._0;

    const _routeInfo = subwayLegExtraInfo.routeInfo;

    const sortedRoutes = _routeInfo.every(r => r.subOrder !== undefined)
        ? [..._routeInfo].sort((route1, route2) =>
              route1.subOrder !== undefined && route2.subOrder !== undefined ? route1.subOrder - route2.subOrder : 0,
          )
        : _routeInfo;

    const selectedServiceTier = subwayLegExtraInfo.selectedServiceTier;
    const lastIndex = sortedRoutes.length - 1;
    const originRoute = sortedRoutes.at(0);
    const originStop = originRoute?.originStop;
    const destinationStop = sortedRoutes.at(lastIndex)?.destinationStop;

    return {
        trainType: selectedServiceTier?.trainTypeCode ?? '',
        trainClass: selectedServiceTier?.serviceTierName ?? '',
        cost: subwayLeg?.totalFare?.amount ?? 0,
        date: subwayLeg.startTime ? new Date(subwayLeg.startTime).toLocaleDateString() : '',
        utsNumber: subwayLegExtraInfo.ticketNo?.at(0) ?? '',
        phoneNumber: getStringItem(MMKVKey.MOBILE_NUMBER) ?? '',
        time: convertUTCtoIST(legExtraInfo._0.ticketsCreatedAt?.[0] ?? '', 'hh:mm A'),
        fromStation: {
            english: originStop?.name ?? '',
            hindi: originStop?.hindiName ?? '',
            tamil: originStop?.regionalName ?? '',
        },
        toStation: {
            english: destinationStop?.name ?? '',
            hindi: destinationStop?.hindiName ?? '',
            tamil: destinationStop?.regionalName ?? '',
        },
        viaRoute: selectedServiceTier?.via ?? '',
        commencingHours: subwayLegExtraInfo.ticketValidityHours?.at(0) ?? 1,
    };
};

// Helper function to map TransitDetail to BusTicketData
// Helper function to create base transit properties
export const createBaseTransitProps = (transitDetail: TransitDetail, userLanguageStrings: strings) => {
    return {
        source: transitDetail.fromLocation,
        destination: transitDetail.destinationLocation,
        regionalSourceTitle: transitDetail.fromLocationSubText || '',
        regionalDestinationTitle: '',
        nextArrivalTime: transitDetail.arrivalTime,
        transitMessage: userLanguageStrings.BoardFrom(transitDetail.fromLocation),
        validTill: transitDetail.validity,
        transitCost: transitDetail.transitCost,

        status: 'ACTIVE' as const,
    };
};

// Helper function to create Metro transit props
export const createMetroTransitProps = (
    transitDetail: TransitDetail,
    userLanguageStrings: strings,
): DirectMetroTransitInfo | SwitchMetroTransitInfo => {
    const baseProps = createBaseTransitProps(transitDetail, userLanguageStrings);
    const legInfo = transitDetail.legInfo;

    if (!legInfo || legInfo.legExtraInfo.TAG !== 'Metro') {
        // Fallback to direct if legInfo is not available or not Metro
        const directInfo: DirectMetroTransitInfo = {
            ...baseProps,
            mode: 'METRO',
            transitMetaInfo: transitDetail.transitMetaInfo,
            transitMetaInfoDisplayName: transitDetail.transitMetaInfoDisplayName,
            ticketNumber: undefined,
            legInfo: undefined,
            metroTransitType: 'DIRECT',
            gateNo: transitDetail.gateNumber ? parseInt(transitDetail.gateNumber) : undefined,
            platformNo: transitDetail.platform ? parseInt(transitDetail.platform) : undefined,
        };
        return directInfo;
    }

    const metroExtra = legInfo.legExtraInfo._0;
    const routeInfo = metroExtra.routeInfo;

    // Check if it's a switch journey (multiple routes)
    if (routeInfo && routeInfo.length > 1) {
        const firstRoute = routeInfo[0];
        const secondRoute = routeInfo[1];

        const switchInfo: SwitchMetroTransitInfo = {
            ...baseProps,
            mode: 'METRO',
            transitMetaInfo: 'SWITCH',
            transitMetaInfoDisplayName: 'SWITCH',
            ticketNumber: metroExtra.ticketNo?.at(0),
            legInfo: undefined,
            metroTransitType: 'SWITCH',
            gateNo: transitDetail.gateNumber ? parseInt(transitDetail.gateNumber) : undefined,
            platformNo: firstRoute?.platformNumber ? parseInt(firstRoute.platformNumber) : undefined,
            sourceMessage: userLanguageStrings.BoardLineMetroFromPlatform(
                getUserLanguageStringsForMetroLine(firstRoute?.lineColor ?? '', userLanguageStrings) ?? '',
                firstRoute?.platformNumber || '',
            ),
            switchStation: firstRoute?.destinationStop?.name || '',
            switchStationRegionalTitle: firstRoute?.destinationStop?.regionalName || '',
            sourceLine: firstRoute?.lineColor || '',
            sourceLineColorCode: '#' + (firstRoute?.lineColorCode || ''),
            switchPlatformNo: secondRoute?.platformNumber ? parseInt(secondRoute.platformNumber) : undefined,
            destinationMessage: userLanguageStrings.BoardLineMetroFromPlatform(
                getUserLanguageStringsForMetroLine(secondRoute?.lineColor ?? '', userLanguageStrings) ?? '',
                secondRoute?.platformNumber || '',
            ),
            destinationLine: secondRoute?.lineColor || '',
            destinationLineColorCode: '#' + (secondRoute?.lineColorCode || ''),
        };
        return switchInfo;
    } else {
        // Direct journey (single route)
        const directInfo: DirectMetroTransitInfo = {
            ...baseProps,
            mode: 'METRO',
            transitMetaInfo: 'DIRECT',
            transitMetaInfoDisplayName: 'DIRECT',
            ticketNumber: metroExtra.ticketNo?.at(0),
            legInfo: undefined,
            metroTransitType: 'DIRECT',
            gateNo: transitDetail.gateNumber ? parseInt(transitDetail.gateNumber) : undefined,
            platformNo: routeInfo?.[0]?.platformNumber ? parseInt(routeInfo[0].platformNumber) : undefined,
        };
        return directInfo;
    }
};

// Helper function to create Bus transit props
export const createBusTransitProps = (
    transitDetail: TransitDetail,
    userLanguageStrings: strings,
    journeyId: JourneyId | null,
): BusTransitInfo => {
    const baseProps = createBaseTransitProps(transitDetail, userLanguageStrings);

    const busInfo: BusTransitInfo = {
        ...baseProps,
        mode: 'BUS',
        transitMetaInfo: transitDetail.busType || 'ORDINARY',
        transitMetaInfoDisplayName: transitDetail.transitMetaInfo,
        busNo: transitDetail.busNo,
        availableBuses: [],
        fleetNo:
            transitDetail.legInfo.legExtraInfo.TAG === 'Bus'
                ? transitDetail.legInfo.legExtraInfo._0?.fleetNo
                : undefined,
        activationProps: {
            legInfo: transitDetail.legInfo,
            journeyId: createJourneyId(journeyId ?? ''),
            legOrder: transitDetail.legInfo.order,
            subLegOrder: getSubLegOrder(transitDetail.legInfo),
            autoFillOtp: undefined,
            type: 'Activate',
        },
        setTicketUIModalClosed: undefined,
        navigation: undefined,
    };
    return busInfo;
};

export const mapTransitDetailToBusTicketData = (
    transitDetail: TransitDetail,
    subUrbanData: SuburbanInfoCardProps | undefined,
    duration: string | undefined,
    journeyId: JourneyId | null,
    handleCloseBusTicketScreen: () => void,
    userLanguageStrings: strings,
): TicketDetailsPopUpProps => {
    // Create transitInfoCardProps based on the mode
    const transitInfoCardProps: TransitInfoCardProps | SuburbanInfoCardProps = (() => {
        if (transitDetail.mode === 'METRO') {
            return createMetroTransitProps(transitDetail, userLanguageStrings);
        } else if (transitDetail.mode === 'SUBWAY') {
            // For subway, return SuburbanInfoCardProps
            return (
                (transitDetail.legInfo && createSubUrbanData([transitDetail.legInfo])) ||
                subUrbanData ||
                createBusTransitProps(transitDetail, userLanguageStrings, journeyId)
            );
        } else {
            return createBusTransitProps(transitDetail, userLanguageStrings, journeyId);
        }
    })();

    return {
        source: transitDetail.fromLocation,
        sourceTamil: transitDetail.fromLocationSubText || transitDetail.fromLocation,
        destination: transitDetail.destinationLocation,
        destinationTamil: transitDetail.destinationLocation,
        duration: duration,
        journeyId: journeyId,
        mode: transitDetail.mode,
        transitInfoCardProps: transitInfoCardProps,
        legInfo: transitDetail.legInfo,
        onStartJourney: () => {
            handleCloseBusTicketScreen();
        },
    };
};

// Helper to map legInfo to the transitTypes format expected by TicketUI
export const mapLegInfoToTransitTypes = (legs: legInfo[]) => {
    return legs.map(leg => ({
        title: leg?.travelMode,
        legInfo: leg,
        AltText: undefined,
    }));
};

// Helper to safely get station name/regional name
export const getStationName = (station: fRFSStationAPI | undefined) => station?.name || '';
export const getRegionalStationName = (station: fRFSStationAPI | undefined) => station?.regionalName || '';

// Helper to map transitTypes to TransitDetail[] for MultiTransitTicketUI
export const mapTransitTypesToTransitDetails = (
    transitTypes: ReturnType<typeof mapLegInfoToTransitTypes>,
    timeTable: TimeEntry[] | undefined,
): TransitDetail[] => {
    const currentTime = Date.now();

    return transitTypes
        .filter(transit => transit.title && ['Metro', 'Bus', 'Subway'].includes(transit.title))
        .map((transit, _index) => {
            const leg = transit.legInfo;
            const legExtra = leg?.legExtraInfo;

            // Get origin and destination stops
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
                    return routeInfos?.[routeInfos.length - 1]?.destinationStop;
                } else if (leg.legExtraInfo.TAG === 'Bus') {
                    return leg.legExtraInfo._0.destinationStop;
                }
                return undefined;
            };

            const originStop = getLegOriginStop(leg);
            const destinationStop = getLegDestinationStop(leg);

            const fromLocation = getStationName(originStop);
            const fromLocationSubText = getRegionalStationName(originStop);
            const destinationLocation = getStationName(destinationStop);

            // Get transit cost
            const transitCost = leg?.totalFare?.amount || 0;

            // Get transit meta info and bus details
            const transitMetaInfo =
                legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway'
                    ? legExtra._0.routeInfo && legExtra._0.routeInfo.length > 1
                        ? 'SWITCH'
                        : 'DIRECT'
                    : legExtra?.TAG === 'Bus'
                      ? legExtra._0.selectedServiceTier?.serviceTierType || 'ORDINARY'
                      : '';

            const transitMetaInfoDisplayName =
                legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway'
                    ? legExtra._0.routeInfo && legExtra._0.routeInfo.length > 1
                        ? 'SWITCH'
                        : 'DIRECT'
                    : legExtra?.TAG === 'Bus'
                      ? legExtra._0.selectedServiceTier?.serviceTierName || 'ORDINARY'
                      : '';

            // For metro/subway, use line color as busNo; for bus, use route name
            const busNo =
                legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway'
                    ? legExtra._0.routeInfo?.[0]?.lineColor || 'Metro Line'
                    : legExtra?.TAG === 'Bus'
                      ? legExtra._0.routeName || ''
                      : '';
            const busType: TransitDetail['busType'] =
                legExtra?.TAG === 'Bus'
                    ? legExtra._0.selectedServiceTier?.serviceTierType || 'ORDINARY'
                    : ('ORDINARY' satisfies TransitDetail['busType']);

            // Get arrival time from timetable
            const nextTime = timeTable?.find((entry: TimeEntry) => entry.time > currentTime);
            const arrivalTime = nextTime
                ? new Date(nextTime.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

            // Get validity
            const ticketValidity =
                legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway' || legExtra?.TAG === 'Bus'
                    ? legExtra._0.ticketValidity
                    : undefined;
            const ticketValidityString = Array.isArray(ticketValidity) ? ticketValidity[0] || '' : ticketValidity || '';

            const validity = ticketValidityString
                ? expiryDateAndTime(ticketValidityString).expiryDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : '';

            // Get platform
            const platform =
                legExtra?.TAG === 'Metro' || legExtra?.TAG === 'Subway'
                    ? legExtra._0.routeInfo?.[0]?.platformNumber || ''
                    : '';

            return {
                fromLocation,
                fromLocationSubText,
                destinationLocation,
                transitCost,
                mode: transit.title === 'Metro' ? 'METRO' : transit.title === 'Subway' ? 'SUBWAY' : 'BUS',
                transitMetaInfo,
                transitMetaInfoDisplayName,
                busNo,
                busType,
                arrivalTime,
                validity,
                platform: platform,
                legInfo: leg,
                onDetailsPress: () => {},
                refundAmount: getRefundAmount(leg),
            };
        });
};

const getTicketNumber = (leg: legExtraInfo | undefined): string | undefined => {
    if (leg && (leg.TAG === 'Metro' || leg.TAG === 'Subway' || leg.TAG === 'Bus')) {
        if (leg._0.ticketNo && leg._0.ticketNo[0]) {
            return leg._0.ticketNo[0];
        }
    }
    return undefined;
};

export const ticketHeader = (
    singleLeg: legInfo | undefined,
    legExtra: legExtraInfo | undefined,
    _paymentDetailsData: { orderId: string; totalAmount: string; dateAndTime: Date | undefined },
): TicketHeaderProps => ({
    id: singleLeg?.travelMode === 'Subway' ? undefined : getTicketNumber(legExtra) || '',
    date: singleLeg?.startTime ? new Date(singleLeg?.startTime).toLocaleDateString() : '', // Format date
    title:
        legExtra?.TAG === 'Bus'
            ? APP_CONFIG.value.screenConfig.ticketScreenConfig.busTicketText.headerTitle
            : singleLeg?.travelMode === 'Metro'
              ? APP_CONFIG.value.screenConfig.ticketScreenConfig.metroTicketText.headerTitle
              : singleLeg?.travelMode === 'Bus'
                ? APP_CONFIG.value.screenConfig.ticketScreenConfig.busTicketText.headerTitle
                : singleLeg?.travelMode === 'Subway'
                  ? APP_CONFIG.value.screenConfig.ticketScreenConfig.subwayTicketText.headerTitle
                  : APP_CONFIG.value.screenConfig.ticketScreenConfig.comboTicket.headerTitle,
    regionalTitle:
        singleLeg?.travelMode === 'Bus'
            ? APP_CONFIG.value.screenConfig.ticketScreenConfig.busTicketText.regionalTitle
            : singleLeg?.travelMode === 'Metro'
              ? APP_CONFIG.value.screenConfig.ticketScreenConfig.metroTicketText.regionalTitle
              : singleLeg?.travelMode === 'Subway'
                ? APP_CONFIG.value.screenConfig.ticketScreenConfig.subwayTicketText.regionalTitle
                : APP_CONFIG.value.screenConfig.ticketScreenConfig.comboTicket.regionalTitle, // Placeholder, needs actual regional names
    ticketCount: legExtra ? calculateTotalTicketsFromExtraInfo(legExtra) : 0,
    leg:
        singleLeg === undefined
            ? undefined
            : singleLeg.travelMode === 'Bus'
              ? 'BUS'
              : singleLeg.travelMode === 'Metro'
                ? 'METRO'
                : 'TRAIN',
});

// Function to get userLanguageStrings for transitMetaInfo values
export const getTransitMetaInfoLabel = (transitMetaInfo: string, userLanguageStrings: strings): string => {
    const transitMode = transitMetaInfo.toUpperCase();
    switch (transitMode) {
        case 'SWITCH':
            return userLanguageStrings.SwitchType;
        case 'DIRECT':
            return userLanguageStrings.DirectType;
        default:
            switch (transitMode) {
                case 'ORDINARY':
                    return userLanguageStrings.OrdinaryType;
                case 'FIRST_CLASS':
                    return userLanguageStrings.FirstClassType;
                case 'SECOND_CLASS':
                    return userLanguageStrings.SecondClassType;
                case 'THIRD_CLASS':
                    return userLanguageStrings.ThirdClassType;
                case 'AC':
                    return userLanguageStrings.ACType;
                case 'NON_AC':
                    return userLanguageStrings.NonACType;
                case 'EXPRESS':
                    return userLanguageStrings.ExpressType;
                case 'EXECUTIVE':
                    return userLanguageStrings.DeluxeType;
                case 'SPECIAL':
                    return userLanguageStrings.SpecialType;
                case 'DELUXE':
                    return userLanguageStrings.DeluxeType;
                default:
                    return transitMetaInfo;
            }
    }
};

// userLanguageStrings only used for ticketValidIn in PreBooking single mode bus
export const getTicketValidInLabel = (serviceTierName: string, userLanguageStrings: strings): string => {
    const label = serviceTierName.toUpperCase();
    switch (label) {
        case 'ORDINARY BUSES':
            return userLanguageStrings.OrdinaryBuses;
        case 'EXECUTIVE':
            return userLanguageStrings.Executive;
        case 'EXPRESS BUSES':
            return userLanguageStrings.ExpressBuses;
        case 'ORDINARY':
            return userLanguageStrings.OrdinaryType;
        case 'DELUXE':
            return userLanguageStrings.DeluxeType;
        case 'EXPRESS':
            return userLanguageStrings.ExpressType;
        case 'AC':
            return userLanguageStrings.ACType;
        case 'NON_AC':
            return userLanguageStrings.NonACType;
        case 'SPECIAL':
            return userLanguageStrings.SpecialType;
        default:
            return serviceTierName;
    }
};
