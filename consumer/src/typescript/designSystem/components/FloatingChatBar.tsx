import React, { useRef, useMemo } from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    useAnimatedGestureHandler,
    runOnJS,
} from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Platform, StyleSheet, View, AccessibilityInfo } from 'react-native';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
// import Button from '@/src-v2/primitives/Button';
import mt_driver_profile from '@/typescript/assets/ny-service/mt_driver_profile.webp';
import { RideId } from '@/typescript/state/client/booking';
import { selectChatSessionWithId } from '@/typescript/state/client/chat';
import { selectCurrentChatSessionIdWithId } from '@/typescript/state/client/ride';
import { useAppSelector } from '@/typescript/state/hooks';
import { getInitials } from '@/typescript/utils/common';
import { isEmpty } from 'lodash';
// import token from '../tokens';
import NameInitials from './NameInitials';
import Avatar from './primitives/Avatar';
import Typography from './primitives/Typography';
// import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
// import ic_user_default_profile from '@/typescript/assets/base64/ic_user_default_profile';
import { CornerRightArrowIcon } from '@/typescript/assets/svg/symbols/CornerRightArraowIcon';
import { selectCurrentEmergencyContact } from '@/typescript/state/client/session';
import { selectUserId } from '@/typescript/state/client/user';
import { ChatSession, ReadableMessage } from '../../state/client/chat';
import { selectUserProfile } from '../../state/client/user';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type FloatingChatBarProps = {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    showChatBar: boolean;
    setShowChatBar: (showChatBar: boolean) => void;
    onPress: () => void;
    rideId: RideId | null;
    driverImage: rideAPIEntity['driverImage'];
    isDriver: boolean;
    messageCount: number;
};

const FloatingChatBar = (props: FloatingChatBarProps) => {
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, props?.rideId));
    const currentSession: ChatSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    // const currentEmergencyContact = useAppSelector(state => selectCurrentEmergencyContact(state));
    const { onPress, showChatBar, setShowChatBar } = props;
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

    // Create shared values for slide animation
    const translateY = useSharedValue(-30);
    const opacity = useSharedValue(0);

    // Get the two latest messages, if available
    const readableMessages = !isEmpty(currentSession?.readableMessages) ? currentSession?.readableMessages : [];
    const messagesCount = readableMessages.length;
    const latestMessage = messagesCount > 0 ? readableMessages[messagesCount - 1] : null;
    const secondLatestMessage = messagesCount > 1 ? readableMessages[messagesCount - 2] : null;

    // Determine if we should show a single message or both based on who sent them
    const showSingleItem =
        !secondLatestMessage ||
        latestMessage?.sentBy === 'Driver' ||
        (latestMessage?.sentBy !== 'Driver' && secondLatestMessage?.sentBy !== 'Driver');

    // Effect to animate when showChatBar changes
    React.useEffect(() => {
        if (showChatBar) {
            opacity.value = withTiming(1, { duration: 200 });
            translateY.value = withTiming(0, { duration: 250 });
        } else {
            opacity.value = withTiming(0, { duration: 150 });
            translateY.value = withTiming(-30, { duration: 250 });
        }
    }, [showChatBar]);

    // Gesture handler for swipe to dismiss
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: Record<string, number>) => {
            // eslint-disable-next-line functional/immutable-data
            ctx['startY'] = translateY.value;
        },
        onActive: (event, ctx: Record<string, number>) => {
            // Only allow vertical swipes (up or down)
            if (ctx['startY'] !== undefined) {
                // Apply vertical movement
                translateY.value = ctx['startY'] + event.translationY;

                // Use absolute vertical distance for opacity
                const verticalDistance = Math.abs(event.translationY);

                // Adjust opacity based on vertical distance
                opacity.value = Math.max(0, 1 - verticalDistance / 80);
            }
        },
        onEnd: (event, _) => {
            const verticalVelocity = Math.abs(event.velocityY);
            const verticalDistance = Math.abs(event.translationY);

            // Dismiss if swiped with enough velocity or distance vertically
            if (verticalVelocity > 200 || verticalDistance > 30) {
                // Determine dismiss direction (up or down)
                const direction = event.translationY > 0 ? 60 : -60;

                // Animate to the exit position
                translateY.value = withTiming(direction, { duration: 150 });
                opacity.value = withTiming(0, { duration: 100 });
                runOnJS(setShowChatBar)(false);
            } else {
                // Otherwise snap back
                translateY.value = withTiming(0);
                opacity.value = withTiming(1);
            }
        },
    });

    // Custom animation style
    const slideAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    // const messagePill = (text: string) => {
    //     return (
    //         <Button
    //             testID="message-pill"
    //             type="secondary"
    //             size="md"
    //             onPress={() => {}}
    //             style={tailwind.style(
    //                 `h-[37px] rounded-[${token?.corner?.lg}] bg-[#FBFBFB] border border-[#F5F5F5] px-4 h-[37px] flex-row items-center`,
    //             )}>
    //             <Typography
    //                 type="callout"
    //                 style={tailwind.style('text-[#2F2D32] text-[14px] font-areaNormal-extrabold')}
    //                 numberOfLines={undefined}
    //                 isAnimate={undefined}
    //                 accessible={undefined}
    //                 accessibilityLabel={undefined} accessibilityRole={undefined}>
    //                 {text}
    //             </Typography>
    //         </Button>
    //     );
    // };

    // const avatarUri =
    //     props.driverImage || latestMessage?.sentBy === currentSession.currentUser || latestMessage?.sentBy !== 'Driver'
    //         ? ic_user_default_profile
    //         : mt_driver_profile;

    const { top } = useSafeAreaInsets();

    return latestMessage && showChatBar ? (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
                style={[tailwind.style(`absolute w-full px-[16px] z-10 mt-[${top + 50}px]`), slideAnimationStyle]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Open chat conversation"
                    accessibilityHint="Double tap to open chat with driver or emergency contact"
                    testID="floating-chat-bar"
                    onPress={() => {
                        accessibilityFocus.pushToFocusStack(mainContentRef, 'floating-chat-bar');
                        onPress();
                    }}
                    activeOpacity={1}
                    style={[
                        showSingleItem
                            ? tailwind.style('bg-white rounded-[25px] p-[8px] flex-row items-center')
                            : tailwind.style('bg-white rounded-[25px] p-[8px] flex-row items-center'),
                        styles.containerShadow,
                    ]}>
                    <ChatBox
                        singleItem={showSingleItem}
                        latestMessage={latestMessage}
                        secondLatestMessage={secondLatestMessage ?? null}
                        currentSession={currentSession}
                        messageCount={props.messageCount}
                    />
                    {/* <Pressable
                        testID="floating-chat-bar-pressable"
                        onPress={onPress}
                        style={tailwind.style('flex-row items-center')}>
                        <Animated.View style={tailwind.style('relative')}>
                            {latestMessage?.sentBy === 'Driver' ||
                            latestMessage?.sentBy === currentSession.currentUser ? (
                                <Avatar uri={avatarUri} type="sm" isLink={undefined} style={undefined} />
                            ) : (
                                <NameInitials
                                    nameInitial={getInitials(currentEmergencyContact?.name) ?? ''}
                                    style={undefined}
                                    textStyle={undefined}
                                />
                            )}
                            {props.messageCount ? (
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'w-4 h-4 rounded-full bg-white absolute right-[-5px] bottom-0 flex-row items-center justify-center',
                                        ),
                                        {
                                            shadowColor: '#aba5a5',
                                            shadowOffset: {
                                                width: 1,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 9,
                                            elevation: 6,
                                        },
                                    ]}>
                                    <Animated.Text style={[tailwind.style('text-[9px]')]}>
                                        {props.messageCount}
                                    </Animated.Text>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    </Pressable>

                    <Animated.View style={tailwind.style('px-[15px] pt-1 w-[70%] flex-row items-center')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-[#14171F] text-[14px] font-areaNormal-bold')}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined} accessibilityRole={undefined}>
                            {latestMessage?.message}
                        </Typography>
                    </Animated.View>

                    <TouchableOpacity testID="floating-chat-bar-arrow-button" onPress={onPress} activeOpacity={1}>
                        <Animated.View
                            style={tailwind.style(
                                'w-[46px] h-[36px] rounded-[24px] bg-[#F1F1F2] flex-row items-center justify-center',
                            )}>
                            <CornerRightArrowIcon />
                        </Animated.View>
                    </TouchableOpacity> */}
                </TouchableOpacity>
            </Animated.View>
        </PanGestureHandler>
    ) : null;
};

const ChatBox = ({
    singleItem = false,
    latestMessage,
    secondLatestMessage,
    messageCount,
}: {
    singleItem: boolean | undefined;
    latestMessage: ReadableMessage;
    secondLatestMessage: ReadableMessage | null;
    currentSession: ChatSession;
    messageCount: number | undefined;
}) => {
    const userId = useAppSelector(selectUserId);
    const currentEmergencyContact = useAppSelector(state => selectCurrentEmergencyContact(state));
    const profile = useAppSelector(selectUserProfile);
    const fullName = (profile?.firstName ?? '') + ' ' + (profile?.lastName ?? '');

    // Check if message is from someone other than the current user
    const isMessageFromReceiver = (message: ReadableMessage | null) => {
        // Message is from Driver or from a third party (not the current user)
        return (
            message?.sentBy === 'Driver' ||
            (message?.sentBy !== 'Driver' && message?.sentBy !== userId && message?.sentBy !== 'customer')
        );
    };

    // Check if the receiver is specifically a driver
    const isDriverReceiver = (message: ReadableMessage | null) => {
        return message?.sentBy === 'Driver';
    };

    return (
        <Animated.View>
            {singleItem ? (
                <ChatBoxItem
                    type={isMessageFromReceiver(latestMessage) ? 'receiver' : 'sender'}
                    isDriver={isDriverReceiver(latestMessage)}
                    message={latestMessage?.message}
                    messageCount={messageCount}
                    contactName={currentEmergencyContact?.name || fullName}
                    showArrow={isMessageFromReceiver(latestMessage)}
                />
            ) : (
                <>
                    <ChatBoxItem
                        type={isMessageFromReceiver(secondLatestMessage) ? 'receiver' : 'sender'}
                        isDriver={isDriverReceiver(secondLatestMessage)}
                        message={secondLatestMessage?.message}
                        showArrow={undefined}
                        messageCount={undefined}
                        contactName={currentEmergencyContact?.name}
                    />
                    <ChatBoxItem
                        type={isMessageFromReceiver(latestMessage) ? 'receiver' : 'sender'}
                        isDriver={isDriverReceiver(latestMessage)}
                        message={latestMessage?.message}
                        showArrow={undefined}
                        messageCount={undefined}
                        contactName={fullName}
                    />
                </>
            )}
        </Animated.View>
    );
};

const ChatBoxItem = (props: {
    type: 'sender' | 'receiver';
    isDriver: boolean | undefined;
    message: string | undefined;
    messageCount: number | undefined;
    contactName: string | undefined;
    showArrow: boolean | undefined;
}) => {
    const { type, isDriver, message, messageCount, contactName, showArrow } = props;
    // Determine if prefix/suffix should be shown based on type
    const showPrefix = type === 'receiver';
    const showSuffix = type === 'sender' || showArrow;

    return (
        <Animated.View style={[styles.chatBoxItemContainer]}>
            {/* Prefix component - only visible for receiver type */}
            {showPrefix && (
                <View style={styles.prefixContainer}>
                    {isDriver ? (
                        <Avatar
                            uri={mt_driver_profile}
                            type="sm"
                            isLink={undefined}
                            style={{ height: 35, width: 35 }}
                        />
                    ) : (
                        <NameInitials
                            nameInitial={getInitials(contactName) ?? ''}
                            style={{ height: 30, width: 30 }}
                            textStyle={{ fontSize: 12 }}
                        />
                    )}
                    {messageCount ? (
                        <Animated.View style={[styles.notificationBadge, styles.badgeShadow]}>
                            <Animated.Text style={styles.badgeText}>{messageCount}</Animated.Text>
                        </Animated.View>
                    ) : null}
                </View>
            )}

            {/* Message container with dynamic alignment based on type */}
            <Animated.View
                style={[
                    styles.messageContainer,
                    // styles.driverMessageBackground,
                    type === 'sender' ? styles.messageContainerRight : styles.messageContainerLeft,
                    type === 'receiver' ? styles.driverMessageBackground : null,
                ]}>
                <Animated.View style={[type === 'sender' ? styles.messagePill : null]}>
                    <Typography
                        type="callout"
                        style={[styles.messageText]}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {message || ''}
                    </Typography>
                </Animated.View>
            </Animated.View>

            {/* Suffix component - visible for sender type or when showing arrow for receiver */}
            {showSuffix && (
                <View style={styles.suffixContainer}>
                    {showArrow ? (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Open chat conversation"
                            accessibilityHint="Double tap to open chat"
                            activeOpacity={1}
                            testID="floating-chat-bar-arrow-button"
                            onPress={() => {
                                AccessibilityInfo.announceForAccessibilityWithOptions('Opening chat', {
                                    queue: true,
                                });
                            }}>
                            <Animated.View
                                style={tailwind.style(
                                    'w-[35px] h-[30px] rounded-[20px] bg-[#F1F1F2] flex-row items-center justify-center',
                                )}>
                                <CornerRightArrowIcon />
                            </Animated.View>
                        </TouchableOpacity>
                    ) : (
                        <NameInitials
                            nameInitial={getInitials(contactName) ?? ''}
                            style={{ height: 30, width: 30 }}
                            textStyle={{ fontSize: 12 }}
                        />
                    )}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
    chatBoxItemContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: 4,
    },
    messagePill: {
        borderRadius: 18,
        paddingVertical: 3,
        paddingHorizontal: 14,
        backgroundColor: '#C1DCFF',
    },
    prefixContainer: {
        position: 'relative',
        marginRight: 8,
    },
    suffixContainer: {
        position: 'relative',
        // marginLeft: 8,
    },
    notificationBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        position: 'absolute',
        right: -5,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeShadow: {
        shadowColor: '#aba5a5',
        shadowOffset: {
            width: 1,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 9,
        elevation: 6,
    },
    badgeText: {
        fontSize: 9,
    },
    messageContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageContainerLeft: {
        justifyContent: 'flex-start',
    },
    messageContainerRight: {
        justifyContent: 'flex-end',
    },
    driverMessageBackground: {
        backgroundColor: '#F1F2F7',
        borderRadius: 18,
        marginVertical: 2,
        paddingVertical: 3,
        paddingHorizontal: 14,
        alignSelf: 'flex-start',
        flex: 0,
        maxWidth: '85%',
        marginRight: 'auto',
    },
    messageText: {
        color: '#14171F',
        fontSize: 12,
        // fontFamily: 'areaNormal-bold',
    },
    pressableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
});

export default FloatingChatBar;
