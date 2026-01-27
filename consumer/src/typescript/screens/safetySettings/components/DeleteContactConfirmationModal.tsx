import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface DeleteContactConfirmationModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    contactName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteContactConfirmationModal: React.FC<DeleteContactConfirmationModalProps> = ({
    sheetRef,
    contactName,
    onConfirm,
    onCancel,
}) => {
    const { bottom } = useSafeAreaInsets();
    return (
        <PopUpModal
            sheetRef={sheetRef}
            isScrollable={false}
            showBackdrop={true}
            onHardwareBackPress={onCancel}
            enableDynamicSizing={true}>
            <View style={[styles.modalContent, { paddingBottom: bottom }]}>
                {/* Title */}
                <Typography
                    style={styles.modalTitle}
                    type={'body-4'}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Remove {contactName}
                </Typography>
                <View
                    style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: '#f7f7f7',
                        marginVertical: 12,
                    }}></View>

                {/* Message */}
                <Typography
                    style={styles.modalMessage}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Are you sure you want to remove them from your trusted contacts?
                </Typography>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        testID="cancel-delete-button"
                        type="secondary"
                        text="Cancel"
                        onPress={onCancel}
                        style={styles.button}
                    />
                    <Button
                        testID="confirm-delete-button"
                        type="primary"
                        text="Yes, Remove"
                        onPress={onConfirm}
                        style={styles.button}
                    />
                </View>
            </View>
        </PopUpModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 200,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 10,
        fontWeight: '500',
    },
    buttonContainer: {
        // borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        gap: 0,
    },
    button: {
        // flex: 1,
        // minWidth: 0, // Prevents overflow
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 150,
        // backgroundColor: 'red',
    },
});

export default DeleteContactConfirmationModal;
