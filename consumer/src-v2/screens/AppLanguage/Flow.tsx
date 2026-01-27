import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { selectUserProfile } from '../../../src/typescript/state/client/user.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { LanguageObj } from '../../systems/configs/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setToastProps, setUserLanguage } from '@/typescript/state/client/session.ts';

import type { Language_language as languages } from '@/readOnly/api/types/Enums.gen.tsx';
import { AppLanguageScreenProps, AppLanguageScreenAction } from './Types.tsx';
import { createDispatcher, Resolver } from '@/typescript/utils/common.ts';
import { AppLanguageView } from './UI.tsx';
import { getAppLanguages } from '../../../src/typescript/state/client/session.ts';
import { useLazyGetProfileQuery, useUpdateProfileMutation } from '@/typescript/state/server/userApi.ts';
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';

const TAG = '[AppLanguage]';

export const AppLanguage = () => {
    const userProfile = useAppSelector(selectUserProfile);
    const currentLanguage = userProfile?.language ?? 'ENGLISH';
    const [updateProfile] = useUpdateProfileMutation();
    const [getProfile] = useLazyGetProfileQuery();
    const allowedLanguages: LanguageObj[] = useAppSelector(state => getAppLanguages(state));
    const dispatch = useAppDispatch();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const resolver: Resolver<AppLanguageScreenAction> = async action => {
        switch (action.type) {
            case 'CONFIRM_APP_LANGUAGE_CLICKED':
                handleConfirmAppLanguage(action.payload?.selectedLanguage);
                break;
            case 'GO_BACK':
                navigation.goBack();
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };

    const handleConfirmAppLanguage = async (updatedLanguage: languages | undefined) => {
        if (updatedLanguage && userProfile) {
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
                language: updatedLanguage,
                lastName: undefined,
                middleName: undefined,
                notificationToken: undefined,
                referralCode: undefined,
                androidId: undefined,
                dateOfBirth: undefined,
                profilePicture: undefined,
                verificationChannel: undefined,
                marketingParams: undefined,
                latestLat: undefined,
                latestLon: undefined,
                liveActivityToken: undefined,
                registrationLat: undefined,
                registrationLon: undefined,
                businessEmail: undefined,
            };

            dispatch(setUserLanguage(updatedLanguage));
            try {
                await updateProfile(updateProfileReq)
                    .unwrap()
                    .then(() => {
                        getProfile();
                    });
                dispatch(
                    setToastProps({
                        backgroundColor: `${colors.recovered.greenMidHigh}`,
                        autoDismissAfter: 1000,
                        visible: true,
                        buttons: [],
                        spannerType: 'bottom',
                        message: 'Language Updated',
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        logo: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                navigation.goBack();
            } catch (err) {
                console.error(TAG, 'Profile Update Error:', err);
            }
        }
    };

    const alDispatch = createDispatcher(resolver);

    const viewState: AppLanguageScreenProps = {
        alDispatch,
        currentLanguage,
        allowedLanguages,
    };

    return <AppLanguageView {...viewState} />;
};
