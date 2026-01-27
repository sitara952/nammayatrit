import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Linking, Share } from 'react-native';
import { tailwind } from '../tailwindTheme/tailwind';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import CloseIcon from '../components/svg/CloseIcon';
import { Icon } from '../components/Icon';
import colors from '../designSystem/colorPalette';
import token from '../designSystem/tokens';
import { personDefaultEmergencyNumberAPIEntity } from '../../readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { followers } from '../../readOnly/api/types/Followers.gen';
import CallIcon from '../assets/svg/symbols/CallIcon';
import FollowingIcon from '../assets/svg/symbols/Following';
import Divider from '../designSystem/components/primitives/Divider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../state/hooks';
import ShareIcon from '../assets/svg/symbols/ShareIcon';
import { useGetEmergencySettingsQuery, useGetFollowRideQuery } from '../state/server/emergencySettings.ts';
import { rideAPIEntity } from '../../readOnly/api/types/RideAPIEntity.gen';
import { selectRideIdWithBookingId } from '../state/client/booking.ts';
import { selectRideDetailsWithId } from '../state/client/ride.ts';
import { useConfigContext } from '../context/ConfigContext.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';

import CleverTap from 'clevertap-react-native';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { MainNavigationParamList } from '../navigation/globalParamList.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { constructShareMessage } from '../designSystem/components/LiveTrackingModal';
import { selectWentToHybridSection } from '../state/client/appinfo.ts';

const SafetyCardModal: React.FC = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const route = useRoute<RouteProp<MainNavigationParamList, 'safetyCard'>>();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { bookingId } = route.params;
    const hasRefetchedRef = useRef(false);

    const closeModal = () => {
        navigation.goBack();
    };

    interface ContactItemProps {
        profile: string;
        name: string;
        status: string;
        mobileNumber: string;
    }

    interface SubTitleProps {
        type: string;
        body: string;
    }

    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const wentToHybridSection = useAppSelector(selectWentToHybridSection);

    const handleSafetySetup = () => {
        navigation.navigate(
            'ProfileTab',
            {
                screen: 'safetyScreen',
                params: { safetyStageId: undefined },
            },
            { pop: true },
        );
    };

    const {
        data: emergencySettings,
        refetch,
        isUninitialized,
    } = useGetEmergencySettingsQuery({
        isPolling: false,
    });

    useFocusEffect(
        useCallback(() => {
            if (wentToHybridSection['safety'] && !hasRefetchedRef.current) {
                hasRefetchedRef.current = true;
                refetch();
            }
            return () => {
                hasRefetchedRef.current = false;
            };
        }, [wentToHybridSection, refetch]),
    );
    useEffect(() => {
        CleverTap.profileSet({
            key: 'Safety Setup Completed',
            value: emergencySettings?._0?.hasCompletedSafetySetup,
        });
        CleverTap.profileSet({
            key: 'Mock Safety Drill Completed',
            value: emergencySettings?._0?.hasCompletedMockSafetyDrill,
        });
        CleverTap.profileSet({
            key: 'Night Safety Check Enabled',
            value: emergencySettings?._0?.nightSafetyChecks,
        });
    }, []);

    useEffect(() => {
        if (!isUninitialized && refetch) refetch();
    }, [isUninitialized]);

    const defaultEmergencyNumbers: personDefaultEmergencyNumberAPIEntity[] =
        emergencySettings?._0?.defaultEmergencyNumbers || [];

    const hasTrustedContacts = defaultEmergencyNumbers.length > 0;

    const transformEmergencyContacts = (contacts: personDefaultEmergencyNumberAPIEntity[]) => {
        return (
            contacts.map((contact: personDefaultEmergencyNumberAPIEntity) => {
                const [firstName, lastName] = contact.name.split(' ');

                return {
                    name: contact.name,
                    profile: `${firstName?.[0] || 'A'}${lastName?.[0] || ''}`,
                    status: 'unknown',
                    id: contact.contactPersonId || '',
                    mobileNumber: contact.mobileNumber,
                };
            }) || []
        );
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

    const [contacts, setContacts] = useState(() => transformEmergencyContacts([]));

    useEffect(() => {
        if (defaultEmergencyNumbers.length > 0) {
            setContacts(transformEmergencyContacts(defaultEmergencyNumbers));
        }
    }, [defaultEmergencyNumbers]);

    const truncateLongText = (text: string) => {
        const maxLength = 20;
        if (text.length <= maxLength) {
            return text; // Return original text if it's within the limit
        }
        return text.slice(0, maxLength - 3) + '...'; // Truncate and add ellipsis
    };

    const { data: updatedStatuses } = useGetFollowRideQuery(rideId, {
        pollingInterval: 5000,
        skipPollingIfUnfocused: true,
    });

    useEffect(() => {
        if (updatedStatuses && updatedStatuses.TAG === 'Ok' && Array.isArray(updatedStatuses._0.details)) {
            const personIds: string[] = updatedStatuses?._0.details.map((follower: followers) => follower.personId);

            setContacts(prevContacts =>
                prevContacts.map(contact => ({
                    ...contact,
                    status: personIds.includes(contact.id) ? 'following' : 'unknown',
                })),
            );
        }
    }, [updatedStatuses]);

    const handleDialPress = (phoneNumber: string) => {
        const url = `tel:${phoneNumber}`;
        try {
            return Linking.openURL(url);
        } catch (error) {
            console.error('Unable to open dialer', error);
        }
        return undefined;
    };

    const ContactItem: React.FC<ContactItemProps> = ({ profile, name, status, mobileNumber }) => {
        return (
            <View style={tailwind.style('flex-row items-center bg-white p-4 rounded-[8px]]')}>
                <View
                    style={tailwind.style(
                        'w-10 h-10 bg-[' +
                            `${colors?.recovered?.yellowUltraHigh}` +
                            '] rounded-full items-center justify-center',
                    )}>
                    <Text style={tailwind.style(`text-[${colors?.primitive?.black?.[2]}] font-bold`)}>{profile}</Text>
                </View>

                <Typography
                    type="subhead-1"
                    style={[tailwind.style('text-[${colors?.primitive?.black?.[2]}] ml-4')]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {truncateLongText(name)}
                </Typography>

                {status === 'following' ? (
                    <Icon icon={<FollowingIcon />} size={20} style={tailwind.style('absolute right-5 mr-10')} />
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Call button'}
                        testID="safety_card_call_contact"
                        onPress={() => {
                            handleDialPress(mobileNumber);
                        }}
                        style={tailwind.style('absolute right-0 mr-4')}>
                        <Icon
                            icon={<CallIcon />}
                            size={20} // Adjusted size for better visibility
                        />
                    </Pressable>
                )}
            </View>
        );
    };

    const RenderSubTitle: React.FC<SubTitleProps> = ({ type, body }) => {
        return (
            <View style={tailwind.style('mt-1')}>
                <Typography
                    type="subhead-2"
                    style={[tailwind.style(`mt-1 text-[${colors?.primitive?.black?.[2]}]`)]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {type}
                </Typography>
                <Typography
                    type="body-subtext"
                    style={tailwind.style(`mt-1 text-[${colors?.primitive?.gray?.[12]}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {body}
                </Typography>
            </View>
        );
    };

    const ContactItemList = () => {
        return (
            <View
                style={[
                    tailwind.style(
                        `bg-white p-4 rounded-lg w-full justify-between mb-4 mt-4 border-[1px] border-[${colors?.primitive?.gray?.[14]}]`,
                    ),
                ]}>
                <RenderSubTitle
                    type={userLanguageStrings.AutomaticLiveTracking}
                    body={
                        userLanguageStrings.RideTrackingsharedwithtrustedcontactsYoucanalsosendacallremindertofollowyourridelive +
                        '.'
                    }
                />
                {contacts.map((contact, index) => (
                    <View key={contact.id || index}>
                        <ContactItem
                            key={index}
                            profile={contact.profile}
                            name={contact.name}
                            status={contact.status}
                            mobileNumber={contact.mobileNumber}
                        />
                        {index < contacts.length - 1 && (
                            <Divider
                                type="dashed"
                                direction={undefined}
                                style={undefined}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                                dividerColor={undefined}
                                strokeDashArray={undefined}
                            />
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const AutomaticTrackingSetup = () => (
        <View
            style={[
                tailwind.style(
                    `bg-white p-4 rounded-[${token?.corner?.md}] w-full justify-between mb-4 mt-4 border-[1px] border-[#E3E0E8]`,
                ),
            ]}>
            <RenderSubTitle
                type={userLanguageStrings.AutomaticLiveTracking}
                body={userLanguageStrings.Youhavenotsetupautomaticlivetrackingwithyourtrustedcontacts}
            />
            <Button
                testID="safety_card_setup_now"
                type="secondary"
                text={userLanguageStrings.SetupNow}
                textColor={colors?.recovered?.greyHigh}
                style={tailwind.style(`mt-4 justify-center bg-[${colors?.primitive?.gray?.[15]}]`)}
                onPress={handleSafetySetup}
            />
        </View>
    );

    const ManualTracking = () => (
        <View
            style={[
                tailwind.style(
                    `bg-white p-4 rounded-[${token?.corner?.md}] w-full justify-between mb-4 mt-2 border-[1px] border-[${colors?.primitive?.gray?.[14]}]`,
                ),
            ]}>
            <RenderSubTitle
                type={userLanguageStrings.ManualLiveTracking}
                body={userLanguageStrings.Sharealivetrackinglinkwithanyone}
            />
            <Button
                testID="safety_card_share_link"
                type="primary"
                text={userLanguageStrings.ShareLink}
                style={tailwind.style('mt-4 justify-center')}
                onPress={() => {
                    logEvent(EventName.NY_USER_SHARE_RIDE_VIA_LINK);
                    shareLinkWithFriends(rideDetails);
                }}
                prefix={<Icon icon={<ShareIcon fillColor="#FFFFFF" />} />}
            />
        </View>
    );

    const ShareRideFrame: React.FC<{ onClose: () => void }> = ({ onClose }) => (
        <View style={tailwind.style('mt-1 flex-row justify-between items-center')}>
            <Typography
                type="subhead-800"
                style={[tailwind.style(`mt-1 text-[${colors?.primitive?.black?.[2]}]`)]}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.ShareRide}
            </Typography>
            <Button
                testID="safety_card_close"
                type="secondary"
                size="md"
                onPress={onClose}
                style={tailwind.style('ml-5 flex-row items-center mb-2')}>
                <Icon
                    icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                    style={tailwind.style(`p-2px`)}
                    size={20}
                    color={colors?.primitive?.gray?.[8]}
                />
            </Button>
        </View>
    );

    return (
        <HardwareBackpressHandler onHardwareBackPress={closeModal}>
            <TouchableWithoutFeedback accessibilityRole="button" testID="safety_card_backdrop" onPress={closeModal}>
                <View
                    style={tailwind.style(
                        'flex-1 justify-end items-center bg-[' + `${colors?.primitive?.gray?.[11]}` + '] bg-opacity-50',
                    )}>
                    <TouchableWithoutFeedback accessibilityRole="button" testID="safety_card_content">
                        <View
                            style={tailwind.style(
                                'p-4 rounded-lg w-full bg-[' + `${colors?.primitive?.gray?.[11]}` + ']',
                                {
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    padding: 20,
                                },
                            )}>
                            <ShareRideFrame onClose={closeModal} />
                            {hasTrustedContacts ? <ContactItemList /> : <AutomaticTrackingSetup />}
                            <ManualTracking />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </HardwareBackpressHandler>
    );
};

export default SafetyCardModal;
