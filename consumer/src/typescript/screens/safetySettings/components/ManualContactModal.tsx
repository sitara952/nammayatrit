import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Keyboard } from 'react-native';
import Button from '@/src-v2/primitives/Button';
import { useProfileDefaultEmergencyNumbersPostMutation } from '../../../../api/integrations/rtk/ProfileDefaultEmergencyNumbersPost';
import { personDefaultEmergencyNumber } from '../../../../readOnly/api/types/PersonDefaultEmergencyNumber.gen';
import { updateProfileDefaultEmergencyNumbersReq } from '../../../../readOnly/api/types/UpdateProfileDefaultEmergencyNumbersReq.gen';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface ManualContactModalProps {
    onContactAdded: () => void;
    existingContacts?: personDefaultEmergencyNumber[];
    onDismiss?: () => void;
}

const ManualContactModal: React.FC<ManualContactModalProps> = ({
    onContactAdded,
    existingContacts = [],
    onDismiss,
}) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [name, setName] = useState('');
    const [addContactMutation, { isLoading }] = useProfileDefaultEmergencyNumbersPostMutation();
    const { addContactManuallyRef, manageContactsRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    // Function to validate and format mobile number input (numbers only)
    const handleMobileNumberChange = (text: string) => {
        // Remove all non-numeric characters
        const numericOnly = text.replace(/[^0-9]/g, '');
        setMobileNumber(numericOnly);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        addContactManuallyRef.current?.dismiss();
        if (onDismiss) {
            onDismiss();
        }
    };

    const handleSave = async () => {
        // Validate inputs
        if (!mobileNumber.trim()) {
            Alert.alert('Error', 'Please enter a mobile number');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        // Validate mobile number format (basic validation for Indian numbers)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobileNumber.trim())) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        // Create new contact
        const newContact: personDefaultEmergencyNumber = {
            mobileCountryCode: '+91', // Default to India, can be made dynamic
            mobileNumber: mobileNumber.trim(),
            name: name.trim(),
            enableForFollowing: true,
            priority: existingContacts.length,
            shareTripWithEmergencyContactOption: 'ALWAYS_SHARE',
        };

        // Create the request payload with existing contacts + new contact
        const requestPayload: updateProfileDefaultEmergencyNumbersReq = {
            defaultEmergencyNumbers: [...existingContacts, newContact],
        };

        console.info('Adding contact:', newContact);
        console.info('Request payload:', requestPayload);

        // Make API call
        await addContactMutation({ body: requestPayload })
            .unwrap()
            .then(() => {
                manageContactsRef.current?.dismiss();
                Alert.alert('Success', 'Contact added successfully!');
                onContactAdded();
                setMobileNumber('');
                setName('');
                handleClose();
            })
            .catch(error => {
                console.error('Failed to add contact:', error);
                Alert.alert('Error', 'Failed to add contact. Please try again.');
            });
    };

    return (
        <View style={[styles.modalContent, { paddingBottom: bottom }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    testID="a09c945f-3f25-4a40-bc57-4f647c4a33e3"
                    style={[tailwind.style('justify-self-start')]}
                    onPress={handleClose}
                    accessibilityLabel="Go Back button"
                    accessibilityRole="button">
                    <ChevronLeftIcon />
                </Pressable>
                <Text style={styles.headerTitle}>Add Contact Manually</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
                {/* Mobile Number Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter Mobile Number </Text>
                    <BottomSheetTextInput
                        testID="mobile-number-input"
                        style={styles.textInput}
                        value={mobileNumber}
                        onChangeText={handleMobileNumberChange}
                        placeholder="Enter mobile number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        maxLength={10}
                        autoFocus={true}
                    />
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter Name</Text>
                    <BottomSheetTextInput
                        testID="name-input"
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter contact name"
                        placeholderTextColor="#999"
                        maxLength={50}
                    />
                </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <Button
                    testID="save-contact-button"
                    type="primary"
                    text={isLoading ? 'Saving...' : 'Save'}
                    onPress={handleSave}
                    disabled={isLoading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#666',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    inputContainer: {
        paddingTop: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#333',
    },
    buttonContainer: {
        paddingTop: 24,
        paddingBottom: 16,
    },
});

export default ManualContactModal;
