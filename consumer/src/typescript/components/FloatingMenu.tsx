import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, LayoutChangeEvent, Modal, View, Dimensions, Platform } from 'react-native';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { RNPressable, Pressable } from '@/src-v2/primitives/Pressable';
import Animated, {
    FadeIn,
    LinearTransition,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Layout,
    useSharedValue,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useScaleAnimation } from '../utils/useScaleAnimation';
import { Icon } from './Icon';
import WalkIcon from '@/typescript/assets/svg/symbols/WalkIcon';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { AnimationProps } from '@/src-v2/primitives/Button';
import { RideStatus } from '../hooks/types';
import ArrowRight from '../assets/svg/symbols/ArrowRight';
import { CarFront } from './svg/CarFront';
import Typography from '../designSystem/components/primitives/Typography';
import { useConfigContext } from '../context/ConfigContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { chatHelpers } from '../screens/chat/Hooks';
import { selectCurrentChatSessionIdWithId } from '../state/client/ride';
import { selectChatSessionWithId } from '../state/client/chat';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { RideId } from '../state/client/booking';
import {
    selectChatEducationShownCount,
    selectChatEducationShownRideIds,
    incrementChatEducationShownCount,
} from '../state/client/session';

// Use a more specific type for AnimatedPressable to fix TypeScript errors
export const AnimatedPressable =
    Animated.createAnimatedComponent<React.ComponentProps<typeof RNPressable>>(RNPressable);

const Call = ({ fill = '#E6E6E6' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60568 8.3978C10.9649 11.7561 11.727 7.87092 13.8658 10.0083C15.9278 12.0697 17.1129 12.4827 14.5004 15.0945C14.1732 15.3575 12.094 18.5215 4.78703 11.2166C-2.52082 3.91074 0.641335 1.82943 0.904396 1.50227C3.52326 -1.11676 3.92915 0.0752698 5.99115 2.1367C8.12999 4.27494 4.24645 5.03951 7.60568 8.3978Z"
                fill={fill}
            />
        </Svg>
    );
};

const Chat = ({ fill = '#E6E6E6' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.3491 11.4578C23.3491 13.9399 22.3485 16.1881 20.724 17.8255V17.8385C20.906 19.0081 21.2828 20.1647 21.8936 21.2174C22.0755 21.5422 21.8416 21.9581 21.4648 21.8931C20.1392 21.6722 18.8527 21.2304 17.7091 20.5546C17.5531 20.4593 17.4087 20.3524 17.2643 20.2456C17.1921 20.1922 17.1199 20.1387 17.0463 20.0868C16.1756 20.3597 15.2529 20.5156 14.2913 20.5156H9.75805C4.75479 20.5156 0.700195 16.461 0.700195 11.4578C0.700195 6.45449 4.75479 2.3999 9.75805 2.3999H14.2913C19.2945 2.3999 23.3491 6.45449 23.3491 11.4578ZM10.6107 11.5799C10.6107 12.8701 9.56477 13.9161 8.27451 13.9161C6.98425 13.9161 5.93828 12.8701 5.93828 11.5799C5.93828 10.2896 6.98425 9.24365 8.27451 9.24365C9.56477 9.24365 10.6107 10.2896 10.6107 11.5799ZM17.6188 11.58C17.6188 12.8703 16.5728 13.9164 15.2825 13.9164C13.9921 13.9164 12.9461 12.8703 12.9461 11.58C12.9461 10.2897 13.9921 9.24365 15.2825 9.24365C16.5728 9.24365 17.6188 10.2897 17.6188 11.58Z"
                fill={fill}
            />
        </Svg>
    );
};

const SendQuickMessage = ({ fill = '#E6E6E6' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path d="M20.0725 11.0806H3V12.9373H20.0725V11.0806Z" fill={fill} />
            <Path
                d="M15.6712 18.5821L14.1023 17.5795C15.4577 15.4535 17.7972 13.1233 18.9855 12C17.8064 10.8767 15.467 8.55577 14.1023 6.42054L15.6712 5.41791C17.0266 7.54386 19.5147 9.94832 20.5173 10.886C20.8237 11.1738 21 11.573 21 11.9907C21 12.4085 20.8237 12.8077 20.5173 13.0955C19.5147 14.0331 17.0266 16.4376 15.6712 18.5635V18.5821Z"
                fill={fill}
            />
        </Svg>
    );
};

const Share = ({ fill = '#FCFCFC' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.37 3.125V7.91987C6.74741 7.91987 3 11.3674 3 15.6202V18.7003H3.83701C3.83701 16.1486 6.08546 14.0801 9.69603 14.0801H11.37V18.875L21 11L11.37 3.125Z"
                fill={fill}
            />
        </Svg>
    );
};

const EditIcon = ({ fill = 'white', size = 16 }: { fill: string | undefined; size: number | undefined }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M17.2218 2.68457C16.3173 1.77975 14.9163 1.77975 14.0118 2.68457L4.48084 12.2155C4.15888 12.5375 3.96943 12.9621 3.94474 13.4109L3.68581 18.1496C3.65001 18.8344 4.19933 19.3837 4.88408 19.3479L9.62279 19.089C10.0716 19.0643 10.4961 18.8748 10.8181 18.5529L20.3491 9.0219C21.2539 8.11708 21.2539 6.71612 20.3491 5.8113L17.2218 2.68457Z"
                stroke={fill}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path d="M13 4L19 10" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
};

const UpArrow = ({
    fill = '#6C7074',
    size = 9,
    marginTop = 0,
}: {
    fill: string | undefined;
    size: number | undefined;
    marginTop: number | undefined;
}) => {
    const height = ((size || 9) * 6) / 9; // Maintain aspect ratio

    return (
        <View style={{ marginTop: marginTop || 0 }}>
            <Svg width={size || 9} height={height} viewBox="0 0 9 6" fill="none">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.59467 5.21783C0.301777 4.92494 0.301777 4.45006 0.59467 4.15717L3.96967 0.782171C4.26256 0.489277 4.73744 0.489277 5.03033 0.782171L8.40533 4.15717C8.69822 4.45006 8.69822 4.92494 8.40533 5.21783C8.11244 5.51072 7.63756 5.51072 7.34467 5.21783L4.5 2.37316L1.65533 5.21783C1.36244 5.51072 0.887563 5.51072 0.59467 5.21783Z"
                    fill={fill}
                />
            </Svg>
        </View>
    );
};

export const ChatButton = ({
    handleOnPressChat,
    isCompact = false,
    entering = undefined,
    exiting = undefined,
    title = undefined,
}: {
    handleOnPressChat: () => void;
    isCompact: boolean | undefined;
    title: string | undefined;
} & AnimationProps) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <AnimatedPressable
            entering={entering}
            exiting={exiting}
            testID="floating_menu_chat"
            layout={LinearTransition.springify().damping(28).stiffness(340)}
            style={[
                isCompact ? btnStyles.compactContainer : btnStyles.container,
                animatedStyle,
                { marginHorizontal: isCompact ? 0 : 8, marginLeft: isCompact ? 12 : 8 },
            ]}
            onPress={handleOnPressChat}
            {...handlers}>
            <Animated.View style={btnStyles.iconContainer} {...handlers}>
                <Icon
                    color={isCompact ? colors.gray350 : 'white'}
                    icon={<Chat fill={undefined} />}
                    size={isCompact ? 16 : 24}
                    accessibilityLabel={`Chat with ${title}`}
                />
            </Animated.View>
        </AnimatedPressable>
    );
};

interface FloatingMenuProps {
    rideId: RideId | null;
    handleOnPressCall: () => void;
    handleOnPressShare: () => void;
    handleOnPressChat: () => void;
    handleAutoSendMessage: () => void;
    newMessageReceived: boolean;
    quickReplyMessage: string;
    handleCancelAutoSendMessage: () => void;
    enableAutoSendMessage: boolean;
    handleOnDirectionsPress: () => void;
    stage: RideStatus;
    isClickable?: boolean;
    activeBackdrop?: 'one' | 'two' | null;
}

// Add the suggestions map constants
const SUGGESTION_MESSAGES = {
    initialMessage: { id: '1', value: 'Are you starting?', key: 'cds1BP' },
    pleaseComeSoon: { id: '2', value: 'Please come soon', key: 'cds2BP' },
    waitingAtPickup: { id: '3', value: 'Waiting at Pickup', key: 'dis1cr1AP' },
    comingSoon: { id: '4', value: 'Coming, 2 mins', key: 'dis1cr2AP' },
};

// Get suggestion keys for cycling through messages
const SUGGESTION_KEYS = Object.keys(SUGGESTION_MESSAGES);

interface SimpleMessageButtonProps {
    handleOnPressChat: () => void;
    newMessageReceived: boolean;
    isCompact?: boolean;
    rideId: RideId | null;
    stage?: RideStatus;
    onMessageStateChange?: (isShowingMessage: boolean, messageKey?: string) => void;
    onLongPress?: () => void;
    ref?: React.RefObject<{
        triggerSendAnimation: (message: string) => void;
    }>;
}

export const SimpleMessageButton = React.forwardRef<
    { triggerSendAnimation: (message: string) => void },
    SimpleMessageButtonProps
>((props, ref) => {
    const { handleOnPressChat, newMessageReceived, rideId, stage, onMessageStateChange } = props;
    const [showMessage, setShowMessage] = useState(false);
    const [messageKey, setMessageKey] = useState(SUGGESTION_KEYS[2]);
    const [isSending, setIsSending] = useState(false);
    const [showIcon, setShowIcon] = useState(true);
    const [showSuggestionMenu, setShowSuggestionMenu] = useState(false);
    const [triggeredExternalOptions, setTriggeredExternalOptions] = useState(false);
    const [customMessageText, setCustomMessageText] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const { animatedStyle, handlers } = useScaleAnimation();

    // Define invalidStages outside of useEffect to avoid creating a new array reference on each render
    const invalidStages = [
        RideStatus.BRIDGE_TO_DESTINATION,
        RideStatus.RIDE_STARTED,
        RideStatus.IS_ON_THE_WAY,
        RideStatus.WAY_TO_STOP,
        RideStatus.STOP_ARRIVED,
        RideStatus.WAITING_AT_STOP,
        RideStatus.STOP_WAITING_CHARGE_APPLY_NOW,
        RideStatus.INTER_CITY,
        RideStatus.RENTAL,
        RideStatus.NONE,
    ];

    // Get chat session data
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const dispatch = useAppDispatch();

    // Expose functions to parent component via ref
    React.useImperativeHandle(ref, () => ({
        triggerSendAnimation: (message: string) => {
            if (!showMessage) {
                setShowMessage(true);
            }

            setCustomMessageText(message);
            setIsSending(true);
            setMessageKey('messageSent');

            setTimeout(() => {
                setIsSending(false);
                setShowMessage(false);

                const send = sendMessage(currentSessionId ?? '');
                if (send) {
                    send(message);
                }

                setCustomMessageText(null);
                setShowIcon(false);
                setTimeout(() => {
                    setShowIcon(true);
                }, 1300);
            }, 1000);
        },
    }));

    // Get the latest message from the session, if available
    const readableMessages = currentSession?.readableMessages || [];
    const messagesCount = readableMessages.length;

    // Function to determine the appropriate suggestion based on conversation history and ride stage
    const determineAppropriateMessageKey = useCallback(() => {
        if (messagesCount === 0) {
            return SUGGESTION_KEYS[0];
        }

        // Check if all message types have been sent
        const sentInitialMessage = readableMessages.some(msg =>
            msg.message.includes(SUGGESTION_MESSAGES.initialMessage.value),
        );
        const sentComingSoon = readableMessages.some(msg => msg.message.includes(SUGGESTION_MESSAGES.comingSoon.value));
        const sentPleaseComeSoon = readableMessages.some(msg =>
            msg.message.includes(SUGGESTION_MESSAGES.pleaseComeSoon.value),
        );

        // If all messages have been sent, return undefined (not null) to not show any suggestion
        if (sentComingSoon) {
            return undefined;
        }
        // Otherwise proceed with the existing logic
        if (
            (stage === RideStatus.CAB_HAS_ARRIVED ||
                stage === RideStatus.CAB_IS_WAITING_FOR_YOU ||
                stage === RideStatus.WAITING_CHARGES_APPLY_NOW ||
                stage === RideStatus.CAB_IS_LEAVING_SOON ||
                stage === RideStatus.CAB_IS_ARRIVING) &&
            !sentComingSoon
        ) {
            return 'comingSoon';
        }

        if (sentPleaseComeSoon) {
            return undefined;
        } else if (sentInitialMessage || messagesCount > 0) {
            return 'pleaseComeSoon';
        }

        return 'initialMessage';
    }, [readableMessages, messagesCount, stage]);

    const latestMessage = messagesCount > 0 ? readableMessages[messagesCount - 1] : null;

    useEffect(() => {
        // First check if we're in one of the invalid stages that should hide messages
        if (stage !== undefined) {
            if (invalidStages.includes(stage)) {
                setShowMessage(false);
                setShowIcon(true);
                return;
            }
        }

        // If not in invalid stages, proceed with normal message display logic
        if (latestMessage) {
            const appropriateKey = determineAppropriateMessageKey();
            if (appropriateKey) {
                if (latestMessage.sentBy === 'Driver') {
                    setShowMessage(true);
                    setShowIcon(false);
                } else {
                    setShowMessage(false);
                    setTimeout(() => {
                        setShowIcon(true);
                    }, 1300);
                }
                setMessageKey(appropriateKey);
            }
        } else {
            setShowMessage(true);
            setShowIcon(false);
        }
    }, [latestMessage, stage]);

    useEffect(() => {
        onMessageStateChange?.(showMessage, messageKey);
    }, [showMessage, onMessageStateChange, messageKey]);

    // Function to cycle to next suggestion
    // const _cycleToNextSuggestion = () => {
    //     const currentIndex = SUGGESTION_KEYS.indexOf(messageKey || '');
    //     const nextIndex = (currentIndex + 1) % SUGGESTION_KEYS.length;
    //     setMessageKey(SUGGESTION_KEYS[nextIndex]);
    // };

    // Success animation style
    const successStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isSending
                ? withTiming('#34A853', { duration: 300 })
                : withTiming('#2D2B2F', { duration: 10 }),
            borderColor: isSending ? withTiming('#34A853', { duration: 300 }) : withTiming('#444248', { duration: 10 }),
        };
    });

    // Width animation style for morphing effect
    const widthAnimStyle = useAnimatedStyle(() => {
        return {
            width: showMessage
                ? withSpring(containerWidth > 0 ? containerWidth : 200, {
                      damping: 20,
                      stiffness: 300,
                      mass: 0.6,
                      overshootClamping: false,
                      restDisplacementThreshold: 0.01,
                      restSpeedThreshold: 0.01,
                  })
                : withSpring(54, {
                      damping: 20,
                      stiffness: 300,
                      mass: 0.6,
                      overshootClamping: false,
                      restDisplacementThreshold: 0.01,
                      restSpeedThreshold: 0.01,
                  }),
            height: 48,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: showMessage ? 8 : 0,
        };
    });

    const sendMessage = chatHelpers(
        [
            {
                channelId: currentSession?.channelId,
                sessionId: currentSessionId,
                currentUser: currentSession?.currentUser,
            },
        ],
        dispatch,
    );

    // Function to handle message send in SimpleMessageButton
    const handleSendMessage = () => {
        const messageValue =
            customMessageText ??
            // @ts-expect-error Note: as the value is static, ignoring the type error
            SUGGESTION_MESSAGES[messageKey]?.value ??
            '';

        if (messageValue === '') {
            return;
        }

        setIsSending(true);
        setMessageKey('messageSent');

        setTimeout(() => {
            setIsSending(false);
            setShowMessage(false);
            const send = sendMessage(currentSessionId ?? '');
            if (send) {
                send(messageValue);
            }

            if (customMessageText) {
                setCustomMessageText(null);
            }

            setShowIcon(false);
            setTimeout(() => {
                setShowIcon(true);
            }, 300);
        }, 1000);
    };

    // Reset state when component unmounts or when we switch back to message view
    useEffect(() => {
        if (!showMessage) {
            const resetTimer = setTimeout(() => {
                const appropriateKey = determineAppropriateMessageKey();
                if (appropriateKey) {
                    setMessageKey(appropriateKey);
                }
                setIsSending(false);
            }, 800);

            return () => clearTimeout(resetTimer);
        }
        return () => {};
    }, [showMessage]);

    // Measure the container width after render
    const onLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(Math.max(width, 200));
    };

    // Get current message to display
    const getCurrentMessage = useCallback(() => {
        // Show "Message sent!" when we're in the sending confirmation state
        if (messageKey === 'messageSent') {
            return 'Message sent!';
        }

        // Show custom message if available
        if (customMessageText) {
            return customMessageText;
        }

        // If no messageKey or all suggestions have been sent, return empty string
        if (!messageKey) {
            return '';
        }

        // Otherwise show the standard suggestion message
        // @ts-expect-error Note: as the value is static, ignoring the type error
        return SUGGESTION_MESSAGES[messageKey]?.value || SUGGESTION_MESSAGES[SUGGESTION_KEYS[0]].value;
    }, [messageKey, customMessageText]);

    // Add custom suggestion options
    const CUSTOM_SUGGESTIONS = ['Where are you?', "I'm waiting at the pickup spot", 'Custom message'];

    // Helper function to handle press and hold that triggers the parent's menu
    const handleLongPress = () => {
        if (props.onLongPress) {
            setTriggeredExternalOptions(true);
            props.onLongPress();
        } else {
            setShowSuggestionMenu(true);
        }
    };

    // Function to handle backdrop press
    const handleBackdropPress = () => {
        if (showSuggestionMenu) {
            setShowSuggestionMenu(false);
        } else {
            handleLongPress();
        }
    };

    // Function to handle selection of custom suggestion
    const handleSelectSuggestion = (suggestion: string) => {
        if (suggestion === 'Custom message') {
            setShowSuggestionMenu(false);
            handleOnPressChat();
            return;
        }

        const send = sendMessage(currentSessionId ?? '');
        if (send) {
            send(suggestion);
        }
        setShowSuggestionMenu(false);
    };

    return (
        <>
            <Animated.View>
                <Animated.View
                    onLayout={onLayout}
                    layout={Layout.springify().damping(20).stiffness(300).mass(0.6)}
                    style={[
                        widthAnimStyle,
                        tailwind.style('relative justify-center bg-[#2D2B2F] rounded-3xl overflow-hidden'),
                        !showMessage && tailwind.style('mx-2'),
                        showMessage && tailwind.style('mx-3'),
                        animatedStyle,
                        successStyle,
                        showMessage && { minWidth: 200 },
                    ]}>
                    {showMessage && messageKey ? (
                        // Message content
                        <RNPressable
                            testID="simple-message-button"
                            onPress={handleSendMessage}
                            onLongPress={handleLongPress}
                            style={tailwind.style('flex-1 pl-4 pr-4 min-w-[200px]')}
                            disabled={isSending}
                            {...handlers}>
                            <Animated.View
                                layout={Layout.springify().damping(20).stiffness(300).mass(0.6)}
                                style={[
                                    tailwind.style('absolute inset-0 bg-[#2D2B2F] z-10 border-[1px] border-[#2D2B2F]'),
                                    successStyle,
                                ]}
                            />
                            <Animated.View
                                layout={Layout.springify().damping(20).stiffness(300).mass(0.6)}
                                style={tailwind.style('flex-row justify-between items-center z-20 h-full w-full')}>
                                <Typography
                                    type="callout"
                                    style={{ color: 'white', paddingRight: 4 }}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={true}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {getCurrentMessage()}
                                </Typography>

                                {!isSending && (
                                    <Pressable
                                        accessibilityRole="button"
                                        testID="simple_message_send"
                                        accessibilityLabel="Send Message"
                                        onPress={handleSendMessage}>
                                        <Animated.View
                                            // layout={Layout.springify().damping(20).stiffness(300).mass(0.6)}
                                            style={tailwind.style(
                                                `w-[42px] h-[32px] justify-center items-center bg-[${colors.gray450}] rounded-[24px]`,
                                            )}>
                                            <Icon
                                                color="white"
                                                icon={<SendQuickMessage fill={undefined} />}
                                                size={24}
                                            />
                                        </Animated.View>
                                    </Pressable>
                                )}
                            </Animated.View>
                        </RNPressable>
                    ) : (
                        // Chat button content
                        <Animated.View style={tailwind.style('w-full h-full flex-1 items-center justify-center')}>
                            <RNPressable
                                onPress={handleOnPressChat}
                                onLongPress={handleLongPress}
                                style={[tailwind.style('w-full h-full flex items-center justify-center')]}
                                {...handlers}>
                                {showIcon && (
                                    <Animated.View
                                        entering={FadeIn.duration(200).springify()}
                                        style={tailwind.style('items-center justify-center absolute')}>
                                        <Icon color="white" icon={<Chat fill={undefined} />} size={24} />
                                    </Animated.View>
                                )}
                            </RNPressable>
                        </Animated.View>
                    )}

                    {/* Notification badge */}
                </Animated.View>
                {!showMessage && showIcon && newMessageReceived && (
                    <Animated.View
                        entering={FadeIn.springify().damping(30).stiffness(350).delay(300)}
                        style={directionsBtnStyles.notificationBadge}
                    />
                )}
            </Animated.View>

            {/* Only show local suggestion menu if not triggered by parent */}
            {showSuggestionMenu && !triggeredExternalOptions && (
                <Modal transparent visible={true} animationType="fade">
                    <TouchableWithoutFeedback
                        accessibilityRole="button"
                        onPress={handleBackdropPress}
                        testID="suggestion-menu-overlay">
                        <View
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
                            ]}>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 80,
                                    backgroundColor: '#2D2B2F',
                                    borderRadius: 10,
                                    padding: 5,
                                    width: '80%',
                                    maxWidth: 300,
                                }}>
                                {CUSTOM_SUGGESTIONS.map((suggestion, index) => (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={suggestion}
                                        key={index}
                                        testID={`suggestion-${index}`}
                                        style={{
                                            padding: 15,
                                            borderBottomWidth: index < CUSTOM_SUGGESTIONS.length - 1 ? 1 : 0,
                                            borderBottomColor: 'rgba(255,255,255,0.1)',
                                        }}
                                        onPress={() => handleSelectSuggestion(suggestion)}>
                                        <Typography
                                            type="body-5"
                                            style={{ color: 'white' }}
                                            numberOfLines={undefined}
                                            isAnimate={false}
                                            accessible={true}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {suggestion}
                                        </Typography>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </>
    );
});

export const CallButton = ({
    handleOnPressCall,
    isCompact = false,
    entering = undefined,
    exiting = undefined,
    title = undefined,
}: Pick<FloatingMenuProps, 'handleOnPressCall'> &
    AnimationProps & { isCompact: boolean; title: string | undefined }) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <AnimatedPressable
            testID="floating_menu_call"
            entering={entering}
            exiting={exiting}
            style={[isCompact ? btnStyles.compactContainer : btnStyles.container, animatedStyle]}
            onPress={handleOnPressCall}
            {...handlers}>
            <Animated.View style={btnStyles.iconContainer} {...handlers}>
                <Icon
                    color={isCompact ? colors.gray350 : 'white'}
                    icon={<Call fill={undefined} />}
                    size={isCompact ? 13 : 16}
                    accessibilityLabel={`Call ${title}`}
                />
            </Animated.View>
        </AnimatedPressable>
    );
};

export const DirectionsButton = ({
    handleOnDirectionsPress,
    isCompact = false,
}: Pick<FloatingMenuProps, 'handleOnDirectionsPress'> & { isCompact: boolean }) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <AnimatedPressable
            testID="a8ee16d4-e628-4166-b8a8-6ef8b900c17g"
            layout={LinearTransition.springify().damping(28).stiffness(340)}
            style={[isCompact ? directionsBtnStyles.compactContainer : directionsBtnStyles.container, animatedStyle]}
            onPress={handleOnDirectionsPress}
            {...handlers}>
            <Animated.View style={directionsBtnStyles.innerContainer}>
                <Animated.View style={directionsBtnStyles.iconContainer}>
                    <Icon icon={<WalkIcon fill={undefined} />} size={24} color={isCompact ? colors.gray350 : 'white'} />
                    <Icon
                        icon={<ArrowRight fill={undefined} bold={undefined} />}
                        size={13}
                        color={isCompact ? colors.gray350 : 'white'}
                    />
                    <Icon icon={<CarFront fill={undefined} />} size={23} color={isCompact ? colors.gray350 : 'white'} />
                </Animated.View>

                <Typography
                    type="title-3"
                    style={{ color: isCompact ? colors.gray350 : 'white', fontSize: 16 }}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Directions}
                </Typography>
            </Animated.View>
        </AnimatedPressable>
    );
};

export const ShareButton = ({
    handleOnPressShare,
    isCompact = false,
}: {
    handleOnPressShare: () => void;
    isCompact: boolean | undefined;
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <AnimatedPressable
            testID="floating_menu_share"
            layout={LinearTransition.springify().damping(28).stiffness(340)}
            style={[isCompact ? btnStyles.compactContainer : btnStyles.container, animatedStyle]}
            onPress={handleOnPressShare}
            {...handlers}>
            <Animated.View style={btnStyles.iconContainer} {...handlers}>
                <Icon
                    color={isCompact ? colors.gray350 : 'white'}
                    icon={<Share fill={undefined} />}
                    size={isCompact ? 16 : 24}
                />
            </Animated.View>
        </AnimatedPressable>
    );
};

const ChatEducationComponent = () => {
    const translateY = useSharedValue(0);

    const animatedArrowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    useEffect(() => {
        const currentTranslateY = translateY;

        currentTranslateY.value = withRepeat(
            withSequence(
                withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
        );
    }, []);

    return (
        <View style={backdropStyles.educationContainer}>
            <View style={backdropStyles.educationContent}>
                <Typography
                    type="callout"
                    style={backdropStyles.educationText}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    Long press the button for more options
                </Typography>

                <Animated.View style={[backdropStyles.arrowContainer, animatedArrowStyle]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M12.2743 4.00005C12.654 4.00005 12.9678 4.2822 13.0175 4.64828L13.0243 4.75005L13.0237 17.934L17.7672 13.1711C18.0595 12.8775 18.5344 12.8765 18.8279 13.1688C19.0947 13.4345 19.1198 13.8511 18.9026 14.1452L18.8302 14.2294L12.8062 20.2794C12.7677 20.3181 12.726 20.3517 12.6819 20.3803C12.6687 20.3883 12.6551 20.3965 12.6413 20.4043C12.6294 20.4114 12.6171 20.4179 12.6047 20.424C12.5866 20.4325 12.5679 20.4407 12.5488 20.4482C12.534 20.4543 12.5197 20.4594 12.5053 20.4641C12.4874 20.4696 12.4683 20.475 12.449 20.4796C12.4355 20.483 12.4225 20.4858 12.4094 20.4881C12.39 20.4915 12.3699 20.4943 12.3495 20.4963C12.334 20.4981 12.3186 20.4991 12.3032 20.4997C12.2939 20.4999 12.2841 20.5001 12.2743 20.5001L12.2453 20.4997C12.2305 20.4991 12.2158 20.4981 12.2012 20.4967L12.2743 20.5001C12.227 20.5001 12.1807 20.4957 12.1358 20.4873C12.1251 20.4853 12.114 20.483 12.1031 20.4805C12.0805 20.4751 12.0588 20.469 12.0374 20.4619C12.0269 20.4584 12.0155 20.4543 12.0043 20.45C11.9817 20.4413 11.9602 20.4317 11.9393 20.4212C11.9294 20.4164 11.9191 20.4109 11.9089 20.4052C11.8922 20.3958 11.8764 20.3862 11.861 20.376C11.8501 20.3688 11.8387 20.3608 11.8275 20.3525L11.8189 20.346C11.7925 20.3258 11.7674 20.3038 11.744 20.2804L11.7433 20.2795L5.71828 14.2295C5.42599 13.936 5.42698 13.4611 5.72048 13.1688C5.98729 12.9031 6.40401 12.8798 6.69717 13.0982L6.78113 13.171L11.5237 17.9321L11.5243 4.75005C11.5243 4.33584 11.8601 4.00005 12.2743 4.00005Z"
                            stroke="white"
                            strokeWidth="1"
                            fill="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Animated.View>
            </View>
        </View>
    );
};

const ChatOptionsView = ({
    onSelectOption,
    currentMessageKey,
}: {
    onSelectOption: (optionText: string) => void;
    currentMessageKey: string | undefined;
}) => {
    const currentMessageText =
        // @ts-expect-error Note: as the value is static, ignoring the type error
        currentMessageKey && SUGGESTION_MESSAGES[currentMessageKey] ? SUGGESTION_MESSAGES[currentMessageKey].value : '';

    // Define all possible options
    const allOptions = [
        { text: 'Custom message', iconType: 'edit' },
        { text: 'Where are you?', iconType: 'chat' },
        { text: 'Are you starting?', iconType: 'chat' },
        { text: 'Please come soon', iconType: 'chat' },
        { text: 'Waiting at Pickup', iconType: 'chat' },
        { text: 'Coming, 2 mins', iconType: 'chat' },
    ];

    // Filter out the option that matches the current message
    const options = allOptions.filter(option => option.text !== currentMessageText);

    // Limit to 3 options if there are too many
    const limitedOptions = options.slice(0, 3);

    const handleOptionPress = (optionText: string) => {
        onSelectOption(optionText);
    };

    return (
        <View style={suggestionMenuStyles.container}>
            <View style={suggestionMenuStyles.suggestionMenuBox}>
                {limitedOptions.map((option, index) => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={option.text}
                        key={index}
                        testID={`suggestion-option-${index}`}
                        style={[
                            suggestionMenuStyles.suggestionOption,
                            index < limitedOptions.length - 1 ? suggestionMenuStyles.suggestionOptionBorder : null,
                        ]}
                        onPress={() => handleOptionPress(option.text)}>
                        <Typography
                            type="callout"
                            style={suggestionMenuStyles.suggestionText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {option.text}
                        </Typography>
                        <View style={suggestionMenuStyles.suggestionIconContainer}>
                            {option.iconType === 'chat' && (
                                <Icon icon={<Chat fill={undefined} />} color="white" size={16} />
                            )}
                            {option.iconType === 'edit' && <EditIcon size={16} fill={undefined} />}
                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

export const FloatingMenu = (_props: FloatingMenuProps) => {
    const {
        handleOnPressCall,
        handleOnPressShare,
        handleOnPressChat,
        newMessageReceived,
        handleOnDirectionsPress,
        stage,
        rideId,
    } = _props;

    const { bottom } = useSafeAreaInsets();
    const reducedBottom = Math.max(bottom - (Platform.OS === 'ios' ? 25 : 0), 0);
    const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
    const [localActiveBackdrop, setLocalActiveBackdrop] = useState<'one' | 'two' | null>(null);
    const [isShowingMessage, setIsShowingMessage] = useState(false);
    const [currentMessageKey, setCurrentMessageKey] = useState<string | undefined>(undefined);
    const simpleMessageButtonRef = React.useRef<{ triggerSendAnimation: (message: string) => void }>(null);

    // Get educational component display state from redux
    const dispatch = useAppDispatch();
    const chatEducationShownCount = useAppSelector(selectChatEducationShownCount);
    const chatEducationShownRideIds = useAppSelector(selectChatEducationShownRideIds);
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));

    // Track current message from SimpleMessageButton
    const handleMessageStateChange = useCallback((showMessage: boolean, messageKey?: string) => {
        setIsShowingMessage(showMessage && !!messageKey);
        setCurrentMessageKey(messageKey);
    }, []);

    // Flag to track whether to show the education component for this session
    const shouldShowEducation =
        chatEducationShownCount < 2 && rideId !== null && !chatEducationShownRideIds.includes(rideId);

    // Show education component on mount if conditions are met
    useEffect(() => {
        if (shouldShowEducation) {
            setLocalActiveBackdrop(null);

            const timer = setTimeout(() => {
                setLocalActiveBackdrop('one');

                if (rideId) {
                    dispatch(incrementChatEducationShownCount(rideId));
                }

                // const hideTimer = setTimeout(() => {
                //     setLocalActiveBackdrop(null);
                // }, 10000);

                // return () => clearTimeout(hideTimer);
            }, 5000);

            return () => clearTimeout(timer);
        }
        return () => {};
    }, [rideId, shouldShowEducation]);

    // Handle dismissing the backdrop
    const handleDismissBackdrop = () => {
        setLocalActiveBackdrop(null);
    };

    // Handle showing options on long press
    const handleLongPress = () => {
        setLocalActiveBackdrop('two');
    };

    // Handle selecting a suggestion from ChatOptionsView
    const handleSelectChatOption = (optionText: string) => {
        if (optionText === 'Custom message') {
            handleOnPressChat();
            handleDismissBackdrop();
            return;
        }

        if (simpleMessageButtonRef.current) {
            setIsShowingMessage(true);

            setTimeout(() => {
                simpleMessageButtonRef.current?.triggerSendAnimation(optionText);
            }, 50);

            handleDismissBackdrop();
        } else {
            handleDismissBackdrop();

            const sendMessage = chatHelpers(
                [
                    {
                        channelId: currentSession?.channelId,
                        sessionId: currentSessionId,
                        currentUser: currentSession?.currentUser,
                    },
                ],
                dispatch,
            );

            const send = sendMessage(currentSessionId ?? '');
            if (send) {
                send(optionText);
            }
        }
    };

    const FLOATING_MENU_HEIGHT = 40 + 12 * 2 + bottom + 16;
    const showBackground = isShowingMessage && localActiveBackdrop !== null;

    return (
        <Animated.View
            style={[
                floatingMenuStyles.container,
                {
                    height: FLOATING_MENU_HEIGHT,
                },
            ]}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', '#fff']}
                style={floatingMenuStyles.gradient}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {showBackground && (
                <Animated.View
                    pointerEvents={'auto'}
                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                    style={[
                        floatingMenuStyles.buttonsContainer,
                        {
                            left: 0,
                            width: screenWidth,
                            height: screenHeight,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                    ]}>
                    <TouchableWithoutFeedback
                        accessibilityRole="button"
                        onPress={handleDismissBackdrop}
                        testID="floating-menu-overlay">
                        <View style={{ flex: 1 }}>
                            {localActiveBackdrop === 'one' && <ChatEducationComponent />}
                            {localActiveBackdrop === 'two' && (
                                <ChatOptionsView
                                    onSelectOption={handleSelectChatOption}
                                    currentMessageKey={currentMessageKey}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            )}
            <Animated.View
                layout={LinearTransition.springify().damping(20).stiffness(300).mass(0.6)}
                style={[
                    floatingMenuStyles.buttonWrapper,
                    {
                        paddingBottom: reducedBottom,
                        backgroundColor: showBackground ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
                    },
                ]}>
                {stage !== RideStatus.OTP_RIDE_ASSIGNED ? (
                    <View style={tailwind.style('flex-column')}>
                        <View style={tailwind.style('flex-row')}>
                            <CallButton handleOnPressCall={handleOnPressCall} isCompact={false} title={undefined} />
                            <SimpleMessageButton
                                ref={simpleMessageButtonRef}
                                rideId={rideId}
                                handleOnPressChat={handleOnPressChat}
                                newMessageReceived={newMessageReceived}
                                isCompact={false}
                                stage={stage}
                                onMessageStateChange={handleMessageStateChange}
                                onLongPress={handleLongPress}
                            />
                            <ShareButton handleOnPressShare={handleOnPressShare} isCompact={false} />
                        </View>
                        {isShowingMessage && (
                            <Animated.View
                                entering={FadeIn.duration(300).delay(100).springify()}
                                layout={Layout.springify().damping(20).stiffness(300)}
                                style={tailwind.style('w-full justify-center items-center')}>
                                <View style={tailwind.style('flex-row items-center')}>
                                    <UpArrow fill={colors.gray300} size={10} marginTop={2} />
                                    <Typography
                                        type="callout"
                                        numberOfLines={1}
                                        style={{ color: colors.gray300, fontSize: 12, marginLeft: 8 }}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        Hold for more options
                                    </Typography>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                ) : (
                    <>
                        <DirectionsButton handleOnDirectionsPress={handleOnDirectionsPress} isCompact={false} />
                        <ShareButton handleOnPressShare={handleOnPressShare} isCompact={false} />
                    </>
                )}
            </Animated.View>
        </Animated.View>
    );
};

const floatingMenuStyles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 50,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    buttonsContainer: {
        // Background color set conditionally in component
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        // Background color set conditionally in component
    },
});

const btnStyles = StyleSheet.create({
    container: {
        height: 48,
        width: 54,
        backgroundColor: colors.gray200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
    compactContainer: {
        height: 42,
        width: 50,
        backgroundColor: colors.white200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
    iconContainer: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const directionsBtnStyles = StyleSheet.create({
    container: {
        height: 48,
        backgroundColor: colors.gray200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        marginRight: 8,
    },
    compactContainer: {
        height: 40,
        backgroundColor: colors.white200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        marginRight: 8,
    },
    innerContainer: {
        height: '100%',
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: 10,
        height: 16,
        width: 16,
        borderRadius: 7,
        backgroundColor: '#FFB629',
    },
});

const backdropStyles = StyleSheet.create({
    educationContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
    },
    educationContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    educationText: {
        color: 'white',
        fontSize: 16,
    },
    arrowContainer: {
        marginTop: 22,
        height: 24,
    },
});

const suggestionMenuStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 15,
        alignItems: 'center',
    },
    suggestionMenuBox: {
        backgroundColor: '#2D2B2F',
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 25,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    suggestionOption: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    suggestionOptionBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    suggestionText: {
        color: 'white',
        marginRight: 8,
    },
    suggestionIconContainer: {
        width: 16,
        alignItems: 'center',
    },
});
