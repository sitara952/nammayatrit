import {
    BottomSheetBackdrop,
    BottomSheetBackgroundProps,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated from 'react-native-reanimated';
import { DoubleActionScreen } from './ChooseNameScreen';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useCallback } from 'react';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';

export const DoubleActionModal = ({
    doubleActionModalRef,
    onPrimaryAction,
    onSecondaryAction,
    title,
    subtitle,
    primaryButtonText,
    secondaryButtonText,
}: {
    doubleActionModalRef: React.RefObject<BottomSheetModal | null>;
    onPrimaryAction: () => void;
    onSecondaryAction: () => void;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    secondaryButtonText: string;
}) => {
    const { bottom } = useSafeAreaInsets();
    const renderBackdrop = useCallback(
        (props: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        ),
        [],
    );
    return (
        <BottomSheetModal
            ref={doubleActionModalRef}
            index={0}
            snapPoints={undefined}
            enableOverDrag={false}
            enableDynamicSizing={true}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={tailwind.style(`bg-[${homeSheetBg}] w-[38px]`)}
            backgroundStyle={tailwind.style(`bg-[${homeSheetBg}] rounded-t-[32px]`)}>
            <BottomSheetView>
                <Animated.View style={tailwind.style(` px-[24px] pb-[${bottom || 16}px]`)}>
                    <DoubleActionScreen
                        onPrimaryAction={onPrimaryAction}
                        onSecondaryAction={onSecondaryAction}
                        title={title}
                        subtitle={subtitle}
                        primaryButtonText={primaryButtonText}
                        secondaryButtonText={secondaryButtonText}
                    />
                </Animated.View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};
