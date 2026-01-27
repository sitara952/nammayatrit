import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DropdownCardProps } from '../schema';
import ChevronDown from '../../../../assets/svg/symbols/ChevronDown';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const DropdownCard: React.FC<DropdownCardProps> = ({ value, options, onChange, marginVertical, visibility = true }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Don't render if visibility is false
    if (!visibility) {
        return null;
    }

    const selectedOption = options.find(option => option.value === value);
    const selectedLabel = selectedOption?.label || options[0]?.label || '';

    const handleOptionSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsExpanded(false);
    };

    const toggleDropdown = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={[styles.container, { marginVertical: marginVertical || 0 }]}>
            {/* Selected option display */}
            <TouchableOpacity
                accessibilityRole="button"
                testID={`dropdown-card-}`}
                style={styles.selectedOptionContainer}
                onPress={toggleDropdown}
                activeOpacity={0.7}>
                <Text style={styles.selectedOptionText}>{selectedLabel}</Text>
                <ChevronDown height={20} width={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Dropdown options */}
            {isExpanded && (
                <View style={styles.dropdownOptions}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            accessibilityRole="button"
                            key={option.value}
                            style={[styles.optionItem, index === options.length - 1 && styles.lastOption]}
                            onPress={() => handleOptionSelect(option.value)}
                            activeOpacity={0.7}
                            testID={''}>
                            <Text style={[styles.optionText, option.value === value && styles.selectedOptionText]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Description */}
            {/* {description && (
                <Text style={styles.description}>{description}</Text>
            )} */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginHorizontal: 15,
    },
    selectedOptionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    selectedOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212529',
        flex: 1,
    },
    chevron: {
        width: 20,
        height: 20,
        color: '#6c757d',
    },
    dropdownOptions: {
        marginTop: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        overflow: 'hidden',
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    optionText: {
        fontSize: 16,
        color: '#495057',
    },
    description: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 12,
        lineHeight: 20,
    },
});

export default DropdownCard;
