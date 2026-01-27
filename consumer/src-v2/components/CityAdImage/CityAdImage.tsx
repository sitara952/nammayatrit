import React from 'react';
import { Image, View, Linking, Platform } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCityConfig } from '@/typescript/state/client/session';
import { selectAdConfigByPlacement } from '@/typescript/state/client/adConfig';
import { CityAdImageProps } from './types';
import { logAdEvent, EventName } from '@/typescript/utils/logger';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';
import { useAdImpression } from '@/typescript/hooks/useAdImpression';

const CityAdImage: React.FC<CityAdImageProps> = (props: CityAdImageProps) => {
    const {
        imageSource: _imageSource,
        testID,
        viewUnitId,
        containerStyle,
        useAnimatedView = false,
        additionalCondition = true,
    } = props;

    const cityBaseAdImageConfig = useAppSelector(state => selectCityConfig(state, 'city_base_ad_image'));
    const adConfig = useAppSelector(state => selectAdConfigByPlacement(state, viewUnitId));

    const { ref: adRef, onLayout: onAdLayout } = useAdImpression({
        threshold: 0.5,
        campaignId: adConfig?.campaign_id,
        campaignItemId: adConfig?.campaign_item_id,
        viewUnitId: viewUnitId,
        source: adConfig?.source,
    });

    // Check global config first (acts as kill switch)
    if (!cityBaseAdImageConfig?.enabled || !additionalCondition) {
        return null;
    }

    // Check if backend config exists for this viewUnitId
    if (!adConfig) {
        // No backend config for this placement, hide ad
        return null;
    }

    const handlePress = () => {
        const eventPayload = {
            event_id: uuid.v4(),
            campaign_id: adConfig.campaign_id,
            campaign_item_id: adConfig.campaign_item_id,
            view_unit_id: viewUnitId,
            source: adConfig.source,
            platform: Platform.OS,
            app_version: DeviceInfo.getVersion(),
        };

        logAdEvent(EventName.AD_CLICK, eventPayload);

        // Open URL after logging click - use backend redirect_url
        if (adConfig.redirect_url) {
            Linking.openURL(adConfig.redirect_url);
        }
    };

    // Use asset_url from backend config
    const imageUri = adConfig.asset_url;

    const imageComponent = (
        <View
            style={[
                {
                    height: 120,
                    borderRadius: 8,
                    overflow: 'hidden',
                },
            ]}>
            <TouchableOpacity
                testID={testID}
                onPress={handlePress}
                style={{ width: '100%', height: '100%' }}
                accessible={true}
                accessibilityLabel="Tap to view offer"
                accessibilityRole="button">
                <Image
                    accessible={true}
                    accessibilityLabel="city ad image"
                    source={{
                        uri: imageUri,
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );

    if (useAnimatedView) {
        return (
            <Animated.View ref={adRef} onLayout={onAdLayout} layout={LinearTransition} style={containerStyle}>
                {imageComponent}
            </Animated.View>
        );
    }

    return (
        <View ref={adRef} onLayout={onAdLayout} style={containerStyle}>
            {imageComponent}
        </View>
    );
};

export default CityAdImage;
