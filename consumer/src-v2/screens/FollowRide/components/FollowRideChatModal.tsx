import Animated from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { tailwind } from '@/typescript//tailwindTheme/tailwind.ts';
import token from '@/typescript//designSystem/tokens/index.ts';
import LeftArrow from '@/typescript//assets/svg/direction/LeftArrow.tsx';
import Typography from '@/typescript//designSystem/components/primitives/Typography';
import Conversation from '@/typescript//designSystem/components/Conversation.tsx';
import Divider from '@/typescript//designSystem/components/primitives/Divider.tsx';
import { Linking, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Keyboard } from 'react-native';
import ic_driver_default_profile from '@/typescript//assets/base64/ic_driver_default_profile.ts';
import ic_user_default_profile from '@/typescript//assets/base64/ic_user_default_profile.ts';
import CallButton from '@/typescript//components/svg/CallButton.tsx';
import { SendMessageIcon } from '@/typescript//../typescript/components/svg/SendMessageIcon';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { chatHelpers } from '@/typescript//screens/chat/Hooks';
import { TextInput } from 'react-native-gesture-handler';
import Button from '@/src-v2/primitives/Button';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { selectCurrentFollower } from '@/typescript/state/client/user.ts';
import { getInitials } from '@/typescript/utils/common';
import { FlatList } from 'react-native-gesture-handler';
import { ReadableSuggestion, selectChatSessionWithId } from '@/typescript/state/client/chat.ts';
import { selectCurrentChatSessionIdWithId, selectRideDetailsWithId } from '@/typescript/state/client/ride.ts';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { RideId } from '@/typescript/state/client/booking.ts';
import { useTriggerFCMMessagePostMutation } from '@/api/integrations/rtk/TriggerFCMMessagePost.ts';
import { selectUserName } from '@/typescript/state/client/user';
import { followers } from '@/typescript//../readOnly/api/types/Followers.gen.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { suggestionsDefinitions } from '@/typescript/screens/chat/Constants';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';

export const ChatHeader = ({
    modalRef,
    nameInitial,
}: {
    modalRef: React.RefObject<BottomSheetModal | null>;
    nameInitial: string;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currentFollower = useAppSelector(selectCurrentFollower);

    return (
        <Animated.View
            style={tailwind.style(
                `px-[${token?.spacing?.[20]}] py-[${token?.spacing?.[12]}] flex-row items-center gap-[${token?.spacing?.[16]}]`,
            )}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go Back button"
                testID="follow_ride_chat_back"
                onPress={() => {
                    modalRef.current?.close();
                }}>
                <LeftArrow />
            </Pressable>
            <Animated.View style={tailwind.style('flex-row justify-center items-center ')}>
                <View
                    style={{
                        backgroundColor: colors.recovered.yellowHigh,
                        borderRadius: 50,
                        height: 40,
                        width: 43,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Typography
                        type="subhead-1"
                        style={{
                            color: colors.primitive.white[10],
                            alignContent: 'center',
                        }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {(nameInitial ?? '').toUpperCase()}
                    </Typography>
                </View>
                <Animated.View style={tailwind.style(`pl-[${token?.spacing?.[12]}]`)}>
                    {currentFollower ? (
                        <Typography
                            type="subhead"
                            style={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {currentFollower.name || userLanguageStrings.User}
                        </Typography>
                    ) : null}
                </Animated.View>
            </Animated.View>
            <View style={tailwind.style('flex-1')} />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call Follower button"
                testID="follow_ride_chat_call_follower"
                onPress={() => {
                    if (currentFollower) {
                        Linking.openURL(`tel:${currentFollower?.mobileNumber}`);
                    }
                }}>
                <CallButton fill={undefined} />
            </Pressable>
        </Animated.View>
    );
};

const FollowRideChatModal = ({
    modalRef,
    rideId,
}: {
    modalRef: React.RefObject<BottomSheetModal | null>;
    rideId: RideId | null;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const currentFollower = useAppSelector(selectCurrentFollower);
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const scrollViewRef = useRef<FlatList | null>(null);
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd();
            }
        }, 1000);
    });

    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const session = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    useEffect(() => {
        return () => {
            showSubscription.remove();
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [session.readableMessages, showSubscription]);

    const nameInitial = getInitials(currentFollower?.name);
    const driverPhotoUri = useDriverPhotoUri(rideDetails?.driverImage);

    return (
        <HardwareBackpressHandler>
            <Animated.View style={tailwind.style(`bg-[${token?.global['bg-standard']}] flex-1 h-full`)}>
                <ChatHeader modalRef={modalRef} nameInitial={nameInitial} />
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
                    renderItem={info => {
                        return (
                            <Conversation
                                avatarUri={
                                    driverPhotoUri || info.item.sentBy === session.currentUser
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
                                isDriver={false}
                                nameInitial={nameInitial}
                                showTime={undefined}
                            />
                        );
                    }}
                    style={tailwind.style(`flex-1 pt-[${token?.spacing?.[12]}] flex-grow`)}
                />
                <ChatFooter rideId={rideId} currentFollower={currentFollower} />
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default FollowRideChatModal;

export const FloatingQuickMessage = ({
    handleSendMessage,
    rideId,
}: {
    handleSendMessage: (val: string) => void;
    rideId: RideId | null;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const session = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const suggestions = session.readableSuggestion.map((item: ReadableSuggestion, index: number) => {
        return (
            <Button
                testID={`follow_ride_chat_quick_message_${item.id}`}
                type="secondary"
                size="md"
                key={index}
                onPress={() => {
                    handleSendMessage(item.id);
                }}
                style={tailwind.style(`border-[${themeColors.Fill_neutralMin}] border px-[${token?.spacing?.[16]}] `)}>
                <Typography
                    type="callout"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {item.suggestion}
                </Typography>
            </Button>
        );
    });
    return (
        <Animated.ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            style={[
                tailwind.style(
                    `pt-${token?.spacing?.[12]} px-${token?.spacing?.[16]} w-full bg-[${token?.global['bg-standard']}] max-h-[64px] `,
                ),
            ]}
            contentContainerStyle={tailwind.style(
                `flex gap-[${token?.spacing?.[8]}] max-h-[64px] mb-[${token?.spacing?.[12]}] `,
            )}>
            {suggestions}
        </Animated.ScrollView>
    );
};

export const ChatFooter = ({
    rideId,
    currentFollower,
}: {
    rideId: RideId | null;
    currentFollower: followers | null;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [message, setMessage] = useState('');
    const textRef = useRef<TextInput | null>(null);
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const dispatch = useAppDispatch();
    const [triggerFcmApiCall] = useTriggerFCMMessagePostMutation();
    const userName = useAppSelector(selectUserName);

    const sendMessage = chatHelpers(
        [
            {
                channelId: currentSession.channelId,
                sessionId: currentSessionId,
                currentUser: currentSession.currentUser,
            },
        ],
        dispatch,
    );

    const handleSendMessage = (text: string) => {
        if (textRef.current) {
            textRef.current.clear();
        }
        if (text.trim().length) {
            if (currentSessionId) {
                const send = sendMessage(currentSessionId);
                if (send) {
                    send(text);
                }
                if (currentFollower && currentSession.channelId) {
                    const val = suggestionsDefinitions[text];
                    triggerFcmApiCall({
                        body: {
                            body: val ? val.en_us : text,
                            channelId: currentSession.channelId,
                            chatPersonId: currentFollower.personId,
                            showNotification: true,
                            source: 'TRUSTED_CONTACT',
                            title: 'Message from' + userName,
                        },
                    });
                }
            }
        }

        setMessage('');
    };

    return (
        <Animated.View style={[tailwind.style('w-full bg-white bottom-0 flex-column justify-start')]}>
            <FloatingQuickMessage handleSendMessage={handleSendMessage} rideId={rideId} />
            <Animated.View
                style={[tailwind.style(`bg-white flex-row gap-[${token?.spacing?.[8]}] p-[${token?.spacing?.[16]}]`)]}>
                <BottomSheetTextInput
                    style={tailwind.style(
                        `flex-2 w-full flex-row items-center gap-[8px] px-[${token?.spacing?.[16]}] h-[${token?.height?.md}] rounded-[${token?.corner?.md}] border border-[${themeColors.Fill_neutralLow}]`,
                    )}
                    selectTextOnFocus
                    autoFocus
                    value={message}
                    ref={textRef}
                    onChangeText={setMessage}
                    placeholder={userLanguageStrings.Typesomething + '...'}
                    onSubmitEditing={() => {
                        if (message.length > 0) {
                            handleSendMessage(message);
                        }
                    }}
                />
                <Button
                    testID="follow_ride_chat_send_message"
                    type="primary"
                    style={tailwind.style('')}
                    onPress={() => {
                        handleSendMessage(message);
                    }}>
                    <SendMessageIcon fill={themeColors.SlideButton_Primary_Disabled_Text_Base} />
                </Button>
            </Animated.View>
        </Animated.View>
    );
};
