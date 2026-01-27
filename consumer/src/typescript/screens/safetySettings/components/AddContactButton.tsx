import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { AddContactButtonProps } from '../rules/schema';

const AddContactButton: React.FC<AddContactButtonProps> = ({ onPress, visibility = true, isEditMode = false }) => {
    // Don't render if visibility is false
    if (!visibility) {
        return null;
    }

    const handlePress = () => {
        if (onPress) {
            onPress();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                accessibilityRole="button"
                testID="add-more-contacts-button"
                onPress={handlePress}
                style={styles.button}
                activeOpacity={0.7}>
                <Typography
                    type="body-1"
                    style={styles.buttonText}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Add Contact button"
                    accessibilityRole={undefined}>
                    Add Contact
                </Typography>
            </TouchableOpacity>

            {/* Manual sharing instruction - only visible when not in edit mode */}
            {!isEditMode && (
                <View style={styles.instructionBox}>
                    <Typography
                        type="body-subtext"
                        style={styles.instructionText}
                        numberOfLines={2}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Manual sharing instruction"
                        accessibilityRole={undefined}>
                        You can also share manually with anybody using the share button
                    </Typography>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    button: {
        backgroundColor: '#F1F2F7',
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 1,
        // borderColor: '#E0E0E0',
        // color: '#F1F2F7'
    },
    buttonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '600',
    },
    instructionBox: {
        backgroundColor: '#fff2e3',
        borderRadius: 15,
        padding: 16,
        marginTop: 12,
    },
    instructionText: {
        fontSize: 14,
    },
});

export default AddContactButton;
