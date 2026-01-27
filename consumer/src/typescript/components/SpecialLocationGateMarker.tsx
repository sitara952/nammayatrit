import mtIcPickupGate from '../../resources/assets/png/mt_ic_pickup_gate.webp';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

interface Props {
    active?: boolean;
}

const SpecialLocationGateMarker: React.FC<Props> = () => {
    const currMarker: ImageSourcePropType = mtIcPickupGate;

    return (
        <Image
            source={currMarker}
            style={styles.image}
            accessible={true}
            accessibilityLabel="special location gate marker image"
        />
    );
};

const styles = StyleSheet.create({
    image: {
        width: 15,
        height: 15,
    },
});

export default SpecialLocationGateMarker;
