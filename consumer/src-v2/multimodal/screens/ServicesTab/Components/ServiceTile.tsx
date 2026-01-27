import React from 'react';
import { StyleSheet, Text, Image, View } from 'react-native';
import { ServiceTileProps } from '../Types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

export const ServiceTile: React.FC<ServiceTileProps> = ({ service }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={service.onPress}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${service.title} service`}
            accessibilityRole="button"
            testID={`service-tile-${service.id}`}>
            <View style={styles.content}>
                <Text accessible={false} style={styles.title}>
                    {service.title}
                </Text>
                <Image
                    accessible={true}
                    accessibilityLabel="service image"
                    source={service.imageSource}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        margin: 8,
        flex: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        height: 100,
        position: 'relative',
    },
    title: {
        fontSize: 16,
        padding: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
        color: '#131211',
    },
    image: {
        position: 'absolute',
        right: -60,
        bottom: -60,
        width: '130%',
        height: '130%',
    },
});
