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
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type MuteJourneyConfirmModalProps = {
    onConfirmMute: () => void;
    onCancel: () => void;
    accessibilityRef: React.RefObject<View | null> | undefined;
    onModalContentReady: (() => void) | undefined;
};

export const MuteJourneyConfirmModal = forwardRef<BottomSheetModal, MuteJourneyConfirmModalProps>((props, ref) => {
    const { handlers: confirmHandlers, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
    const { handlers: cancelHandlers, animatedStyle: cancelAnimatedStyle } = useScaleAnimation();
    const { onConfirmMute, onCancel, accessibilityRef, onModalContentReady } = props;
    const configMangaer = useConfigContext();
    const userLanguageStrings = configMangaer.get('userLanguageStrings');

    useEffect(() => {
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

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={['35%']}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            handleComponent={null}
            backdropComponent={renderBackdrop}
            backgroundStyle={tailwind.style('rounded-[28px] bg-[#FFFFFF]')}>
            <BottomSheetView style={tailwind.style('flex-1 pt-8 px-5')}>
                <View ref={accessibilityRef}>
                    <Text style={tailwind.style('font-areaNormal-extrabold text-[16px] text-[#3B3A3C] text-center')}>
                        {userLanguageStrings.MuteJourney}
                    </Text>
                    <Text
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[14px] w-[80%] text-[#656565] pt-[12px] text-center mx-auto pb-[24px] leading-[24px]',
                        )}>
                        {userLanguageStrings.YouWillNotReceiveAnyNotificationsForThisJourneyAreYouSure}
                    </Text>
                    <Animated.View style={confirmAnimatedStyle}>
                        <Pressable
                            testID="mute-confirm-button"
                            onPress={onConfirmMute}
                            accessibilityLabel={'Mute button'}
                            accessibilityRole="button"
                            {...confirmHandlers}>
                            <View
                                style={[
                                    tailwind.style(
                                        'rounded-[16px] bg-[#FC443A] h-[56px] flex-row items-center justify-center mb-[12px]',
                                    ),
                                ]}>
                                <Text style={tailwind.style('font-areaNormal-extrabold text-[16px] text-white')}>
                                    {userLanguageStrings.Mute}
                                </Text>
                            </View>
                        </Pressable>
                    </Animated.View>
                    <Animated.View style={cancelAnimatedStyle}>
                        <Pressable
                            testID="mute-cancel-button"
                            onPress={onCancel}
                            accessibilityLabel={'Cancel button'}
                            accessibilityRole="button"
                            {...cancelHandlers}>
                            <View
                                style={[
                                    tailwind.style(
                                        'rounded-[20px] h-[56px] flex-row items-center justify-center bg-[#E5E5E5]',
                                    ),
                                ]}>
                                <Text style={tailwind.style('font-areaNormal-extrabold text-[16px] text-[#3B3A3C]')}>
                                    {userLanguageStrings.Cancel}
                                </Text>
                            </View>
                        </Pressable>
                    </Animated.View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});
