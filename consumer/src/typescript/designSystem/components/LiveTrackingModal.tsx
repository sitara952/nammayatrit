import Animated from 'react-native-reanimated';
import Typography from './primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import EmergencyContactCard from './EmergencyContactCard';
import Divider from './primitives/Divider';
import { ImageSourcePropType, Share } from 'react-native';
import Button from '@/src-v2/primitives/Button';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useAppSelector } from '../../state/hooks';
import { BookingId, selectEmergencyContacts } from '../../state/client/user';
import { navigationRef } from '@/typescript/navigation/RootNavigation';
import { RideId, selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { selectRideDetailsWithId, setCurrentChatSessionId } from '@/typescript/state/client/ride';
import { useRefsContext } from '@/typescript/context/RefsContext';
import {
    setLiveSharingEmergencyContacts,
    selectLiveSharingEmergencyContacts,
    updateLiveSharingEmergencyContact,
    setToastProps,
    setCurrentEmergencyContact,
    APP_CONFIG,
} from '../../state/client/session';
import { useDispatch, useSelector } from 'react-redux';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import CleverTap from 'clevertap-react-native';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { useEffect } from 'react';
import nyIcDriverProfile from '../../../../android/app/src/nammaYatri/res/drawable/ny_ic_driver_profile.png';
import { useShareRidePostMutation } from '@/api/integrations/rtk/ShareRidePost.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { useProfileGetEmergencySettingsGetQuery } from '@/api/integrations/rtk/ProfileGetEmergencySettingsGet.ts';
import { Dispatch, SetStateAction } from 'react';
import { AppDispatch } from '@/typescript/state/store';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { isSafetyCheckTime } from '@/typescript/utils/time';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type LiveTrackingModalProps = {
    bookingId: BookingId | null;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const handleChatPress = (
    index: number,
    rideConfirmedBottomsheetModalRef: React.RefObject<BottomSheetModal | null>,
    rideConfirmedChatBottomsheetRef: React.RefObject<BottomSheetModal | null>,
    setIsBottomSheetChatOpen: Dispatch<SetStateAction<boolean>>,
    defaultEmergencyNumbers: personDefaultEmergencyNumberAPIEntity[],
    emergencyContacts: TransformedContact[],
    dispatch: AppDispatch, //ThunkDispatch<RootState, unknown, UnknownAction>,
    rideId: RideId | null,
    bookingId: BookingId | null,
) => {
    rideConfirmedBottomsheetModalRef.current?.close();
    rideConfirmedChatBottomsheetRef?.current?.expand();
    setIsBottomSheetChatOpen(true);
    const emergencyContact = defaultEmergencyNumbers.find(
        contact => contact.contactPersonId === emergencyContacts[index]?.contactPersonId,
    );
    dispatch(setCurrentEmergencyContact(emergencyContact));
    dispatch(
        setCurrentChatSessionId({
            id: rideId,
            payload: bookingId + '$' + emergencyContact?.contactPersonId,
        }),
    );
};

export type TransformedContact = {
    imgSrc: ImageSourcePropType;
    title: string;
    isRideShared: boolean;
    mobileNumber: string;
    contactPersonId: string | undefined;
    priority: number;
};

export const transformEmergencyContactsToLiveSharing = (
    contacts: personDefaultEmergencyNumberAPIEntity[],
    safetyCheckStartTime: number,
    safetyCheckEndTime: number,
) => {
    return (
        contacts.map((contact: personDefaultEmergencyNumberAPIEntity) => {
            return {
                imgSrc: nyIcDriverProfile,
                title: contact.name,
                isRideShared:
                    contact.shareTripWithEmergencyContactOption === 'ALWAYS_SHARE' ||
                    (contact.shareTripWithEmergencyContactOption === 'SHARE_WITH_TIME_CONSTRAINTS' &&
                        isSafetyCheckTime(safetyCheckStartTime, safetyCheckEndTime))
                        ? true
                        : false,
                mobileNumber: contact.mobileNumber,
                contactPersonId: contact.contactPersonId,
                priority: contact.priority,
            };
        }) || []
    );
};

export const constructShareMessage = (details: rideAPIEntity) => {
    const driverName = details?.driverName || '';
    const vehicleNumber = details?.vehicleNumber;
    const rideId = details?.id || '';
    const trackLink = `${APP_CONFIG.value.constants.websiteLink}u?vp=shareRide&rideId=${rideId}`;

    return `👋 Hey,\n\nI am riding with Driver ${driverName}!\n\nTrack this ride on: ${trackLink} \n\nVehicle number: ${vehicleNumber}`;
};

export const updateLiveSharingWithNewEmergencyContacts = (
    emergencyContacts: personDefaultEmergencyNumberAPIEntity[],
    liveSharingEmergencyContacts: TransformedContact[],
    safetyCheckStartTime: number,
    safetyCheckEndTime: number,
) => {
    const retainedLiveSharingContacts = liveSharingEmergencyContacts
        .map((liveContact: TransformedContact) => {
            //for updating existing live sharing contacts, if the relavent emergency contact's sharing option is updated.
            const emergencyContact = emergencyContacts.find(contact => liveContact.title === contact.name);
            if (emergencyContact) {
                // Update both isRideShared and priority for retained contacts
                const shouldShareRide =
                    emergencyContact.shareTripWithEmergencyContactOption === 'ALWAYS_SHARE' ||
                    (emergencyContact.shareTripWithEmergencyContactOption === 'SHARE_WITH_TIME_CONSTRAINTS' &&
                        isSafetyCheckTime(safetyCheckStartTime, safetyCheckEndTime));

                return {
                    ...liveContact,
                    isRideShared: liveContact.isRideShared || shouldShareRide,
                    priority: emergencyContact.priority,
                };
            }
            return liveContact;
        })
        .filter(
            //for removing any current live sharing contacts which are not in new emergency contacts.
            (liveContact: TransformedContact) => emergencyContacts.some(contact => liveContact.title === contact.name),
        );
    const newEmergencyContacts = emergencyContacts.filter((contact: personDefaultEmergencyNumberAPIEntity) => {
        return !liveSharingEmergencyContacts.find(
            liveContact => liveContact.contactPersonId === contact.contactPersonId,
        );
    });
    const newLiveSharingContacts = transformEmergencyContactsToLiveSharing(
        newEmergencyContacts,
        safetyCheckStartTime,
        safetyCheckEndTime,
    );
    const allContacts = [...retainedLiveSharingContacts, ...newLiveSharingContacts];
    // Sort based on priority in ascending order
    return [...allContacts].sort((a, b) => a.priority - b.priority);
};

const LiveTrackingModal = ({ bookingId, setIsBottomSheetChatOpen }: LiveTrackingModalProps) => {
    const dispatch = useDispatch();
    const emergencyContacts = useSelector(selectEmergencyContacts);
    const { liveSharingRef, rideConfirmedChatBottomsheetRef, rideConfirmedBottomsheetModalRef } = useRefsContext();
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const handleSafetySetup = () => {
        navigationRef.current?.navigate('ProfileTab', {
            screen: 'safetyScreen',
            params: {
                safetyStageId: 'trustedContacts',
            },
        });
        liveSharingRef.current?.close();
    };

    const {
        data: emergencySettings,
        refetch,
        isUninitialized,
    } = useProfileGetEmergencySettingsGetQuery({
        isPolling: false,
    });

    useEffect(() => {
        CleverTap.profileSet({
            key: 'Safety Setup Completed',
            value: emergencySettings?.hasCompletedSafetySetup,
        });
        CleverTap.profileSet({
            key: 'Mock Safety Drill Completed',
            value: emergencySettings?.hasCompletedMockSafetyDrill,
        });
        CleverTap.profileSet({
            key: 'Night Safety Check Enabled',
            value: emergencySettings?.nightSafetyChecks,
        });
    }, []);

    useEffect(() => {
        if (!isUninitialized && refetch) {
            refetch();
        }
    }, [isUninitialized]);

    const defaultEmergencyNumbers: personDefaultEmergencyNumberAPIEntity[] =
        emergencySettings?.defaultEmergencyNumbers || [];

    const liveSharingEmergencyContacts = useAppSelector(selectLiveSharingEmergencyContacts) ?? [];
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const safetyCheckStartTime: number = emergencySettings?.safetyCheckStartTime || 21 * 3600;
    const safetyCheckEndTime: number = emergencySettings?.safetyCheckEndTime || 6 * 3600;

    useEffect(() => {
        if (emergencyContacts.length === 0) return;
        const mergedContacts = updateLiveSharingWithNewEmergencyContacts(
            emergencyContacts,
            liveSharingEmergencyContacts,
            safetyCheckStartTime,
            safetyCheckEndTime,
        );
        if (JSON.stringify(mergedContacts) !== JSON.stringify(liveSharingEmergencyContacts)) {
            dispatch(setLiveSharingEmergencyContacts(mergedContacts));
        }
    }, [emergencyContacts]);

    const [shareRidePost] = useShareRidePostMutation();

    const handleShare = async (index: number) => {
        if (!liveSharingEmergencyContacts[index]?.isRideShared)
            dispatch(updateLiveSharingEmergencyContact({ index, isRideShared: true }));
        const mobileNumber = liveSharingEmergencyContacts[index]?.mobileNumber;
        if (mobileNumber) {
            try {
                await shareRidePost({
                    body: { emergencyContactNumbers: [mobileNumber] },
                }).unwrap();
                dispatch(
                    setToastProps({
                        message: 'Ride Shared!',
                        bottomSpanDescription: undefined,
                        useSpannedToast: false,
                        visible: true,
                        spannerType: 'top',
                        backgroundColor: `${colors.green900}`,
                        buttons: [],
                        logo: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        autoDismissAfter: 1000,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
            } catch (err) {
                console.error('Error calling share ride API:', err);
            }
        } else {
            console.warn('No mobile number found for contact:', liveSharingEmergencyContacts[index]);
        }
    };

    const shareLinkWithFriends = async (details: rideAPIEntity | null) => {
        if (details) {
            try {
                await Share.share({
                    message: constructShareMessage(details),
                });
            } catch (error) {
                console.error('Error sharing the link: ', error);
            }
        }
    };

    const { bottom } = useSafeAreaInsets();
    return (
        <Animated.View style={{ paddingHorizontal: 20, paddingTop: 36, paddingBottom: bottom }}>
            <Typography
                type={'subhead-1'}
                style={tailwind.style(`text-[${colors.gray200}]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={true}
                accessibilityLabel={'Permanent Sharing'}
                accessibilityRole={undefined}>
                {userLanguageStrings.permanentSharing}
            </Typography>
            <Typography
                type={'body-1'}
                style={tailwind.style(`pt-[7px] text-[${colors.gray300}]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={true}
                accessibilityLabel={'Set driver location to be shared with trusted contacts.'}
                accessibilityRole={undefined}>
                {userLanguageStrings.setDriverLocationToBeSharedWithTrustedContacts}
            </Typography>
            {liveSharingEmergencyContacts.map((contact, index) => {
                return (
                    <EmergencyContactCard
                        key={contact.contactPersonId}
                        contactPersonId={contact.contactPersonId}
                        sharingStatus={true}
                        isSwitch={true}
                        value={contact.isRideShared}
                        imgSrc={contact.imgSrc}
                        title={contact.title}
                        mobileNumber={contact.mobileNumber}
                        shareOnPress={() => handleShare(index)}
                        shouldDisable={contact.isRideShared}
                        chatOnPress={() =>
                            handleChatPress(
                                index,
                                rideConfirmedBottomsheetModalRef,
                                rideConfirmedChatBottomsheetRef,
                                setIsBottomSheetChatOpen,
                                defaultEmergencyNumbers,
                                liveSharingEmergencyContacts,
                                dispatch,
                                rideId,
                                bookingId,
                            )
                        }
                    />
                );
            })}
            <Animated.View style={tailwind.style('flex-row w-full items-end mt-7 justify-between')}>
                <Animated.View style={tailwind.style('w-[80%]')}>
                    <Divider
                        type={undefined}
                        direction={undefined}
                        style={tailwind.style('mb-2')}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row')}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Add or edit button'}
                        testID="39e708e2-3fcd-4071-9e01-e2bb1aaa12be"
                        onPress={handleSafetySetup}>
                        <Typography
                            type={'body-1'}
                            style={tailwind.style(`text-[${colors?.black600}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={true}
                            accessibilityLabel={'AddOrEdit'}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.addOrEdit}
                        </Typography>
                    </Pressable>
                </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-row items-end justify-between gap-[20px]')}>
                <Animated.View style={tailwind.style('mt-[16px]')}>
                    <Typography
                        type={'subhead-1'}
                        style={{ fontFamily: 'AreaNormal-Extrabold', color: colors.gray200 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'Temporary Live Tracking'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.temporaryLiveTracking}
                    </Typography>
                    <Typography
                        type={'body-1'}
                        style={tailwind.style(`pt-[7px] text-[${colors.gray300}] max-w-[163px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'Share live tracking link with anyone.'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.shareLiveTrackingLinkWithAnyone}
                    </Typography>
                </Animated.View>
                <Button
                    testID="2277e1a4-5359-42a1-a911-cc053dbb2217"
                    type={'primary'}
                    text="Share"
                    onPress={() => {
                        logEvent(EventName.NY_USER_SHARE_RIDE_VIA_LINK);
                        shareLinkWithFriends(rideDetails);
                    }}
                    textStyle={tailwind.style(`text-[${themeColors.TrackingModal_Button_Text_Color}]`)}
                    style={tailwind.style(`bg-[${themeColors.TrackingModal_Button_Color}]`)}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default LiveTrackingModal;
