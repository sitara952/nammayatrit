import React, { useState, useCallback, useEffect } from 'react';
import { Banner } from './Banner/Flow';
import { BannerConfig, APIEndpoint } from './types';
import { ViewStyle } from 'react-native';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { ValidBannerId } from './BannerRegistry';

/**
 * `ChainedBanner` is a wrapper component around the `Banner` component that supports
 * chaining banners one after another based on user interaction or configuration.
 *
 * It holds the current banner configuration in state, and can transition to a new banner
 * using `onChainBanner`. It also handles dismiss logic and triggers `onAllDismissed` when
 * the final banner in the chain is dismissed.
 *
 * @param initialConfig - The initial banner configuration to render.
 * @param style - A `ViewStyle` object to apply to the Banner's wrapper.
 * @param onAllDismissed - Optional callback fired once the banner (or final banner in a chain) is dismissed.
 * @param rideId - The ride identifier used for contextual API calls within the banner (e.g., reporting issues).
 *
 * @returns The currently active `Banner` component or `null` if all banners are dismissed.
 */
interface ChainedBannerProps {
    initialConfig: BannerConfig;
    style: ViewStyle;
    onAllDismissed?: () => void;
    rideId: RideId | null;
    bookingId: BookingId | null;
}

export const ChainedBanner: React.FC<ChainedBannerProps> = ({
    initialConfig,
    style,
    onAllDismissed,
    rideId,
    bookingId,
}) => {
    const [currentConfig, setCurrentConfig] = useState<BannerConfig | null>(initialConfig);

    useEffect(() => {
        if (currentConfig?.bannerId === initialConfig.bannerId) {
            const hasTextChanged =
                initialConfig.title !== currentConfig.title ||
                initialConfig.primaryButton?.text !== currentConfig.primaryButton?.text ||
                initialConfig.secondaryButton?.text !== currentConfig.secondaryButton?.text;

            if (hasTextChanged) {
                setCurrentConfig(initialConfig);
            }
        }
    }, [
        initialConfig.bannerId,
        initialConfig.title,
        initialConfig.primaryButton?.text,
        initialConfig.secondaryButton?.text,
    ]);

    const handleDismiss = useCallback(() => {
        setCurrentConfig(null);
        if (onAllDismissed) {
            onAllDismissed();
        }
    }, [onAllDismissed]);

    // The chaining callback
    const handleChainBanner = useCallback(
        (newConfig: BannerConfig, inherit: boolean) => {
            const maybeBannerId = currentConfig?.bannerId;
            const validBannerIds: ValidBannerId[] = [
                'acPreferenceBanner',
                'acPreferenceConfirmationBanner',
                'thankyouRideBanner',
                'thankyouRideBannerExtraFare',
                'sorryActionBanner',
                'sorryActionBannerExtraFare',
                'tollAndParkingIncludedBanner',
                'tollIncludedBanner',
                'parkingBanner',
                'driverDemandExtraBanner',
                'driverDemandExtraConfirmationBanner',
                'vehicleCleanlinessBanner',
            ];

            const isValidBannerId = (id: string | undefined): id is ValidBannerId => {
                if (id === undefined) return false;
                return validBannerIds.some(validId => validId === id);
            };

            const parentBannerId: ValidBannerId | null = isValidBannerId(maybeBannerId) ? maybeBannerId : null;

            const enrichedConfig: BannerConfig = {
                ...newConfig,
                parentBannerId,
                primaryButton: {
                    ...newConfig.primaryButton,
                    apiEndpoint:
                        inherit &&
                        currentConfig?.secondaryButton &&
                        newConfig.primaryButton.apiEndpoint === APIEndpoint.None
                            ? currentConfig.secondaryButton.apiEndpoint
                            : newConfig.primaryButton.apiEndpoint,
                },
            };

            setCurrentConfig(enrichedConfig);
        },
        [currentConfig],
    );

    if (!currentConfig) return null;

    const bannerKey = `${currentConfig.bannerId}-${currentConfig.title}-${currentConfig.primaryButton?.text}-${currentConfig.secondaryButton?.text}`;

    return (
        <Banner
            key={bannerKey}
            config={currentConfig}
            onDismiss={handleDismiss}
            onChainBanner={handleChainBanner}
            style={style}
            rideId={rideId}
            bookingId={bookingId}
        />
    );
};

export default ChainedBanner;
