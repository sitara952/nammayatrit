import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop } from '@/typescript/components/common/BottomSheetBackdrop';
import PassCalendarIcon from '@/src-v2/assets/svg/PassCalendarIcon';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Button from '@/src-v2/primitives/Button';

interface BusPassActivationModalProps {
    validTillFormatted: string;
    onActivate: () => void;
    onCancel: () => void;
}

export const BusPassActivationModal = ({ validTillFormatted, onActivate, onCancel }: BusPassActivationModalProps) => {
    const { bottom } = useSafeAreaInsets();
    const { busPassActivationModalRef } = useRefsContext();

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                sheetRef={busPassActivationModalRef}
                onHardwareBackPress={() => {
                    onCancel();
                    return true;
                }}
                showBackdrop={true}
            />
        ),
        [busPassActivationModalRef, onCancel],
    );

    return (
        <BottomSheetModal
            ref={busPassActivationModalRef}
            backdropComponent={renderBackdrop}
            enableDynamicSizing
            handleComponent={null}
            style={tailwind.style('bg-white rounded-t-[32px]')}>
            <BottomSheetView style={tailwind.style(`px-6 pb-[${bottom + 16}px] pt-6`)}>
                <View style={tailwind.style('bg-white')}>
                    {/* Title */}
                    <Text
                        style={tailwind.style('text-[#313131] text-center text-[18px] font-areaNormal-extrabold mb-3')}>
                        Activate Pass
                    </Text>

                    {/* Message */}
                    <Text
                        style={tailwind.style(
                            'text-[#7E7E7E] text-center text-[15px] font-areaNormal-bold mb-6 leading-[20px]',
                        )}>
                        Are you sure you want to continue?{'\n'}Pass is scheduled to begin later. Validity{'\n'}
                        will start from today if activated.
                    </Text>

                    <View style={tailwind.style('flex-row items-center justify-center mb-6')}>
                        <Text
                            style={tailwind.style(
                                'text-[#EA4848] text-center text-[15px] font-areaNormal-bold leading-[20px] ml-1',
                            )}>
                            This action is not reversible.
                        </Text>
                    </View>

                    {/* Validity Card */}
                    <View
                        style={tailwind.style(
                            'rounded-[16px] p-4 flex-row items-center mb-6 border-2 border-[#EFEFEF]',
                        )}>
                        {/* Calendar Icon */}
                        <PassCalendarIcon fill="#22C55E" width={30} height={31} isToday={true} />

                        {/* Date Info */}
                        <View style={tailwind.style('flex-1 ml-2')}>
                            <Text style={tailwind.style('text-[#313131] text-[14px] font-areaNormal-extrabold mb-1')}>
                                From Today
                            </Text>
                            <Text style={tailwind.style('text-[#7E7E7E] text-[14px] font-areaNormal-regular')}>
                                Valid till {validTillFormatted}
                            </Text>
                        </View>
                    </View>

                    {/* Activate Button */}
                    <Button
                        onPress={onActivate}
                        testID="confirm-activate-button"
                        accessibilityLabel="Confirm Activate Pass"
                        type="primary"
                        style={tailwind.style('bg-[#047AEA] rounded-[16px] h-[56px] items-center justify-center mb-3')}>
                        <Text style={tailwind.style('text-white text-[16px] font-areaNormal-extrabold')}>
                            Activate Today
                        </Text>
                    </Button>

                    {/* Not Now Button */}
                    <Pressable
                        testID="cancel-activate-button"
                        onPress={onCancel}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel Activation"
                        style={tailwind.style('bg-[#E5E5E5] rounded-[16px] h-[56px] items-center justify-center')}>
                        <Text style={tailwind.style('text-[#313131] text-[16px] font-areaNormal-extrabold')}>
                            Not Now
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};
