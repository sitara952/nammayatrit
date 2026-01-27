import React, { memo, useCallback, useMemo } from 'react';
import { MainNavigationParamList, LiveTabParamList } from './globalParamList.tsx';
import { JourneyId, createJourneyId } from '../state/client/user';
import { PickupInstructionsFlow } from '@/src-v2/screens/PickupInstructions/Flow.tsx';
import { ProfiledRideConfirmed } from '@/src-v2/screens/RideConfirmed/Flow.tsx';
import { MultiTransitFeedback } from '@/src-v2/multimodal/screens/MultiTransitFeedback/Flow.tsx';
import { LiveJourneyDetailFlow } from '@/src-v2/multimodal/screens/LiveJourneyDetail/Flow.tsx';
import { JourneyPlanScreenFlow } from '@/src-v2/multimodal/screens/JourneyPlanScreen/Flow.tsx';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../state/hooks.ts';
import { selectLiveJourneyId } from '../state/client/session.ts';
import { selectLatestInprogressJourneyId } from '../state/client/journey.ts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const LiveStack = createNativeStackNavigator<LiveTabParamList>();

const MemoizedProfiledRideConfirmed = memo(() => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'taxiRideTracking'>>();
    return (
        <ProfiledRideConfirmed
            bookingId={route.params.bookingId}
            hideSideDrawer={false}
            multimodalProps={route.params.multimodalProps}
        />
    );
});

const MemoizedMultiTransitFeedback = memo<{ journeyId: JourneyId | null }>(({ journeyId }) => {
    const route = useRoute<RouteProp<LiveTabParamList, 'multiTransitFeedback'>>();
    const finalJourneyId = route.params?.multimodalProps?.journeyId ?? route.params?.journeyId ?? journeyId;
    return <MultiTransitFeedback journeyId={finalJourneyId} />;
});

const MemoizedLiveJourneyDetailFlow = memo<{ journeyId: JourneyId | null }>(({ journeyId }) => {
    const route = useRoute<RouteProp<LiveTabParamList, 'liveJourneyDetail'>>();
    const finalJourneyId = route.params?.multimodalProps?.journeyId ?? route.params?.journeyId ?? journeyId;
    if (!finalJourneyId) {
        return null;
    }
    return <LiveJourneyDetailFlow journeyId={finalJourneyId} />;
});

export const LiveStackNavigator: React.FC = memo(() => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'LiveTab'>>();
    const { screen } = route.params ?? {};
    const liveJourneyIdFromStore = useAppSelector(selectLiveJourneyId);
    const latestInProgressJourneyId = useAppSelector(selectLatestInprogressJourneyId);
    const liveJourneyId = liveJourneyIdFromStore ? createJourneyId(liveJourneyIdFromStore) : null;

    const fallbackJourneyId = useMemo(
        () => (latestInProgressJourneyId ? createJourneyId(latestInProgressJourneyId) : null),
        [latestInProgressJourneyId],
    );

    const journeyId = useMemo(() => {
        return liveJourneyId ?? fallbackJourneyId;
    }, [liveJourneyId, fallbackJourneyId]);

    const ProfiledRideConfirmedComponent = useCallback(() => {
        return <MemoizedProfiledRideConfirmed />;
    }, []);

    const MultiTransitFeedbackComponent = useCallback(() => {
        return <MemoizedMultiTransitFeedback journeyId={journeyId} />;
    }, [journeyId]);

    const LiveJourneyDetailFlowComponent = useCallback(() => {
        return <MemoizedLiveJourneyDetailFlow journeyId={journeyId} />;
    }, [journeyId]);

    return (
        <LiveStack.Navigator
            initialRouteName={screen ?? 'pickupInstructions'}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'none',
                statusBarAnimation: 'fade',
            }}>
            {/* Entry Screen */}
            <LiveStack.Screen name={'taxiRideTracking'} component={ProfiledRideConfirmedComponent} />
            <LiveStack.Screen name={'pickupInstructions'} component={PickupInstructionsFlow} />
            <LiveStack.Screen name={'multiTransitFeedback'} component={MultiTransitFeedbackComponent} />
            <LiveStack.Screen name={'journeyPlanScreen'} component={JourneyPlanScreenFlow} />
            <LiveStack.Screen name={'liveJourneyDetail'} component={LiveJourneyDetailFlowComponent} />
            <LiveStack.Screen name="DetailsNoAnim" component={ProfiledRideConfirmedComponent} />
        </LiveStack.Navigator>
    );
});
