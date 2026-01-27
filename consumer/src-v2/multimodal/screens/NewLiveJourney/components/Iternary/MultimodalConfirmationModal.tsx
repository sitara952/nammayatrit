import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { useScaleAnimation } from '../../../../../../src/typescript/utils/useScaleAnimation';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useAsyncAction } from '@/src-v2/multimodal/hooks/useAsyncAction';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type MultimodalConfirmationModalProps = {
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    heading: string;
    description: string | React.ReactElement;
    primaryButtonText: string;
    secondaryButtonText: string;
    accessibilityRef: React.RefObject<View | null> | undefined;
    onModalContentReady: (() => void) | undefined;
};

export const MultimodalConfirmationModal = forwardRef<BottomSheetModal, MultimodalConfirmationModalProps>(
    (props, ref) => {
        const { handlers: confirmHandlers, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
        const { handlers: cancelHandlers, animatedStyle: cancelAnimatedStyle } = useScaleAnimation();
        const {
            onConfirm,
            onCancel,
            heading,
            description,
            primaryButtonText,
            secondaryButtonText,
            accessibilityRef,
            onModalContentReady,
        } = props;
        const configManager = useConfigContext();
        const colors = configManager.get('themeColors');

        useEffect(() => {
            console.info('accessibilityRef?.current in modal', accessibilityRef?.current);
            if (accessibilityRef?.current && onModalContentReady) {
                onModalContentReady();
            }
        }, [accessibilityRef?.current]);

        const renderBackdrop = useCallback(
            (props: BottomSheetBackgroundProps) => (
                <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
            ),
            [],
        );

        const safeOnConfirm = React.useCallback(() => {
            const result = onConfirm();
            return result instanceof Promise ? result : Promise.resolve(result);
        }, [onConfirm]);
        const { bottom } = useSafeAreaInsets();
        const { execute: onConfirmAction, isLoading } = useAsyncAction(safeOnConfirm);
        return (
            <BottomSheetModal
                ref={ref}
                enableDynamicSizing={true}
                enablePanDownToClose={true}
                handleComponent={null}
                backdropComponent={renderBackdrop}
                backgroundStyle={tailwind.style('rounded-[28px] bg-[#FFFFFF]')}>
                <BottomSheetView style={{ flex: 1, paddingBottom: bottom, paddingTop: 20, paddingHorizontal: 20 }}>
                    <View ref={accessibilityRef} accessible={false}>
                        <View style={{ rowGap: 6 }}>
                            {heading ? (
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[16px] text-[#3B3A3C] text-center',
                                    )}
                                    accessible={true}
                                    accessibilityRole="header"
                                    accessibilityLabel={heading}>
                                    {heading}
                                </Text>
                            ) : null}
                            {description ? (
                                typeof description === 'string' ? (
                                    <Text
                                        style={tailwind.style(
                                            `font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] text-center mx-auto pb-[24px]`,
                                        )}
                                        accessible={true}
                                        accessibilityRole="header"
                                        accessibilityLabel={description}>
                                        {description}
                                    </Text>
                                ) : (
                                    description
                                )
                            ) : null}
                        </View>
                        {primaryButtonText ? (
                            <Animated.View style={confirmAnimatedStyle}>
                                <Pressable
                                    testID="complete-journey-button"
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={primaryButtonText + ' button'}
                                    onPress={onConfirmAction}
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
                        ) : null}
                        {secondaryButtonText ? (
                            <Animated.View style={cancelAnimatedStyle}>
                                <Pressable
                                    testID="favourites-cancel-delete-button"
                                    onPress={onCancel}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={secondaryButtonText + ' button'}
                                    {...cancelHandlers}>
                                    <View
                                        style={[
                                            tailwind.style(
                                                'rounded-[20px] h-[56px] flex-row items-center justify-center bg-[#E5E5E5]',
                                            ),
                                        ]}>
                                        <Text
                                            style={tailwind.style(
                                                'font-areaNormal-extrabold text-[16px] text-[#3B3A3C]',
                                            )}>
                                            {secondaryButtonText}
                                        </Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ) : null}
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    },
);
