import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import { setToken } from '../state/client/auth';
import { initSession, selectAppConfig, selectUtmParams } from '../state/client/session';
import { setMobileNumber, setProfile } from '../state/client/user';
import { getStringItem, MMKVKey, setStringItem } from '../utils/MMKV';
import { EventName, logEvent } from '../utils/logger';
import { recordCampaignMetric } from '../utils/marketingTracking';
import CleverTap from 'clevertap-react-native';
import * as MoEngage from '@/typescript/utils/moengage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { useNavigation } from '@react-navigation/native';
import { OnboardingNavigationParamList } from '../navigation/globalParamList';
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { useUpdateProfileMutation, useLazyGetProfileQuery, initialUpdateProfileReq } from '../state/server/userApi';
import { authRes } from '@/readOnly/api/types/AuthRes.gen';
import { getUTCTimeFromDate } from '../utils/time';
import { Keyboard, NativeModules } from 'react-native';
const { AppInfoModule } = NativeModules;

const TAG = '[useAuthValidation]';

export enum VerificationChannel {
    TrueCaller = 'truecaller',
    OTP = 'otp',
}

const buildProfileRes = (authRes: authRes): profileRes => {
    return {
        firstName: authRes.person?.firstName,
        lastName: authRes.person?.lastName,
        middleName: authRes.person?.middleName,
        aadhaarVerified: false,
        androidId: undefined,
        bundleVersion: undefined,
        cancellationRate: undefined,
        clientVersion: authRes.person?.clientVersion,
        customerReferralCode: undefined,
        deviceId: undefined,
        disability: authRes.person?.disability,
        email: authRes.person?.email,
        followsRide: authRes.person?.followsRide ?? false,
        frontendConfigHash: undefined,
        gender: authRes.person?.gender ?? 'UNKNOWN',
        hasCompletedMockSafetyDrill: authRes.person?.hasCompletedMockSafetyDrill,
        hasCompletedSafetySetup: authRes.person?.hasCompletedSafetySetup ?? false,
        hasDisability: authRes.person?.hasDisability ?? false,
        hasTakenRide: authRes.person?.hasTakenRide ?? false,
        hasTakenValidAmbulanceRide: false,
        hasTakenValidAutoRide: false,
        hasTakenValidBikeRide: false,
        hasTakenValidBusRide: false,
        hasTakenValidCabRide: false,
        hasTakenValidRide: false,
        hasTakenValidTruckRide: false,
        id: authRes.person?.id ?? '',
        isBlocked: false,
        isPayoutEnabled: false,
        isSafetyCenterDisabled: authRes.person?.isSafetyCenterDisabled ?? false,
        language: authRes.person?.language ?? 'ENGLISH',
        maskedDeviceToken: authRes.person?.maskedDeviceToken,
        maskedMobileNumber: authRes.person?.maskedMobileNumber,
        payoutVpa: undefined,
        referralAmountPaid: undefined,
        referralCode: authRes.person?.referralCode,
        referralEarnings: undefined,
        referredByEarnings: undefined,
        whatsappNotificationEnrollStatus: authRes.person?.whatsappNotificationEnrollStatus,
        publicTransportVersion: undefined,
        isMultimodalRider: false, // check
        customerTags: authRes.person?.customerTags,
        profilePicture: undefined,
        businessEmail: authRes.person?.businessEmail,
        businessProfileVerified: authRes.person?.businessProfileVerified,
    };
};

export const useAuthValidation = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<OnboardingNavigationParamList>>();
    const [updateProfile] = useUpdateProfileMutation();
    const [getProfile] = useLazyGetProfileQuery({});
    const appConfig = useAppSelector(selectAppConfig);
    const utmParams = useAppSelector(selectUtmParams);

    const authValidation = async (
        authRes: authRes,
        phoneNumber: string | undefined,
        email: string | undefined,
        gender: string | undefined,
        name: string | undefined,
        dateOfBirth: string | undefined,
        profilePicture: string | undefined,
        verificationChannel: VerificationChannel,
    ) => {
        dispatch(setProfile({ id: authRes.token ?? null, payload: buildProfileRes(authRes) }));

        setStringItem(
            MMKVKey.SESSION_KEY,
            JSON.stringify({
                email: authRes.person?.email,
                nextScreen: 'UpdateProfile',
                token: authRes.token,
            }),
        );
        setStringItem(MMKVKey.REGISTRATION_TOKEN, authRes.token ?? '');
        dispatch(setToken(authRes.token ?? ''));
        dispatch(initSession(authRes?.person?.id));
        // dispatch(setProfile({ id: authRes.token, payload: authRes?.person }));
        dispatch(setMobileNumber({ id: authRes.token ?? null, payload: phoneNumber ?? null }));
        const person = {
            Identity: authRes?.person?.id,
            'Preferred Language': 'English',
            Phone: phoneNumber ? '+91' + phoneNumber : undefined,
        };
        const fcmRegId = getStringItem(MMKVKey.FCM_TOKEN);
        if (fcmRegId) {
            CleverTap.setFCMPushToken(fcmRegId);
        }
        CleverTap.onUserLogin(person);

        // Set MoEngage user identity for event attribution
        if (authRes?.person?.id) {
            MoEngage.setUniqueId(authRes.person.id);
        }

        if (verificationChannel === VerificationChannel.TrueCaller) {
            logEvent(EventName.NY_USER_VERIFY_TRUECALLER);
        } else {
            logEvent(EventName.NY_USER_VERIFY_OTP);
        }

        if (
            !authRes?.person?.firstName ||
            authRes?.person?.firstName === 'User' ||
            !authRes?.person?.maskedMobileNumber
        ) {
            if (appConfig.flowConfig.skipProfileOnboarding) {
                await updateDetailsOnProfile(dateOfBirth, profilePicture, verificationChannel);
                return;
            }
            Keyboard.dismiss();
            navigation.navigate('UpdateProfile', {
                preFillEmail: email,
                preFillGender: gender,
                preFillName: name,
            });
        } else {
            // Existing user - record login in Firestore if campaignId is present
            if (utmParams?.campaignId) {
                recordCampaignMetric(utmParams.campaignId, 'logins');
            }
        }
        updateDOBAndProfilePictureAndVerificationChannel(dateOfBirth, profilePicture, verificationChannel);
    };

    const updateDetailsOnProfile = async (
        dateOfBirth: string | undefined,
        profilePicture: string | undefined,
        verificationChannel: VerificationChannel,
    ) => {
        const deviceId = await AppInfoModule.getDeviceId();
        const resolveDeviceId = !deviceId || deviceId === 'NO_DEVICE_ID' ? undefined : deviceId;
        const dobInUTC: string | undefined = dateOfBirth ? getUTCTimeFromDate(dateOfBirth) : undefined;
        const updateProfileReq: updateProfileReq = {
            ...initialUpdateProfileReq,
            deviceId: resolveDeviceId,
            dateOfBirth: dobInUTC,
            profilePicture: profilePicture,
            verificationChannel: verificationChannel.valueOf(),
        };
        updateProfile(updateProfileReq)
            .unwrap()
            .then(() => {
                logEvent(EventName.NY_USER_ONBOARDED);
                console.info(TAG, 'Device ID updated successfully:', resolveDeviceId);
                getProfile()
                    .then(() => {
                        console.info(TAG, 'Profile fetched successfully');
                    })
                    .catch(err => {
                        console.error(TAG, 'Error getting profile:', err);
                    });
            })
            .catch(err => {
                console.error(TAG, 'Error updating profile:', err);
            });
    };

    const updateDOBAndProfilePictureAndVerificationChannel = async (
        dateOfBirth: string | undefined,
        profilePicture: string | undefined,
        verificationChannel: VerificationChannel,
    ) => {
        const dobInUTC: string | undefined = dateOfBirth ? getUTCTimeFromDate(dateOfBirth) : undefined;

        const updateProfileReq: updateProfileReq = {
            dateOfBirth: dobInUTC,
            profilePicture: profilePicture,
            verificationChannel: verificationChannel.valueOf(),
            androidId: undefined,
            bundleVersion: undefined,
            clientVersion: undefined,
            deviceId: undefined,
            deviceToken: undefined,
            enableOtpLessRide: undefined,
            email: undefined,
            firstName: undefined,
            gender: undefined,
            lastName: undefined,
            middleName: undefined,
            disability: undefined,
            hasDisability: undefined,
            language: undefined,
            notificationToken: undefined,
            referralCode: undefined,
            marketingParams: undefined,
            latestLat: undefined,
            latestLon: undefined,
            liveActivityToken: undefined,
            registrationLat: undefined,
            registrationLon: undefined,
            businessEmail: undefined,
        };

        updateProfile(updateProfileReq)
            .unwrap()
            .then(() => {
                getProfile()
                    .unwrap()
                    .catch(err => {
                        console.error(TAG, 'Error getting profile:', err);
                    });
            })
            .catch(err => {
                console.error(TAG, 'Error updating profile:', err);
            });
    };
    return authValidation;
};
