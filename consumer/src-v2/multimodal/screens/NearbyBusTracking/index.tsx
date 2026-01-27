import React from 'react';
import { NearbyBusTrackingFlow } from './Flow';
import { selectAppConfig, selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import MapProvider from '@/typescript/Maps/MapProvider';
import HardwareBackPressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';

export const NearbyBusTrackingScreen: React.FC = () => {
    const appConfig = useAppSelector(selectAppConfig);
    const initialCoordinate = appConfig.merchantData.initialCoordinate;
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    return (
        <HardwareBackPressHandler>
            <MapProvider
                initialCoordinate={{
                    latitude: currentLocationCoords?.coords.latitude ?? initialCoordinate.latitude,
                    longitude: currentLocationCoords?.coords.longitude ?? initialCoordinate.longitude,
                }}
                mapId="NearByBusTracking"
                fitToMapElementFlag={true}>
                <NearbyBusTrackingFlow />
            </MapProvider>
        </HardwareBackPressHandler>
    );
};

export default NearbyBusTrackingScreen;
