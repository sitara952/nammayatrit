import React, { useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useIssuePostMutation } from '../../../../src/api/integrations/rtk/IssuePost';
import { setToastProps } from '@/typescript/state/client/session';
import { genericErrorToastProps } from '@/typescript/state/middleware';
import { useDispatch } from 'react-redux';
import { useIssueCategoryGetQuery } from '../../../../src/api/integrations/rtk/IssueCategoryGet';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

export type ModalStep = 'FORM_INPUT' | 'SUCCESS';

interface RaiseTicketModalProps {
    visible: boolean;
    handleClose: () => void;
    currentStep: ModalStep;
    setCurrentStep: React.Dispatch<React.SetStateAction<ModalStep>>;
    issueDescription: string;
    setIssueDescription: React.Dispatch<React.SetStateAction<string>>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RaiseTicketModal: React.FC<RaiseTicketModalProps> = ({
    visible,
    handleClose,
    currentStep,
    setCurrentStep,
    issueDescription,
    setIssueDescription,
    isSubmitting,
    setIsSubmitting,
}) => {
    const [issuePostMutation] = useIssuePostMutation();
    const dispatch = useDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { bottom } = useSafeAreaInsets();
    const styles = createStyles(themeColors, bottom);

    // Fetch issue categories
    const { data: categoriesData } = useIssueCategoryGetQuery({ language: undefined });
    // Helper function to find category ID synchronously
    const getCategoryId = useCallback(
        (categoryLabel: string): string | null => {
            if (!categoriesData?.categories) {
                return null;
            }
            const matchingCategory = categoriesData.categories.find(
                (category: issueCategoryRes) => category.label === categoryLabel,
            );
            return matchingCategory ? matchingCategory.issueCategoryId : null;
        },
        [categoriesData],
    );

    const handleSubmit = async () => {
        if (!issueDescription.trim()) {
            const toastProps = genericErrorToastProps('Please describe your issue before submitting.');
            dispatch(setToastProps(toastProps));
            return;
        }

        setIsSubmitting(true);

        try {
            const categoryId = getCategoryId('APP_RELATED');
            if (!categoryId) {
                const toastProps = genericErrorToastProps('Unable to determine issue category. Please try again.');
                dispatch(setToastProps(toastProps));
                return;
            }

            const issueRequest = {
                categoryId: categoryId,
                chats: [],
                createTicket: true,
                description: issueDescription.trim(),
                mediaFiles: [],
                optionId: undefined,
                rideId: undefined,
                ticketBookingId: undefined,
            };

            await issuePostMutation({
                language: 'en', // Default language
                body: issueRequest,
            }).unwrap();

            setCurrentStep('SUCCESS');
        } catch (error) {
            console.info('🎫 ISSUE_DEBUG: Failed to submit issue:', error);
            const toastProps = genericErrorToastProps('Failed to submit your issue. Please try again.');
            dispatch(setToastProps(toastProps));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFormInput = () => (
        <KeyboardAwareScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="always">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Typography
                        type="sub-body-700"
                        style={styles.title}
                        numberOfLines={0}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Raise a ticket"
                        accessibilityRole={undefined}>
                        Raise a ticket
                    </Typography>
                </View>

                <View style={styles.content}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Describe your issue. We will try to resolve it in under 24 hours."
                        value={issueDescription}
                        onChangeText={setIssueDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        maxLength={500}
                        accessibilityLabel="Issue description text input"
                        accessibilityHint="Enter details about your issue"
                    />

                    <Button
                        testID="raise-ticket-submit-button"
                        type="primary"
                        text={isSubmitting ? 'Submitting...' : 'Submit Details'}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !issueDescription.trim()}
                        style={[
                            styles.submitButton,
                            (!issueDescription.trim() || isSubmitting) && styles.submitButtonDisabled,
                        ]}
                        textStyle={styles.submitButtonText}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );

    const renderSuccess = () => (
        <View style={styles.container}>
            <View style={styles.successContent}>
                <Typography
                    type="sub-body-700"
                    style={styles.successTitle}
                    numberOfLines={0}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Ticket submitted successfully"
                    accessibilityRole="button">
                    Ticket submitted!
                </Typography>

                <Typography
                    type="sub-body-700"
                    style={styles.successDescription}
                    numberOfLines={0}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Success message"
                    accessibilityRole="button">
                    Your ticket has been submitted successfully. Our team will review it and follow up shortly.
                </Typography>

                <Button
                    testID="raise-ticket-done-button"
                    type="primary"
                    text="Done"
                    onPress={handleClose}
                    style={styles.doneButton}
                    textStyle={styles.doneButtonText}
                />
            </View>
        </View>
    );

    return (
        <>
            <AnimatedModal visible={visible} setVisible={handleClose} showCloseButton={true} animationDuration={300}>
                {currentStep === 'FORM_INPUT' ? renderFormInput() : renderSuccess()}
            </AnimatedModal>
        </>
    );
};

const createStyles = (themeColors: ThemeTokens, bottom: number) =>
    StyleSheet.create({
        container: {
            width: '100%',
            backgroundColor: themeColors.Fill_neutralUltraLow,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: bottom + 8,
        },
        header: {
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
        },
        title: {
            fontSize: 20,
            lineHeight: 20,
            fontWeight: '600',
            color: colors.neutral900,
            textAlign: 'left',
            paddingTop: 10,
        },
        content: {
            paddingHorizontal: 24,
            paddingTop: 24,
        },
        description: {
            fontSize: 14,
            lineHeight: 20,
            color: colors.neutral700,
            marginBottom: 20,
            textAlign: 'center',
        },
        textInput: {
            borderWidth: 1,
            borderColor: colors.neutral300,
            borderRadius: 8,
            padding: 16,
            fontSize: 16,
            color: colors.neutral900,
            backgroundColor: colors.neutral100,
            minHeight: 120,
            marginBottom: 20,
        },
        attachmentButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '50%',
            marginBottom: 32,
            gap: 12,
        },
        attachmentButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.neutral300,
            backgroundColor: colors.neutral200,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6, // Disabled appearance for Phase 1
        },
        functionalButton: {
            opacity: 1,
            backgroundColor: colors.neutral100,
            borderColor: colors.neutral400,
        },
        attachmentButtonText: {
            fontSize: 14,
            color: colors.neutral600,
            textAlign: 'center',
        },
        functionalButtonText: {
            color: colors.neutral800,
            fontWeight: '600',
        },
        imageContainer: {
            marginBottom: 16,
            paddingVertical: 8,
        },
        imageWrapper: {
            position: 'relative',
            marginRight: 12,
        },
        selectedImage: {
            width: 80,
            height: 80,
            borderRadius: 8,
            backgroundColor: colors.neutral200,
        },
        removeImageButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: colors.neutral900,
            borderRadius: 12,
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        removeImageText: {
            color: colors.neutral100,
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        audioContainer: {
            marginBottom: 16,
            paddingVertical: 8,
        },
        audioWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.neutral200,
            borderRadius: 8,
            padding: 12,
            position: 'relative',
        },
        audioText: {
            fontSize: 14,
            color: colors.neutral800,
            fontWeight: '600',
            flex: 1,
        },
        submitButton: {
            backgroundColor: themeColors.Button_primary_default_fill_base,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        submitButtonDisabled: {
            backgroundColor: themeColors.Button_primary_default_fill_base,
            opacity: 0.5,
        },
        submitButtonText: {
            color: themeColors.Button_Primary_Default_Text_Base,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            paddingBottom: 3,
        },
        successContent: {
            paddingHorizontal: 10,
            paddingVertical: 20,
            width: '100%',
        },
        successTitle: {
            fontSize: 24,
            fontWeight: '600',
            color: colors.neutral900,
            paddingTop: 16,
            marginLeft: 12,
            marginBottom: 16,
        },
        successDescription: {
            fontSize: 16,
            lineHeight: 24,
            color: colors.neutral700,
            marginBottom: 32,
            marginLeft: 4,
            textAlign: 'center',
        },
        doneButton: {
            backgroundColor: themeColors.Button_primary_default_fill_base,
            borderRadius: 18,
            paddingVertical: 16,
            paddingHorizontal: 40,
            width: '100%',
            minWidth: 120,
        },
        doneButtonText: {
            color: themeColors.Button_Primary_Default_Text_Base,
            fontSize: 18,
            height: '100%',
            width: '100%',
            fontWeight: '600',
            textAlign: 'center',
        },
    });
