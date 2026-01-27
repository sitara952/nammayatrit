import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { BusinessProfileStage } from './Types';
import BusinessProfileUI from './UI';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, ProfileTabParamList } from '@/typescript/navigation/globalParamList';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useUpdateProfileMutation, useLazyGetProfileQuery } from '@/typescript/state/server/userApi';
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { useAuthBusinessemailSendverificationPostMutation } from '@/api/integrations/rtk/AuthBusiness-emailSend-verificationPost';
import { useAuthBusinessemailVerifyPostMutation } from '@/api/integrations/rtk/AuthBusiness-emailVerifyPost';
import { verifyBusinessEmailReq } from '@/readOnly/api/types/VerifyBusinessEmailReq.gen';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import {
    selectPersonalMailServicesNames,
    selectAppConfig,
    setBottomSheetStage,
    BottomSheetStage,
    setActiveInput,
    SearchInput,
    removeAllSearchedStops,
    setFareProductType,
    setGoBackToRental,
    selectCurrentLocationCoords,
} from '@/typescript/state/client/session';
import { selectUserProfile } from '@/typescript/state/client/user';
import { deleteItem, MMKVKey, setNumberItem, getNumberItem } from '@/typescript/utils/MMKV';
import { setToastProps } from '@/typescript/state/client/session';
import { genericErrorToastProps } from '@/typescript/state/middleware';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { logEvent, EventName } from '@/typescript/utils/logger';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESEND_OTP_TIMER = 30;

export const BusinessProfileFlow: React.FC = () => {
    const route = useRoute<RouteProp<ProfileTabParamList, 'businessProfileScreen'>>();
    const userProfile = useAppSelector(selectUserProfile);
    const isBusinessProfileVerified = route.params?.isBusinessProfileVerified ?? false;
    const appSystemConfig = useAppSelector(selectAppConfig);
    const businessProfileConfig = appSystemConfig.flowConfig.businessProfileConfig;

    const [stage, setStage] = useState<BusinessProfileStage>(() => {
        // Use a simple initial state, will be updated in useEffect once config is available
        if (isBusinessProfileVerified) {
            return BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW;
        }
        return BusinessProfileStage.EMAIL_ENTRY;
    });

    // Update stage based on verification timestamp once config is available
    useEffect(() => {
        if (!isBusinessProfileVerified && businessProfileConfig?.maxPollTimeout) {
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                const currentTime = Date.now();
                const timeElapsed = currentTime - verificationStartTime;

                // If less than maxPollTimeout have passed, go to EMAIL_VERIFICATION
                if (timeElapsed < businessProfileConfig.maxPollTimeout) {
                    setStage(BusinessProfileStage.EMAIL_VERIFICATION);
                } else {
                    // maxPollTimeout has passed, go to VERIFICATION_TIMEOUT
                    setStage(BusinessProfileStage.VERIFICATION_TIMEOUT);
                }
            }
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [businessProfileConfig, isBusinessProfileVerified]);
    const [email, setEmail] = useState<string>(userProfile?.businessEmail || '');
    const [otp, setOtp] = useState<string>('');
    const [_isPollingTimeout, setIsPollingTimeout] = useState<number>(0);
    const [otpError, setOtpError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resendOtpTimer, setResendOtpTimer] = useState<number>(RESEND_OTP_TIMER);
    const [resendOtpEnabled, setResendOtpEnabled] = useState<boolean>(false);
    const [resendAttempts, setResendAttempts] = useState<number>(0);
    const [showEmailError, setShowEmailError] = useState<boolean>(false);
    const timerRef = useRef<number>(RESEND_OTP_TIMER);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCancelledRef = useRef<boolean>(false);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const accumulatedPollingTimeRef = useRef<number>(0);
    const previousStageRef = useRef<BusinessProfileStage | null>(null);
    const deleteProfileModalRef = useRef<BottomSheetModal | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [sendVerificationEmail] = useAuthBusinessemailSendverificationPostMutation();
    const [verifyBusinessEmail] = useAuthBusinessemailVerifyPostMutation();
    const [updateProfile] = useUpdateProfileMutation();
    const [fetchProfile] = useLazyGetProfileQuery();
    const personalMailServicesNames = useAppSelector(selectPersonalMailServicesNames);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);

    const ifPersonalEmail = useMemo(() => {
        const trimmedEmail = email.trim();
        if (!personalMailServicesNames || !Array.isArray(personalMailServicesNames)) {
            return false;
        }
        const domain = trimmedEmail.split('@')[1]?.toLowerCase();
        if (!domain) {
            return false;
        }
        return personalMailServicesNames.some(serviceName => {
            // Remove @ from service name (e.g., '@gmail' -> 'gmail')
            const serviceDomain = serviceName.toLowerCase().replace('@', '');
            // Check if domain matches exactly, starts with serviceDomain followed by a dot,
            // or ends with .serviceDomain (for subdomains like mail.gmail.com)
            // This prevents false positives like 'mygmail.com' matching '@gmail'
            return (
                domain === serviceDomain ||
                domain.startsWith(`${serviceDomain}.`) ||
                domain.endsWith(`.${serviceDomain}`)
            );
        });
    }, [email, personalMailServicesNames]);

    useEffect(() => {
        if (userProfile?.businessEmail && email === '') {
            setEmail(userProfile.businessEmail);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile?.businessEmail]);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, []);

    const startOtpTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        setResendOtpTimer(RESEND_OTP_TIMER);
        timerRef.current = RESEND_OTP_TIMER;
        setResendOtpEnabled(false);

        const timerId = setInterval(() => {
            timerRef.current -= 1;
            if (timerRef.current < 0) {
                clearInterval(timerId);
                timerIntervalRef.current = null;
                setResendOtpEnabled(true);
            } else {
                setResendOtpTimer(timerRef.current);
            }
        }, 1000);

        timerIntervalRef.current = timerId;
    }, []);

    // Restart OTP timer when entering EMAIL_VERIFICATION state
    useEffect(() => {
        if (stage === BusinessProfileStage.EMAIL_VERIFICATION) {
            // Check if verification email was already sent (timestamp exists)
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                // Only start timer if it's not already running
                if (!timerIntervalRef.current) {
                    startOtpTimer();
                }
            }
        } else {
            // Clear timer when leaving EMAIL_VERIFICATION state
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [stage, startOtpTimer]);

    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        setShowEmailError(false);
    }, []);

    const handleVerifyOtp = useCallback(
        async (otpValue: string) => {
            setIsLoading(true);
            const requestBody: verifyBusinessEmailReq = {
                otp: otpValue,
                token: undefined,
            };
            verifyBusinessEmail({ body: requestBody })
                .unwrap()
                .then(async () => {
                    // Clear the verification start timestamp when verification succeeds
                    deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                    await fetchProfile();
                    setStage(BusinessProfileStage.VERIFICATION_SUCCESS);
                })
                .catch(error => {
                    if (error?.data?.errorCode === 'BUSINESS_EMAIL_TOKEN_EXPIRED') {
                        setStage(BusinessProfileStage.VERIFICATION_TIMEOUT);
                    } else if (
                        error?.data?.errorCode === 'INVALID_REQUEST' &&
                        error?.data?.errorMessage === 'No pending business email verification found'
                    ) {
                        setOtpError(true);
                        setOtp('');
                    } else {
                        setStage(BusinessProfileStage.VERIFICATION_FAILED);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [verifyBusinessEmail],
    );

    const handleOtpChange = useCallback(
        (value: string) => {
            setOtp(value);
            setOtpError(false);

            // Auto-verify when OTP is 4 digits
            if (value.length === 4) {
                logEvent(EventName.BUSINESS_PROFILE_OTP_ENTERED);
                handleVerifyOtp(value);
            }
        },
        [handleVerifyOtp],
    );

    const handleVerifyEmail = useCallback(async () => {
        // Validate email before API call
        const trimmedEmail = email.trim();
        const emailIsValid = EMAIL_REGEX.test(trimmedEmail);
        const isPersonalEmailDomain = ifPersonalEmail;

        if (!emailIsValid || isPersonalEmailDomain) {
            setShowEmailError(true);
            const toastProps = genericErrorToastProps(userLanguageStrings.PleaseEnterValidCompanyEmailID);
            dispatch(setToastProps(toastProps));
            return;
        }

        // Check if email is same as current verified business email
        const currentBusinessEmail = userProfile?.businessEmail?.trim() || '';
        const isBusinessEmailVerified = userProfile?.businessProfileVerified === true;

        if (isBusinessEmailVerified && trimmedEmail.toLowerCase() === currentBusinessEmail.toLowerCase()) {
            const toastProps = genericErrorToastProps(userLanguageStrings.EditedEmailCannotBeSameAsCurrent);
            dispatch(setToastProps(toastProps));
            return;
        }

        setShowEmailError(false);
        const updateProfileReq: updateProfileReq = {
            bundleVersion: undefined,
            clientVersion: undefined,
            deviceId: undefined,
            deviceToken: undefined,
            disability: undefined,
            email: undefined,
            enableOtpLessRide: undefined,
            firstName: undefined,
            gender: undefined,
            hasDisability: undefined,
            language: undefined,
            lastName: undefined,
            middleName: undefined,
            notificationToken: undefined,
            referralCode: undefined,
            androidId: undefined,
            dateOfBirth: undefined,
            profilePicture: undefined,
            verificationChannel: undefined,
            marketingParams: undefined,
            businessEmail: email.trim(),
            latestLat: undefined,
            latestLon: undefined,
            liveActivityToken: undefined,
            registrationLat: undefined,
            registrationLon: undefined,
        };
        setIsLoading(true);
        try {
            await updateProfile(updateProfileReq).unwrap();
            await sendVerificationEmail({}).unwrap();
            setNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME, Date.now());
            setStage(BusinessProfileStage.EMAIL_VERIFICATION);
            startOtpTimer();
        } catch (error) {
            console.error('Email verification failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [
        email,
        ifPersonalEmail,
        startOtpTimer,
        sendVerificationEmail,
        updateProfile,
        dispatch,
        userLanguageStrings,
        userProfile,
    ]);

    const handleResendEmail = useCallback(async () => {
        // If in VERIFICATION_TIMEOUT state, resend email and go to EMAIL_VERIFICATION
        if (stage === BusinessProfileStage.VERIFICATION_TIMEOUT) {
            setIsLoading(true);
            setOtp('');
            setOtpError(false);
            setResendAttempts(0);
            setResendOtpTimer(RESEND_OTP_TIMER);
            setResendOtpEnabled(false);
            setIsPollingTimeout(0);
            accumulatedPollingTimeRef.current = 0;

            try {
                await sendVerificationEmail({}).unwrap();
                // Store the current timestamp when verification email is sent
                setNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME, Date.now());
                setStage(BusinessProfileStage.EMAIL_VERIFICATION);
                startOtpTimer();
            } catch (error) {
                console.error('Resend email failed:', error);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // For other states (e.g., coming from EMAIL_VERIFICATION edit flow), clear and go to EMAIL_ENTRY
        deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
        setStage(BusinessProfileStage.EMAIL_ENTRY);
        setEmail('');
        setOtp('');
        setOtpError(false);
        setResendAttempts(0);
        setResendOtpTimer(RESEND_OTP_TIMER);
        setResendOtpEnabled(false);
        setIsPollingTimeout(0);
        accumulatedPollingTimeRef.current = 0;
    }, [
        stage,
        sendVerificationEmail,
        startOtpTimer,
        setStage,
        setEmail,
        setOtp,
        setOtpError,
        setResendAttempts,
        setResendOtpTimer,
        setResendOtpEnabled,
        setIsPollingTimeout,
    ]);

    const handleResendOtp = useCallback(async () => {
        if (!resendOtpEnabled || resendAttempts >= 2) return;

        setIsLoading(true);
        setOtp('');
        setOtpError(false);

        try {
            await sendVerificationEmail({}).unwrap();
            setResendAttempts(prev => prev + 1);
            startOtpTimer();
        } catch (error) {
            console.error('Resend OTP failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [email, resendOtpEnabled, resendAttempts, startOtpTimer]);

    const handleReportIssue = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: {
                screen: 'helpAndSupportScreen',
            },
        });
    }, [navigation]);

    useEffect(() => {
        isCancelledRef.current = false;

        // Check timeout based on stored timestamp when entering EMAIL_VERIFICATION stage
        if (stage === BusinessProfileStage.EMAIL_VERIFICATION) {
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                const currentTime = Date.now();
                const timeElapsed = currentTime - verificationStartTime;

                // If maxPollTimeout has passed, go to VERIFICATION_TIMEOUT
                if (timeElapsed >= businessProfileConfig.maxPollTimeout) {
                    setStage(BusinessProfileStage.VERIFICATION_TIMEOUT);
                    return;
                }

                // Set accumulated polling time based on elapsed time
                accumulatedPollingTimeRef.current = Math.floor(timeElapsed / 1000); // Convert to seconds
                setIsPollingTimeout(accumulatedPollingTimeRef.current);
            } else {
                // No timestamp found, reset
                accumulatedPollingTimeRef.current = 0;
                setIsPollingTimeout(0);
            }
        }

        /**
         * Calculate polling interval based on elapsed time:
         * - First 5 seconds: no polling (initial delay)
         * - 5 seconds to 2 minutes: 5 seconds interval
         * - After 2 minutes: increase by 15 seconds for each minute passed
         */
        const getPollingInterval = (timeElapsedSeconds: number): number => {
            // Initial 5 second delay
            if (timeElapsedSeconds < 5) {
                return (5 - timeElapsedSeconds) * 1000; // Wait until 5 seconds
            }

            // First 2 minutes (5 seconds to 120 seconds): 5 second interval
            if (timeElapsedSeconds < 120) {
                return 5 * 1000; // 5 seconds
            }

            // After 2 minutes: increase by 15 seconds for each minute passed
            // Minutes after 2 minutes = (timeElapsedSeconds - 120) / 60
            const minutesAfter2Min = Math.floor((timeElapsedSeconds - 120) / 60);
            const intervalSeconds = 5 + minutesAfter2Min * 15; // Start at 5, add 15 per minute

            return intervalSeconds * 1000;
        };

        const pollVerificationStatus = async () => {
            // Check timeout based on stored timestamp
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                const currentTime = Date.now();
                const timeElapsed = currentTime - verificationStartTime;

                // If maxPollTimeout has passed, go to VERIFICATION_TIMEOUT
                if (timeElapsed >= businessProfileConfig.maxPollTimeout) {
                    setStage(BusinessProfileStage.VERIFICATION_TIMEOUT);
                    return;
                }
            }

            try {
                const profile = await fetchProfile().unwrap();
                if (profile?.businessProfileVerified) {
                    // Clear the timestamp when verification succeeds
                    deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                    setStage(BusinessProfileStage.VERIFICATION_SUCCESS);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch profile for verification status:', error);
            }

            // Only continue polling if not cancelled and timeout has not been exceeded
            if (!isCancelledRef.current) {
                const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                if (verificationStartTime) {
                    const currentTime = Date.now();
                    const timeElapsed = currentTime - verificationStartTime;
                    const timeElapsedSeconds = Math.floor(timeElapsed / 1000);

                    // Update accumulated time based on elapsed time
                    accumulatedPollingTimeRef.current = timeElapsedSeconds;
                    setIsPollingTimeout(accumulatedPollingTimeRef.current);

                    // Check if timeout exceeded
                    if (timeElapsed >= businessProfileConfig.maxPollTimeout) {
                        setStage(BusinessProfileStage.VERIFICATION_TIMEOUT);
                        return;
                    }

                    // Calculate next polling interval based on progressive strategy
                    const nextInterval = getPollingInterval(timeElapsedSeconds);

                    // Schedule next poll with calculated interval
                    pollTimeoutRef.current = setTimeout(pollVerificationStatus, nextInterval);
                } else {
                    // No timestamp, use default interval for first poll
                    pollTimeoutRef.current = setTimeout(pollVerificationStatus, 5 * 1000); // 5 second initial delay
                }
            }
        };

        // Only poll when stage is EMAIL_VERIFICATION
        if (stage === BusinessProfileStage.EMAIL_VERIFICATION) {
            // Start polling after 5 second initial delay
            pollTimeoutRef.current = setTimeout(pollVerificationStatus, 5 * 1000);
        }

        return () => {
            isCancelledRef.current = true;
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [stage, businessProfileConfig, fetchProfile]);

    // Log events when stage changes to verification states
    useEffect(() => {
        if (stage === BusinessProfileStage.VERIFICATION_SUCCESS) {
            logEvent(EventName.BUSINESS_PROFILE_VERIFICATION_SUCCESS);
        } else if (stage === BusinessProfileStage.VERIFICATION_FAILED) {
            logEvent(EventName.BUSINESS_PROFILE_VERIFICATION_FAILED);
        } else if (stage === BusinessProfileStage.VERIFICATION_TIMEOUT) {
            logEvent(EventName.BUSINESS_PROFILE_VERIFICATION_TIMEOUT);
        }
    }, [stage]);

    const handleBookBusinessRide = useCallback(() => {
        navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });

        dispatch(removeAllSearchedStops());
        dispatch(setFareProductType(null));
        dispatch(setGoBackToRental(false));
        dispatch(
            setActiveInput(
                currentLocationCoords?.coords.latitude && currentLocationCoords?.coords.longitude
                    ? SearchInput.Destination
                    : SearchInput.Source,
            ),
        );
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'business_profile_book_ride' }));
        hapticEffect(HapticFeedbackTypes.impactMedium, undefined);
    }, [navigation, dispatch, currentLocationCoords]);

    const handleDeleteProfile = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const handleConfirmDeleteProfile = useCallback(async () => {
        const updateProfileReq: updateProfileReq = {
            androidId: undefined,
            bundleVersion: undefined,
            businessEmail: '',
            clientVersion: undefined,
            dateOfBirth: undefined,
            deviceId: undefined,
            deviceToken: undefined,
            disability: undefined,
            email: undefined,
            enableOtpLessRide: undefined,
            firstName: undefined,
            gender: undefined,
            hasDisability: undefined,
            language: undefined,
            lastName: undefined,
            latestLat: undefined,
            latestLon: undefined,
            liveActivityToken: undefined,
            marketingParams: undefined,
            middleName: undefined,
            notificationToken: undefined,
            profilePicture: undefined,
            referralCode: undefined,
            registrationLat: undefined,
            registrationLon: undefined,
            verificationChannel: undefined,
        };
        setIsLoading(true);
        try {
            await updateProfile(updateProfileReq).unwrap();
            deleteItem(MMKVKey.BUSINESS_RIDES_INFO_DISMISSED);
            deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            await fetchProfile();
            // Close modal and navigate back only after API completes successfully
            deleteProfileModalRef.current?.dismiss();
            navigation.goBack();
        } catch (error) {
            console.error('Delete profile failed:', error);
            // Close modal even on error, but don't navigate back
            deleteProfileModalRef.current?.dismiss();
        } finally {
            setIsLoading(false);
        }
    }, [updateProfile, fetchProfile, navigation]);

    const handleCancelDeleteProfile = useCallback(() => {
        deleteProfileModalRef.current?.dismiss();
    }, []);

    const handleEditEmail = useCallback(() => {
        previousStageRef.current = stage;
        setStage(BusinessProfileStage.EMAIL_ENTRY);
    }, [stage]);

    const handleBack = useCallback(() => {
        if (stage === BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW) {
            navigation.goBack();
        } else if (stage === BusinessProfileStage.EMAIL_ENTRY) {
            if (previousStageRef.current === BusinessProfileStage.EMAIL_VERIFICATION) {
                previousStageRef.current = null;
                setStage(BusinessProfileStage.EMAIL_VERIFICATION);
            } else if (userProfile?.businessEmail && userProfile?.businessProfileVerified) {
                setStage(BusinessProfileStage.BUSINESS_PROFILE_OVERVIEW);
            } else {
                navigation.goBack();
            }
        } else if (stage === BusinessProfileStage.EMAIL_VERIFICATION) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            navigation.goBack();
        } else if (stage === BusinessProfileStage.VERIFICATION_SUCCESS) {
            navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        } else if (stage === BusinessProfileStage.VERIFICATION_FAILED) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setIsPollingTimeout(0);
            setResendAttempts(0);
            setResendOtpTimer(RESEND_OTP_TIMER);
            setResendOtpEnabled(false);
            setOtp('');
            setOtpError(false);
            setStage(BusinessProfileStage.EMAIL_ENTRY);
        } else if (stage === BusinessProfileStage.VERIFICATION_TIMEOUT) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            // Clear the verification start timestamp when navigating back
            deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            navigation.goBack();
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setOtp('');
            setOtpError(false);
            const stages = Object.values(BusinessProfileStage);
            const currentIndex = stages.indexOf(stage);
            if (currentIndex > 0) {
                const previousStage = stages[currentIndex - 1];
                if (previousStage) {
                    setStage(previousStage);
                }
            }
        }
    }, [stage, navigation, userProfile]);

    return (
        <BusinessProfileUI
            stage={stage}
            email={email}
            otp={otp}
            onEmailChange={handleEmailChange}
            onOtpChange={handleOtpChange}
            onVerifyEmail={handleVerifyEmail}
            onResendOtp={handleResendOtp}
            onResendEmail={handleResendEmail}
            onReportIssue={handleReportIssue}
            onBookBusinessRide={handleBookBusinessRide}
            onBack={handleBack}
            onEditEmail={handleEditEmail}
            isLoading={isLoading}
            otpError={otpError}
            resendOtpTimer={resendOtpTimer}
            resendOtpEnabled={resendOtpEnabled}
            resendAttempts={resendAttempts}
            isBusinessEmailVerified={route.params?.isBusinessProfileVerified}
            hasBusinessEmail={!!userProfile?.businessEmail}
            onDeleteProfile={handleDeleteProfile}
            showEmailError={showEmailError}
            businessEmail={userProfile?.businessEmail}
            deleteProfileModalRef={deleteProfileModalRef}
            isDeleteModalVisible={isDeleteModalVisible}
            setIsDeleteModalVisible={setIsDeleteModalVisible}
            onConfirmDeleteProfile={handleConfirmDeleteProfile}
            onCancelDeleteProfile={handleCancelDeleteProfile}
        />
    );
};
