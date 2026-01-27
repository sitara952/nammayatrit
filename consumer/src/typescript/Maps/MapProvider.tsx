import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { LatLng } from 'react-native-maps';

interface GMapWrapperProps {
    children: React.ReactNode;
    initialCoordinate?: LatLng;
    hidden?: boolean;
    animatedCircle?: React.ReactNode;
    mapId: string;
    fitToMapElementFlag: boolean | undefined;
    zoomLevel?: number;
}
import { MapContext } from './MapContext';
import MapComponent, { MapRef } from './MapComponent';

export const usePreventMapPressOnMarker = () => {
    const ref = useRef(false);

    const onMarkerPress = () => {
        ref.current = true;
        setTimeout(() => (ref.current = false), 50);
    };

    const shouldAllowMapPress = () => !ref.current;

    return { onMarkerPress, shouldAllowMapPress };
};

const MapProvider: React.FC<GMapWrapperProps> = ({
    children,
    initialCoordinate,
    animatedCircle,
    hidden = false,
    mapId = '',
    fitToMapElementFlag = true,
    zoomLevel,
}) => {
    const mapRef = useRef<MapRef>(null);

    const { shouldAllowMapPress, onMarkerPress } = usePreventMapPressOnMarker();

    const gmapOnPress = useCallback(() => {
        if (!shouldAllowMapPress()) return;
        mapRef?.current?.turnOffAllCallouts();
    }, [mapRef]);

    return (
        <MapContext.Provider value={{ mapRef, shouldAllowMapPress, onMarkerPress }}>
            <View style={styles.wrapper} pointerEvents="box-none" accessible={false}>
                {children}
            </View>
            <MapComponent
                ref={mapRef}
                initialCoordinate={initialCoordinate}
                animatedCircle={animatedCircle}
                hidden={hidden}
                mapId={mapId}
                fitToMapElementFlag={fitToMapElementFlag}
                zoomLevel={zoomLevel}
                onPress={gmapOnPress}
            />
        </MapContext.Provider>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF00',
    },
});

export default MapProvider;
