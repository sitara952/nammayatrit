import React from 'react';
import { View } from 'react-native';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfile } from '@/typescript/state/client/user';
import { passAPIEntity as Pass } from '@/readOnly/api/types/PassAPIEntity.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type BusPassConfirmationModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    selectedPass: Pass;
};

export const BusPassConfirmationModal: React.FC<BusPassConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    selectedPass,
}) => {
    const { bottom } = useSafeAreaInsets();
    const userProfile = useAppSelector(selectUserProfile);
    console.warn('User Profile in Confirmation Modal:', userProfile);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleUploadSelfie = async () => {
        try {
            // TODO: Implement native image picker here
            // For now, simulate the picker delay and success

            // Simulate picker delay
            setTimeout(() => {
                // Close modal and proceed to payment
                onClose();
                // Call onConfirm to proceed with payment
                setTimeout(() => onConfirm(), 300);
            }, 1000);
        } catch (error) {
            console.error('Error picking image:', error);
            // Handle error - could show a toast or alert
        }
    };

    // Calculate valid till date (current date + 1 month)
    const validTillDate = React.useMemo(() => {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return nextMonth.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    }, []);

    return (
        <AnimatedModal visible={visible} setVisible={onClose} animationDuration={300} allowCloseOnBackdropPress={true}>
            <View style={[tailwind.style('bg-white rounded-2xl mx-3'), { marginBottom: bottom }]}>
                <View style={tailwind.style('items-center mb-4 p-6 pb-2')}>
                    <Typography
                        type="title-3"
                        style={tailwind.style('text-gray-800 mb-2 text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ConfirmPurchase}
                    </Typography>
                    <Typography
                        type="body"
                        style={tailwind.style('text-gray-600 text-center mb-2')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ConfirmPurchaseQuestion(selectedPass?.name || userLanguageStrings.BusPass)}
                    </Typography>
                    <Typography
                        type="callout"
                        style={tailwind.style('text-gray-700 text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ValidUpto(validTillDate)}
                    </Typography>
                </View>

                <View style={tailwind.style('flex-row justify-between')}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="confirm-modal-button"
                        onPress={handleUploadSelfie}
                        style={tailwind.style('flex-1 py-3 rounded-2xl shadow-md bg-[#016ACD]')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-center text-white text-lg')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Confirm}
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </AnimatedModal>
    );
};
