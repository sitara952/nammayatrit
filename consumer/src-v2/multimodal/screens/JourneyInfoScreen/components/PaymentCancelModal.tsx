import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface PaymentCancelModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onCancelPayment?: () => void;
    amount?: number;
    domainType?: string;
}

export const PaymentCancelModal: React.FC<PaymentCancelModalProps> = ({
    sheetRef,
    onCancelPayment,
    amount,
    domainType,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleCancelConfirm = () => {
        sheetRef.current?.dismiss();
        onCancelPayment?.();
    };

    const handleCancelDismiss = () => {
        sheetRef.current?.dismiss();
    };
    return (
        <>
            <Animated.View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTicketInfo}>
                        {domainType === 'FRFSPassPurchase' ? 'Bus Pass Amount' : 'Ticket Amount'}: ₹{amount}
                    </Text>
                </View>

                <Text style={styles.modalTitle}>{userLanguageStrings.AreYouSureYouWantToCancelPayment}</Text>

                <Text style={styles.modalDescription}>{userLanguageStrings.PaymentRequestWillGetCancelled}</Text>

                <View style={styles.modalButtons}>
                    <Button
                        testID={'journey_info_confirm'}
                        onPress={handleCancelConfirm}
                        type={'primary'}
                        text={userLanguageStrings.YesCancel}
                        textColor={'#ffffff'}
                    />

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.noButton}
                        onPress={handleCancelDismiss}
                        testID="dismiss-cancel-button">
                        <Text style={styles.noButtonText}>{userLanguageStrings.No}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    modalTicketInfo: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    modalContent: {
        backgroundColor: '#F8F9FB',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
        borderRadius: 50,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'AreaNormal-Extrabold',
        color: '#1F2937',
        textAlign: 'left',
        marginBottom: 16,
        lineHeight: 24,
    },
    modalDescription: {
        fontSize: 15,
        color: '#6B7280',
        fontFamily: 'AreaNormal-Bold',
        textAlign: 'left',
        lineHeight: 25,
        marginBottom: 32,
        letterSpacing: 0.25,
    },
    modalButtons: {
        gap: 12,
    },
    cancelButton: {
        backgroundColor: '#374151',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    noButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    noButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    modalHeader: {
        alignItems: 'flex-start',
        marginBottom: 24,
    },
});
