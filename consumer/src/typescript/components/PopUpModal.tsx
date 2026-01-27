import { useConfigContext } from '@/typescript/context/ConfigContext';
import {
    BottomSheetBackgroundProps,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop } from './common/BottomSheetBackdrop';

interface Props extends BottomSheetModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    isScrollable: boolean;
    onHardwareBackPress: (() => void) | undefined; // Optional callback for custom backpress handling
    showBackdrop: boolean | undefined;
    borderRadius?: number;
    showHandle?: boolean;
    handleStyle?: {
        backgroundColor: string | undefined;
        width: number | undefined;
        height: number | undefined;
        borderRadius: number | undefined;
    };
}

export const PopUpModal: React.FC<Props> = ({
    children,
    onHardwareBackPress,
    sheetRef,
    isScrollable = false,
    showBackdrop = true,
    borderRadius = 16,
    showHandle = false,
    handleStyle,
    handleComponent = null,
    ...bottomSheetProps
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const renderBackdrop = React.useCallback(
        (backdropProps: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop
                sheetRef={sheetRef}
                onHardwareBackPress={onHardwareBackPress}
                {...backdropProps}
                showBackdrop={showBackdrop}
            />
        ),
        [sheetRef, onHardwareBackPress],
    );

    const renderHandle = React.useCallback(() => {
        if (!showHandle) return null;

        const defaultHandleStyle = {
            backgroundColor: themeColors.Border_neutralMidLow || '#E0E0E0',
            width: 42,
            height: 4,
            borderRadius: 2,
        };

        const combinedHandleStyle = { ...defaultHandleStyle, ...handleStyle };

        return (
            <View style={styles.handleContainer}>
                <View style={[styles.handle, combinedHandleStyle]} />
            </View>
        );
    }, [showHandle, handleStyle, themeColors]);

    // Determine the final handle component to use
    const finalHandleComponent = showHandle ? handleComponent || renderHandle : null;

    // Determine snapPoints based on enableDynamicSizing
    const snapPoints =
        bottomSheetProps.enableDynamicSizing === false
            ? bottomSheetProps.snapPoints || ['50%'] // Default to 50% if not provided but required
            : undefined;

    return (
        <BottomSheetModal
            backgroundStyle={{ backgroundColor: themeColors.Fill_neutralUltraLow, borderRadius }}
            backdropComponent={renderBackdrop}
            enableOverDrag={false}
            enableDismissOnClose={true}
            enableDynamicSizing={true}
            bottomInset={0}
            handleComponent={finalHandleComponent}
            ref={sheetRef}
            accessible={false}
            {...bottomSheetProps}
            snapPoints={snapPoints}>
            {isScrollable ? (
                <BottomSheetScrollView accessible={false}>
                    {typeof children === 'function' ? null : children}
                </BottomSheetScrollView>
            ) : (
                <BottomSheetView accessible={false}>{typeof children === 'function' ? null : children}</BottomSheetView>
            )}
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handle: {
        // Default styles are applied via the renderHandle function
    },
});
