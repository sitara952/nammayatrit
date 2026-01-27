import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DeleteBusinessProfileModalProps {
    onDeleteAccount: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const DeleteBusinessProfileModal: React.FC<DeleteBusinessProfileModalProps> = ({
    onDeleteAccount,
    onCancel,
    isLoading = false,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: bottom }]}>
            <Typography
                type="subhead-800"
                style={styles.title}
                accessibilityLabel="Delete Business Account"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="header">
                {userLanguageStrings.DeleteBusinessAccount}
            </Typography>

            <Typography
                type="subhead"
                style={styles.message}
                accessibilityLabel="Are you sure you want to delete your business account?"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.AreYouSureYouWantToDeleteYourBusinessAccount}
            </Typography>

            <View style={styles.buttonContainer}>
                <Button
                    onPress={onDeleteAccount}
                    text={userLanguageStrings.DeleteAccount}
                    testID="delete-account-button"
                    type="primary"
                    size="lg"
                    bgColor={colors.neutral900}
                    textColor={colors.yellow650}
                    style={styles.deleteButton}
                    isLoading={isLoading}
                    disabled={isLoading}
                    accessible={true}
                    accessibilityLabel="Delete Account"
                    accessibilityRole="button"
                    accessibilityHint="Tap to delete your business account"
                />

                <Button
                    onPress={onCancel}
                    text={userLanguageStrings.Cancel}
                    testID="cancel-button"
                    type="secondary"
                    size="lg"
                    bgColor={colors.neutral100}
                    textColor={colors.neutral900}
                    style={styles.cancelButton}
                    disabled={isLoading}
                    accessible={true}
                    accessibilityLabel="Cancel"
                    accessibilityRole="button"
                    accessibilityHint="Tap to cancel deleting your business account"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
        backgroundColor: '#F8F8F8',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    title: {
        textAlign: 'left',
        color: '#14171F',
        marginBottom: 12,
        fontSize: 18,
    },
    message: {
        color: '#666666',
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
        textAlign: 'left',
    },
    buttonContainer: {
        gap: 12,
    },
    deleteButton: {
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DeleteBusinessProfileModal;
