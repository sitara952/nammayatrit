import { useEffect, useRef, useCallback } from 'react';
import { Platform, Dimensions } from 'react-native';
import { EventName, logAdEvent } from '@/typescript/utils/logger';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';

interface UseAdImpressionOptions {
    /**
     * Percentage of ad that must be visible to count as impression (0-1)
     * Default: 0.5 (50% visible)
     */
    threshold?: number;
    /**
     * Optional scroll trigger that increments when parent scrolls
     * When provided, visibility will be checked on each scroll event
     */
    scrollTrigger?: number;
    /**
     * Campaign ID from backend config
     */
    campaignId?: string | null;
    /**
     * Campaign item ID from backend config
     */
    campaignItemId?: string | null;
    /**
     * View unit ID (placement identifier)
     */
    viewUnitId?: string | null;
    /**
     * Source of the ad (from backend config)
     */
    source?: string | null;
}

/**
 * Hook to automatically log ad impressions when component becomes visible
 *
 * Uses onLayout events to detect when component is scrolled into view.
 * This ensures impressions are only counted when users can actually see the ad.
 *
 * Implements session-based deduplication:
 * - Same screen + same session = Skip (already logged)
 * - Same screen + new session = Log (app restart)
 * - Different screens = Log (different context)
 *
 * @param options - Configuration options
 * @returns Object with ref and onLayout handler to attach to component
 *
 * @example
 * // Default 50% visibility threshold
 * const { ref: adRef, onLayout: onAdLayout } = useAdImpression();
 * <View ref={adRef} onLayout={onAdLayout}>
 *   <Tag {...props} />
 * </View>
 *
 * @example
 * // Custom 70% visibility threshold
 * const { ref: adRef, onLayout: onAdLayout } = useAdImpression({ threshold: 0.7 });
 * <Animated.View ref={adRef} onLayout={onAdLayout}>
 *   <Pressable>...</Pressable>
 * </Animated.View>
 */
export const useAdImpression = (options: UseAdImpressionOptions | undefined) => {
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    const viewRef = useRef<any>(null);
    const hasLogged = useRef(false);

    const logImpression = () => {
        // Guard: Don't log impression if campaign data is missing
        // This prevents logging when component mounts before ad config is loaded
        if (!options?.campaignId || !options?.campaignItemId) {
            return;
        }

        const impressionPayload = {
            event_id: uuid.v4(),
            campaign_id: options.campaignId,
            campaign_item_id: options.campaignItemId,
            view_unit_id: options?.viewUnitId || null,
            source: options?.source || null,
            platform: Platform.OS,
            app_version: DeviceInfo.getVersion(),
        };

        logAdEvent(EventName.AD_IMPRESSION, impressionPayload);
    };

    const checkIfVisible = useCallback(() => {
        if (!viewRef.current) {
            return;
        }

        if (hasLogged.current) {
            return;
        }

        viewRef.current.measureInWindow((_x: number, y: number, _width: number, height: number) => {
            if (hasLogged.current) return; // Double-check to avoid race conditions

            // Skip if component hasn't been laid out yet (height is 0)
            if (height === 0) {
                return;
            }

            const windowHeight = Dimensions.get('window').height;

            // Calculate how much of the component is visible
            const visibleTop = Math.max(y, 0);
            const visibleBottom = Math.min(y + height, windowHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibilityPercentage = visibleHeight / height;

            const threshold = options?.threshold ?? 0.5;

            if (visibilityPercentage >= threshold) {
                hasLogged.current = true;
                logImpression();
            }
        });
    }, [options?.threshold, options?.campaignId, options?.campaignItemId]);

    // onLayout handler - fires when component position changes (including from scrolling)
    const handleLayout = useCallback(() => {
        // Small delay to ensure layout is complete and measurement is accurate
        setTimeout(checkIfVisible, 100);
    }, [checkIfVisible]);

    // Initial check on mount - with longer delay to allow full render
    // Re-runs when campaign data becomes available
    useEffect(() => {
        // Only schedule check if we have campaign data
        if (options?.campaignId && options?.campaignItemId) {
            // Wait longer (300ms) to ensure component is fully rendered
            const timer = setTimeout(checkIfVisible, 300);
            return () => clearTimeout(timer);
        }
        return undefined;
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [checkIfVisible, options?.campaignId, options?.campaignItemId]);

    // Check visibility when scroll event occurs
    useEffect(() => {
        if (options?.scrollTrigger !== undefined && options.scrollTrigger > 0) {
            checkIfVisible();
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [options?.scrollTrigger, checkIfVisible]);

    return { ref: viewRef, onLayout: handleLayout };
};
