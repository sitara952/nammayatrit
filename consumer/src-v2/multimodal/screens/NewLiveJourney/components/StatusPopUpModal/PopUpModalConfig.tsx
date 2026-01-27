import React, { ReactNode } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { ComponentProps } from 'react';

type BasePopUpModalProps = ComponentProps<typeof PopUpModal>;

type PopUpModalConfigProps = Partial<Omit<BasePopUpModalProps, 'sheetRef' | 'children' | 'backgroundStyle'>> & {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    children: ReactNode;
    // eslint-disable-next-line myCustomPlugin/enforce-optional-params
    style?: string | undefined;
    // eslint-disable-next-line myCustomPlugin/enforce-optional-params
    showBackdrop?: boolean | undefined;
    onClosePress: () => void;
};

export const PopUpModalConfig: React.FC<PopUpModalConfigProps> = ({
    sheetRef,
    children,
    style,
    enableDynamicSizing = true,
    snapPoints = ['90%'],
    isScrollable = true,
    onHardwareBackPress = undefined,
    showBackdrop = true,
    onClosePress,
    ...props
}) => {
    return (
        <PopUpModal
            sheetRef={sheetRef}
            isScrollable={isScrollable}
            enableDynamicSizing={enableDynamicSizing}
            onHardwareBackPress={onHardwareBackPress}
            onDismiss={onClosePress}
            snapPoints={snapPoints}
            backgroundStyle={tailwind.style('rounded-[28px] bg-[#FFDF6A]', style)}
            showBackdrop={showBackdrop}
            {...props}>
            {children}
        </PopUpModal>
    );
};
