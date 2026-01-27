import React, { useState, useEffect } from 'react';
import { View, Alert, Platform, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import { personDefaultEmergencyNumber } from '@/readOnly/api/types/PersonDefaultEmergencyNumber.gen';
import {
    requestContactsPermission,
    loadContactsFromDevice,
    convertContactsToAPIFormat,
    checkDuplicateContacts,
    filterContactsBySearch,
    groupContactsByLetter,
    getContactDisplayName,
    Contact,
} from '../HelperFunctions';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface ContactPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onContactsAdded: (contacts: personDefaultEmergencyNumber[]) => void;
    existingContacts: personDefaultEmergencyNumber[];
}

const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
    visible,
    onClose,
    onContactsAdded,
    existingContacts,
}) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Request contacts permission and load contacts when modal becomes visible
    useEffect(() => {
        if (visible) {
            handlePermissionAndLoadContacts();
        }
    }, [visible]);

    const handlePermissionAndLoadContacts = async () => {
        const hasPermission = await requestContactsPermission();
        if (hasPermission) {
            loadContacts();
        }
    };

    const loadContacts = async () => {
        const loadedContacts = await loadContactsFromDevice();
        setContacts(loadedContacts);
    };

    const handleContactSelection = (contact: Contact) => {
        setSelectedContacts(prev => {
            const isSelected = prev.some(c => c.recordID === contact.recordID);
            if (isSelected) {
                return prev.filter(c => c.recordID !== contact.recordID);
            } else {
                return [...prev, contact];
            }
        });
    };

    const handleAddSelectedContacts = async () => {
        try {
            if (selectedContacts.length === 0) {
                Alert.alert('No Contacts Selected', 'Please select at least one contact to add.');
                return;
            }

            // Convert selected contacts to the format expected by the API
            const contactsToAdd = convertContactsToAPIFormat(selectedContacts);

            // Check for duplicates
            const duplicateContacts = checkDuplicateContacts(contactsToAdd, existingContacts);

            if (duplicateContacts.length > 0) {
                Alert.alert(
                    'Duplicate Contacts',
                    `The following contacts are already added: ${duplicateContacts.map(c => c.name).join(', ')}`,
                );
                return;
            }

            // Call the callback with new contacts
            onContactsAdded(contactsToAdd);

            // Clear selection and close modal
            setSelectedContacts([]);
            onClose();
        } catch {
            Alert.alert('Error', 'Failed to process contacts. Please try again.');
        }
    };

    const handleClose = () => {
        setSelectedContacts([]);
        setSearchQuery('');
        onClose();
    };

    // Filter contacts based on search query
    const filteredContacts = filterContactsBySearch(contacts, searchQuery);

    // Group contacts by first letter
    const groupedContacts = groupContactsByLetter(filteredContacts);

    // Sort groups alphabetically
    const sortedGroups = Object.keys(groupedContacts).sort();

    const { top, bottom } = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleClose}>
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'white',
                    zIndex: 9999,
                }}>
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: top,
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: '#E5E5E5',
                        backgroundColor: 'white',
                    }}>
                    <TouchableOpacity
                        testID="close-contact-picker"
                        onPress={handleClose}
                        accessibilityRole="button"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#F5F5F5',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16,
                        }}>
                        <CloseIcon />
                    </TouchableOpacity>
                    <Typography
                        type="title-3"
                        style={{ color: '#333', flex: 1 }}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Choose Contacts
                    </Typography>
                </View>

                {/* Search Bar */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        backgroundColor: 'white',
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F5F5F5',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: Platform.OS === 'ios' ? 12 : 0,
                        }}>
                        <Typography
                            type="body-2"
                            style={{ color: '#999', marginRight: 8 }}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            🔍
                        </Typography>
                        <TextInput
                            style={{
                                flex: 1,
                                fontSize: 16,
                                color: '#333',
                            }}
                            accessibilityRole="search"
                            placeholder="Search name or number"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Contacts List */}
                <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                    {sortedGroups.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Typography
                                type="body-2"
                                style={{ color: '#666', textAlign: 'center' }}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {searchQuery
                                    ? 'No contacts found matching your search.'
                                    : 'No contacts found. Please check your contacts app.'}
                            </Typography>
                        </View>
                    ) : (
                        sortedGroups.map(letter => {
                            const contactsInGroup = groupedContacts[letter];
                            if (!contactsInGroup) return null;

                            return (
                                <View key={letter}>
                                    {/* Section Header */}
                                    <View
                                        style={{
                                            backgroundColor: '#F8F8F8',
                                            paddingHorizontal: 20,
                                            paddingVertical: 8,
                                        }}>
                                        <Typography
                                            type="title-3"
                                            style={{ color: '#666' }}
                                            numberOfLines={undefined}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {letter}
                                        </Typography>
                                    </View>

                                    {/* Contacts in this section */}
                                    {contactsInGroup.map(contact => {
                                        const isSelected = selectedContacts.some(c => c.recordID === contact.recordID);

                                        // Format phone number consistently for duplicate checking
                                        const phoneNumber = contact.phoneNumbers[0]?.number.replace(/\s/g, '') || '';
                                        const isDuplicate = existingContacts.some(
                                            existing => existing.mobileNumber === phoneNumber,
                                        );

                                        return (
                                            <TouchableOpacity
                                                key={contact.recordID}
                                                testID={`contact-${contact.recordID}`}
                                                accessibilityRole="button"
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingHorizontal: 20,
                                                    paddingVertical: 16,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: '#F0F0F0',
                                                    opacity: isDuplicate ? 0.5 : 1,
                                                }}
                                                onPress={() => !isDuplicate && handleContactSelection(contact)}
                                                disabled={isDuplicate}>
                                                {/* Initials Avatar */}
                                                <View
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: '#E5E5E5',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        marginRight: 16,
                                                    }}>
                                                    <Typography
                                                        type="body-2"
                                                        style={{ fontWeight: 'bold', color: '#666' }}
                                                        numberOfLines={undefined}
                                                        isAnimate={false}
                                                        accessible={true}
                                                        accessibilityLabel={undefined}
                                                        accessibilityRole={undefined}>
                                                        {getContactDisplayName(contact).charAt(0).toUpperCase()}
                                                    </Typography>
                                                </View>

                                                {/* Contact Info */}
                                                <View style={{ flex: 1 }}>
                                                    <Typography
                                                        type="body-2"
                                                        style={{ fontWeight: '500', color: '#333' }}
                                                        numberOfLines={undefined}
                                                        isAnimate={false}
                                                        accessible={true}
                                                        accessibilityLabel={undefined}
                                                        accessibilityRole={undefined}>
                                                        {getContactDisplayName(contact)}
                                                    </Typography>
                                                    {contact.phoneNumbers[0] && (
                                                        <Typography
                                                            type="subhead-1-rupee"
                                                            style={{ color: '#666' }}
                                                            numberOfLines={undefined}
                                                            isAnimate={false}
                                                            accessible={true}
                                                            accessibilityLabel={undefined}
                                                            accessibilityRole={undefined}>
                                                            {(() => {
                                                                const phoneNumber =
                                                                    contact.phoneNumbers[0].number.replace(/\s/g, '');
                                                                // Check if number already starts with +91 or other country code
                                                                if (
                                                                    phoneNumber.startsWith('+91') ||
                                                                    phoneNumber.startsWith('+')
                                                                ) {
                                                                    return phoneNumber;
                                                                } else {
                                                                    return `+91 ${phoneNumber}`;
                                                                }
                                                            })()}
                                                        </Typography>
                                                    )}
                                                    {isDuplicate && (
                                                        <Typography
                                                            type="body-2"
                                                            style={{ color: '#999', marginTop: 2 }}
                                                            numberOfLines={undefined}
                                                            isAnimate={false}
                                                            accessible={true}
                                                            accessibilityLabel={undefined}
                                                            accessibilityRole={undefined}>
                                                            Already added
                                                        </Typography>
                                                    )}
                                                </View>

                                                {/* Selection Indicator */}
                                                <View
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: isSelected ? '#007AFF' : '#CCC',
                                                        backgroundColor: isSelected ? '#007AFF' : 'transparent',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                    {isSelected && (
                                                        <Typography
                                                            type="body-2"
                                                            style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}
                                                            numberOfLines={undefined}
                                                            isAnimate={false}
                                                            accessible={true}
                                                            accessibilityLabel={undefined}
                                                            accessibilityRole={undefined}>
                                                            ✓
                                                        </Typography>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Bottom Button */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: bottom,
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5E5',
                        backgroundColor: 'white',
                    }}>
                    <Button
                        testID="confirm-trusted-contacts"
                        onPress={handleAddSelectedContacts}
                        text={`Confirm Trusted Contacts (${selectedContacts.length})`}
                        type="primary"
                        disabled={selectedContacts.length === 0}
                        style={{
                            height: 50,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    />
                </View>
            </View>
        </HardwareBackpressHandler>
    );
};

export default ContactPickerModal;
