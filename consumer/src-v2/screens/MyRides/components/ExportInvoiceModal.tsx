import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, TextInput, Keyboard, Platform } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Pressable } from '@/src-v2/primitives/Pressable';
import EmailUserIcon from '@/typescript/assets/svg/symbols/EmailUserIcon';
import WorkBagIcon from '@/typescript/assets/svg/symbols/WorkBag';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import ChevronDown from '@/src-v2/multimodal/components/svg/ChevronDown';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ExportInvoiceOption = 'EMAIL' | 'DOWNLOAD';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ViewMode = 'SELECTION' | 'EMAIL_SELECT' | 'EMAIL_INPUT' | 'SUCCESS';

interface ExportInvoiceModalProps {
    selectedOption: ExportInvoiceOption;
    onSelectOption: (option: ExportInvoiceOption) => void;
    onPrimaryAction: () => void;
    onExportAction?: (email: string) => Promise<void>;
    onDownloadAction?: () => Promise<void>;
    businessEmail?: string;
    isBusinessEmailVerified?: boolean;
    personalEmail?: string;
    isDownloadLoading?: boolean;
}

const ExportInvoiceModal: React.FC<ExportInvoiceModalProps> = ({
    selectedOption,
    onSelectOption,
    onPrimaryAction,
    onExportAction,
    onDownloadAction,
    businessEmail,
    isBusinessEmailVerified,
    personalEmail,
    isDownloadLoading = false,
}) => {
    const hasVerifiedBusinessEmail = Boolean(businessEmail && isBusinessEmailVerified);
    const hasPersonalEmail = Boolean(personalEmail);
    const hasAnyEmail = hasVerifiedBusinessEmail || hasPersonalEmail;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Determine the default/primary email to use
    const defaultEmail = hasVerifiedBusinessEmail ? businessEmail : hasPersonalEmail ? personalEmail : '';

    const [viewMode, setViewMode] = useState<ViewMode>('SELECTION');
    const [selectedEmail, setSelectedEmail] = useState<string>(defaultEmail || '');
    const [customEmail, setCustomEmail] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const { bottom } = useSafeAreaInsets();

    // Keyboard listeners
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            e => {
                setKeyboardHeight(e.endCoordinates.height);
            },
        );
        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            },
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Get available emails for dropdown
    const availableEmails: string[] = useMemo(() => {
        return [
            ...(hasVerifiedBusinessEmail && businessEmail ? [businessEmail] : []),
            ...(hasPersonalEmail && personalEmail && personalEmail !== businessEmail ? [personalEmail] : []),
        ];
    }, [hasVerifiedBusinessEmail, businessEmail, hasPersonalEmail, personalEmail]);

    const isCustomEmailValid = useMemo(() => {
        const trimmedEmail = customEmail.trim();
        return EMAIL_REGEX.test(trimmedEmail);
    }, [customEmail]);

    const handleBackPress = () => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        if (viewMode === 'EMAIL_INPUT') {
            // Go back to EMAIL_SELECT if we have emails to choose from, otherwise go to SELECTION
            if (hasAnyEmail) {
                setViewMode('EMAIL_SELECT');
            } else {
                setViewMode('SELECTION');
            }
            setCustomEmail('');
        } else if (viewMode === 'EMAIL_SELECT') {
            setViewMode('SELECTION');
            setSelectedEmail(defaultEmail || '');
        } else {
            setViewMode('SELECTION');
        }
    };

    const handleChangeEmailPress = () => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        setViewMode('EMAIL_SELECT');
    };

    const handlePrimaryButtonPress = async () => {
        if (selectedOption === 'EMAIL') {
            if (hasAnyEmail) {
                // Send invoice with default email
                if (onExportAction && selectedEmail) {
                    try {
                        await onExportAction(selectedEmail);
                        setViewMode('SUCCESS');
                    } catch (error) {
                        console.error('Export action failed:', error);
                    }
                }
            } else {
                // No emails available, go to EMAIL_INPUT
                setViewMode('EMAIL_INPUT');
            }
        } else {
            // Download Invoice option
            if (onDownloadAction) {
                try {
                    await onDownloadAction();
                    onPrimaryAction();
                } catch (error) {
                    console.error('Download action failed:', error);
                }
            }
        }
    };

    const handleSelectEmail = (email: string) => {
        setSelectedEmail(email);
        setIsDropdownOpen(false);
    };

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleAddNewEmailPress = () => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        setViewMode('EMAIL_INPUT');
    };

    const handleSendInvoiceFromSelect = async () => {
        if (selectedEmail) {
            if (onExportAction) {
                try {
                    await onExportAction(selectedEmail);
                    setViewMode('SUCCESS');
                } catch (error) {
                    console.error('Export action failed:', error);
                }
            }
        }
    };

    const handleSendInvoiceFromInput = async () => {
        if (isCustomEmailValid) {
            const emailToSend = customEmail.trim();
            setSelectedEmail(emailToSend);
            if (onExportAction) {
                try {
                    await onExportAction(emailToSend);
                    setViewMode('SUCCESS');
                } catch (error) {
                    console.error('Export action failed:', error);
                }
            }
        }
    };

    const handleGotIt = () => {
        onPrimaryAction();
    };

    const renderRadio = (isSelected: boolean) => (
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected ? <View style={styles.radioInner} /> : null}
        </View>
    );

    const renderOption = (
        option: ExportInvoiceOption,
        label: string,
        icon: React.ReactNode,
        testID: string,
        subtitle: string | undefined,
    ) => {
        const isSelected = selectedOption === option;
        return (
            <TouchableOpacity
                testID={testID}
                onPress={() => onSelectOption(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={styles.optionRow}>
                <View style={styles.iconContainer}>{icon}</View>
                <View style={styles.optionTextContainer}>
                    <Typography
                        type="subhead-700"
                        style={styles.optionLabel}
                        accessibilityLabel={label}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityRole="text">
                        {label}
                    </Typography>
                    {subtitle ? (
                        <View style={styles.subtitleRow}>
                            <Typography
                                type="subhead"
                                style={styles.subtitleText}
                                accessibilityLabel={subtitle}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityRole="text">
                                {subtitle}
                            </Typography>
                            <Pressable
                                testID="change-email-button"
                                onPress={handleChangeEmailPress}
                                accessibilityLabel="Change Email"
                                accessibilityRole="button">
                                <Typography
                                    type="subhead-700"
                                    style={styles.changeEmailText}
                                    accessibilityLabel="Change Email"
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityRole="button">
                                    {userLanguageStrings.ChangeEmail}
                                </Typography>
                            </Pressable>
                        </View>
                    ) : null}
                </View>
                {renderRadio(isSelected)}
            </TouchableOpacity>
        );
    };

    const getCtaLabel = () => {
        if (selectedOption === 'EMAIL') {
            return hasAnyEmail ? userLanguageStrings.SendInvoice : userLanguageStrings.AddEmail;
        }
        return userLanguageStrings.DownloadInvoice;
    };

    const renderSelectionView = () => (
        <View style={[styles.container, { marginBottom: keyboardHeight }, { paddingBottom: bottom }]}>
            <Typography
                type="subhead-800"
                style={styles.title}
                accessibilityLabel="Export Invoice"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="header">
                {userLanguageStrings.ExportInvoice}
            </Typography>
            <View style={styles.optionsWrapper}>
                {renderOption(
                    'EMAIL',
                    userLanguageStrings.EmailInvoice,
                    <EmailUserIcon size={24} color="#454C55" />,
                    'export-email-option',
                    hasAnyEmail && selectedOption === 'EMAIL' ? defaultEmail : undefined,
                )}
                <View style={styles.optionDivider} />
                {renderOption(
                    'DOWNLOAD',
                    userLanguageStrings.DownloadInvoices,
                    <WorkBagIcon size={24} color="#454C55" />,
                    'export-download-option',
                    undefined,
                )}
            </View>
            <Button
                onPress={handlePrimaryButtonPress}
                text={getCtaLabel()}
                testID="export-invoice-primary-button"
                type="primary"
                size="lg"
                style={styles.primaryButton}
                isLoading={selectedOption === 'DOWNLOAD' && isDownloadLoading}
                disabled={selectedOption === 'DOWNLOAD' && isDownloadLoading}
            />
        </View>
    );

    const renderEmailSelectView = () => (
        <View style={[styles.container, { marginBottom: keyboardHeight }, { paddingBottom: bottom }]}>
            <View style={styles.headerRow}>
                <Pressable
                    testID="export-invoice-back-button-email-select"
                    style={[tailwind.style('justify-self-start')]}
                    onPress={handleBackPress}
                    accessibilityLabel="Go Back button"
                    accessibilityRole="button">
                    <ChevronLeftIcon />
                </Pressable>
                <Typography
                    type="subhead-800"
                    style={styles.titleWithBack}
                    accessibilityLabel="Export Invoice"
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="header">
                    {userLanguageStrings.ExportInvoice}
                </Typography>
            </View>

            {/* Email dropdown selection */}
            <View style={styles.emailDropdownContainer}>
                {/* Selected email display with dropdown toggle */}
                <TouchableOpacity
                    testID="email-dropdown-toggle"
                    style={styles.emailOptionRow}
                    onPress={handleToggleDropdown}
                    accessibilityRole="button"
                    accessibilityLabel="Select email">
                    <Typography
                        type="subhead"
                        style={styles.emailOptionText}
                        accessibilityLabel={selectedEmail}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityRole="text">
                        {selectedEmail}
                    </Typography>
                    <ChevronDown />
                </TouchableOpacity>

                {/* Dropdown options */}
                {isDropdownOpen ? (
                    <View style={styles.dropdownOptionsContainer}>
                        {availableEmails.map(email => (
                            <TouchableOpacity
                                key={email}
                                testID={`select-email-${email}`}
                                style={styles.dropdownOptionRow}
                                onPress={() => handleSelectEmail(email)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: selectedEmail === email }}>
                                <Typography
                                    type="subhead"
                                    style={styles.emailOptionText}
                                    accessibilityLabel={email}
                                    numberOfLines={1}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityRole="text">
                                    {email}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </View>

            {/* Add new email button */}
            <TouchableOpacity
                testID="add-new-email-button"
                style={styles.addNewEmailButton}
                onPress={handleAddNewEmailPress}
                accessibilityRole="button"
                accessibilityLabel="Add new email">
                <Typography
                    type="subhead-700"
                    style={styles.addNewEmailText}
                    accessibilityLabel="Add new email"
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="text">
                    {userLanguageStrings.AddNewEmail}
                </Typography>
            </TouchableOpacity>

            <Typography
                type="subhead"
                style={styles.instructionText}
                accessibilityLabel="We'll send all the selected invoices to the above email address."
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.WeWillSendAllTheSelectedInvoicesToTheAboveEmailAddress}
            </Typography>

            <Button
                onPress={handleSendInvoiceFromSelect}
                text={userLanguageStrings.SendInvoice}
                testID="send-invoice-button-email-select"
                type="primary"
                size="lg"
                disabled={!selectedEmail}
                style={styles.primaryButton}
            />
        </View>
    );

    const renderEmailInputView = () => (
        <View style={[styles.container, { marginBottom: keyboardHeight }, { paddingBottom: bottom }]}>
            <View style={styles.headerRow}>
                <Pressable
                    testID="export-invoice-back-button-email-input"
                    style={[tailwind.style('justify-self-start')]}
                    onPress={handleBackPress}
                    accessibilityLabel="Go Back button"
                    accessibilityRole="button">
                    <ChevronLeftIcon />
                </Pressable>
                <Typography
                    type="subhead-800"
                    style={styles.titleWithBack}
                    accessibilityLabel="Export Invoice"
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityRole="header">
                    {userLanguageStrings.ExportInvoice}
                </Typography>
            </View>
            <View style={styles.emailInputContainer}>
                <TextInput
                    style={styles.emailInput}
                    placeholder="Enter email address"
                    placeholderTextColor="#999999"
                    value={customEmail}
                    onChangeText={setCustomEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Email address input field"
                    accessibilityHint="Enter the email address where invoices will be sent"
                />
            </View>
            <Typography
                type="subhead"
                style={styles.instructionText}
                accessibilityLabel="We'll send all the selected invoices to the above email address."
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.WeWillSendAllTheSelectedInvoicesToTheAboveEmailAddress}
            </Typography>
            <Button
                onPress={handleSendInvoiceFromInput}
                text={userLanguageStrings.SendInvoice}
                testID="send-invoice-button-email-input"
                type="primary"
                size="lg"
                disabled={!isCustomEmailValid}
                style={styles.primaryButton}
            />
        </View>
    );

    const renderSuccessView = () => (
        <View style={[styles.container, { marginBottom: keyboardHeight }, { paddingBottom: bottom }]}>
            <Typography
                type="subhead-800"
                style={styles.successTitle}
                accessibilityLabel="Invoice Request submitted"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="header">
                {userLanguageStrings.InvoiceRequestSubmitted}
            </Typography>
            <Typography
                type="subhead"
                style={styles.successMessage}
                accessibilityLabel="Your invoice will be mailed automatically within next business day"
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityRole="text">
                {userLanguageStrings.YourInvoiceWillBeMailedAutomaticallyWithinNextBusinessDay}
            </Typography>
            <Button
                onPress={handleGotIt}
                text={userLanguageStrings.GotIt}
                testID="got-it-button"
                type="primary"
                size="lg"
                bgColor="#212121"
                textColor="#E8B10B"
                style={styles.gotItButton}
            />
        </View>
    );

    if (viewMode === 'SELECTION') {
        return renderSelectionView();
    } else if (viewMode === 'EMAIL_SELECT') {
        return renderEmailSelectView();
    } else if (viewMode === 'EMAIL_INPUT') {
        return renderEmailInputView();
    } else {
        return renderSuccessView();
    }
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
        marginBottom: 20,
    },
    optionsWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 24,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionLabel: {
        color: '#14171F',
        fontSize: 14,
    },
    subtitleRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 2,
    },
    subtitleText: {
        color: '#666666',
        fontSize: 12,
    },
    changeEmailText: {
        color: '#004FB6',
        fontSize: 13,
        marginTop: 8,
    },
    optionDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E2E2',
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C5CAD3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#14171F',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 10,
        backgroundColor: '#14171F',
    },
    primaryButton: {
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleWithBack: {
        flex: 1,
        textAlign: 'left',
        color: '#14171F',
        marginLeft: 12,
    },
    emailDropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        marginBottom: 16,
        overflow: 'hidden',
    },
    emailOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownOptionsContainer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E2E2',
    },
    dropdownOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E2E2E2',
    },
    emailOptionText: {
        color: '#14171F',
        fontSize: 16,
        flex: 1,
    },
    addNewEmailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    addNewEmailText: {
        color: '#004FB6',
        fontSize: 14,
    },
    emailInputContainer: {
        marginBottom: 12,
    },
    emailInput: {
        width: '100%',
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#14171F',
    },
    instructionText: {
        color: '#666666',
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    successTitle: {
        textAlign: 'left',
        color: '#14171F',
        marginBottom: 12,
        fontSize: 16,
    },
    successMessage: {
        color: '#5F5F5F',
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
        textAlign: 'left',
    },
    gotItButton: {
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ExportInvoiceModal;
