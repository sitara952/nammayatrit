import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { useScaleAnimation } from '../../../../../../src/typescript/utils/useScaleAnimation';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useAsyncAction } from '@/src-v2/multimodal/hooks/useAsyncAction';
import { colors as color } from 'config-types/src/domain/default/themes/colors';
import { Pressable } from '@/src-v2/primitives/Pressable';

type SwitchToAutoConfirmationModalProps = {
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
};

export const SwitchToAutoConfirmationModal = forwardRef<BottomSheetModal, SwitchToAutoConfirmationModalProps>(
    (props, ref) => {
        const { handlers: confirmHandlers, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
        const { handlers: cancelHandlers, animatedStyle: cancelAnimatedStyle } = useScaleAnimation();
        const { onConfirm, onCancel, description, primaryButtonText, secondaryButtonText } = props;
        const configManager = useConfigContext();
        const colors = configManager.get('themeColors');

        const renderBackdrop = useCallback(
            (props: BottomSheetBackgroundProps) => (
                <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
            ),
            [],
        );

        const { execute: onConfirmAction, isLoading } = useAsyncAction(onConfirm);

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={['30%']}
                enableDynamicSizing={false}
                enablePanDownToClose={true}
                handleComponent={null}
                backdropComponent={renderBackdrop}
                backgroundStyle={tailwind.style(`rounded-[28px] bg-[${color.neutral100}]`)}>
                <BottomSheetView style={tailwind.style('flex-1 pt-8 px-5')}>
                    <View>
                        <Text
                            style={tailwind.style(
                                `font-areaNormal-extrabold text-[14px] w-[80%] text-[${color.gray665}] pt-[9px] text-center mx-auto pb-[24px] leading-[24px]`,
                            )}>
                            {description}
                        </Text>
                        <Animated.View style={confirmAnimatedStyle}>
                            <Pressable
                                testID="complete-journey-button"
                                onPress={onConfirmAction}
                                accessibilityLabel={`${primaryButtonText} button`}
                                accessibilityRole="button"
                                disabled={isLoading}
                                {...confirmHandlers}>
                                <View
                                    style={[
                                        tailwind.style(
                                            `rounded-[16px] bg-[${colors.Button_primary_default_fill_base}] h-[56px] flex-row items-center justify-center mb-[12px]`,
                                        ),
                                    ]}>
                                    {isLoading ? (
                                        <LottieWithFallback
                                            fallback={undefined}
                                            style={tailwind.style('w-[40px] h-[50px] m-auto')}
                                            source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                                            autoPlay
                                            loop
                                        />
                                    ) : (
                                        <Text
                                            style={tailwind.style(
                                                `font-areaNormal-extrabold text-[16px] text-[${colors.Button_Primary_Default_Text_Base}]`,
                                            )}>
                                            {primaryButtonText}
                                        </Text>
                                    )}
                                </View>
                            </Pressable>
                        </Animated.View>
                        <Animated.View style={cancelAnimatedStyle}>
                            <Pressable
                                testID="favourites-cancel-delete-button"
                                onPress={onCancel}
                                accessibilityRole="button"
                                accessibilityLabel={'Cancel button'}
                                {...cancelHandlers}>
                                <View
                                    style={[
                                        tailwind.style(
                                            `rounded-[20px] h-[56px] flex-row items-center justify-center bg-[${color.gray240}]`,
                                        ),
                                    ]}>
                                    <Text
                                        style={tailwind.style(
                                            `font-areaNormal-extrabold text-[16px] text-[${color.gray900}]`,
                                        )}>
                                        {secondaryButtonText}
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    },
);
