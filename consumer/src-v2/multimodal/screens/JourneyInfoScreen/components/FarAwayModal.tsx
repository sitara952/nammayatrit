import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Button from '@/src-v2/primitives/Button';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FarAwayModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onContinue: () => void;
    onCancel: () => void;
    amount?: string;
}

export const FarAwayModal: React.FC<FarAwayModalProps> = ({ sheetRef, onContinue, onCancel, amount }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();

    const buttonText = amount
        ? `${userLanguageStrings.BookBus || 'Book Bus'} ${amount}`
        : userLanguageStrings.BookBus || 'Book Bus';

    return (
        <PopUpModal
            sheetRef={sheetRef}
            isScrollable={false}
            onHardwareBackPress={onCancel}
            enableDynamicSizing={true}
            borderRadius={32}
            onDismiss={onCancel}
            showBackdrop={true}>
            <Animated.View
                style={tailwind.style(
                    `px-[20px] pt-[24px] pb-[${bottom + 20}px] bg-white rounded-t-[32px] items-center`,
                )}>
                <Animated.Text
                    style={tailwind.style('text-[18px] font-areaNormal-extrabold text-[#3B3A3C] text-center mb-4')}>
                    {userLanguageStrings.YouAreFarAwayFromStop}
                </Animated.Text>

                <Animated.Text
                    style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#656565] text-center mb-6')}>
                    {userLanguageStrings.ConfirmBookingFarAway}
                </Animated.Text>

                <View style={tailwind.style('w-full')}>
                    <Button
                        type="primary"
                        text={buttonText}
                        onPress={onContinue}
                        size="lg"
                        style={tailwind.style('w-full flex justify-center h-15')}
                        textStyle={tailwind.style('text-[16px] font-areaNormal-extrabold')}
                        testID="far-away-modal-continue"
                    />
                </View>
            </Animated.View>
        </PopUpModal>
    );
};
