import { useContext, useEffect } from 'react';
import { NotificationContext, getNotificationsSince } from '@/typescript/context/NotificationContext';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setLegIsLoading } from '@/typescript/state/client/journey';
import type { JourneyId } from '@/typescript/state/client/user';
import type { ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { getNextLegOrder } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { checkTaxiLeg } from '@/typescript/utils/common';

const isAutoOrTaxi = (leg: ProcessedLegInfo): boolean => checkTaxiLeg(leg.transitMode);

const getTargetLegOrder = (allLegs: ProcessedLegInfo[]): string | undefined => {
    // Priority 1: If current leg is AUTO/TAXI, use it
    const currentIndex = allLegs.findIndex(l => l.currentLeg === l.staticInfo.legOrder);
    if (currentIndex === -1) return undefined;
    const currentLeg = allLegs[currentIndex];
    if (currentLeg && isAutoOrTaxi(currentLeg)) return currentLeg.staticInfo.legOrder;

    // Priority 2: Else, use the next leg if AUTO/TAXI
    const nextLeg = currentLeg ? getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder) : undefined;
    if (nextLeg && isAutoOrTaxi(nextLeg)) return nextLeg.staticInfo.legOrder;

    return undefined;
};

export const useJourneyNotificationSync = (journeyId: JourneyId | null, legs: ProcessedLegInfo[]) => {
    const dispatch = useAppDispatch();
    const [notification] = useContext(NotificationContext);

    const triggerRefetch = () => {
        if (!journeyId) return;
        const legOrder = getTargetLegOrder(legs);
        if (legOrder !== undefined)
            dispatch(setLegIsLoading({ id: journeyId, payload: { legOrder, journeyRefresh: true } }));
    };

    useEffect(() => {
        if (!journeyId) return;
        if (notification?.notification_type) {
            triggerRefetch();
            return;
        }
        // For handling notifications which are received while away from Overview/Details screens,
        // we check for any notifications over last 30 seconds.
        const recentNotifications = getNotificationsSince(30 * 1000) ?? [];
        if (recentNotifications.length > 0) {
            triggerRefetch();
        }
    }, [journeyId, notification?.notification_type]);
};

export default useJourneyNotificationSync;
