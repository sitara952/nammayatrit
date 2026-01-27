import Animated from 'react-native-reanimated';
import React from 'react';
import MapProvider from '@/typescript/Maps/MapProvider.tsx';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { LatLng } from 'react-native-maps';
import { FollowRideScreen } from './Flow';
import { latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { selectCurrentFollower } from '@/typescript/state/client/user';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { RouteProp, useRoute } from '@react-navigation/native';

export interface FollowRideWrapperProps {
    defaultFollower: followers | null;
    shouldOpenChat?: boolean;
}

export const FollowRideWrapper = () => {
    const route: RouteProp<{ params: FollowRideWrapperProps }, 'params'> = useRoute();
    const defaultFollower = route.params.defaultFollower;
    const shouldOpenChat = route.params.shouldOpenChat ?? false;
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const followerFromStore = useAppSelector(selectCurrentFollower);

    const currentFollowerLocation =
        currentLocationCoords &&
        ({
            latitude: currentLocationCoords.coords.latitude,
            longitude: currentLocationCoords.coords.longitude,
        } as LatLng);

    const currentFollower = defaultFollower ?? followerFromStore;

    return (
        <Animated.View style={tailwind.style('relative flex-1')} accessible={false}>
            {currentFollower && (
                <MapProvider
                    initialCoordinate={
                        {
                            latitude: currentFollowerLocation?.latitude,
                            longitude: currentFollowerLocation?.longitude,
                        } as latLng
                    }
                    mapId={'MapAfterRide'}
                    hidden={false}
                    children={<FollowRideScreen currentFollower={currentFollower} shouldOpenChat={shouldOpenChat} />}
                    fitToMapElementFlag={true}
                />
            )}
        </Animated.View>
    );
};
