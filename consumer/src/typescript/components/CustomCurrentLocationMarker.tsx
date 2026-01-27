import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { useAppSelector } from '../state/hooks';
import { selectCurrentLocation, selectAppConfig } from '../state/client/session';
import { Z_INDEX_DEFAULT_MARKER } from '../constants/common';

import CurrentLocationMarkerSvg from './CurrentLocationMarkerSvg';

interface CustomCurrentLocationMarkerProps {
    size: number | undefined;
}

const CustomCurrentLocationMarker: React.FC<CustomCurrentLocationMarkerProps> = ({ size = 95 }) => {
    const currentLocation = useAppSelector(selectCurrentLocation);
    const appConfig = useAppSelector(selectAppConfig);
    const markerColor = appConfig.uiConfig.currentLocationMarkerColor;

    if (!currentLocation?.lat || !currentLocation?.lng) {
        return null;
    }

    const coordinate = {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
    };

    return (
        <Marker
            key={`ny_ic_currentlocation_marker`}
            coordinate={coordinate}
            anchor={{ x: 0.5, y: 1.0 }}
            zIndex={Z_INDEX_DEFAULT_MARKER}
            tracksViewChanges={Platform.OS === 'ios'}>
            <View style={styles.container}>
                <CurrentLocationMarkerSvg width={size} height={size * 0.65} fill={markerColor} />
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CustomCurrentLocationMarker;
