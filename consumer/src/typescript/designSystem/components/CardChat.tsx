import { followers } from '@/readOnly/api/types/Followers.gen.tsx';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen.tsx';
import { RideConfirmedScreenAction } from '@/src-v2/screens/RideConfirmed/Types.tsx';
import { formatPhone } from '@/src-v2/utils/Booking.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { RideId } from '@/typescript/state/client/booking.ts';
import { ChatSession, ReadableMessage, selectChatSessionWithId } from '@/typescript/state/client/chat.ts';
import { selectCurrentChatSessionIdWithId, selectRideDetailsWithId } from '@/typescript/state/client/ride.ts';
import { selectCurrentEmergencyContact } from '@/typescript/state/client/session.ts';
import { createBookingId, selectCurrentFollower } from '@/typescript/state/client/user.ts';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { getInitials, Resolver } from '@/typescript/utils/common.ts';
import { hapticEffect } from '@/typescript/utils/useHaptic.ts';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { strings } from 'config-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, Keyboard, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated from 'react-native-reanimated';
import mtIcChatTyping from '../../../resources/assets/png/mt_ic_chat_typing.webp';
import CallDriver from '../../../typescript/screens/CallDriver.tsx';
import ic_driver_default_profile from '../../assets/base64/ic_driver_default_profile';
import ic_user_default_profile from '../../assets/base64/ic_user_default_profile';
import { PopUpModal } from '../../components/PopUpModal.tsx';
import { useRefsContext } from '../../context/RefsContext';
import colors from '../../designSystem/colorPalette';
import { tailwind } from '../../tailwindTheme/tailwind';
import { ChatFooter } from './ChatFooter.tsx';
import Conversation from './Conversation';
import Typography from './primitives/Typography';
import NameInitials from './NameInitials.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable.tsx';
import Avatar from './primitives/Avatar.tsx';
import DownArrow from '@/typescript/components/svg/DownArrow.tsx';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';

type CardChatTypes = {
    merchantExoPhone: string | undefined;
    rideId: RideId | null;
    isChatOpen: boolean;
    bookingId: string | undefined;
    chatPartnerName: string;
    isFollowRide: boolean;
    rcsDispatch: Resolver<RideConfirmedScreenAction> | undefined;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    driverPhoneNumber: string | undefined;
};

const CardChat = ({
    merchantExoPhone,
    rideId,
    isChatOpen,
    rcsDispatch,
    isFollowRide,
    bookingId,
    chatPartnerName,
    setHideAccessibility,
    driverPhoneNumber, // club this in case of other things in multimodal
}: CardChatTypes) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const isCallDriverOpen = useRef<boolean>(false);
    const { callDriverBottomsheetModalRef, followRideModalRef, multiChatRef } = useRefsContext();
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentFollower = useAppSelector(selectCurrentFollower);
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const driverPhotoUri = useDriverPhotoUri(rideDetails?.driverImage);
    const callNumber = isFollowRide ? currentFollower?.mobileNumber : currentEmergencyContact?.mobileNumber;

    const scrollViewRef = useRef<ScrollView | null>(null);

    const messageListData = useMemo(() => {
        if (isChatOpen || currentSession.readableMessages.length <= 2) {
            return currentSession.readableMessages;
        }
        return currentSession.readableMessages.slice(-2);
    }, [isChatOpen, currentSession.readableMessages]);

    const totalMessage = messageListData.length;

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd();
        }
    }, [isChatOpen]);

    const callModalOnDismiss = useCallback(() => {
        if (setHideAccessibility) {
            setHideAccessibility(false);
        }
    }, [setHideAccessibility]);

    const handleChatHeaderPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        if (isFollowRide) {
            Keyboard.dismiss();
            followRideModalRef.current?.present();
        } else {
            multiChatRef.current?.present();
        }
    }, [isFollowRide, followRideModalRef, multiChatRef]);

    return (
        <Animated.View style={[tailwind.style(`bg-[#F8F8F8] `), styles.containerShadow]}>
            <Animated.View
                style={[
                    { overflow: 'visible', height: SCREEN_HEIGHT * 0.46 },
                    tailwind.style(`flex-col justify-between  `),
                ]}>
                <Animated.View style={tailwind.style(`flex-initial`)}>
                    <Animated.View style={[tailwind.style(`items-center relative w-full z-10`)]}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Card Chat Header button"
                            testID="card-chat-header"
                            style={[
                                tailwind.style(
                                    `bg-white rounded-[18px] border border-[#F4F4F4] p-[18px] w-[90%] flex-row items-center justify-between`,
                                ),
                                {
                                    shadowColor: '#FFFFFF',
                                    shadowOffset: {
                                        width: 1,
                                        height: 9,
                                    },
                                    shadowOpacity: 1,
                                    shadowRadius: 17,
                                    elevation: 18,
                                },
                            ]}
                            onPress={handleChatHeaderPress}>
                            <Animated.View style={tailwind.style('flex-row gap-[10px] items-center')}>
                                {currentSessionId === bookingId ? (
                                    <Avatar uri={driverPhotoUri} type="sm" isLink={undefined} style={undefined} />
                                ) : (
                                    <NameInitials
                                        nameInitial={getInitials(currentEmergencyContact?.name) ?? ''}
                                        style={undefined}
                                        textStyle={undefined}
                                    />
                                )}
                                <Animated.View style={tailwind.style('flex-col')}>
                                    <Typography
                                        type="subhead-600"
                                        style={tailwind.style(` font-areaNormal-bold text-[13px] text-[#7F7B81] `)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {(messageListData.length > 0
                                            ? userLanguageStrings.Chatting
                                            : userLanguageStrings.Chat) + ` ${userLanguageStrings.with} `}
                                    </Typography>

                                    <Typography
                                        type="subhead-800"
                                        style={tailwind.style(`font-areaNormal-extraBold text-[15px] text-[#313131] `)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {currentSessionId === bookingId
                                            ? userLanguageStrings.Driver
                                            : chatPartnerName.split(' ')[0]}
                                    </Typography>
                                </Animated.View>
                            </Animated.View>

                            <Animated.View
                                style={tailwind.style(
                                    'rounded-[25px] w-[43px] h-[36px] bg-[#F2F2F2] flex-row items-center justify-center',
                                )}>
                                <DownArrow size={16} />
                            </Animated.View>
                        </Pressable>
                    </Animated.View>

                    {messageListData.length > 0 ? (
                        <ScrollView
                            ref={scrollViewRef}
                            key={currentSessionId}
                            scrollEnabled
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="always"
                            showsVerticalScrollIndicator={true}
                            style={tailwind.style(`flex-initial py-2  `)}
                            contentContainerStyle={tailwind.style(`pb-[10px]`)}
                            onContentSizeChange={() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }}>
                            {messageListData.map((item, index) => {
                                return (
                                    <ChatMessage
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        rideDetails={rideDetails}
                                        currentSession={currentSession}
                                        messageListData={messageListData}
                                        currentSessionId={currentSessionId}
                                        bookingId={bookingId}
                                        currentEmergencyContact={currentEmergencyContact}
                                        userLanguageStrings={userLanguageStrings}
                                        currentFollower={currentFollower}
                                        isFollowRide={isFollowRide}
                                        parentScrollRef={scrollViewRef}
                                    />
                                );
                            })}
                        </ScrollView>
                    ) : isChatOpen ? (
                        <Animated.View style={tailwind.style(`h-[70%] flex-col justify-center overflow-hidden`)}>
                            <Animated.View style={tailwind.style(' self-center')}>
                                <Image
                                    accessible={false}
                                    source={mtIcChatTyping}
                                    style={tailwind.style('w-[40px] h-[50px] ')}
                                />
                            </Animated.View>
                            <Typography
                                type="subhead-700"
                                accessible
                                style={tailwind.style('text-[#B2B9C7] text-center text-[14px] mx-5')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Starttypingtochatwith +
                                    ' ' +
                                    (currentSessionId === bookingId
                                        ? userLanguageStrings.YourDriver.toLowerCase() + ' '
                                        : '') +
                                    chatPartnerName}
                            </Typography>
                        </Animated.View>
                    ) : null}
                </Animated.View>
                <Animated.View style={tailwind.style(` flex-none`)}>
                    <Animated.View style={[tailwind.style(`w-[100%] flex-row items-end justify-start`)]}>
                        <ChatFooter
                            bookingId={bookingId}
                            rideId={rideId}
                            isDriver={currentSessionId === bookingId}
                            isCallDriverOpen={isCallDriverOpen}
                            chatPartnerName={chatPartnerName}
                            callNumber={callNumber}
                            isFollowRide={isFollowRide}
                            totalMessage={totalMessage}
                            rcsDispatch={rcsDispatch}
                            setHideAccessibility={setHideAccessibility}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>

            <PopUpModal
                sheetRef={callDriverBottomsheetModalRef}
                onAnimate={() => Keyboard.dismiss()}
                onDismiss={callModalOnDismiss}
                showBackdrop={undefined}
                stackBehavior="push"
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <CallDriver
                    driverNumber={formatPhone(rideDetails?.driverNumber || driverPhoneNumber)}
                    exoNumber={merchantExoPhone}
                    onClose={undefined}
                    bookingId={createBookingId(bookingId ?? '')}
                    rideId={rideId}
                />
            </PopUpModal>
        </Animated.View>
    );
};

export default CardChat;

const styles = StyleSheet.create({
    buttonShadow: {
        shadowColor: '#05181A1C',
        shadowRadius: 2.5,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 3.5 },
    },
    containerShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '08',
        shadowRadius: 4.5,
        shadowOpacity: 1.0,
        shadowOffset: { width: 0, height: 5.5 },
    },
});

type ChatMessageProps = {
    item: ReadableMessage;
    rideDetails: rideAPIEntity | null;
    currentSession: ChatSession;
    messageListData: ReadableMessage[];
    index: number;
    currentSessionId: string | null;
    bookingId: string | undefined;
    currentEmergencyContact: personDefaultEmergencyNumberAPIEntity | undefined;
    userLanguageStrings: strings;
    currentFollower: followers | null;
    isFollowRide: boolean;
    parentScrollRef: React.RefObject<ScrollView | null>;
};

const ChatMessage = ({
    item,
    rideDetails,
    currentSession,
    messageListData,
    index,
    currentSessionId,
    bookingId,
    currentEmergencyContact,
    userLanguageStrings,
    currentFollower,
    isFollowRide,
}: ChatMessageProps) => {
    return (
        <Conversation
            key={item.id}
            avatarUri={
                rideDetails?.driverImage || item.sentBy === currentSession.currentUser || item.sentBy !== 'Driver'
                    ? ic_user_default_profile
                    : ic_driver_default_profile
            }
            type={item.sentBy === currentSession.currentUser ? 'send' : 'receive'}
            text={item.message}
            isAvatar={
                index !== messageListData.length - 1 ? messageListData.at(index + 1)?.sentBy !== item.sentBy : true
            }
            time={item.time}
            showTime={false}
            isVariant={true}
            isDriver={currentSessionId === bookingId}
            nameInitial={
                currentSessionId === bookingId
                    ? userLanguageStrings.Driver
                    : isFollowRide
                      ? (currentFollower?.name ?? '')
                      : (currentEmergencyContact?.name ?? '')
            }
        />
    );
};
