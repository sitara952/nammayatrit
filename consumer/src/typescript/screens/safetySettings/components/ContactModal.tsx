import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { ChooseContact } from '@/typescript/components/svg/ChooseContact';
import { AddContact } from '@/typescript/components/svg/AddContact';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface ContactModalProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onClose: () => void;
    onChooseFromContacts: () => void;
    onAddManually: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose, onChooseFromContacts, onAddManually }) => {
    return (
        <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Contacts</Text>
                <TouchableOpacity
                    testID="close-contact-modal"
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityRole="button">
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {/* Choose from contacts */}
                <TouchableOpacity
                    testID="choose-from-contacts-option"
                    style={styles.optionRow}
                    onPress={onChooseFromContacts}
                    activeOpacity={0.7}
                    accessibilityRole="button">
                    <View style={styles.optionIcon}>
                        <ChooseContact fill="#14171F" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Choose from contacts</Text>
                    </View>
                </TouchableOpacity>

                {/* Add manually */}
                <TouchableOpacity
                    testID="add-manually-option"
                    style={styles.optionRow}
                    onPress={onAddManually}
                    accessibilityRole="button"
                    activeOpacity={0.7}>
                    <View style={styles.optionIcon}>
                        <AddContact fill="#14171F" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Add Manually</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom indicator bar */}
            <View style={styles.bottomIndicator} />
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#14171F',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
    },
    optionsContainer: {
        paddingTop: 16,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    optionIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    optionContent: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#14171F',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    optionArrow: {
        width: 24,
        alignItems: 'center',
    },
    bottomIndicator: {
        position: 'absolute',
        bottom: 8,
        left: '50%',
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
    },
});

export default ContactModal;
