import { BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useRefsContext } from '../../context/RefsContext';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { Pressable } from '@/src-v2/primitives/Pressable';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';

type BottomSheetBackdropProps = BottomSheetBackgroundProps & {
    sheetRef: React.RefObject<BottomSheetModal | null> | undefined;
    onHardwareBackPress: (() => void) | undefined;
    showBackdrop: boolean | undefined;
};

export const BottomSheetBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    const { animatedIndex, style, sheetRef, onHardwareBackPress, showBackdrop = true } = props;
    /**
     * Add all the refs of sheet modals which needs to close on overlay press
     */
    const {
        errorStateBottomsheetModalRef,
        rideConfirmedBottomsheetModalRef,
        rideSafetyModalRef,
        rideConfirmedChatBottomsheetRef,
        journeyInfoModalRef,
        developerSettingsModalRef,
        multimodalWarningModalRef,
        cancelTicketConfirmationRef,
    } = useRefsContext();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
        };
    });

    const handleBackdropPress = () => {
        if (!sheetRef?.current) return;

        const excludedSheets = [
            errorStateBottomsheetModalRef,
            rideSafetyModalRef,
            journeyInfoModalRef,
            developerSettingsModalRef,
            multimodalWarningModalRef,
            cancelTicketConfirmationRef,
        ];

        const isExcludedSheet = excludedSheets.some(ref => ref === sheetRef);
        const isRideConfirmedSheet =
            sheetRef === rideConfirmedBottomsheetModalRef || sheetRef === rideConfirmedChatBottomsheetRef;

        // Handle excluded sheets - don't dismiss and don't call callback
        if (isExcludedSheet) return;

        // Handle ride confirmed sheets - only call callback
        if (isRideConfirmedSheet) {
            if (onHardwareBackPress) {
                onHardwareBackPress();
            }
            return;
        }

        // Handle regular sheets - dismiss and call callback
        sheetRef.current.dismiss({ overshootClamping: true });
        if (onHardwareBackPress) {
            onHardwareBackPress();
        }
    };

    const handleBackPress = useCallback(() => {
        if (!sheetRef?.current) return false;
        handleBackdropPress();
        return true;
    }, [sheetRef, onHardwareBackPress]);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(handleBackPress, 1000, [handleBackPress]);

    return showBackdrop ? (
        <Pressable
            testID={'bottom_sheet_backdrop_clicked'}
            onPress={handleBackdropPress}
            style={style}
            importantForAccessibility="no-hide-descendants"
            accessibilityRole="button"
            accessibilityLabel="Backdrop"
            accessible={false}>
            {Platform.OS === 'ios' ? (
                <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                    <BlurView style={[style]} blurType="extraDark" blurAmount={50} ignoreSafeArea={true} />
                </Animated.View>
            ) : (
                <Animated.View
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }, style, animatedStyle]}
                />
            )}
        </Pressable>
    ) : null;
};
