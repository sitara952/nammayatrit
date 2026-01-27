import { ImageSourcePropType } from 'react-native';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';
import { getIconFromType } from '../../../components/PublicTransportCard/PublicTransportCardUtils';
import { mapModeToTransitType } from '../../../components/PublicTransportCard/types';
import { TicketData, TicketStatus, TicketStatusConfig } from './Types';
import mtIcBusTransitReview from '@/src-v2/assets/3D-assets/review-transits/mt_ic_bus_transit_review.webp';
import mtIcMetroTransitReview from '@/src-v2/assets/3D-assets/review-transits/mt_ic_metro_transit_review.webp';
import mtIcTrainTransitReview from '@/src-v2/assets/3D-assets/review-transits/mt_ic_train_transit_review.webp';
import mtIcMultiTransitReview from '@/src-v2/assets/3D-assets/transits/transit_multi.webp';
import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';
import { getTransitLocation } from '@/src-v2/utils/common';
import { getLegTickets } from '@/typescript/utils/MultiModal';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { metroLegExtraInfo } from '@/readOnly/api/types/MetroLegExtraInfo.gen';
import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';
import { busLegExtraInfo } from '@/readOnly/api/types/BusLegExtraInfo.gen';
import { isUndefined } from 'lodash';

export const ticketStatusConfig: Record<string, TicketStatusConfig> = {
    live: {
        label: '',
        color: '#F27115',
        textClass: 'text-[#F27115]',
    },
    expired: {
        label: 'Expired',
        color: '#9696961F',
        textClass: 'text-[#969696]',
    },
    cancelled: {
        label: 'Cancelled',
        color: '#F7381226',
        textClass: 'text-[#FF0000]',
    },
    failed: {
        label: 'Failed',
        color: '#969696',
        textClass: 'text-[#FF0000]',
    },
};

export const getMetroLineColorHex = (lineColor: string) => {
    const colorMap: Record<string, string> = {
        green: '#258834',
        blue: '#016ACD',
        red: '#D32F2F',
        purple: '#8C2877',
        yellow: '#f0ca00',
        magenta: '#FF00FF',
    };
    return colorMap[lineColor.trim().toLowerCase()] || '#016ACD';
};

//to be removed once we get proper data for serviceTierName
const getServiceTierLabel = (tierType: FRFSServiceTierType_fRFSServiceTierType | undefined): string => {
    if (!tierType) return '';

    const serviceTierMap: Record<FRFSServiceTierType_fRFSServiceTierType, string> = {
        ORDINARY: 'Ordinary',
        FIRST_CLASS: 'First Class',
        SECOND_CLASS: 'Second Class',
        THIRD_CLASS: 'Third Class',
        AC: 'AC',
        NON_AC: 'Non AC',
        EXPRESS: 'Express',
        EXECUTIVE: 'Deluxe',
        SPECIAL: 'Special',
    };

    return (
        serviceTierMap[tierType] ||
        tierType
            .toLowerCase()
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );
};

const getTransitImage = (legs: journeyInfoResp['legs']): ImageSourcePropType => {
    if (legs.length > 1) return mtIcMultiTransitReview;

    const tag = legs[0]?.legExtraInfo.TAG;
    const imageMap: Record<string, ImageSourcePropType> = {
        Bus: mtIcBusTransitReview,
        Metro: mtIcMetroTransitReview,
        Subway: mtIcTrainTransitReview,
    };

    return tag ? (imageMap[tag] ?? mtIcBusTransitReview) : mtIcBusTransitReview;
};
export const getTicketStatus = (
    status: string,
    hasLegs: boolean,
    legExtraInfos: legExtraInfo[],
): TicketStatus | undefined => {
    if (!hasLegs || ['NEW', 'INITIATED'].includes(status)) return undefined;

    if (['CONFIRMED', 'INPROGRESS', 'COMPLETED'].includes(status)) {
        //add additional validQR check once we get proper unifiedQR data in JourneyInfoResp
        const hasLiveTicket = legExtraInfos.some(leg => {
            if (leg.TAG === 'Bus' || leg.TAG === 'Metro' || leg.TAG === 'Subway') {
                const ticketValidity = leg._0.ticketValidity?.[0];
                if (!ticketValidity) return false;
                return new Date(ticketValidity) > new Date();
            }
            return false;
        });

        return hasLiveTicket ? 'live' : status === 'FAILED' ? 'failed' : 'expired';
    }
    return status === 'CANCELLED' ? 'cancelled' : status === 'FAILED' ? 'failed' : 'expired';
};

export const transformJourneyToTicket = (journey: journeyInfoResp): TicketData | undefined => {
    const legs = journey.legs.filter(
        l => l.legExtraInfo.TAG === 'Bus' || l.legExtraInfo.TAG === 'Metro' || l.legExtraInfo.TAG === 'Subway',
    );
    const status = getTicketStatus(
        journey.journeyStatus,
        legs.length > 0,
        journey.legs.map(l => l.legExtraInfo),
    );
    if (!status) return undefined;

    const legTickets = getLegTickets(journey);
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    const isSingleLeg = legs.length === 1;
    const fare = legs.reduce((total, leg) => {
        if (leg.legExtraInfo.TAG === 'Bus') {
            return total + (leg.totalFare?.amount ?? 0);
        } else if (leg.legExtraInfo.TAG === 'Metro') {
            return total + (leg.totalFare?.amount ?? 0);
        } else if (leg.legExtraInfo.TAG === 'Subway') {
            return total + (leg.totalFare?.amount ?? 0);
        }
        return total + (leg.estimatedMinFare?.amount || 0);
    }, 0);

    const legIcons = legs.map(l => getIconFromType(mapModeToTransitType(l.legExtraInfo.TAG, undefined), 18));

    const { route, serviceTier, legType } =
        isSingleLeg && firstLeg
            ? (() => {
                  const legExtra = firstLeg.legExtraInfo;
                  return {
                      route:
                          legExtra.TAG === 'Bus'
                              ? legExtra._0.routeName || ''
                              : legExtra.TAG === 'Subway'
                                ? legExtra._0.routeInfo[0]?.trainNumber || ''
                                : '',
                      serviceTier:
                          legExtra.TAG === 'Bus' || legExtra.TAG === 'Subway'
                              ? getServiceTierLabel(legExtra._0.selectedServiceTier?.serviceTierType)
                              : legExtra.TAG === 'Metro'
                                ? legExtra._0.routeInfo?.map(r => r.lineColor).join(', ') || ''
                                : '',
                      legType: legExtra.TAG,
                  };
              })()
            : { route: '', serviceTier: '', legType: '' };

    const transitTypes = legs.map(item => ({
        title: item.travelMode,
        legInfo: item,
        AltText: undefined,
    }));

    return {
        id: journey.journeyId,
        from: getTransitLocation(firstLeg, true),
        to: getTransitLocation(lastLeg, false),
        fare,
        legIcons,
        status,
        route,
        serviceTier,
        legType,
        isSingleLeg,
        image: getTransitImage(legs),
        unifiedQR: journey.unifiedQRV2,
        transitTypes,
        legTickets: legTickets,
        paymentOrderId: journey.paymentOrderShortId,
        createdAt: journey.createdAt,
        journeyInfoResp: journey,
    };
};

export const hasTicketData = (leg: legInfo): boolean => {
    if (leg.legExtraInfo.TAG === 'Metro') {
        const xtraInfo: metroLegExtraInfo = leg.legExtraInfo._0;
        return !isUndefined(xtraInfo.tickets) && xtraInfo.tickets.length > 0;
    } else if (leg.legExtraInfo.TAG === 'Subway') {
        const xtraInfo: subwayLegExtraInfo = leg.legExtraInfo._0;
        return !isUndefined(xtraInfo.tickets) && xtraInfo.tickets.length > 0;
    } else if (leg.legExtraInfo.TAG === 'Bus') {
        const xtraInfo: busLegExtraInfo = leg.legExtraInfo._0;
        return !isUndefined(xtraInfo.tickets) && xtraInfo.tickets.length > 0;
    } else {
        return false;
    }
};
