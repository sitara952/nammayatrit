// BannerStack.tsx
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { ChainedBanner } from './ChainedBanner';
import type { BannerConfig } from './types';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { StyleSheet } from 'react-native';

/**
 * `BannerStack` is a container component that renders a stack of bannerpopups,
 * each with animation, stacking offset, and dismiss logic.
 * It is typically used to display multiple banner popups in a cascading visual order.
 *
 * @param banners - An array of banner items. Each item contains:
 *   - `config`: The `BannerConfig` object defining the appearance and behavior of the banner.
 *   - `dismissType`: A `RideChecksType` value that identifies the condition for the banner.
 *   - `onDismiss`: Callback invoked with the `dismissType` when the banner is fully dismissed.
 *
 * @param containerStyle - The base style applied to the outer Animated container.
 * @param animatedStyle - An optional Reanimated style for animated transitions.
 * @param verticalOffset - The vertical spacing between each stacked banner (default: 6).
 * @param horizontalMargin - The horizontal margin applied to both sides of the banner (default: 5).
 * @param rideId - The current ride ID, passed down to each `ChainedBanner` for context-aware API handling.
 *
 * @returns A stack of `ChainedBanner` components positioned with stacking animation.
 */
export interface BannerStackItem {
    config: BannerConfig;
    dismissType: RideChecksType;
    onDismiss: (type: RideChecksType) => void;
}

export interface BannerStackProps {
    banners: BannerStackItem[];
    containerStyle: ViewStyle;
    animatedStyle: ViewStyle;
    verticalOffset: number;
    horizontalMargin: number;
    rideId: RideId | null;
    bookingId: BookingId | null;
}

export const BannerStack: React.FC<BannerStackProps> = ({
    banners,
    containerStyle,
    animatedStyle,
    verticalOffset = 6,
    horizontalMargin = 5,
    rideId,
    bookingId,
}) => {
    return (
        <Animated.View style={[styles.container, containerStyle, animatedStyle]}>
            {banners.map((item, index) => {
                const reversedIndex = banners.length - 1 - index;
                const shrinkAmount = reversedIndex * 10;

                return (
                    <Animated.View
                        key={item.config.bannerId || index}
                        style={[
                            styles.bannerWrapper,
                            {
                                top: index * verticalOffset,
                                left: horizontalMargin + shrinkAmount,
                                right: horizontalMargin + shrinkAmount,
                                zIndex: index + 1,
                            },
                        ]}>
                        <ChainedBanner
                            initialConfig={item.config}
                            style={{}}
                            onAllDismissed={() => {
                                item.onDismiss(item.dismissType);
                            }}
                            rideId={rideId}
                            bookingId={bookingId}
                        />
                    </Animated.View>
                );
            })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
    },
    bannerWrapper: {
        position: 'absolute',
    },
});
