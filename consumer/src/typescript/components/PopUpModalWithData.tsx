import {
    BottomSheetBackgroundProps,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BottomSheetBackdrop } from './common/BottomSheetBackdrop';

interface Props extends BottomSheetModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    isScrollable: boolean;
    onHardwareBackPress: (() => void) | undefined; // Optional callback for custom backpress handling
    showBackdrop: boolean | undefined;
}

export const PopUpModalWithData: React.FC<Props> = ({
    children,
    onHardwareBackPress,
    sheetRef,
    isScrollable = false,
    showBackdrop = true,

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
        [sheetRef, onHardwareBackPress, showBackdrop],
    );

    const snapPoints =
        bottomSheetProps.enableDynamicSizing === false
            ? bottomSheetProps.snapPoints || ['50%'] // Default to 50% if not provided but required
            : undefined;

    return (
        <BottomSheetModal
            backgroundStyle={{ backgroundColor: themeColors.Fill_neutralUltraLow }}
            backdropComponent={renderBackdrop}
            enableOverDrag={false}
            enableDismissOnClose={true}
            enableDynamicSizing={true}
            bottomInset={0}
            handleComponent={null}
            ref={sheetRef}
            accessible={false}
            {...bottomSheetProps}
            snapPoints={snapPoints}>
            {({ data: modalData }) => {
                const content = React.isValidElement<{ data: string }>(children) //Change the type of data as per requirement
                    ? React.cloneElement(children, { data: modalData })
                    : typeof children === 'function'
                      ? children({ data: modalData })
                      : children;

                // Ensure content is not a Promise
                const resolvedContent =
                    React.isValidElement(content) ||
                    typeof content === 'string' ||
                    typeof content === 'number' ||
                    Array.isArray(content)
                        ? content
                        : null;

                return isScrollable ? (
                    <BottomSheetScrollView accessible={false}>{resolvedContent}</BottomSheetScrollView>
                ) : (
                    <BottomSheetView accessible={false}>{resolvedContent}</BottomSheetView>
                );
            }}
        </BottomSheetModal>
    );
};
