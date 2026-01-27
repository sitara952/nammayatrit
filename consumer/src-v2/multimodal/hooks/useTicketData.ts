import { useEffect, useState, useMemo } from 'react';
import { useRideBookingListV2GetQuery } from '@/api/integrations/rtk/RideBookingListV2Get';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectLatestInprogressJourney } from '@/typescript/state/client/journey';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { bookingAPIEntityV2 } from '@/readOnly/api/types/BookingAPIEntityV2.gen';
import { bookingListResV2 } from '@/readOnly/api/types/BookingListResV2.gen';
import { useOfflineTickets } from '../hooks/useOfflineTickets';
import { useNetInfo } from '@react-native-community/netinfo';
import { getTicketStatus, transformJourneyToTicket } from '../screens/LiveTicket/Tickets/TicketUtils';
import { TicketData } from '../screens/LiveTicket/Tickets/Types';
import { convertJourneyToJourneyInfoResp } from '@/typescript/utils/MultiModal';
import { isNull } from 'lodash';
import { selectRefetchJourneys, setRefetchJourneys } from '@/typescript/state/client/session';

export const useTicketData = () => {
    const limit = 10;
    const offset = 0;

    const { isConnected } = useNetInfo();
    const { cachedJourneys, addJourneyToMMKV } = useOfflineTickets();
    const refetchJourneys = useAppSelector(selectRefetchJourneys);

    const {
        data,
        isSuccess,
        isLoading: isBookingListLoading,
        refetch,
    } = useRideBookingListV2GetQuery(
        {
            limit,
            offset: undefined,
            bookingOffset: offset,
            journeyOffset: offset,
            fromDate: undefined,
            toDate: undefined,
            rideStatus: undefined,
            journeyStatus: undefined,
            isPaymentSuccess: true,
            bookingRequestType: 'JourneyRequest',
            billingCategory: undefined,
            rideType: undefined,
        },
        {
            refetchOnMountOrArgChange: true,
        },
    );

    const latestInProgressJourney = useAppSelector(selectLatestInprogressJourney);

    const [offlineJourneys, setOfflineJourneys] = useState<bookingListResV2 | undefined>(undefined);

    const dispatch = useAppDispatch();

    const journeyListResp: bookingListResV2 = useMemo(() => {
        const apiList: bookingAPIEntityV2[] = data?.list || []; // Handle undefined data.list
        const offlineList: bookingAPIEntityV2[] = offlineJourneys?.list ?? [];

        const combinedList = [...offlineList, ...apiList];

        apiList.forEach(item => {
            if (item.TAG === 'MultiModalRide') addJourneyToMMKV(item._0);
        });

        // Filter out duplicates based on journeyId or a unique identifier
        const uniqueJourneys = Array.from(
            new Map(
                combinedList.map(item => {
                    const id =
                        item.TAG === 'MultiModalRide' ? item._0.journeyId : item.TAG === 'Ride' ? item._0.id : null;
                    return [id, item];
                }),
            ).values(),
        );

        // Sort the unique list by startTime in descending order
        const sortedList = [...uniqueJourneys].sort((a, b) => {
            const startTimeA = a.TAG === 'MultiModalRide' ? a._0.createdAt || '' : '';
            const startTimeB = b.TAG === 'MultiModalRide' ? b._0.createdAt || '' : '';
            return startTimeB.localeCompare(startTimeA);
        });

        return { list: sortedList, bookingOffset: data?.bookingOffset ?? 0, journeyOffset: data?.journeyOffset ?? 0 };
    }, [isConnected, data, offlineJourneys, isBookingListLoading]);

    const latestJourney = useMemo(() => {
        const isJourneyInCache = offlineJourneys?.list.find(
            booking => booking.TAG === 'MultiModalRide' && booking._0.journeyId === latestInProgressJourney?.journeyId,
        );

        if (latestInProgressJourney && isJourneyInCache) {
            return convertJourneyToJourneyInfoResp(latestInProgressJourney);
        } else {
            const latestNonCancelledJourney = journeyListResp.list.filter((booking: bookingAPIEntityV2) => {
                return booking.TAG === 'MultiModalRide' && booking._0.journeyStatus !== 'CANCELLED';
            });
            const latestJourney = latestNonCancelledJourney?.at(0);
            if (
                latestJourney &&
                latestJourney._0 &&
                latestJourney.TAG === 'MultiModalRide' &&
                latestJourney._0.legs.length > 0 &&
                latestJourney._0.journeyStatus &&
                getTicketStatus(
                    latestJourney._0.journeyStatus,
                    latestJourney._0.legs.length > 0,
                    latestJourney._0.legs.map(l => l.legExtraInfo),
                ) === 'live'
            )
                return latestJourney._0;

            return undefined;
        }
    }, [journeyListResp, latestInProgressJourney]);

    const convertCacheToJourney = (journey: journeyInfoResp): bookingAPIEntityV2 => {
        return {
            TAG: 'MultiModalRide',
            _0: journey,
        };
    };

    useEffect(() => {
        const cachedJourneyResp = cachedJourneys.map(item => convertCacheToJourney(item));
        setOfflineJourneys({ list: cachedJourneyResp, bookingOffset: undefined, journeyOffset: undefined });
    }, [cachedJourneys]);

    const allTickets = useMemo(() => {
        return (journeyListResp?.list ?? [])
            .filter(
                (booking: bookingAPIEntityV2): booking is { TAG: 'MultiModalRide'; _0: journeyInfoResp } =>
                    booking.TAG === 'MultiModalRide',
            )
            .flatMap((booking: { TAG: 'MultiModalRide'; _0: journeyInfoResp }) => {
                const ticket = transformJourneyToTicket(booking._0);
                return ticket ? [ticket] : [];
            });
    }, [journeyListResp]);

    const liveTickets = useMemo(
        () => allTickets.filter((t: TicketData) => t.status === 'live' || t.status === 'cancelled'),
        [allTickets],
    );

    const pastTickets = useMemo(
        () => allTickets.filter((t: TicketData) => t.status === 'expired' || t.status === 'failed').slice(0, 5),
        [allTickets],
    );

    useEffect(() => {
        if (refetchJourneys) {
            refetch();
            dispatch(setRefetchJourneys(false));
        }
    }, [refetchJourneys, dispatch]);

    return {
        isLoading: isBookingListLoading && (isNull(isConnected) ? false : isConnected),
        journeyListResp,
        allTickets,
        liveTickets,
        pastTickets,
        addJourneyToMMKV,
        latestInProgressJourney: latestJourney,
        isSuccess,
        data,
    };
};
