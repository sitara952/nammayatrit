import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { TouchableOpacity } from '../../primitives/TouchableOpacity';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DeleteConfirmationModalProps } from './Types';
import { useConfigContext } from '../../../src/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isVisible, onConfirm, onCancel }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const styles = createStyles(themeColors);

    return (
        <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} style={styles.container}>
                    <Typography
                        type="body-2"
                        style={styles.title}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ReplaceAudio}
                    </Typography>

                    <Typography
                        type="body-1"
                        style={styles.message}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ThePreviousAudioNoteWillBeRemovedAndReplacedWithThisOne}
                    </Typography>

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.confirmButton}
                        onPress={onConfirm}
                        testID="delete-confirmation-confirm-button">
                        <Typography
                            type="callout"
                            style={styles.confirmButtonText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.YesReplace}
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.cancelButton}
                        onPress={onCancel}
                        testID="delete-confirmation-cancel-button-new">
                        <Typography
                            type="callout"
                            style={styles.cancelButtonText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Cancel}
                        </Typography>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: themeColors.Modal_overlay_color,
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: themeColors.Modal_content_bg_color,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 24,
            width: '100%',
            alignItems: 'center',
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: themeColors.Modal_title_text_color,
            paddingTop: 10,
            marginTop: 14,
            marginBottom: 8,
            textAlign: 'left',
            width: '100%',
        },
        message: {
            fontSize: 14,
            color: themeColors.Modal_message_text_color,
            textAlign: 'left',
            lineHeight: 20,
            marginBottom: 32,
            width: '100%',
        },
        confirmButton: {
            backgroundColor: themeColors.Modal_primary_button_bg_color,
            borderRadius: 10,
            paddingVertical: 16,
            paddingHorizontal: 32,
            width: '100%',
            alignItems: 'center',
            marginBottom: 16,
        },
        confirmButtonText: {
            color: themeColors.Modal_primary_button_text_color,
            fontWeight: '700',
            fontSize: 16,
        },
        cancelButton: {
            backgroundColor: themeColors.Modal_secondary_button_bg_color,
            borderRadius: 10,
            paddingVertical: 16,
            paddingHorizontal: 32,
            width: '100%',
            alignItems: 'center',
        },
        cancelButtonText: {
            color: themeColors.Modal_secondary_button_text_color,
            fontWeight: '600',
            fontSize: 16,
        },
    });
