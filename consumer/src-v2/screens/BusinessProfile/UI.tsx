import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TextInput, Platform, Keyboard } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ScrollView } from 'react-native-gesture-handler';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import Button from '../../primitives/Button';
import { Pressable } from '../../primitives/Pressable';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { BusinessProfileUIProps, BusinessProfileStage } from './Types';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import OTPComponentNew from '@/typescript/components/common/OTPComponentNew';
import { BulletPoint } from '@/src-v2/components/BulletPoint';
import { Icon } from '@/typescript/components/Icon';
import { MailIcon } from '@/src-v2/assets/svg/MailIcon';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import BusinessEmailVerifiedIcon from '@/typescript/assets/svg/symbols/BusinessEmailVerified';
import WorkBagIcon from '@/typescript/assets/svg/symbols/WorkBag';
import CheckMarkIcon from '@/typescript/assets/svg/symbols/CheckMarkIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';
import businessEmailFailedIcon from '@/src-v2/assets/business_email_failed.webp';
import CloseCross from '@/typescript/components/svg/CloseCross';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import businessEmailTimeoutIcon from '@/src-v2/assets/business_email_timeout.webp';
import { DeleteIcon } from '@/typescript/assets/svg/symbols/DeleteIcon';
import EditIcon from '@/typescript/assets/svg/symbols/EditIcon';
import Tick from '@/typescript/components/svg/Tick';
import BusinessGetStartedImg from '@/src-v2/assets/ny_ic_business_get_started.webp';
import BusinessTrip from '@/typescript/assets/svg/symbols/BusinessTrip';
import InfoFilled from '@/typescript/assets/svg/symbols/InfoFilled';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import DeleteBusinessProfileModal from './components/DeleteBusinessProfileModal';

export const BusinessProfileUI: React.FC<BusinessProfileUIProps> = ({
    stage,
    email,
    otp,
    onEmailChange,
    onOtpChange,
    onVerifyEmail,
    onResendOtp,
    onResendEmail,
    onReportIssue,
    onBookBusinessRide,
    onBack,
    onEditEmail,
    isLoading,
    otpError,
    resendOtpTimer,
    resendOtpEnabled,
    resendAttempts,
    isBusinessEmailVerified,
    hasBusinessEmail,
    onDeleteProfile,
    showEmailError,
    businessEmail,
    deleteProfileModalRef,
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    onConfirmDeleteProfile,
    onCancelDeleteProfile,
}) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppReadableName);

    const paddingBottom = bottom;

    useEffect(() => {
        if (isDeleteModalVisible) {
            deleteProfileModalRef.current?.present();
        } else {
            deleteProfileModalRef.current?.dismiss();
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [isDeleteModalVisible, deleteProfileModalRef]);

    const truncateEmailMiddle = (emailAddress: string, maxLength: number = 25): string => {
        if (!emailAddress || emailAddress.length <= maxLength) {
            return emailAddress;
        }

        const atIndex = emailAddress.indexOf('@');
        if (atIndex === -1) {
            // No @ found, just truncate from end
            return emailAddress.substring(0, maxLength - 3) + '...';
        }

        const localPart = emailAddress.substring(0, atIndex);
        const domainPart = emailAddress.substring(atIndex); // includes @

        // Always show full domain if possible
        // Calculate how much space we have for local part
        const availableForLocal = maxLength - domainPart.length - 3; // 3 for '...'

        if (availableForLocal <= 0) {
            // If domain itself is too long, show as much as possible
            if (domainPart.length > maxLength) {
                return '...' + domainPart.substring(domainPart.length - maxLength + 3);
            }
            return '...' + domainPart;
        }

        // Truncate local part in the middle, keeping some from start and end
        const keepFromStart = Math.max(2, Math.floor(availableForLocal / 2));
        const keepFromEnd = Math.max(2, availableForLocal - keepFromStart);

        if (localPart.length <= availableForLocal) {
            // Local part fits, no need to truncate
            return localPart + domainPart;
        }

        const truncatedLocal =
            localPart.substring(0, keepFromStart) + '...' + localPart.substring(localPart.length - keepFromEnd);

        return truncatedLocal + domainPart;
    };

    const handleReportIssueClick = () => {
        onReportIssue();
    };

    const renderEmailEntryStage = () => (
        <>
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'android' ? -(bottom - 18) : 0}
                style={styles.stageContainer}>
                <TouchableWithoutFeedback
                    testID="email-entry-screen-backdrop"
                    onPress={Keyboard.dismiss}
                    accessible={false}
                    accessibilityRole="button">
                    <View style={styles.stageContentWrapper}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
                            <View style={styles.content}>
                                <Typography
                                    type="title-800"
                                    style={styles.title}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={
                                        isBusinessEmailVerified || email.trim().length > 0
                                            ? 'Edit your business email'
                                            : hasBusinessEmail && !isBusinessEmailVerified
                                              ? 'Verify your business email'
                                              : "What's your company email?"
                                    }
                                    accessibilityRole="header">
                                    {isBusinessEmailVerified || email.trim().length > 0
                                        ? userLanguageStrings.EditYourBusinessEmail
                                        : hasBusinessEmail && !isBusinessEmailVerified
                                          ? userLanguageStrings.VerifyYourBusinessEmail
                                          : userLanguageStrings.WhatsYourCompanyEmail}
                                </Typography>

                                <Typography
                                    type="body-7"
                                    style={styles.subtitle}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel="We'll send you an email with a magic link that'll verify you right away."
                                    accessibilityRole="text">
                                    {userLanguageStrings.WellSendYouAnEmailWithAMagicLink}
                                </Typography>

                                <TextInput
                                    style={[styles.input, showEmailError && styles.inputError]}
                                    placeholder="Enter your business email ID"
                                    placeholderTextColor={colors.neutral500}
                                    value={email}
                                    onChangeText={onEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="email"
                                    accessible={true}
                                    accessibilityLabel="Business email input field"
                                    accessibilityHint="Enter your company email address"
                                />
                            </View>
                        </ScrollView>

                        <View style={[styles.buttonContainer, { paddingBottom: paddingBottom }]}>
                            <Button
                                testID="verify-email-button"
                                size="lg"
                                type="primary"
                                text={userLanguageStrings.VerifyEmail}
                                onPress={onVerifyEmail}
                                isLoading={isLoading}
                                disabled={isLoading}
                                accessible={true}
                                accessibilityLabel={userLanguageStrings.VerifyEmail}
                                accessibilityHint="Tap to verify your business email"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </>
    );

    const renderEmailVerificationStage = () => (
        <>
            <TouchableWithoutFeedback
                testID="verification-screen-backdrop"
                onPress={Keyboard.dismiss}
                accessible={false}
                accessibilityRole="button">
                <View style={styles.verificationContentWrapper}>
                    <View style={styles.verificationContent}>
                        {/* Email Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Icon icon={<MailIcon />} size={40} color="#014FB5" />
                            </View>
                        </View>

                        {/* Title */}
                        <Typography
                            type="title-800"
                            style={styles.verificationTitle}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Check your email!"
                            accessibilityRole="header">
                            {userLanguageStrings.CheckYourEmail}
                        </Typography>

                        {/* Email sent to text */}
                        <Typography
                            type="body-7"
                            style={styles.emailSentToText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Email sent to"
                            accessibilityRole="text">
                            {userLanguageStrings.EmailSentTo}
                        </Typography>

                        {/* Email with edit icon */}
                        <View style={styles.verificationEmailRow}>
                            <Typography
                                type="body-7"
                                style={styles.verificationEmailAddress}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={email || businessEmail || ''}
                                accessibilityRole="text">
                                {email || businessEmail || ''}
                            </Typography>
                            <Pressable
                                testID="edit-email-button-verification"
                                style={styles.verificationEditIconContainer}
                                onPress={onEditEmail}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Edit business email">
                                <View style={styles.verificationEditIconWrapper}>
                                    <EditIcon fill="#004FB6" />
                                </View>
                            </Pressable>
                        </View>

                        {/* Verify the magic link text */}
                        <Typography
                            type="body-7"
                            style={styles.verifyMagicLinkText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Verify the magic link"
                            accessibilityRole="text">
                            {userLanguageStrings.VerifyTheMagicLink}
                        </Typography>

                        {/* Or Divider */}
                        <Typography
                            type="body-7"
                            style={styles.orText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Or"
                            accessibilityRole="text">
                            {userLanguageStrings.Or}
                        </Typography>

                        {/* Enter code text */}
                        <Typography
                            type="body-7"
                            style={styles.enterCodeText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Enter the code below"
                            accessibilityRole="text">
                            {userLanguageStrings.EnterTheCodeBelow}
                        </Typography>

                        {/* OTP Component */}
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <View>
                                <View style={styles.otpContainer}>
                                    <OTPComponentNew
                                        value={otp}
                                        error={otpError}
                                        onChange={onOtpChange}
                                        cellStyle={styles.otpCell}
                                        textStyle={styles.otpText}
                                    />
                                </View>
                                {otpError ? (
                                    <View style={styles.errorTextContainer}>
                                        <Typography
                                            type="sub-body-700"
                                            style={styles.errorText}
                                            numberOfLines={undefined}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel="Invalid OTP"
                                            accessibilityRole="text">
                                            {userLanguageStrings.TheEmailCodeYouveEnteredIsIncorrect}
                                        </Typography>
                                    </View>
                                ) : null}
                            </View>
                        </KeyboardAvoidingView>

                        {/* Resend OTP */}
                        <View style={[styles.resendContainer, otpError && styles.resendContainerWithError]}>
                            <Typography
                                type="sub-body-700"
                                style={styles.resendText}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Didn't receive an email?"
                                accessibilityRole="text">
                                {userLanguageStrings.DidntReceiveAnEmail}
                            </Typography>
                            <Pressable
                                testID="resend-otp-button"
                                onPress={onResendOtp}
                                disabled={!resendOtpEnabled || resendAttempts >= 2}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    resendOtpEnabled ? 'Resend OTP ' : `Resend OTP in ${resendOtpTimer} seconds`
                                }
                                accessibilityHint="Tap to resend verification code">
                                <Typography
                                    type="sub-body-700"
                                    style={[
                                        styles.resendLink,
                                        (!resendOtpEnabled || resendAttempts >= 2) && styles.resendLinkDisabled,
                                    ]}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={false}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Resend} {!resendOtpEnabled ? ` (${resendOtpTimer})` : ''}
                                </Typography>
                            </Pressable>
                        </View>
                    </View>

                    {/* Report Issue - Bottom positioned */}
                    {resendAttempts >= 2 && (
                        <View style={[styles.reportIssueContainer, { paddingBottom: paddingBottom }]}>
                            {/* Text */}
                            <Typography
                                type="sub-body-700"
                                style={styles.reportIssueText}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Still having trouble with your email?"
                                accessibilityRole="text">
                                {userLanguageStrings.StillHavingTroubleWithYourEmail}
                            </Typography>

                            {/* Report Issue Link */}
                            <Pressable
                                testID="report-issue-button"
                                onPress={handleReportIssueClick}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Report issue"
                                accessibilityHint="Tap to report an issue with email verification">
                                <Typography
                                    type="sub-body-700"
                                    style={styles.reportIssueLink}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={false}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.ReportIssue}
                                </Typography>
                            </Pressable>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </>
    );

    const renderVerificationSuccessStage = () => (
        <View style={styles.successStageContainer}>
            <ScrollView
                contentContainerStyle={styles.successScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.successHeaderContainer}>
                    <View style={styles.successIconContainer}>
                        <BusinessEmailVerifiedIcon size={120} />
                    </View>

                    {/* Title */}
                    <Typography
                        type="title-800"
                        style={styles.successTitle}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Your business profile is all set!"
                        accessibilityRole="text">
                        {userLanguageStrings.YourBusinessProfileIsAllSet}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        type="sub-body-700"
                        style={styles.successSubtitle}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Pick your destination and change your ride to a business ride with just a switch!"
                        accessibilityRole="text">
                        {userLanguageStrings.PickYourDestinationAndChangeYourRideToABusinessRideWithJustASwitch}
                    </Typography>
                </View>

                {/* Email Info Section */}
                <View style={styles.emailInfoContainer}>
                    {/* Email Section */}
                    <View style={styles.emailSection}>
                        <View style={styles.emailIconWrapper}>
                            <WorkBagIcon size={24} color="#1D74F6" />
                        </View>
                        <View style={styles.emailContent}>
                            <Typography
                                type="sub-body-800"
                                style={styles.emailLabel}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Invoices billed to"
                                accessibilityRole="text">
                                {userLanguageStrings.InvoicesBilledTo}
                            </Typography>
                            <Typography
                                type="subhead-700"
                                style={styles.emailAddress}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={email}
                                accessibilityRole="text">
                                {email}
                            </Typography>
                        </View>
                    </View>

                    <Divider
                        type={undefined}
                        direction={undefined}
                        style={{ paddingHorizontal: 16 }}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />

                    {/* Benefits List */}
                    <View style={styles.successBenefitsList}>
                        <BulletPoint
                            items={[
                                userLanguageStrings.SeparateRideHistoryAndInvoicesBetweenBusinessVsPersonalToEnsureReconciliationIsEasy,
                                userLanguageStrings.SaveTimeWithAutomaticReceiptUploadsViaExpenseIntegrations,
                                userLanguageStrings.EnjoyTravelBenefitsBasedOnExclusivePartnerships,
                            ]}
                            icon={CheckMarkIcon}
                            size={20}
                            color="#14A255"
                            spacing={16}
                            textStyle={styles.successBenefitText}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* CTA Button */}
            <View style={[styles.buttonContainer, { paddingBottom: paddingBottom }]}>
                <Button
                    testID="book-business-ride-button"
                    size="lg"
                    type="primary"
                    text={userLanguageStrings.BookBusinessRide}
                    onPress={onBookBusinessRide}
                    disabled={isLoading}
                    accessible={true}
                    accessibilityLabel="Book Business Ride"
                    accessibilityRole="button"
                    accessibilityHint="Tap to start booking a business ride"
                />
            </View>
        </View>
    );

    const renderVerificationFailedStage = () => (
        <View style={styles.statusStageContainer}>
            <View>
                {/* Error Icon */}
                <View style={styles.successIconContainer}>
                    <Image
                        source={businessEmailFailedIcon}
                        accessible={true}
                        accessibilityLabel="business email failed icon"
                    />
                </View>

                {/* Title */}
                <Typography
                    type="title-800"
                    style={styles.statusTitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Verification Failed!"
                    accessibilityRole="text">
                    {userLanguageStrings.VerificationFailed}
                </Typography>

                {/* Subtitle */}
                <Typography
                    type="sub-body-700"
                    style={styles.statusSubtitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="We couldn't verify your email"
                    accessibilityRole="text">
                    {userLanguageStrings.WeCouldntVerifyYourEmail}
                </Typography>
                <Typography
                    type="sub-body-700"
                    style={styles.statusSubtitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Tap on Resend Email to try again"
                    accessibilityRole="text">
                    {userLanguageStrings.TapOnResendEmailToTryAgain}
                </Typography>
            </View>

            <View>
                <View style={[styles.buttonContainer]}>
                    <Button
                        testID="resend-email-failed-button"
                        size="lg"
                        type="primary"
                        text={userLanguageStrings.ResendEmail}
                        onPress={onResendEmail}
                        isLoading={isLoading}
                        disabled={isLoading}
                        bgColor={colors.neutral900}
                        textColor={colors.yellow650}
                        accessible={true}
                        accessibilityLabel="Resend Email"
                        accessibilityRole="button"
                        accessibilityHint="Tap to resend verification email"
                    />
                </View>
                <View style={[{ paddingHorizontal: 8, paddingBottom: paddingBottom }]}>
                    <Button
                        testID="edit-email-id-button"
                        size="lg"
                        type="secondary"
                        text={userLanguageStrings.EditEmailID}
                        onPress={onEditEmail}
                        isLoading={isLoading}
                        disabled={isLoading}
                        bgColor={colors.neutral100}
                        textColor={colors.neutral900}
                        accessible={true}
                        accessibilityLabel="Edit Email ID"
                        accessibilityRole="button"
                        accessibilityHint="Tap to edit email id"
                    />
                </View>
            </View>
        </View>
    );

    const renderVerificationTimeoutStage = () => (
        <View style={styles.statusStageContainer}>
            <View>
                {/* Error Icon */}
                <View style={styles.successIconContainer}>
                    <Image
                        style={styles.timeoutIcon}
                        source={businessEmailTimeoutIcon}
                        accessible={true}
                        accessibilityLabel="business email timeout icon"
                    />
                </View>

                {/* Title */}
                <Typography
                    type="title-800"
                    style={styles.statusTitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Email Verification Timed Out!"
                    accessibilityRole="text">
                    {userLanguageStrings.EmailVerificationTimedOut}
                </Typography>

                {/* Subtitle */}
                <Typography
                    type="sub-body-700"
                    style={styles.statusSubtitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Your verification link has expired. Click below to resend a new one and complete verification."
                    accessibilityRole="text">
                    {userLanguageStrings.YourVerificationLinkHasExpiredClickBelowToResendANewOneAndCompleteVerification}
                </Typography>
            </View>

            <View style={[styles.buttonContainer]}>
                <Button
                    testID="resend-email-failed-timeout"
                    size="lg"
                    type="primary"
                    text={userLanguageStrings.ResendEmail}
                    onPress={onResendEmail}
                    isLoading={isLoading}
                    disabled={isLoading}
                    bgColor={colors.neutral900}
                    textColor={colors.yellow650}
                    accessible={true}
                    accessibilityLabel="Resend Email"
                    accessibilityRole="button"
                    accessibilityHint="Tap to resend verification email"
                />
            </View>
        </View>
    );

    const renderBusinessProfileOverviewStage = () => (
        <ScrollView contentContainerStyle={styles.overviewContentContainer} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Typography
                type="title-800"
                style={styles.overviewTitle}
                numberOfLines={undefined}
                isAnimate={false}
                accessible={true}
                accessibilityLabel="Namma Yatri for Business"
                accessibilityRole="header">
                {userLanguageStrings.NammaYatriForBusiness(appName)}
            </Typography>

            {/* Business Email Section */}
            <View style={styles.overviewEmailSection}>
                <View style={styles.overviewEmailRow}>
                    <View style={styles.overviewEmailLeft}>
                        <View style={styles.overviewEmailIconWrapper}>
                            <Icon icon={<BusinessTrip color="#14171F" backgroundColor="#F1F2F7" />} size={32} />
                        </View>
                        <View style={styles.overviewEmailTextContainer}>
                            <Typography
                                type="body-8"
                                style={styles.overviewEmailLabel}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Business Email"
                                accessibilityRole="text">
                                {userLanguageStrings.BusinessEmail}
                            </Typography>
                            <Typography
                                type="body-7"
                                style={styles.overviewEmailAddress}
                                numberOfLines={undefined}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={businessEmail || ''}
                                accessibilityRole="text">
                                {businessEmail ? truncateEmailMiddle(businessEmail, 30) : ''}
                            </Typography>
                        </View>
                    </View>
                    <Pressable
                        testID="edit-business-email-button"
                        style={styles.overviewEditIconContainer}
                        onPress={onEditEmail}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Edit business email">
                        <View style={styles.overviewEditIconWrapper}>
                            <EditIcon fill="#004FB6" />
                        </View>
                    </Pressable>
                </View>
                <View style={styles.overviewInfoContainer}>
                    <View style={styles.overviewInfoIconWrapper}>
                        <InfoFilled color="#7B8997" size={16} />
                    </View>
                    <Typography
                        type="sub-body-700"
                        style={styles.overviewInfoText}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Toggle to Business mode in Ride Preferences when booking your ride."
                        accessibilityRole="text">
                        {userLanguageStrings.ToggleToBusinessModeInRidePreferencesWhenBookingYourRide}
                    </Typography>
                </View>
            </View>

            {/* Business Benefits Section */}
            <View style={styles.overviewBenefitsSection}>
                <Typography
                    type="subhead-800"
                    style={styles.overviewBenefitsTitle}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Business Benefits"
                    accessibilityRole="header">
                    {userLanguageStrings.BusinessBenefits}
                </Typography>

                {/* Illustration */}
                <View style={styles.overviewIllustrationContainer}>
                    <Image
                        source={BusinessGetStartedImg}
                        resizeMode="contain"
                        style={styles.overviewIllustrationImage}
                        accessible={false}
                    />
                </View>

                {/* Benefits List */}
                <View style={styles.overviewBenefitsList}>
                    <View style={styles.overviewBenefitItem}>
                        <View style={styles.overviewCheckmarkContainer}>
                            <Tick fill="#53BB6F" size={15} />
                        </View>
                        <Typography
                            type="body-7"
                            style={styles.overviewBenefitText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={
                                userLanguageStrings.SeparateRideHistoryAndInvoicesBetweenBusinessVsPersonal
                            }
                            accessibilityRole="text">
                            {userLanguageStrings.SeparateRideHistoryAndInvoicesBetweenBusinessVsPersonal}
                        </Typography>
                    </View>

                    <View style={styles.overviewBenefitItem}>
                        <View style={styles.overviewCheckmarkContainer}>
                            <Tick fill="#53BB6F" size={15} />
                        </View>
                        <Typography
                            type="sub-body-700"
                            style={styles.overviewBenefitText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={
                                userLanguageStrings.SaveTimeWithAutomaticReceiptUploadsViaExpenseIntegrations
                            }
                            accessibilityRole="text">
                            {userLanguageStrings.SaveTimeWithAutomaticReceiptUploadsViaExpenseIntegrations}
                        </Typography>
                    </View>

                    <View style={styles.overviewBenefitItem}>
                        <View style={styles.overviewCheckmarkContainer}>
                            <Tick fill="#53BB6F" size={15} />
                        </View>
                        <Typography
                            type="sub-body-700"
                            style={styles.overviewBenefitText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={userLanguageStrings.EnjoyTravelBenefitsBasedOnExclusivePartnerships}
                            accessibilityRole="text">
                            {userLanguageStrings.EnjoyTravelBenefitsBasedOnExclusivePartnerships}
                        </Typography>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderStageContent = () => {
        switch (stage) {
            case BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW:
                return renderBusinessProfileOverviewStage();
            case BusinessProfileStage.EMAIL_ENTRY:
                return renderEmailEntryStage();
            case BusinessProfileStage.EMAIL_VERIFICATION:
                return renderEmailVerificationStage();
            case BusinessProfileStage.VERIFICATION_SUCCESS:
                return renderVerificationSuccessStage();
            case BusinessProfileStage.VERIFICATION_FAILED:
                return renderVerificationFailedStage();
            case BusinessProfileStage.VERIFICATION_TIMEOUT:
                return renderVerificationTimeoutStage();
            default:
                return renderEmailEntryStage();
        }
    };

    const headerBackIcon = () => {
        if (
            stage === BusinessProfileStage.VERIFICATION_FAILED ||
            stage === BusinessProfileStage.VERIFICATION_TIMEOUT ||
            stage === BusinessProfileStage.VERIFICATION_SUCCESS
        ) {
            return <CloseCross />;
        } else if (stage === BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW) {
            return <ChevronLeftIcon />;
        } else {
            return <ChevronLeftIcon />;
        }
    };

    const shouldShowDeleteButton =
        (stage === BusinessProfileStage.EMAIL_ENTRY || stage === BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW) &&
        isBusinessEmailVerified;

    const deleteButtonIcon = <Icon icon={<DeleteIcon fill="#3B3A3C" />} size={20} color="#3B3A3C" />;

    return (
        <HardwareBackpressHandler onHardwareBackPress={onBack}>
            <View style={[styles.container]}>
                <Header
                    title=""
                    onBackPress={onBack}
                    backIcon={headerBackIcon()}
                    showNextView={shouldShowDeleteButton}
                    nextViewIcon={deleteButtonIcon}
                    nextViewText={userLanguageStrings.DeleteProfile}
                    nextViewOnPress={onDeleteProfile}
                />
                {renderStageContent() ?? null}
                <PopUpModal
                    sheetRef={deleteProfileModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={true}
                    onDismiss={() => setIsDeleteModalVisible(false)}>
                    <DeleteBusinessProfileModal
                        onDeleteAccount={onConfirmDeleteProfile}
                        onCancel={onCancelDeleteProfile}
                        isLoading={isLoading}
                    />
                </PopUpModal>
            </View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9f9',
    },
    stageContainer: {
        flex: 1,
    },
    stageContentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral300,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    title: {
        fontSize: 20,
        lineHeight: 26,
        color: colors.neutral900,
    },
    subtitle: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.neutral600,
        marginTop: 10,
    },
    input: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral450,
        backgroundColor: colors.neutral100,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.neutral900,
        marginTop: 15,
    },
    inputError: {
        borderColor: colors.red800,
    },
    inputErrorText: {
        fontSize: 12,
        lineHeight: 16,
        color: colors.red800,
        marginTop: 8,
        paddingHorizontal: 0,
    },
    buttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    buttonSpacing: {
        marginBottom: 16,
    },
    verificationContentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    verificationContent: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 10,
    },
    iconCircle: {
        width: 75,
        height: 75,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailIcon: {
        fontSize: 40,
    },
    verificationTitle: {
        fontSize: 24,
        lineHeight: 32,
        color: colors.neutral900,
        textAlign: 'center',
        marginBottom: 12,
    },
    verificationSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
        marginBottom: 16,
    },
    emailSentToText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
        marginBottom: 4,
    },
    verificationEmailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    verificationEmailAddress: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
    },
    verificationEditIconContainer: {
        padding: 4,
        marginLeft: 8,
    },
    verificationEditIconWrapper: {
        transform: [{ scale: 1.2 }],
    },
    verifyMagicLinkText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
        marginBottom: 5,
    },
    orText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
        marginBottom: 5,
    },
    enterCodeText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
    },
    otpContainer: {
        marginTop: 4,
        alignSelf: 'center',
    },
    otpCell: {
        width: 56,
        height: 64,
        borderRadius: 12,
        marginRight: 12,
    },
    otpText: {
        fontSize: 24,
        fontWeight: '600',
    },
    errorTextContainer: {
        marginTop: -5,
        paddingHorizontal: 16,
    },
    errorText: {
        fontSize: 10,
        lineHeight: 20,
        color: colors.red800,
        textAlign: 'left',
    },
    resendContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resendContainerWithError: {
        marginTop: 16,
    },
    resendText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral700,
    },
    resendLink: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.black600,
        fontWeight: '600',
    },
    resendLinkDisabled: {
        color: '#004FB680',
    },
    reportIssueContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    reportIssueText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
        textAlign: 'center',
        marginBottom: 8,
    },
    reportIssueLink: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.black600,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    // Success Stage Styles
    successStageContainer: {
        backgroundColor: colors.neutral100,
        flex: 1,
    },
    successScrollContent: {
        flexGrow: 1,
        paddingTop: 32,
        paddingBottom: 16,
    },
    successHeaderContainer: {
        alignItems: 'center',
    },
    successIconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        color: colors.neutral900,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    successSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral700,
        textAlign: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
    },
    emailInfoContainer: {
        flexDirection: 'column',
        gap: 16,
        marginHorizontal: 16,
        backgroundColor: colors.neutral200,
        borderRadius: 20,
    },
    emailSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        borderRadius: 12,
    },
    emailIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emailSectionIcon: {
        fontSize: 24,
        lineHeight: 28,
    },
    emailContent: {
        flex: 1,
    },
    emailLabel: {
        fontSize: 14,
        lineHeight: 16,
        color: colors.neutral600,
        marginBottom: 4,
    },
    emailAddress: {
        color: colors.neutral900,
    },
    successBenefitsList: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    successBenefitText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral800,
    },
    // Status Stages (Pending, Timeout)
    statusStageContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-around',
    },
    statusIconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    statusIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pendingIcon: {
        backgroundColor: '#FFF9E6',
    },
    timeoutIcon: {},
    errorIcon: {
        backgroundColor: colors.red800,
    },
    iconText: {
        fontSize: 48,
        lineHeight: 56,
    },
    errorIconText: {
        fontSize: 48,
        lineHeight: 56,
        color: colors.neutral100,
    },
    statusTitle: {
        fontSize: 24,
        lineHeight: 32,
        color: colors.neutral900,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 12,
    },
    statusSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.neutral700,
        textAlign: 'center',
    },
    twoButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    halfButton: {
        flex: 1,
    },
    deleteButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#3B3A3C',
        fontWeight: '500',
    },
    // Overview Stage Styles
    overviewContentContainer: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    overviewTitle: {
        color: colors.neutral900,
        paddingHorizontal: 18,
        paddingTop: 5,
        marginBottom: 8,
    },
    overviewEmailSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F1F4',
        marginHorizontal: 16,
        marginTop: 16,
        paddingLeft: 6,
        paddingTop: 10,
        paddingBottom: 10,
    },
    overviewEmailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    overviewEmailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        marginRight: 12,
    },
    overviewEmailIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    overviewEmailTextContainer: {
        flex: 1,
        minWidth: 0,
    },
    overviewEmailLabel: {
        fontSize: 14,
        color: colors.neutral900,
        marginBottom: 4,
    },
    overviewEmailAddress: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.neutral600,
        flexShrink: 1,
        minWidth: 0,
    },
    overviewEditIconContainer: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overviewEditIconWrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 1.2 }],
        marginRight: 8,
    },
    overviewInfoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F4F4F4',
        gap: 8,
        paddingBottom: 6,
    },
    overviewInfoIconWrapper: {
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 2,
        marginLeft: 10,
    },
    overviewInfoText: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.neutral900,
        flex: 1,
    },
    overviewBenefitsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F1F4',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        marginBottom: 24,
    },
    overviewBenefitsTitle: {
        fontSize: 16,
        color: colors.neutral900,
        marginBottom: 16,
    },
    overviewIllustrationContainer: {
        width: '100%',
        height: 140,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewIllustrationImage: {
        width: '100%',
        height: '100%',
    },
    overviewBenefitsList: {
        gap: 16,
    },
    overviewBenefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        alignSelf: 'center',
    },
    overviewCheckmarkContainer: {
        marginTop: 2,
    },
    overviewBenefitText: {
        fontSize: 14,
        color: '#454C55',
        lineHeight: 20,
        flex: 1,
    },
});

export default BusinessProfileUI;
