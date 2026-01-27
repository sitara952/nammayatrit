import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';
import { upcomingVehicleInfo } from '@/readOnly/api/types/UpcomingVehicleInfo.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';

export type BusTransitCellAction = Action<'LIVE_OR_GTFS_CLICK'>;

export type BusCellProps = {
    isLastCell: boolean | undefined;
    legInfo: legInfo | TrackedLegInfoStaticInfo;
    onClassChange: (() => void) | undefined;
    isDataLoading: boolean | undefined;
    fromJourneyInfoScreen: boolean;
    transitTime: string | undefined;
    totalTicketCount: number;
    onBusRouteSwitch: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
    journeyId: string | undefined;
};

export type BusTransitCellViewState = {
    isLastCell: boolean | undefined;
    originStop: fRFSStationAPI | undefined;
    destinationStop: fRFSStationAPI | undefined;
    providerName: string | undefined;
    routeName: string | undefined;
    selectedServiceTier: legServiceTier | { serviceTierName: string | undefined } | undefined;
    alternateShortNames: string[];
    routeCode: string;
    upcomingBusInfo: upcomingVehicleInfo | null;
    distance: number | null;
    onClassChange: (() => void) | undefined;
    ticketState: 'review' | 'scheduled' | 'expired' | undefined;
    btDispatch: Resolver<BusTransitCellAction> | undefined;
    isDataLoading: boolean | undefined;
    isStatic: boolean;
    timeTableProps: NewTimeTableUIProps | undefined;
    transitTime: string | undefined;
    bookingAllowed: boolean | undefined;
    showPassText: boolean;
    totalTicketCount: number;
};
