import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ChevronUp from '../../../assets/svg/symbols/ChevronUp';
import ChevronDownIcon from '../../../components/common/ChevronDownIcon';
import TrashIcon from '../../../../../src/resources/assets/png/ic_trash.webp';
import DeleteContactConfirmationModal from './DeleteContactConfirmationModal';
import { ContactColor } from '@/src-v2/utils/common';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface TrustedContactDetailProps {
    contactName: string;
    mobileNumber: string;
    avatarInitials: string;
    avatarColor: ContactColor;
    onDelete: (mobileNumber: string) => void;
    sheetRef: React.RefObject<BottomSheetModal | null>;
    onOptionSelect: (option: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE') => void;
    selectedOption: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE';
    options?: { label: string; value: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE' }[];
}

const TrustedContactDetail: React.FC<TrustedContactDetailProps> = ({
    contactName,
    mobileNumber,
    avatarInitials,
    avatarColor = ContactColor.Blue,
    onDelete,
    sheetRef,
    onOptionSelect,
    selectedOption,
    options = [
        { label: 'All rides shared automatically', value: 'ALWAYS_SHARE' },
        { label: 'Night rides shared automatically (9PM - 6AM)', value: 'SHARE_WITH_TIME_CONSTRAINTS' },
        { label: 'I will share rides manually', value: 'NEVER_SHARE' },
    ],
}) => {
    const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

    const getOptionText = (option: string) => {
        const selectedOptionConfig = options.find(opt => opt.value === option);
        return selectedOptionConfig?.label || '';
    };

    const getSelectedOptionText = () => {
        return getOptionText(selectedOption);
    };

    const toggleOptions = () => {
        setIsOptionsExpanded(!isOptionsExpanded);
    };

    const handleOptionSelect = (selectedValue: 'ALWAYS_SHARE' | 'SHARE_WITH_TIME_CONSTRAINTS' | 'NEVER_SHARE') => {
        onOptionSelect(selectedValue);
        setIsOptionsExpanded(false);
    };

    const handleDeletePress = () => {
        console.info('handleDeletePress');
        sheetRef.current?.present();
    };

    const handleConfirmDelete = () => {
        sheetRef.current?.dismiss();
        onDelete(mobileNumber);
    };

    const handleCancelDelete = () => {
        sheetRef.current?.dismiss();
    };

    return (
        <>
            <View style={styles.container}>
                {/* Top Section */}
                <View style={styles.topSection}>
                    {/* Avatar */}
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Typography
                            type="body-1"
                            style={styles.avatarText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {avatarInitials}
                        </Typography>
                    </View>

                    {/* Contact Details */}
                    <View style={styles.contactDetails}>
                        <Typography
                            type="body-1"
                            style={styles.contactName}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {contactName}
                        </Typography>
                        <Typography
                            type="body-1"
                            style={styles.mobileNumber}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {mobileNumber}
                        </Typography>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="delete-button"
                        style={styles.deleteButton}
                        onPress={handleDeletePress}>
                        <Image accessible={false} source={TrashIcon} resizeMode="contain" style={styles.deleteIcon} />
                    </TouchableOpacity>
                </View>

                {/* Bottom Section - Option Bar */}
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="option-bar"
                    style={styles.optionBar}
                    onPress={toggleOptions}>
                    <Typography
                        type="subhead-3"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {getSelectedOptionText()}
                    </Typography>
                    {isOptionsExpanded ? (
                        <ChevronUp width={16} height={16} color="#495057" />
                    ) : (
                        <ChevronDownIcon size={12} color="#495057" />
                    )}
                </TouchableOpacity>

                {/* Expanded Options */}
                {isOptionsExpanded && (
                    <View style={styles.expandedOptions}>
                        {options.map(option => (
                            <TouchableOpacity
                                accessibilityRole="button"
                                key={option.value}
                                testID={`option-${option.value}`}
                                style={[styles.optionItem, selectedOption === option.value && styles.selectedOption]}
                                onPress={() => handleOptionSelect(option.value)}>
                                <Typography
                                    type="subhead-3"
                                    style={[
                                        styles.optionItemText,
                                        selectedOption === option.value && styles.selectedOptionText,
                                    ]}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Delete Confirmation Modal */}
            <DeleteContactConfirmationModal
                sheetRef={sheetRef}
                contactName={contactName}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.1 },
        shadowOpacity: 0.1,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        width: 50,
        height: 40,
        borderRadius: 20,
    },
    avatarText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
    },
    contactDetails: {
        flex: 1,
    },
    contactName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    mobileNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7B8997',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F6F6F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    optionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f6f6f8',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 4,
        width: '100%',
    },

    expandedOptions: {
        marginTop: 8,
        marginHorizontal: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        overflow: 'hidden',
        width: '100%',
    },
    optionItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F4',
    },
    selectedOption: {
        backgroundColor: '#E3F2FD',
    },
    optionItemText: {
        color: '#495057',
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default TrustedContactDetail;
