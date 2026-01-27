import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import colors from '../../designSystem/colorPalette';
import Button from '@/src-v2/primitives/Button';
import Animated from 'react-native-reanimated';
import Typography from '../../designSystem/components/primitives/Typography';
import { getInitials } from '@/typescript/utils/common';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CloseIcon from '../../components/svg/CloseIcon';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { BookingId, selectEmergencyContacts, selectUserProfile } from '@/typescript/state/client/user';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { setCurrentChatSessionId } from '@/typescript/state/client/ride';
import { selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { SecondaryMessageIcon } from '@/typescript/components/svg/secondarymessageicon';
import { CallIcon } from '@/typescript/components/svg/CallIcon';
import Avatar from '@/typescript/designSystem/components/primitives/Avatar';
import NameInitials from '@/typescript/designSystem/components/NameInitials';
import { selectAppConfig, selectOperatingCity, setCurrentEmergencyContact } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppReadableName } from '../../state/client/session';
import { shareApp } from '@/src-v2/utils/common';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { truncateDriverName } from '@/src-v2/utils/common';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';
interface props {
    avatarUri: string;
    driverName: string | undefined;
    sheetRef: React.RefObject<BottomSheetModal | null>;
    showDriver: boolean;
    bookingId: BookingId | null;
    isDriver: boolean;
    setIsDriver: React.Dispatch<React.SetStateAction<boolean>>;
}

const MultiChatSheet: React.FC<props> = ({
    avatarUri,
    driverName,
    sheetRef,
    showDriver,
    bookingId,
    setIsDriver,
}: props) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const style = styles(bottom);
    const dispatch = useAppDispatch();
    const emergencyContactsData = useAppSelector(selectEmergencyContacts) ?? [];
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const appName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const userProfile = useAppSelector(selectUserProfile);
    const operatingCity = useAppSelector(selectOperatingCity);
    const { callDriverBottomsheetModalRef, multiChatRef } = useRefsContext();
    const truncatedDriverName = truncateDriverName(driverName);
    const driverPhotoUri = useDriverPhotoUri(avatarUri);

    const onCardClick = (item: personDefaultEmergencyNumberAPIEntity) => {
        setIsDriver(false);
        if (item.contactPersonId != '' && item.contactPersonId != undefined) {
            console.info('Current emergency contact:0 ', item?.contactPersonId);
            dispatch(setCurrentEmergencyContact(item));
            dispatch(
                setCurrentChatSessionId({
                    id: rideId,
                    payload: bookingId + '$' + item?.contactPersonId,
                }),
            );
            multiChatRef?.current?.dismiss();
        } else {
            //todo - add referal bottomsheet
        }
    };
    const emergencyContactsList = emergencyContactsData
        ?.map((item: personDefaultEmergencyNumberAPIEntity, index: number) => {
            const nameInitial = getInitials(item.name);
            return (
                <Animated.View
                    style={[
                        {
                            width: '100%',
                            backgroundColor: colors.primitive.white[10],
                            padding: 12,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                        },
                        tailwind.style('justify-between'),
                    ]}>
                    <TouchableOpacity
                        testID={`83d935fe-997f-41ff-98ca-ce3bc3dc2d1c-${index}`}
                        activeOpacity={0.5}
                        accessibilityRole="button"
                        onPress={() => onCardClick(item)}
                        style={tailwind.style('flex-1 flex-row items-center justify-start mr-10')}
                        accessibilityLabel={`Chat with ${item.name ? item.name : 'trusted contact'}`}
                        accessibilityHint="Click to open chat">
                        <NameInitials
                            nameInitial={item.name ? nameInitial.toUpperCase() : userLanguageStrings.User}
                            textStyle={undefined}
                            style={undefined}
                        />
                        <Typography
                            type="body"
                            style={tailwind.style('ml-[10px]')}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {item.name || userLanguageStrings.User}
                        </Typography>
                    </TouchableOpacity>
                    {item.contactPersonId != '' && item.contactPersonId != undefined ? (
                        <Animated.View style={tailwind.style(' flex-row items-center justify-center')}>
                            <Button
                                testID={`6fe3c651-7dba-4113-8def-2039c2774fc1-${index}`}
                                accessibilityLabel={`Chat with ${item.name ? item.name : 'trusted contact'}`}
                                accessibilityHint="Click to open chat"
                                type="secondary"
                                style={tailwind.style(
                                    'mr-2 z-50 w-48px h-40px border-[#E0E3E8] border rounded-[19px] px-16px py-12px items-center',
                                )}
                                onPress={() => {
                                    setIsDriver(false);
                                    dispatch(setCurrentEmergencyContact(item));
                                    dispatch(
                                        setCurrentChatSessionId({
                                            id: rideId,
                                            payload: bookingId + '$' + item?.contactPersonId,
                                        }),
                                    );
                                    multiChatRef?.current?.dismiss();
                                }}>
                                <SecondaryMessageIcon fillColor="black" />
                            </Button>
                            <Button
                                testID={`c4d11b7f-437d-4e35-9693-eb9f81283de0-${index}`}
                                accessibilityLabel={`Call ${item.name ? item.name : ' trusted contact'}`}
                                accessibilityHint="Click to call"
                                type="secondary"
                                style={tailwind.style(
                                    ' w-48px h-40px border-[#E0E3E8] border rounded-[19px] px-16px py-12px items-center',
                                )}
                                onPress={() => {
                                    Linking.openURL(`tel:${item.mobileNumber}`);
                                }}>
                                <CallIcon />
                            </Button>
                        </Animated.View>
                    ) : (
                        <Button
                            testID={`4aaf0fa2-47a4-4208-93b2-f415557877aa-${index}`}
                            accessibilityLabel={`Invite contact ${item.name}`}
                            accessibilityHint="Click to invite"
                            type="secondary"
                            style={tailwind.style('')}
                            onPress={() => {
                                shareApp(
                                    operatingCity,
                                    userProfile?.customerReferralCode || '',
                                    appName,
                                    userLanguageStrings,
                                    appConfig.flowConfig.shareReferralLink,
                                );
                            }}>
                            <Typography
                                type="subhead"
                                style={tailwind.style('text-blue-600 ')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Invite}
                            </Typography>
                        </Button>
                    )}
                </Animated.View>
            );
        })
        .concat(
            showDriver ? (
                <Animated.View
                    style={[
                        {
                            width: '100%',
                            backgroundColor: colors.primitive.white[10],
                            padding: 12,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        },
                    ]}>
                    <TouchableOpacity
                        testID="0341c2b6-cc37-42d6-be15-c92a75d0ba23"
                        activeOpacity={0.5}
                        accessibilityLabel={`Chat with ${driverName ? driverName + ' Driver' : 'Driver'}`}
                        accessibilityHint="Click to open chat"
                        accessibilityRole="button"
                        style={tailwind.style('flex-1')}
                        onPress={() => {
                            dispatch(setCurrentEmergencyContact(undefined));
                            setIsDriver(true);
                            dispatch(
                                setCurrentChatSessionId({
                                    id: rideId,
                                    payload: bookingId,
                                }),
                            );
                            multiChatRef?.current?.dismiss();
                        }}>
                        <Animated.View style={[tailwind.style(' flex-row justify-start mr-16')]}>
                            <View
                                style={{
                                    borderRadius: 20,
                                    marginRight: 16,
                                }}>
                                <Avatar uri={driverPhotoUri} style={undefined} type="sm" isLink={false} />
                            </View>
                            <View style={tailwind.style(' flex-col')}>
                                <Typography
                                    numberOfLines={1}
                                    type="body"
                                    style={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {truncatedDriverName || 'Driver'}
                                </Typography>
                                <Typography
                                    numberOfLines={1}
                                    type="body-subtext"
                                    style={tailwind.style('text-[#5B6777]')}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.YourDriver}
                                </Typography>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>

                    <Animated.View style={tailwind.style(' flex-row items-center justify-center')}>
                        <Button
                            testID="593fe32c-9285-49d9-b161-50b67645632d"
                            accessibilityLabel={`Chat with ${driverName ? driverName + ' Driver' : 'Driver'}`}
                            accessibilityHint="Click to open chat"
                            type="secondary"
                            style={tailwind.style(
                                'mr-2 z-50 w-48px h-40px border-[#E0E3E8] border rounded-[19px] px-16px py-12px items-center',
                            )}
                            onPress={() => {
                                dispatch(setCurrentEmergencyContact(undefined));
                                setIsDriver(true);
                                dispatch(
                                    setCurrentChatSessionId({
                                        id: rideId,
                                        payload: bookingId,
                                    }),
                                );
                                multiChatRef?.current?.dismiss();
                            }}>
                            <SecondaryMessageIcon fillColor="black" />
                        </Button>
                        <Button
                            testID="cb7907e1-e9a8-43ac-bc17-46fccbc1e582"
                            accessibilityLabel={`Call ${driverName ? driverName + ' Driver' : 'Driver'}`}
                            accessibilityHint="Click to call driver"
                            type="secondary"
                            style={tailwind.style(
                                ' w-48px h-40px border-[#E0E3E8] border rounded-[19px] px-16px py-12px items-center',
                            )}
                            onPress={() => {
                                callDriverBottomsheetModalRef?.current?.present();
                            }}>
                            <CallIcon />
                        </Button>
                    </Animated.View>
                </Animated.View>
            ) : (
                []
            ),
        );

    return (
        <>
            <Animated.View style={[style.parent]}>
                <Animated.View style={style.header}>
                    <Typography
                        type="subhead"
                        style={style.headerTitle}
                        numberOfLines={2}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {showDriver
                            ? emergencyContactsData.length !== 0
                                ? userLanguageStrings.Contactatrustedcontactoryourdriver
                                : userLanguageStrings.Contactyourdriver
                            : userLanguageStrings.Contactatrustedcontact}
                    </Typography>
                    <Button
                        testID="a8b37f38-285e-472a-9682-62bf8cdb2235"
                        size="md"
                        type={'secondary'}
                        style={style.close}
                        prefix={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                        onPress={() => {
                            sheetRef.current?.dismiss();
                        }}
                    />
                </Animated.View>
                {emergencyContactsList}
            </Animated.View>
        </>
    );
};

export default MultiChatSheet;

const styles = (bottom: number) => {
    return StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        parent: {
            backgroundColor: colors.primitive.gray[11],
            padding: 16,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            paddingBottom: bottom,
            gap: 20,
        },
        close: {
            borderRadius: 20,
            width: 48,
            height: 40,
            justifyContent: 'center',
            zIndex: 1000000,
        },
        headerTitle: { width: 220 },
    });
};
