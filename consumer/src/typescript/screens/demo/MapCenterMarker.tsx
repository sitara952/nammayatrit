import React from 'react';
import { Marker, LatLng } from 'react-native-maps';
import { View } from 'react-native';

type MapCenterMarkerProps = {
    coordinate: LatLng;
};

const MapCenterMarker = ({ coordinate }: MapCenterMarkerProps): React.JSX.Element => {
    return (
        <Marker coordinate={coordinate}>
            <View
                style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderRadius: 50,
                    padding: 5,
                }}></View>
        </Marker>
    );
};

export default MapCenterMarker;
