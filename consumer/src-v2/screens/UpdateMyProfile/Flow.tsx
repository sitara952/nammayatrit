import { useEffect, useRef, useState } from 'react';
import { selectMobileNumber, selectUserProfile } from '@/typescript/state/client/user.ts';
import { setToastProps } from '@/typescript/state/client/session.ts';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import CheckCircle from '@/typescript/components/svg/CheckCircle.tsx';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { AccessibilityInfo, ToastAndroid } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ProfileTabParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { decodeGender, toScreamingSnakeCase } from '@/src-v2/utils/common';
import { UpdateMyProfileScreenActions, UpdateMyProfileScreenProps } from './Types';
import UpdateMyProfile from './UI';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useDisabilityListGetQuery } from '@/api/integrations/rtk/DisabilityListGet';
import { selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { selectRideDetailsWithId } from '@/typescript/state/client/ride';
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { useUpdateProfileMutation } from '@/typescript/state/server/userApi';
import { useLazyGetProfileQuery } from '@/typescript/state/server/userApi';
import { disability } from '@/readOnly/api/types/Disability.gen';
import { validateInput } from '@/typescript/utils/common.ts';

export const UpdateMyProfileFlow = () => {
    const route = useRoute<RouteProp<ProfileTabParamList, 'updateMyProfile'>>();
    const userProfile = useAppSelector(selectUserProfile);
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, route.params.bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const { disabilityPopUp } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<ProfileTabParamList>>();
    const [hideAssesibility, setHideAssesibility] = useState(false);

    const [name, setName] = useState(
        `${userProfile?.firstName || ''} ${userProfile?.middleName || ''} ${userProfile?.lastName || ''}`
            .replace(/\s+/g, ' ')
            .trim(),
    );

    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<string>(toScreamingSnakeCase(userProfile?.gender || ''));
    const [selectedDisability, setSelectedDisability] = useState(userProfile?.hasDisability ? 1 : 0);
    const disabilityResponse = useDisabilityListGetQuery({});
    const mobileNumber = useAppSelector(selectMobileNumber) ?? userProfile?.maskedMobileNumber ?? '';
    useEffect(() => {
        if (disabilityResponse.data) {
            setDisabilityData(disabilityResponse.data);
        } else if (disabilityResponse.error) {
            ToastAndroid.show('Error fetching disability data', ToastAndroid.SHORT);
        }
    }, [disabilityResponse.data, disabilityResponse.error]);

    const [disabilityData, setDisabilityData] = useState<disability[]>([]);
    const selectedDisabilityStr = useRef<disability>({
        description: '',
        id: '',
        tag: '',
    });

    const { disabilityScreenBottomSheetModalRef } = useRefsContext();
    const dispatch = useAppDispatch();
    const nameParts = name.trim().split(/\s+/);
    const [updateProfile] = useUpdateProfileMutation();
    const [refetch] = useLazyGetProfileQuery({});
    const [emailError, setEmailError] = useState<string>('');

    const handleSubmit = async () => {
        if (selectedDisability === 1 && selectedDisabilityStr.current.description === '') {
            setHideAssesibility(true);
            disabilityScreenBottomSheetModalRef.current?.present();
            return;
        }
        const emailValid = validateInput('email', email, undefined);
        const updatedGender = toScreamingSnakeCase(gender);
        const namePartsCount = nameParts.length;

        if (!emailValid) {
            setEmailError(userLanguageStrings.Entervalidemail);
            return;
        }

        if (userProfile != null) {
            const updateProfileReq: updateProfileReq = {
                disability: selectedDisability === -1 ? undefined : selectedDisabilityStr.current,
                email: email !== '' ? email : undefined,
                firstName: nameParts[0],
                gender: decodeGender(updatedGender),
                hasDisability: selectedDisability === -1 ? undefined : selectedDisability !== 0,
                middleName: namePartsCount > 2 ? nameParts.slice(1, namePartsCount - 1).join(' ') : '',
                lastName: namePartsCount > 1 ? nameParts[namePartsCount - 1] : '',
                enableOtpLessRide: undefined,
                deviceToken: undefined,
                notificationToken: undefined,
                androidId: undefined,
                bundleVersion: undefined,
                clientVersion: undefined,
                deviceId: undefined,
                language: undefined,
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

            try {
                await updateProfile(updateProfileReq)
                    .unwrap()
                    .then(() => {
                        refetch();
                    });
                disabilityScreenBottomSheetModalRef.current?.close();

                navigation.popTo('myProfile', {
                    refetchProfile: true,
                    showPopup: selectedDisability === 1,
                    bookingId: route.params.bookingId,
                });

                dispatch(
                    setToastProps({
                        visible: selectedDisability === 0,
                        message: 'Profile Updated Successfully',
                        backgroundColor: `${colors.recovered.greenMidHigh}`,
                        autoDismissAfter: 2000,
                        logo: <CheckCircle />,
                        buttons: [],
                        spannerType: 'bottom',
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                setTimeout(() => {
                    if (selectedDisability === 1) {
                        disabilityPopUp.current?.present();
                    }
                }, 150);
            } catch (err) {
                console.error('Profile Update Error:', err);
            }
        }
    };

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Update My Profile Screen', { queue: true });
    }, []);

    const resolver: Resolver<UpdateMyProfileScreenActions> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                navigation.goBack();
                break;
            case 'CONTINUE_CLICKED':
                handleSubmit();
                break;
        }
    };
    const upDispatch = createDispatcher(resolver);

    const viewState: UpdateMyProfileScreenProps = {
        name,
        userProfile,
        setName,
        email,
        setEmail,
        gender,
        setGender,
        selectedDisability,
        setSelectedDisability,
        disabilityData,
        selectedDisabilityStr,
        handleSubmit,
        userLanguageStrings,
        disabilityScreenBottomSheetModalRef,
        upDispatch,
        hideAssesibility,
        setHideAssesibility,
        mobileNumber,
        rideStatus: rideDetails?.status,
        emailError: emailError,
    };

    return <UpdateMyProfile {...viewState} />;
};

export default UpdateMyProfileFlow;
