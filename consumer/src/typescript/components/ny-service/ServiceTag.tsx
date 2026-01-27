import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { ServiceTagConfig } from '@/src-v2/systems/configs/types';
import { LottieWithFallback } from '../common/LottieWithFallback';

interface ServiceTagProps {
    config: ServiceTagConfig;
}

export const ServiceTag: React.FC<ServiceTagProps> = ({ config }) => {
    if (config.type === 'text') {
        if (!config.text) return null;

        return (
            <View style={[styles.tagContainer, { backgroundColor: config.bgColor || '#8F26FF' }]}>
                <Text style={[styles.tagText, { color: config.textColor || '#FFFFFF' }]}>{config.text}</Text>
            </View>
        );
    }

    if (config.type === 'image') {
        if (!config.url) return null;

        return (
            <Image
                source={{ uri: config.url }}
                style={styles.tagImage}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="service tag image"
            />
        );
    }

    if (config.type === 'lottie') {
        if (!config.url) return null;

        return (
            <LottieWithFallback
                source={{ uri: config.url }}
                style={styles.tagLottie}
                autoPlay={true}
                loop={true}
                fallback={undefined}
            />
        );
    }

    return null;
};

const styles = StyleSheet.create({
    tagContainer: {
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        alignSelf: 'center',
        marginTop: 7,
    },
    tagText: {
        fontSize: 9,
        fontFamily: 'AreaNormal-ExtraBold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tagImage: {
        width: 24,
        height: 24,
        alignSelf: 'center',
        marginTop: 7,
    },
    tagLottie: {
        width: 24,
        height: 24,
        alignSelf: 'center',
        marginTop: 7,
    },
});
