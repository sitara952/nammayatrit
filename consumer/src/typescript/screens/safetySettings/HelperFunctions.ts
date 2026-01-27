import { Platform, Alert, PermissionsAndroid, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { SafetyContext } from './rules/schema';
import { RideShareOptions_rideShareOptions } from '../../../readOnly/api/types/Enums.gen';
import { personDefaultEmergencyNumberAPIEntity } from '../../../readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { personDefaultEmergencyNumber } from '../../../readOnly/api/types/PersonDefaultEmergencyNumber.gen';
import Contacts from 'react-native-contacts';

// Define proper types for the contact card
interface DefaultContactCardProps {
    name: string;
    description: string;
}

interface DefaultContactCard {
    type: 'DefaultContactCard';
    props: DefaultContactCardProps;
}

// Contact interface for helper functions
export interface Contact {
    recordID: string;
    displayName: string | null;
    givenName: string | null;
    familyName: string | null;
    phoneNumbers: Array<{
        label: string;
        number: string;
    }>;
}

// Helper function to request phone call permission
export const requestPhonePermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            // Android requires explicit CALL_PHONE permission
            const result = await request(PERMISSIONS.ANDROID.CALL_PHONE);
            return result === RESULTS.GRANTED;
        } else {
            // iOS doesn't require explicit permission for making phone calls
            // Phone calls via tel: links work automatically
            return true;
        }
    } catch (error) {
        console.error('Phone permission request failed:', error);
        return false;
    }
};

// Helper function to handle auto call toggle with permission request
export const handleAutoCallToggle = async (value: boolean, setDraft: SafetyContext['setDraft']): Promise<void> => {
    if (value) {
        // When enabling auto call, request phone permission first
        const hasPermission = await requestPhonePermission();
        if (hasPermission) {
            setDraft(prev => ({ ...prev, autoCallDefaultContact: true }));
        } else {
            // Permission denied, don't enable the setting
            console.warn('Phone permission denied, cannot enable auto call');
        }
    } else {
        // When disabling, no permission needed
        setDraft(prev => ({ ...prev, autoCallDefaultContact: false }));
    }
};

// Helper function to generate default contact card components
export const generateDefaultContactCard = (
    isAutoCallEnabled: boolean,
    emergencyContacts: personDefaultEmergencyNumberAPIEntity[],
): DefaultContactCard[] => {
    if (isAutoCallEnabled) {
        if (emergencyContacts && emergencyContacts.length > 0) {
            // Find the contact with priority 1 (default contact)
            const defaultContact = emergencyContacts.find(contact => contact.priority === 1);

            if (defaultContact) {
                return [
                    {
                        type: 'DefaultContactCard',
                        props: {
                            name: defaultContact.name,
                            description: 'This contact will be called automatically in emergencies',
                        },
                    },
                ];
            }
        } else {
            // No contacts available
            return [
                {
                    type: 'DefaultContactCard',
                    props: {
                        name: 'No contacts added',
                        description: "You haven't added any contacts yet. Add contacts to enable automatic calling.",
                    },
                },
            ];
        }
    }
    return [];
};

// Helper function to safely get emergency setting value
export const getEmergencySettingValue = (
    value: RideShareOptions_rideShareOptions | undefined,
): RideShareOptions_rideShareOptions => {
    if (value === 'ALWAYS_SHARE' || value === 'NEVER_SHARE' || value === 'SHARE_WITH_TIME_CONSTRAINTS') {
        return value;
    }
    return 'NEVER_SHARE'; // Default fallback
};

// Helper function to check if value is ALWAYS_SHARE
export const isSharingRide = (value: RideShareOptions_rideShareOptions | undefined): boolean => {
    return (
        getEmergencySettingValue(value) === 'ALWAYS_SHARE' ||
        getEmergencySettingValue(value) === 'SHARE_WITH_TIME_CONSTRAINTS'
    );
};

// Helper function to handle contact selection and priority management
export const handleContactSelection = (
    contactId: string,
    currentContacts: personDefaultEmergencyNumberAPIEntity[],
    setDraft: SafetyContext['setDraft'],
): void => {
    console.info('Contact selected:', contactId);

    // Find the selected contact index
    const selectedIndex = currentContacts.findIndex(contact => contact.mobileNumber === contactId);

    if (selectedIndex !== -1) {
        // Create updated contacts with new priorities and store in draft
        const updatedContacts = currentContacts.map((contact, index) => {
            if (index === selectedIndex) {
                // Selected contact gets priority 0 (highest priority)
                return {
                    ...contact,
                    priority: 0,
                };
            } else {
                // Other contacts get priority based on their position
                // If they were before selected contact, add 1 to their priority
                // If they were after selected contact, keep their relative position
                const newPriority = index < selectedIndex ? index + 1 : index;
                return {
                    ...contact,
                    priority: newPriority,
                };
            }
        });

        // Store updated contacts in draft state (don't call API yet)
        setDraft(prev => ({
            ...prev,
            selectedDefaultContactId: contactId,
            updatedEmergencyContacts: updatedContacts,
        }));

        console.info('Contact priorities updated in draft state');
    }
};

// Helper function to request contacts permission
export const requestContactsPermission = async (): Promise<boolean> => {
    try {
        // Check if Contacts module is available first
        if (!Contacts) {
            Alert.alert('Error', 'Contacts module not available. Please check if the library is properly installed.');
            return false;
        }

        if (Platform.OS === 'android') {
            // Request runtime permission - following the basic example pattern
            const permission = PermissionsAndroid.PERMISSIONS['READ_CONTACTS'];
            if (!permission) {
                Alert.alert('Error', 'Contacts permission not available on this device.');
                return false;
            }

            const granted = await PermissionsAndroid.request(permission, {
                title: 'Contacts Permission',
                message: 'This app would like to view your contacts.',
                buttonPositive: 'Please accept',
            });
            if (granted !== PermissionsAndroid.RESULTS['GRANTED']) {
                Alert.alert('Permission Denied', 'Contacts permission is required to add emergency contacts.');
                return false;
            }
            return true;
        } else {
            // iOS permission handling - simplified approach
            try {
                const currentPermission = await Contacts.checkPermission();

                if (currentPermission === 'authorized') {
                    return true;
                } else {
                    const permission = await Contacts.requestPermission();

                    if (permission === 'authorized') {
                        return true;
                    } else {
                        Alert.alert(
                            'Contacts Permission Required',
                            'Please enable contacts access in Settings > Privacy & Security > Contacts to add emergency contacts.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Open Settings',
                                    onPress: () => {
                                        Linking.openSettings();
                                    },
                                },
                            ],
                        );
                        return false;
                    }
                }
            } catch {
                Alert.alert('Permission Error', 'Failed to check contacts permission. Please try again.');
                return false;
            }
        }
    } catch {
        Alert.alert('Error', 'Failed to request contacts permission. Please try again.');
        return false;
    }
};

// Helper function to load contacts from device
export const loadContactsFromDevice = async (): Promise<Contact[]> => {
    try {
        // Check if Contacts module is available
        if (!Contacts) {
            Alert.alert('Error', 'Contacts module not available. Please check if the library is properly installed.');
            return [];
        }

        // Check if getAll method exists
        if (typeof Contacts.getAll !== 'function') {
            Alert.alert('Error', 'Contacts module not properly initialized. Please restart the app.');
            return [];
        }

        const allContacts = await Contacts.getAll();

        if (allContacts.length === 0) {
            Alert.alert('No Contacts', 'No contacts found on your device. Please check your contacts app.');
            return [];
        }

        // Filter contacts that have phone numbers and valid display names
        const contactsWithPhones = allContacts.filter(contact => {
            const hasPhone = contact.phoneNumbers && contact.phoneNumbers.length > 0;

            // iOS contacts often use givenName + familyName instead of displayName
            const hasDisplayName = contact.displayName;
            const hasGivenName = contact.givenName;
            const hasFamilyName = contact.familyName;

            // Create a fallback name if displayName is undefined
            const contactName =
                hasDisplayName ||
                (hasGivenName || hasFamilyName ? `${hasGivenName || ''} ${hasFamilyName || ''}`.trim() : '');

            const hasName = contactName && contactName.length > 0;
            const isValid = hasPhone && hasName;

            return isValid;
        });

        if (contactsWithPhones.length === 0) {
            Alert.alert('No Valid Contacts', 'No contacts with phone numbers found. Please check your contacts app.');
            return [];
        }

        return contactsWithPhones;
    } catch (error) {
        if (error instanceof Error && error.message.includes('getAll')) {
            Alert.alert(
                'Contacts Error',
                'Failed to load contacts. This might be due to:\n\n1. Library not properly linked\n2. App needs to be restarted\n3. Native module not available\n\nPlease try restarting the app.',
            );
        } else {
            Alert.alert('Error', 'Failed to load contacts. Please try again.');
        }
        return [];
    }
};

// Helper function to clean phone number (extract 10 digits)
export const cleanPhoneNumber = (phoneNumber: string): string => {
    const removeCountryCode = (num: string): string => {
        if (num.startsWith('+91')) return num.substring(3);
        if (num.startsWith('+')) {
            const match = num.match(/\+(\d+)(\d{10})/);
            return match?.[2] || num;
        }
        return num;
    };

    const extractDigits = (num: string): string => {
        const digitsOnly = num.replace(/\D/g, '');
        return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : num;
    };

    const numberWithoutCode = removeCountryCode(phoneNumber);
    return extractDigits(numberWithoutCode);
};

// Helper function to convert contacts to API format
export const convertContactsToAPIFormat = (selectedContacts: Contact[]): personDefaultEmergencyNumber[] => {
    return selectedContacts.map((contact, index) => {
        const phoneNumber = contact.phoneNumbers[0]?.number.replace(/\s/g, '') || '';
        const cleanPhoneNumberValue = cleanPhoneNumber(phoneNumber);

        return {
            name: getContactDisplayName(contact),
            mobileNumber: cleanPhoneNumberValue,
            mobileCountryCode: '+91', // Default to India, can be made dynamic later
            priority: index,
            shareTripWithEmergencyContactOption: 'ALWAYS_SHARE',
            enableForFollowing: false,
        };
    });
};

// Helper function to check for duplicate contacts
export const checkDuplicateContacts = (
    newContacts: personDefaultEmergencyNumber[],
    existingContacts: personDefaultEmergencyNumber[],
): personDefaultEmergencyNumber[] => {
    return newContacts.filter(newContact =>
        existingContacts.some(existing => existing.mobileNumber === newContact.mobileNumber),
    );
};

// Helper function to get a consistent contact name
export const getContactDisplayName = (contact: Contact): string => {
    return contact.displayName || `${contact.givenName || ''} ${contact.familyName || ''}`.trim() || 'Unknown Contact';
};

// Helper function to filter contacts based on search query
export const filterContactsBySearch = (contacts: Contact[], searchQuery: string): Contact[] => {
    return contacts.filter(contact => {
        // Use the helper function for consistent name handling
        const contactName = getContactDisplayName(contact);

        // Search in the robust name
        const nameMatch = contactName.toLowerCase().includes(searchQuery.toLowerCase());

        // Search in phone numbers
        const phoneMatch = contact.phoneNumbers.some(phone => phone.number.includes(searchQuery));

        return nameMatch || phoneMatch;
    });
};

// Helper function to group contacts by first letter
export const groupContactsByLetter = (contacts: Contact[]): Record<string, Contact[]> => {
    return contacts.reduce<Record<string, Contact[]>>((groups, contact) => {
        // Use the helper function for consistent name handling
        const contactName = getContactDisplayName(contact);

        const firstLetter = contactName.charAt(0).toUpperCase() || '#';
        const existingGroup = groups[firstLetter] || [];
        return {
            ...groups,
            [firstLetter]: [...existingGroup, contact],
        };
    }, {});
};
