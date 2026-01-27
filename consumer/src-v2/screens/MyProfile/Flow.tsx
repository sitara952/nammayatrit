import React from 'react';
import { useEffect, useState } from 'react';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyProfileScreenAction } from './Types';
import MyProfileScreen from './UI';
import CheckCircle from '../../../../consumer/src/typescript/components/svg/CheckCircle.tsx';
import colors from '../../../src/typescript/designSystem/colorPalette/index.ts';
import { setToastProps } from '../../../src/typescript/state/client/session.ts';
import { useRefsContext } from '../../../src/typescript/context/RefsContext.tsx';
import { createDispatcher, Resolver } from '../../../src/typescript/utils/common.ts';
import { useSafeAreaInsets } from '../../../../consumer/src/typescript/hooks/safeAreaInsets.ts';
import { selectToken } from '../../../src/typescript/state/client/auth.ts';
import { selectMobileNumber, selectUserProfile } from '../../../src/typescript/state/client/user.ts';
import { useAppDispatch, useAppSelector } from '../../../src/typescript/state/hooks.ts';
import { AccessibilityInfo } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList, ProfileTabParamList } from '@/typescript/navigation/globalParamList.tsx';
import { selectRideIdWithBookingId } from '@/typescript/state/client/booking.ts';
import { selectRideDetailsWithId } from '@/typescript/state/client/ride.ts';
import Danger from '@/typescript/components/svg/Danger.tsx';
import { useGetProfileQuery } from '@/typescript/state/server/userApi.ts';

export const MyProfileFlow = () => {
    const routeProp = useRoute<RouteProp<ProfileTabParamList, 'myProfile'>>();
    const dispatch = useAppDispatch();
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, routeProp.params.bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const userProfile = useAppSelector(selectUserProfile);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const userToken = useAppSelector(selectToken);
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { disabilityPopUp } = useRefsContext();
    const mobileNumber = useAppSelector(selectMobileNumber) ?? userProfile?.maskedMobileNumber ?? '';
    const { refetch, data: profileRes, isUninitialized } = useGetProfileQuery();
    const [name, setName] = useState(
        `${userProfile?.firstName || ''} ${userProfile?.middleName || ''} ${userProfile?.lastName || ''}`.trim(),
    );
    const onBackPress = () => {
        navigation.goBack();
    };
    const handleEditPress = (isDisability: boolean | undefined) => {
        if (rideDetails?.status === 'INPROGRESS' && isDisability) {
            dispatch(
                setToastProps({
                    message: userLanguageStrings.Cannoteditdisabilityduringanongoingride,
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    visible: true,
                    logo: <Danger />,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: 2000,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
        } else {
            navigation.navigate('ProfileTab', {
                screen: 'updateMyProfile',
                params: { bookingId: routeProp.params.bookingId },
            });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (!isUninitialized && refetch) {
                refetch();
            }
        }, [isUninitialized, refetch]),
    );

    useEffect(() => {
        if (profileRes) {
            setName(
                `${profileRes?.firstName || ''} ${profileRes?.middleName || ''} ${profileRes?.lastName || ''}`.trim(),
            );
        }
    }, [profileRes, dispatch, userToken]);

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('My Profile Screen', {
            queue: true,
        });
    }, []);

    const resolver: Resolver<MyProfileScreenAction> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                onBackPress();
                break;
            case 'EDIT':
                handleEditPress(action.payload?.isDisability);
                break;
            case 'CLOSE_POPUP':
                disabilityPopUp.current?.close();
                if (routeProp.params && routeProp.params.showPopup) {
                    dispatch(
                        setToastProps({
                            visible: true,
                            message: userLanguageStrings.ProfileUpdatedSuccessfully,
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
                }
                break;
            case 'SHOW_DISABILITY_POPUP':
                disabilityPopUp.current?.present();
        }
    };
    const mpDispatch = createDispatcher(resolver);

    return (
        <MyProfileScreen
            top={top}
            mpDispatch={mpDispatch}
            onBackPress={onBackPress}
            disabilityPopUp={disabilityPopUp}
            userLanguageStrings={userLanguageStrings}
            userProfile={userProfile}
            name={name}
            refetch={refetch}
            setName={setName}
            email={userProfile?.email}
            showPopup={undefined}
            mobileNumber={mobileNumber}
            rideStatus={rideDetails?.status}
        />
    );
};

export default MyProfileFlow;
