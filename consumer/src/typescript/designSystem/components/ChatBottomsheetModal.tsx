import mtIcInd from '../../assets/ny-service/mt_ic_ind.webp';
import Animated from 'react-native-reanimated';
import colors from '../../designSystem/colorPalette';
import React, { useEffect, useRef, useMemo } from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import LeftArrow from '../../assets/svg/direction/LeftArrow';
import Avatar from './primitives/Avatar';
import Typography from './primitives/Typography';
import Conversation from './Conversation';
import Divider from './primitives/Divider';
import { AccessibilityInfo, Linking, StyleSheet, View } from 'react-native';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { getInitials } from '@/typescript/utils/common';
import { useRefsContext } from '../../context/RefsContext';
import { Keyboard } from 'react-native';
import ic_driver_default_profile from '../../assets/base64/ic_driver_default_profile';
import ic_user_default_profile from '../../assets/base64/ic_user_default_profile';
import { getVehicleNumber } from '../../screens/chat/utils';
import CallButton from '../../components/svg/CallButton.tsx';
import NameInitials from '../../designSystem/components/NameInitials.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectCurrentChatSessionIdWithId, selectRideDetailsWithId } from '@/typescript/state/client/ride.ts';
import { selectChatSessionWithId } from '@/typescript/state/client/chat.ts';
import { selectCurrentEmergencyContact } from '@/typescript/state/client/session';
import ChevronDownIcon from '@/typescript/components/common/ChevronDownIcon';
import { FlatList } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectFeatureFlags } from '../../state/client/session.ts';
import { RideId } from '@/typescript/state/client/booking.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen.tsx';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';

type DriverChatHeaderTypes = {
    merchantExoPhone: string | undefined;
    rideId: RideId | null;
    isDriver: boolean;
    name: string;
    nameInitial: string;
    onClose: () => void;
    vehicleServiceType: ServiceTierType_serviceTierType | undefined;
};

export const DriverChatHeader = ({
    rideId,
    isDriver,
    name,
    nameInitial,
    onClose,
    vehicleServiceType,
}: DriverChatHeaderTypes) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const featureFlags = useAppSelector(selectFeatureFlags);
    const { multiChatRef } = useRefsContext();
    const closeButtonRef = useRef<View>(null);
    const mainContentRef = useRef<View>(null);

    // Initialize accessibility focus management
    const accessibilityFocusConfig = useMemo(
        () => ({
            mainContentRef,
            focusDelay: 100,
            accessibilityDelay: 50,
            maxStackSize: 10,
        }),
        [],
    );

    const accessibilityFocus = useAccessibilityFocus(accessibilityFocusConfig);
    const handleDriverProfile = () => {
        chatBottomsheetModalRef?.current?.close();
        if (featureFlags.showDriverProfile) {
            navigation.navigate('driverProfile', {
                rideId: rideId,
                vehicleServiceType: vehicleServiceType,
                driverId: null,
            });
        }
    };
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const { chatBottomsheetModalRef, callDriverBottomsheetModalRef } = useRefsContext();
    const vehicleNumber: string = useMemo(() => {
        if (rideDetails) {
            return getVehicleNumber(rideDetails?.vehicleNumber);
        } else {
            return '';
        }
    }, [rideDetails]);

    const driverPhotoUri = useDriverPhotoUri(rideDetails?.driverImage);

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Chat view', {
            queue: true,
        });
        // Push chat header to focus stack and set focus to close button
        accessibilityFocus.pushToFocusStack(closeButtonRef, 'chat-header');
        accessibilityFocus.setFocus(closeButtonRef);
    }, [accessibilityFocus.pushToFocusStack, accessibilityFocus.setFocus]);

    return (
        <Animated.View
            style={tailwind.style(`px-[${token?.spacing?.[20]}] pb-[${token?.spacing?.[12]}] flex-row items-center `)}>
            <Pressable
                testID="a9eb4d79-7be5-4fc8-8221-dfa92c9464fc"
                accessible
                accessibilityLabel="close chat button"
                accessibilityRole="button"
                accessibilityHint="Double tap to close chat and return to previous screen"
                onPress={() => {
                    onClose();
                    Keyboard.dismiss();
                    chatBottomsheetModalRef?.current?.dismiss();
                    // Pop from focus stack and restore focus to previous element
                    accessibilityFocus.popFromFocusStack();
                    accessibilityFocus.restoreFocus();
                    // Announce that chat is closing for accessibility users
                    AccessibilityInfo.announceForAccessibilityWithOptions('Chat closed', {
                        queue: true,
                    });
                }}>
                <Animated.View style={tailwind.style('mr-2')}>
                    <LeftArrow />
                </Animated.View>
            </Pressable>
            <Animated.View
                style={[tailwind.style('flex-row justify-start items-center w-[70%] p-1 bg-[#E8F1FF] rounded-[29px]')]}>
                {isDriver ? (
                    <Pressable
                        testID="19a180b4-e9da-4bcb-8303-5d4c0f751530"
                        onPress={handleDriverProfile}
                        accessible
                        accessibilityLabel="Driver profile button"
                        accessibilityHint="Click to see driver profile"
                        accessibilityRole="imagebutton">
                        <Avatar uri={driverPhotoUri} type="md" isLink={true} style={undefined} />
                    </Pressable>
                ) : (
                    <NameInitials nameInitial={nameInitial} textStyle={undefined} style={undefined} />
                )}
                <Pressable
                    testID="3e91fddd-0cfc-487f-a9d7-7d4599d86351"
                    accessibilityLabel={`Currently chatting with ${isDriver ? 'Driver' : name} button`}
                    accessibilityHint="Click to switch chat"
                    accessibilityRole="button"
                    onPress={() => {
                        chatBottomsheetModalRef.current?.dismiss();
                        multiChatRef.current?.present();
                    }}>
                    <Animated.View
                        accessibilityElementsHidden={true}
                        importantForAccessibility={'no-hide-descendants'}
                        style={[tailwind.style('flex-row w-[85%] justify-between items-center')]}>
                        <Animated.View style={tailwind.style(`pl-[${token?.spacing?.[12]}] items-center`)}>
                            {rideDetails ? (
                                <Typography
                                    type="subhead"
                                    style={tailwind.style(' overflow-hidden truncate')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {isDriver ? rideDetails.driverName : name}
                                </Typography>
                            ) : null}
                            {isDriver ? (
                                <Animated.View
                                    style={tailwind.style(
                                        `rounded-[2.469px] h-[21px] bg-[${colors?.recovered?.yellowMid}] mt-[4px] p-1px self-baseline`,
                                    )}>
                                    <Animated.View
                                        style={tailwind.style(
                                            `border-[0.823px] border-[${colors?.recovered?.blueMax}] h-full rounded-[2.469px] flex-row self-baseline justify-center`,
                                        )}>
                                        <Animated.Image
                                            accessible={false}
                                            style={tailwind.style('h-full w-[13px] ml--1px')}
                                            source={mtIcInd}
                                        />
                                        {rideDetails?.vehicleNumber && (
                                            <Typography
                                                type="callout"
                                                style={[
                                                    tailwind.style(
                                                        'text-[#000] text-[9px] px-1 leading-[10px] self-center',
                                                    ),
                                                    style.vehicleNumberFont,
                                                ]}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {vehicleNumber}
                                            </Typography>
                                        )}
                                    </Animated.View>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                        <Animated.View>
                            <ChevronDownIcon
                                size={15}
                                color="#1D74F6"
                                paddingLeft={undefined}
                                paddingRight={undefined}
                                paddingBottom={undefined}
                                paddingTop={undefined}
                            />
                        </Animated.View>
                    </Animated.View>
                </Pressable>
            </Animated.View>
            <View />
            <Pressable
                testID="8974290e-64ae-4dbb-819c-0ca96fcc0b74"
                accessibilityLabel={`${isDriver ? 'Call Driver' : 'Call this emergency contact'} button`}
                accessibilityRole="button"
                onPress={() => {
                    if (isDriver) {
                        callDriverBottomsheetModalRef?.current?.present();
                        AccessibilityInfo.announceForAccessibilityWithOptions('Calling Driver', { queue: true });
                    } else {
                        Linking.openURL(`tel:${currentEmergencyContact?.mobileNumber}`);
                        AccessibilityInfo.announceForAccessibilityWithOptions('Calling current emergency contact', {
                            queue: true,
                        });
                    }
                    Keyboard.dismiss();
                }}>
                <CallButton fill={themeColors.APP_THEME_COLOR} />
            </Pressable>
        </Animated.View>
    );
};

type ChatBottomsheetModalTypes = {
    merchantExoPhone: string | undefined;
    rideId: RideId | null;
    isDriver: boolean;
    onClose: () => void;
};

const ChatBottomsheetModal = ({ merchantExoPhone, rideId, isDriver, onClose }: ChatBottomsheetModalTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const scrollViewRef = useRef<FlatList | null>(null);
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const session = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const chatContainerRef = useRef<View>(null);
    const mainContentRef = useRef<View>(null);

    // Initialize accessibility focus management for the chat modal
    const accessibilityFocusConfig = useMemo(
        () => ({
            mainContentRef,
            focusDelay: 100,
            accessibilityDelay: 50,
            maxStackSize: 10,
        }),
        [],
    );

    const accessibilityFocus = useAccessibilityFocus(accessibilityFocusConfig);
    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd();
                }
            }, 1000);
        });
        return () => {
            showSubscription.remove();
        };
    }, []);

    // Push chat modal to focus stack when it opens
    useEffect(() => {
        accessibilityFocus.pushToFocusStack(chatContainerRef, 'chat-modal');
        return () => {
            // Clean up focus stack when modal closes
            accessibilityFocus.popFromFocusStack();
        };
    }, [accessibilityFocus.pushToFocusStack, accessibilityFocus.popFromFocusStack]);

    const nameInitial = getInitials(currentEmergencyContact?.name);

    return (
        <Animated.View
            ref={chatContainerRef}
            style={tailwind.style('flex-col flex-1')}
            accessibilityViewIsModal={true}
            accessible={true}
            accessibilityLabel="Chat conversation"
            accessibilityRole="none">
            <DriverChatHeader
                merchantExoPhone={merchantExoPhone}
                rideId={rideId}
                isDriver={isDriver}
                name={currentEmergencyContact?.name ?? 'User'}
                nameInitial={nameInitial}
                onClose={onClose}
                vehicleServiceType={rideDetails?.vehicleServiceTierType}
            />
            <Divider
                dividerColor={themeColors.Border_neutralMidLow}
                type={undefined}
                direction={undefined}
                style={undefined}
                labelPosition={undefined}
                offset={undefined}
                offsetBackground={undefined}
                strokeDashArray={undefined}
            />
            <FlatList
                ref={scrollViewRef}
                onViewableItemsChanged={() => {}}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                onContentSizeChange={() => {
                    scrollViewRef.current?.scrollToEnd();
                }}
                data={session.readableMessages}
                accessible={true}
                accessibilityLabel="Chat messages"
                accessibilityRole="list"
                renderItem={info => {
                    return (
                        <Conversation
                            avatarUri={
                                rideDetails?.driverImage || info.item.sentBy === session.currentUser
                                    ? ic_user_default_profile
                                    : ic_driver_default_profile
                            }
                            type={info.item.sentBy === session.currentUser ? 'send' : 'receive'}
                            text={info.item.message}
                            isAvatar={
                                info.index !== session.readableMessages.length - 1
                                    ? session.readableMessages.at(info.index + 1)?.sentBy !== info.item.sentBy
                                    : true
                            }
                            time={info.item.time}
                            isVariant={true}
                            isDriver={isDriver}
                            nameInitial={nameInitial}
                            showTime={undefined}
                        />
                    );
                }}
                style={tailwind.style(`flex-1 pt-[${token?.spacing?.[12]}]`)}
            />
            {/* <ChatFooter rideId={rideId} isDriver={isDriver} chatPartnerName="" isMultiChatOpen={} /> */}
        </Animated.View>
    );
};

export default ChatBottomsheetModal;

const style = StyleSheet.create({
    vehicleNumberFont: {
        fontFamily: 'FE-Font',
    },
});
