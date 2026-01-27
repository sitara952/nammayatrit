import React, { ReactElement, useMemo, useState } from 'react';
import { View, StyleSheet, Linking, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '../designSystem/tokens';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import ShareUserIcon from '../components/svg/Shareuser';
import CallActiveIcon from '../components/svg/Callactive';
import AlarmIcon from '../components/svg/Alarm';
import { BookingId } from '../state/client/user';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import Typography from '../designSystem/components/primitives/Typography';
import SvgComponent from '../components/svg/CloseIcon';
import { useRefsContext } from '../context/RefsContext';
import { strings } from 'config-types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
    BottomSheetStage,
    clearSession,
    selectRideChecksType,
    selectSafetyHelplineNo,
    setBottomSheetStage,
} from '../state/client/session';
import { selectAppReadableName } from '@/typescript/state/client/session';
import { useCancelBookingMutation } from '../state/server/bookingApi';
import { selectToken } from '../state/client/auth';
import { resetIds } from '../state/sharedReducer';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { useConfigContext } from '../context/ConfigContext';
import { AppDispatch } from '../state/store';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { selectRideIdWithBookingId } from '../state/client/booking';
import { useSosCreatePostMutation } from '@/api/integrations/rtk/SosCreatePost';
import { selectSosId, setSosId } from '../state/client/sos';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { getSafetyCreatePostBody } from '@/src-v2/screens/SafetyModule/Flow';

const SafetyAlertModal = ({
    onClose,
    bookingId = null,
    navigation,
}: {
    onClose: (type: RideChecksType) => void;
    bookingId: BookingId | null | undefined;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
}) => {
    const [primaryButtonOngoingAction, setPrimaryButtonOngoingAction] = useState(false);
    const type = useAppSelector(selectRideChecksType);
    const { bottom } = useSafeAreaInsets();
    const { rideSafetyModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const [cancelBooking] = useCancelBookingMutation();
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const onSheetClose = () => {
        rideSafetyModalRef.current?.close();
        onClose(type);
    };
    const rideChecksData = useMemo(
        () =>
            getRideData(
                type,
                userLanguageStrings,
                rideSafetyModalRef,
                navigation,
                bookingId,
                cancelBooking,
                onClose,
                setPrimaryButtonOngoingAction,
                dispatch,
                userToken,
            ),
        [type, userLanguageStrings, rideSafetyModalRef, navigation],
    );
    return (
        <Animated.View
            style={tailwind.style(
                `bg-[#F8F9FB] px-[${token?.spacing?.[16]}] pt-[24px] pb-[${bottom + 24}px] px-[${
                    token?.spacing?.[16]
                }] rounded-[15px] gap-[20px]`,
            )}>
            <View style={styles.header}>
                <Typography
                    type="subhead-4"
                    style={[tailwind.style('text-[#14171F] flex-1 pr-[16px]')]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {rideChecksData.title}
                </Typography>
                {rideChecksData.dismissable && (
                    <TouchableOpacity accessibilityRole="button" testID="safety_modal_close" onPress={onSheetClose}>
                        <View style={[tailwind.style(`bg-white`), styles.crossbox]}>
                            <SvgComponent color={undefined} height={undefined} width={undefined} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            {rideChecksData.description ? (
                <Typography
                    type="body-1"
                    style={[tailwind.style('text-[#14171F]')]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {rideChecksData.description}
                </Typography>
            ) : null}

            <View style={styles.optionsContainer}>
                {rideChecksData.content}
                {rideChecksData.footer ? (
                    <Typography
                        type="body-7"
                        style={[tailwind.style('text-[#5B6777]')]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {rideChecksData.footer}
                    </Typography>
                ) : null}
                <Button
                    testID="safety_modal_primary_action"
                    type="primary"
                    isLoading={primaryButtonOngoingAction}
                    text={rideChecksData.primaryButtonTitle}
                    onPress={() => {
                        if (!primaryButtonOngoingAction && rideChecksData.primaryButtonOnPress) {
                            rideChecksData.primaryButtonOnPress();
                        }
                    }}
                />
                {rideChecksData.secondaryButtonTitle ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="safety_modal_secondary_action"
                        style={[styles.secondaryButton, { backgroundColor: themeColors.Fill_neutralLow }]}
                        onPress={() => {
                            if (rideChecksData.secondaryButtonOnPress) {
                                rideChecksData.secondaryButtonOnPress();
                            }
                            onClose(type);
                        }}>
                        <Typography
                            type="subhead-4"
                            style={[tailwind.style(`text-[${themeColors.Text_neutralHigh}]`)]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {rideChecksData.secondaryButtonTitle}
                        </Typography>
                    </TouchableOpacity>
                ) : null}
            </View>
        </Animated.View>
    );
};

const Safety = ({
    userLanguageStrings,
    navigation,
    rideSafetyModalRef,
    bookingId,
}: {
    userLanguageStrings: strings;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    rideSafetyModalRef: React.RefObject<BottomSheetModal | null>;
    bookingId: BookingId | null;
}) => {
    const appName = useAppSelector(selectAppReadableName);
    const phoneNumber = '112';
    const { safetyNumber, enableSafetyCall } = useAppSelector(selectSafetyHelplineNo);
    const dispatch = useAppDispatch();
    const sosId = useAppSelector(selectSosId);
    const rideId: string | null = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));

    const [sosCreatePost] = useSosCreatePostMutation();

    const openDialer = async () => {
        if (sosId === undefined) {
            const sosReqBody = await getSafetyCreatePostBody(rideId, 'Police');
            sosCreatePost({ body: sosReqBody })
                .then(data => {
                    if (data.data?.sosId !== undefined) {
                        dispatch(setSosId(data?.data?.sosId));
                    }
                })
                .catch(err => console.error('Error in create sos api', err));
        }
        Linking.openURL(`tel:${phoneNumber}`);
    };
    const callHelpline = async () => {
        if (sosId === undefined) {
            const sosReqBody = await getSafetyCreatePostBody(rideId, 'CustomerCare');
            sosCreatePost({ body: sosReqBody })
                .then(data => {
                    if (data.data?.sosId !== undefined) {
                        dispatch(setSosId(data?.data?.sosId));
                    }
                })
                .catch(err => console.error('Error in create sos api', err));
        }
        Linking.openURL(`tel:${safetyNumber}`);
    };
    return (
        <>
            <TouchableOpacity
                accessibilityRole="button"
                testID="safety_modal_share_ride"
                style={styles.option}
                onPress={() => {
                    rideSafetyModalRef.current?.close();
                    navigation.navigate('safetyCard', { bookingId: bookingId, hideSideDrawer: false });
                }}>
                <ShareUserIcon />
                <View style={styles.optionTextContainer}>
                    <Typography
                        type="body-6"
                        style={[tailwind.style('text-[#14171F]')]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ShareRide}
                    </Typography>
                    <Typography
                        type="body-7"
                        style={[tailwind.style('text-[#5B6777]')]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Shareyourliveridedetailswithfriendsorfamily}
                    </Typography>
                </View>
            </TouchableOpacity>

            {enableSafetyCall && (
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="safety_modal_call_helpline"
                    style={styles.option}
                    onPress={callHelpline}>
                    <CallActiveIcon />
                    <View style={styles.optionTextContainer}>
                        <Typography
                            type="body-6"
                            style={[tailwind.style('text-[#14171F]')]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Helpline(appName)}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={[tailwind.style('text-[#5B6777]')]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.CallourTwo_Four_Six_supportteamforassistance}
                        </Typography>
                    </View>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                accessibilityRole="button"
                testID="safety_modal_call_112"
                style={styles.option}
                onPress={openDialer}>
                <AlarmIcon />
                <View style={styles.optionTextContainer}>
                    <Typography
                        type="body-6"
                        style={[tailwind.style('text-[#EA4848]')]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.CallOne_One_Two_}
                    </Typography>
                    <Typography
                        type="body-7"
                        style={[tailwind.style('text-[#5B6777]')]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.CallTwo_Four_Six_policehelpforemergencyassistance}
                    </Typography>
                </View>
            </TouchableOpacity>
        </>
    );
};

export enum RideChecksType {
    RideStoppage,
    RideDeviation,
    OtpRideExpired,
    Parking,
    TollIncluded,
    TollExcluded,
    DriverDemandExtra,
    AcVehicle,
    VehicleCleanliness,
    None,
    Acknowledged,
    TollAndParkingIncluded,
}

export interface RideChecksData {
    title: string;
    description: string | undefined;
    content: ReactElement;
    footer: string | undefined;
    dismissable: boolean;
    primaryButtonTitle: string;
    secondaryButtonTitle: string;
    primaryButtonOnPress: () => void;
    secondaryButtonOnPress: (() => void) | undefined;
}

export const getRideData = (
    type: RideChecksType,
    userLanguageStrings: strings,
    rideSafetyModalRef: React.RefObject<BottomSheetModal | null>,
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    bookingId: BookingId | null,
    cancelBooking: ReturnType<typeof useCancelBookingMutation>[0],
    onClose: (type: RideChecksType) => void,
    setPrimaryButtonOngoingAction: React.Dispatch<React.SetStateAction<boolean>>,
    dispatch: AppDispatch,
    userToken: string | null,
): RideChecksData => {
    const defaultRideChecksData: RideChecksData = {
        title: '',
        content: <View />,
        footer: '',
        dismissable: true,
        primaryButtonTitle: userLanguageStrings.ImAlright,
        description: undefined,
        secondaryButtonTitle: '',
        primaryButtonOnPress: () => {
            rideSafetyModalRef.current?.close();
            onClose(type);
        },
        secondaryButtonOnPress: undefined,
    };

    switch (type) {
        case RideChecksType.RideStoppage: {
            return {
                ...defaultRideChecksData,
                title: userLanguageStrings.Routestoppagedetected,
                description:
                    userLanguageStrings.WenoticedyourdriverhasntmovedforawhileAreyoufeelingsafeonyourtrip_QuestionMark,
                primaryButtonOnPress: () => {
                    logEvent(EventName.NY_USER_NIGHT_SAFETY_MARK_I_FEEL_SAFE);
                    rideSafetyModalRef.current?.close();
                    onClose(type);
                },
                secondaryButtonOnPress: () => {
                    logEvent(EventName.NY_USER_NIGHT_SAFETY_MARK_NEED_HELP);
                },
                content: (
                    <Safety
                        userLanguageStrings={userLanguageStrings}
                        navigation={navigation}
                        rideSafetyModalRef={rideSafetyModalRef}
                        bookingId={bookingId}
                    />
                ),
            };
        }
        case RideChecksType.RideDeviation: {
            return {
                ...defaultRideChecksData,
                title: userLanguageStrings.Routedeviationdetected,
                description:
                    userLanguageStrings.WenoticedyourdriverhastakenadifferentrouteAreyoufeelingsafeonyourtrip_QuestionMark,
                primaryButtonOnPress: () => {
                    logEvent(EventName.NY_USER_NIGHT_SAFETY_MARK_I_FEEL_SAFE);
                    rideSafetyModalRef.current?.close();
                    onClose(type);
                },
                secondaryButtonOnPress: () => {
                    logEvent(EventName.NY_USER_NIGHT_SAFETY_MARK_NEED_HELP);
                },
                content: (
                    <Safety
                        userLanguageStrings={userLanguageStrings}
                        navigation={navigation}
                        rideSafetyModalRef={rideSafetyModalRef}
                        bookingId={bookingId}
                    />
                ),
            };
        }
        case RideChecksType.TollExcluded: {
            return {
                ...defaultRideChecksData,
                title: userLanguageStrings.TollChargesareNOTincludedinyourFinalFare,
                footer: userLanguageStrings.Pleasepayitseparatelytothedriveronlyifatollwascrossed,
                primaryButtonTitle: userLanguageStrings.Gotit,
                content: (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Image
                            accessible={true}
                            accessibilityLabel="toll excluded image"
                            height={215}
                            width={343}
                            source={{ uri: 'mt_ic_toll_excluded', height: 215, width: 343 }}
                        />
                    </View>
                ),
            };
        }
        case RideChecksType.OtpRideExpired: {
            return {
                ...defaultRideChecksData,
                title: userLanguageStrings.OtpRideHasExpired,
                dismissable: false,
                footer: undefined,
                primaryButtonTitle: userLanguageStrings.CancelBooking,
                primaryButtonOnPress: () => {
                    if (bookingId) {
                        setPrimaryButtonOngoingAction(true);
                        const cancelBookingReq = {
                            bookingId: bookingId,
                            data: {
                                additionalInfo: 'Otp Ride Expired',
                                reallocate: false,
                                reasonCode: 'OTP_RIDE_EXPIRED',
                                reasonStage: 'OnAssign',
                            },
                        };
                        cancelBooking(cancelBookingReq).then(() => {
                            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'otp_ride_expired' }));
                            dispatch(clearSession());
                            resetIds(userToken, bookingId, dispatch);
                            rideSafetyModalRef.current?.close();
                            setPrimaryButtonOngoingAction(false);
                            navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                        });
                    }
                },
            };
        }
        default:
            return defaultRideChecksData;
    }
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionsContainer: {
        gap: 12,
    },
    crossbox: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        width: 48,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        padding: 12,
        gap: 6,
        height: 64,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
    },
    optionTextContainer: {
        flex: 1,
        gap: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#5B6777',
    },
    alrightButton: {
        backgroundColor: '#E67E22',
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 12,
        alignItems: 'center',
    },
    alrightButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SafetyAlertModal;
