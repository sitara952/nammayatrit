import { FC } from 'react';
import { View } from 'react-native';
import Typography from './primitives/Typography';
import CrossButton from './CrossButton';
import Button from '@/src-v2/primitives/Button';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { selectUserProfile, setProfile, setSpecialAssistance } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import { disability } from '@/readOnly/api/types/Disability.gen';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';
import type { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useUpdateProfileMutation } from '@/typescript/state/server/userApi';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface TurnOffSpecialAssistanceProps {
    currentAssistance: disability | undefined;
    hasDisability: boolean;
}

const TurnOffSpecialAssistance: FC<TurnOffSpecialAssistanceProps> = ({ currentAssistance, hasDisability }) => {
    const { turnOffSpecialAssistanceBottomSheetModalRef, specialAssistanceBottomSheetModalRef } = useRefsContext();
    const dispatch = useAppDispatch();
    const authToken = useAppSelector(selectToken);
    const [updateProfile] = useUpdateProfileMutation();
    const profile = useAppSelector(selectUserProfile);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const onCrossPressHandle = () => {
        turnOffSpecialAssistanceBottomSheetModalRef?.current?.close();
    };

    const onTemporaryOffClick = () => {
        // Only clear the specialAssistance state temporarily without modifying the profile.
        dispatch(setSpecialAssistance({ id: authToken, payload: undefined }));
        turnOffSpecialAssistanceBottomSheetModalRef?.current?.close();
        specialAssistanceBottomSheetModalRef?.current?.close();
    };

    const onPermanentClick = () => {
        dispatch(setSpecialAssistance({ id: authToken, payload: currentAssistance }));

        const profileUpdatePayload: updateProfileReq = {
            disability: currentAssistance,
            hasDisability: hasDisability,
            email: profile?.email,
            firstName: profile?.firstName,
            gender: profile?.gender,
            middleName: profile?.middleName,
            lastName: profile?.lastName,
            androidId: undefined,
            bundleVersion: undefined,
            clientVersion: undefined,
            deviceId: undefined,
            deviceToken: undefined,
            enableOtpLessRide: undefined,
            language: undefined,
            notificationToken: undefined,
            referralCode: undefined,
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

        updateProfile(profileUpdatePayload)
            .unwrap()
            .then(_updatedProfile => {
                if (profile) {
                    const clientUpdatedProfile: profileRes = {
                        ...profile,
                        disability: currentAssistance?.tag,
                        hasDisability: hasDisability,
                    };
                    dispatch(setProfile({ id: authToken, payload: clientUpdatedProfile }));
                }
            })
            .catch(error => {
                console.warn('Failed to update profile:', error);
            });

        turnOffSpecialAssistanceBottomSheetModalRef?.current?.close();
        specialAssistanceBottomSheetModalRef?.current?.close();
    };
    const { bottom } = useSafeAreaInsets();
    return (
        <View
            style={{
                paddingTop: 24,
                paddingBottom: bottom,
                paddingHorizontal: 16,
                flexDirection: 'column',
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <Typography
                    type="subhead-800"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {hasDisability
                        ? userLanguageStrings.ChangeSpecialAssistance
                        : userLanguageStrings.TurnOffSpecialAssistance}
                </Typography>
                <CrossButton
                    onClick={onCrossPressHandle}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E3E8',
                        borderRadius: 20,
                        padding: 10,
                        borderWidth: 1,
                    }}
                />
            </View>

            {!hasDisability ? (
                <View style={{ paddingTop: 20 }}>
                    <Typography
                        type="subhead-700"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.TurnOffSpecialAssistanceDesc}
                    </Typography>
                </View>
            ) : null}

            <View style={{ paddingTop: 20 }}>
                <Button
                    testID="a05a1534-cb94-40bc-9cdf-6e4c4070c486"
                    type="primary"
                    text={
                        hasDisability
                            ? userLanguageStrings.ChangeSpecialAssistanceTemp
                            : userLanguageStrings.TurnOffAssistanceTemp
                    }
                    onPress={onTemporaryOffClick}
                    textType="subhead-800"></Button>
            </View>

            <View style={{ paddingTop: 20 }}>
                <Button
                    testID="dfa10f8a-c130-4878-a967-d038254e142f"
                    type="secondary"
                    text={
                        hasDisability
                            ? userLanguageStrings.ChangeSpecialAssistancePermanently
                            : userLanguageStrings.TurnOffAssistancePermanently
                    }
                    bgColor="#F1F2F750"
                    onPress={onPermanentClick}
                    textType="subhead-800"
                />
            </View>
        </View>
    );
};

export default TurnOffSpecialAssistance;
