import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { getMapSnapshotWithExpiryCheck } from '../../../../utils/mapSnapshotUtils';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';

interface MapPreviewProps {
    journeyId?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ journeyId }) => {
    const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
    const appConfig = useAppSelector(selectAppConfig);

    // Styling configuration for different image types
    const getImageConfig = (): { style: StyleProp<ImageStyle>; resizeMode: 'cover' | 'stretch' } => {
        // Default styling for normal snapshots and other fallback images
        return {
            style: {
                height: 146,
                width: '100%',
            },
            resizeMode: 'cover',
        };
    };

    useEffect(() => {
        const loadSnapshot = async () => {
            try {
                if (!journeyId) {
                    return;
                }
                const cachedSnapshot = getMapSnapshotWithExpiryCheck(journeyId);
                if (cachedSnapshot) {
                    setSnapshotUri(cachedSnapshot);
                } else if (appConfig.uiConfig.showMapFallback) {
                    setSnapshotUri('fallback');
                }
            } catch (error) {
                console.error('Failed to load map snapshot:', error);
            }
        };

        loadSnapshot();
    }, [journeyId]);

    return (
        <Animated.View style={tailwind.style('rounded-xl overflow-hidden mt-[22px]')}>
            <Animated.View style={tailwind.style('w-full h-[146px] bg-gray-200 rounded-[24px] ')}>
                <Image
                    accessible={true}
                    accessibilityLabel="map preview image"
                    source={
                        snapshotUri === 'fallback'
                            ? { uri: appConfig.assets.fallbackJourneyImageUri }
                            : snapshotUri
                              ? { uri: snapshotUri }
                              : { uri: '' }
                    }
                    style={[tailwind.style('w-full bg-gray-200'), getImageConfig().style]}
                    resizeMode={getImageConfig().resizeMode}
                />
            </Animated.View>
        </Animated.View>
    );
};
