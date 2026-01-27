import React, { useEffect } from 'react';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import AccessRestricted from '@/typescript/screens/AccessRestricted';
import { HomeScreenFragment } from './HomeScreenFragment';
import { HomeScreenFragmentProps } from './Types';
import { events, EventType } from '@/src-v2/systems/events/events';

export type HomeScreenViewProps = {
    userProfile: profileRes | null;
    enableLocationUnserviceable: boolean;
    isCurrentLocationServiceable: boolean | undefined;
    homeScreenFragmentState: HomeScreenFragmentProps;
};
export const HomeScreenView: React.FC<HomeScreenViewProps> = ({ userProfile, homeScreenFragmentState }) => {
    useEffect(() => {
        events.markFirstScreenRender(EventType.ON_CREATE_TO_HOME);
        logEvent(EventName.NY_HOME_SCREEN_RENDER);
    }, []);

    return userProfile?.isBlocked ? (
        <AccessRestricted restrictionType={userProfile?.isBlocked ? 'ACCOUNT_BLOCKED' : 'LOCATION_UNSERVICEABLE'} />
    ) : (
        <HomeScreenFragment {...homeScreenFragmentState} />
    );
};
