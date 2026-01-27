import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '../../../designSystem/components/primitives/Typography';
import { ContactColor } from '@/src-v2/utils/common';
import NameInitials from '@/typescript/designSystem/components/NameInitials';

export interface Contact {
    id: string;
    name: string;
    phone: string;
    initials: string;
    color: ContactColor;
}

export interface DefaultContactSelectorProps {
    contacts: Contact[];
    selectedContactId?: string;
    onContactSelect: (contactId: string) => void;
    title?: string;
}

const DefaultContactSelector: React.FC<DefaultContactSelectorProps> = ({
    contacts,
    selectedContactId,
    onContactSelect,
    title = 'Default Contact',
}) => {
    const handleContactSelect = (contactId: string) => {
        onContactSelect(contactId);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Typography
                type="body-1"
                style={styles.title}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {title}
            </Typography>

            {/* Contacts List */}
            <View style={styles.contactsCard}>
                {contacts.map(contact => (
                    <TouchableOpacity
                        accessibilityRole="button"
                        key={contact.id}
                        testID={`contact-selector-${contact.id}`}
                        style={styles.contactRow}
                        onPress={() => handleContactSelect(contact.id)}
                        activeOpacity={0.7}>
                        {/* Contact Avatar using NameInitials */}
                        <NameInitials
                            nameInitial={contact.initials}
                            style={[styles.avatar, { backgroundColor: contact.color }]}
                            textStyle={styles.avatarText}
                        />

                        {/* Contact Details */}
                        <View style={styles.contactDetails}>
                            <Typography
                                type="subhead-800"
                                style={styles.contactName}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {contact.name}
                            </Typography>
                            <Typography
                                type="body-1"
                                style={styles.contactPhone}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {contact.phone}
                            </Typography>
                        </View>

                        {/* Radio Button */}
                        <View style={styles.radioContainer}>
                            <View
                                style={[
                                    styles.radioButton,
                                    selectedContactId === contact.id && styles.radioButtonSelected,
                                ]}>
                                {selectedContactId === contact.id && <View style={styles.radioButtonInner} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#666666',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    contactsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        paddingVertical: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    avatar: {
        width: 50,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    contactDetails: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 14,
        color: '#666666',
    },
    radioContainer: {
        marginLeft: 8,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#000000',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000000',
    },
});

export default DefaultContactSelector;
