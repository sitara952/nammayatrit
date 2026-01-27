import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Callout } from 'react-native-maps';
import { useAppSelector } from '../state/hooks';

import { selectDistanceMovedWithRideId, selectPickupDistanceWithid } from '../state/client/ride';
import { RideId } from '../state/client/booking';

export type CustomCalloutProps = {
    description: string;
    routeId: string;
    rideId: RideId | null;
};

type CalloutContentProps = {
    routeId: string;
    pickupDistance: number;
    travlledDistance: number;
    displayText: string;
};
export const calculateDisplayDistance = (distanceMoved: number): { displayDistance: number; displayUnit: string } => {
    if (distanceMoved > 1000) {
        return {
            displayDistance: Number((distanceMoved / 1000).toFixed(1)),
            displayUnit: 'km',
        };
    } else {
        return {
            displayDistance: Number(distanceMoved.toFixed(0)),
            displayUnit: 'm',
        };
    }
};

const CalloutContent: React.FC<CalloutContentProps> = ({ routeId, pickupDistance, travlledDistance, displayText }) => {
    const { displayDistance, displayUnit } = calculateDisplayDistance(travlledDistance);

    return (
        <View
            style={styles.bubble}
            accessible={true}
            accessibilityLabel={
                pickupDistance > 0 && routeId === 'routeStart' ? `${displayDistance}${displayUnit} away` : displayText
            }>
            <View style={styles.amount}>
                {pickupDistance > 0 && routeId === 'routeStart' ? (
                    <Text style={styles.calloutText}>{`${displayDistance}${displayUnit} away`}</Text>
                ) : (
                    <Text style={styles.calloutText}>{displayText}</Text>
                )}
            </View>
        </View>
    );
};

const CustomCallout: React.FC<CustomCalloutProps> = ({ description, routeId, rideId }) => {
    const distanceMoved = useAppSelector(state => selectDistanceMovedWithRideId(state, rideId));
    const pickupDistance = useAppSelector(state => selectPickupDistanceWithid(state, rideId));

    const displayText = description.length > 10 ? `${description.substring(0, 10)}...` : description;

    return (
        <Callout
            key={`callout-${routeId}`}
            tooltip={true}
            alphaHitTest={true}
            onPress={() => {
                console.info('callout pressed');
            }}>
            <CalloutContent
                routeId={routeId}
                pickupDistance={pickupDistance}
                travlledDistance={distanceMoved}
                displayText={displayText}
            />
        </Callout>
    );
};

const styles = StyleSheet.create({
    bubble: {
        minWidth: 86,
        height: 24,
        backgroundColor: 'black',
        pointerEvents: 'auto',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    amount: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto',
    },
    calloutText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        pointerEvents: 'auto',
        lineHeight: 20,
        includeFontPadding: true,
        textAlignVertical: 'center',
    },
    arrow: {
        backgroundColor: 'black',
        borderWidth: 0,
        borderColor: 'transparent',
        borderTopColor: 'black',
        borderTopWidth: 16,
        borderRightWidth: 16,
        alignSelf: 'center',
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: 'black',
        alignSelf: 'center',
        marginTop: -0.5,
    },
});

export default CustomCallout;
