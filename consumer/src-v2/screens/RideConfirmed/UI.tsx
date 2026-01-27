import { latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';

import { RideConfirmedFragmentProps } from './Types.tsx';
import RideConfirmedFragment from './RideConfirmedFragment.tsx';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen.tsx';
import { PostRideStartFragment, PostRideStartFragmentProps } from './components/PostRideStartFragment.tsx';
import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { FeatureFlags } from '@/src-v2/systems/configs/types.ts';
import MapProvider from '@/typescript/Maps/MapProvider.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';
// import { init } from '@sentry/react-native';
// import { initialCoordinate } from '@/storage/Constants.bs.js';

export type RideConfirmedViewProps = {
    rideDetails: rideAPIEntity | null;
    lastKnownLocation: location | null;
    featureFlags: FeatureFlags;
    onHardwareBackPress: () => void;
    rideConfirmedFragmentState: RideConfirmedFragmentProps;
    postRideStartFragmentState: PostRideStartFragmentProps;
};

const _RideConfirmedView: React.FC<RideConfirmedViewProps> = ({
    rideDetails,
    lastKnownLocation,
    featureFlags,
    onHardwareBackPress,
    rideConfirmedFragmentState,
    postRideStartFragmentState,
}) => {
    return (
        <Animated.View style={tailwind.style('relative flex-1')} accessible={false}>
            <HardwareBackpressHandler onHardwareBackPress={onHardwareBackPress}>
                <MapProvider
                    initialCoordinate={
                        {
                            latitude: lastKnownLocation?.lat, //?? initialCoordinate.latitude,
                            longitude: lastKnownLocation?.lng, //?? initialCoordinate.longitude,
                        } as latLng
                    }
                    mapId="MapAfterRide"
                    hidden={false}
                    fitToMapElementFlag={true}>
                    <>
                        {rideDetails && rideDetails?.status !== 'NEW' && featureFlags.postRideStartFragment && (
                            <PostRideStartFragment {...postRideStartFragmentState} />
                        )}
                        <RideConfirmedFragment {...rideConfirmedFragmentState} />
                    </>
                </MapProvider>
            </HardwareBackpressHandler>
        </Animated.View>
    );
};

export const RideConfirmedView = _RideConfirmedView;
