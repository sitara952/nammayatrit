import React, { useState, useEffect, useRef, useCallback } from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import Button from '@/src-v2/primitives/Button';
import Typography from './primitives/Typography';
import { SendMessageIcon } from '../../../typescript/components/svg/SendMessageIcon';
import Animated, { StretchInX } from 'react-native-reanimated';
import { chatHelpers } from '../../screens/chat/Hooks';
import { ScrollView } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentChatSessionIdWithId, selectRideDetailsWithId } from '@/typescript/state/client/ride';
import { ReadableSuggestion, selectChatSessionWithId } from '@/typescript/state/client/chat';
import {
    selectCurrentEmergencyContact,
    selectLiveSharingEmergencyContacts,
    setCurrentEmergencyContact,
    setLiveSharingEmergencyContacts,
} from '@/typescript/state/client/session';
import { selectCurrentFollower, selectEmergencyContacts, setEmergencyContacts } from '@/typescript/state/client/user';
import { useShareRidePostMutation } from '@/api/integrations/rtk/ShareRidePost';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { selectToken } from '@/typescript/state/client/auth';
import { RideId } from '@/typescript/state/client/booking';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { Linking, StyleSheet, Platform, View } from 'react-native';
import { useTriggerFCMMessagePostMutation } from '../../../api/integrations/rtk/TriggerFCMMessagePost';
import { selectUserName } from '@/typescript/state/client/user';
import { suggestionsDefinitions } from '@/src-v2/screens/FollowRide/components/Suggestion';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { CallIcon } from '@/typescript/components/svg/CallIcon';
import { Resolver } from '@/typescript/utils/common';
import { RideConfirmedScreenAction } from '@/src-v2/screens/RideConfirmed/Types';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { formatPhone } from '@/src-v2/utils/Booking';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { TransformedContact } from './LiveTrackingModal';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';

export const FloatingQuickMessage = ({
    handleSendMessage,
    rideId,
}: {
    handleSendMessage: (val: string) => void;
    rideId: RideId | null;
}) => {
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const session = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const suggestions = session.readableSuggestion.map((item: ReadableSuggestion, index: number) => {
        return (
            <Button
                testID={`e8fe3494-b991-4ab6-af77-0ef0fcaaacd4-${index}`}
                type="secondary"
                size="md"
                key={index}
                onPress={() => {
                    handleSendMessage(item.id);
                }}
                style={tailwind.style(`border-[#E0E3E8] border px-[${token?.spacing?.[16]}] `)}>
                <Typography
                    type="callout"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessibilityRole={undefined}
                    accessible={true}
                    accessibilityLabel={`Quick message: ${item.suggestion}`}>
                    {item.suggestion}
                </Typography>
            </Button>
        );
    });
    return (
        <Animated.View>
            <ScrollView
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                style={[tailwind.style(` px-${token?.spacing?.[16]}`)]}
                contentContainerStyle={[tailwind.style(`flex self-center gap-[${token?.spacing?.[8]}]`)]}>
                {suggestions}
            </ScrollView>
        </Animated.View>
    );
};

export const ChatFooter = ({
    rideId,
    bookingId,
    isDriver,
    isCallDriverOpen,
    chatPartnerName,
    isFollowRide,
    callNumber,
    setHideAccessibility,
}: {
    rideId: RideId | null;
    bookingId: string | undefined;
    isDriver: boolean;
    isCallDriverOpen: React.MutableRefObject<boolean>;
    chatPartnerName: string;
    isFollowRide: boolean;
    callNumber: string | undefined;
    rcsDispatch: Resolver<RideConfirmedScreenAction> | undefined;
    totalMessage: number | undefined;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [isEmptyMessage, setIsEmptyMessage] = useState(true);
    const message = useRef('');
    const { chatFooterTextRef, callDriverBottomsheetModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    // Accessibility focus management for chat input
    const mainContentRef = useRef<View>(null);
    const chatInputRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 50,
    });
    const [shareRideApiCall] = useShareRidePostMutation();
    const [triggerFcmApiCall] = useTriggerFCMMessagePostMutation();
    const emergencyContacts = useAppSelector(selectEmergencyContacts);
    const liveSharingEmergencyContacts = useAppSelector(selectLiveSharingEmergencyContacts);
    const userToken = useAppSelector(selectToken);
    const userName = useAppSelector(selectUserName);
    const currentFollower = useAppSelector(selectCurrentFollower);
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const dispatch = useAppDispatch();
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

    useEffect(() => {
        chatFooterTextRef.current?.clear();
    }, []);

    // Handle accessibility focus for chat input
    useEffect(() => {
        if (chatInputRef.current) {
            accessibilityManager.pushToFocusStack(chatInputRef, 'ChatInput');
            accessibilityManager.setFocus(chatInputRef);
        }
    }, []);

    const handleSendMessage = (text: string) => {
        if (chatFooterTextRef.current) {
            chatFooterTextRef.current.clear();
        }
        if (text.trim().length) {
            if (currentSessionId) {
                const send = sendMessage(currentSessionId);
                if (send) {
                    send(text);
                    if (
                        currentSession.channelId &&
                        ((currentSessionId !== bookingId &&
                            currentEmergencyContact != undefined &&
                            currentEmergencyContact.contactPersonId) ||
                            currentFollower)
                    ) {
                        const val = suggestionsDefinitions[text];
                        triggerFcmApiCall({
                            body: {
                                body: val ? val.en_us : text,
                                channelId: currentSession.channelId,
                                chatPersonId: isFollowRide
                                    ? (currentFollower?.personId ?? '')
                                    : (currentEmergencyContact?.contactPersonId ?? ''),
                                showNotification: true,
                                source: isFollowRide ? 'TRUSTED_CONTACT' : 'USER',
                                title: 'Message from ' + userName,
                            },
                        });
                    }
                    if (
                        currentSessionId !== bookingId &&
                        !isFollowRide &&
                        currentEmergencyContact != undefined &&
                        !currentEmergencyContact.enableForShareRide &&
                        (rideDetails?.status !== 'INPROGRESS' ||
                            currentEmergencyContact?.shareTripWithEmergencyContactOption !== 'ALWAYS_SHARE')
                    ) {
                        const newEmergencyContact: personDefaultEmergencyNumberAPIEntity = {
                            ...currentEmergencyContact,
                            enableForShareRide: true,
                        };
                        const currLiveSharingContact = liveSharingEmergencyContacts?.find(contact => {
                            return contact.contactPersonId === currentEmergencyContact.contactPersonId;
                        });
                        const newLiveSharingContact: TransformedContact = {
                            isRideShared: true,
                            imgSrc: currLiveSharingContact?.imgSrc ?? { uri: '' },
                            title: currLiveSharingContact?.title ?? '',
                            mobileNumber: currLiveSharingContact?.mobileNumber ?? '',
                            contactPersonId: currLiveSharingContact?.contactPersonId,
                            priority: currLiveSharingContact?.priority ?? 0,
                        };
                        dispatch(setCurrentEmergencyContact(newEmergencyContact));
                        dispatch(
                            setEmergencyContacts({
                                id: userToken,
                                payload: emergencyContacts
                                    .filter(v => v.mobileNumber != newEmergencyContact.mobileNumber)
                                    .concat(newEmergencyContact),
                            }),
                        );
                        dispatch(
                            setLiveSharingEmergencyContacts(
                                liveSharingEmergencyContacts
                                    ?.filter(v => v.mobileNumber != newLiveSharingContact.mobileNumber)
                                    .concat(newLiveSharingContact),
                            ),
                        );
                        shareRideApiCall({
                            body: {
                                emergencyContactNumbers: [currentEmergencyContact.mobileNumber],
                            },
                        });
                    }
                }
            }
            message.current = '';
            setIsEmptyMessage(true);
        }
    };

    const onChangeText = useCallback((text: string) => {
        message.current = text;

        setIsEmptyMessage(prev => {
            if (text && prev) return false;
            if (text === '' && !prev) return true;
            return prev;
        });
    }, []);

    return (
        <Animated.View ref={mainContentRef} style={[tailwind.style(`w-full flex-col justify-start bg-white`)]}>
            <Animated.View style={{ marginVertical: 16 }}>
                <FloatingQuickMessage handleSendMessage={handleSendMessage} rideId={rideId} />
            </Animated.View>
            <Animated.View
                ref={chatInputRef}
                accessibilityLabel="Chat Input Section"
                entering={StretchInX.duration(500)}
                style={[
                    tailwind.style(
                        ` flex-row justify-between pb-[${bottom / 1.5}px] mb-[${
                            Platform.OS === 'android' ? '10' : '3'
                        }px] px-[16px]`,
                    ),
                ]}>
                <Animated.View style={tailwind.style(`flex-row items-center justify-between gap-2`)}>
                    <Button
                        testID="call-button"
                        accessible
                        type="secondary"
                        size="md"
                        accessibilityLabel="Call"
                        bgColor={'#FFD000'}
                        onPressOut={() => {
                            isCallDriverOpen.current = true;
                            if (setHideAccessibility) {
                                setHideAccessibility(true);
                            }
                            if (currentEmergencyContact === undefined && !isFollowRide) {
                                callDriverBottomsheetModalRef.current?.present();
                            } else {
                                try {
                                    Linking.openURL(`tel:${formatPhone(callNumber)}`);
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        }}
                        style={[
                            tailwind.style(
                                `border-[${themeColors.Fill_neutralUltraLow}] border px-[${token?.spacing?.[16]}] mr-2 `,
                            ),
                            styles.buttonShadow,
                        ]}>
                        <CallIcon fillColor={'#2F2D32'} />
                    </Button>
                </Animated.View>
                <BottomSheetTextInput
                    accessible={true}
                    accessibilityLabel="Type your message"
                    accessibilityRole="text"
                    accessibilityHint="Double tap to start typing your message"
                    autoCorrect={false}
                    style={[
                        tailwind.style(
                            `flex-2 w-full bg-[#F4F4F4] items-center
             pl-[${token?.spacing?.[16]}] h-[11] rounded-[50px]`,
                        ),
                        { fontSize: 13.5, fontFamily: 'AreaNormal-Bold' },
                    ]}
                    selectTextOnFocus
                    // autoFocus
                    multiline={false}
                    ref={chatFooterTextRef}
                    onChangeText={onChangeText}
                    placeholder={
                        chatPartnerName !== ''
                            ? `${userLanguageStrings.Chatwith}` +
                              ' ' +
                              `${
                                  isDriver
                                      ? userLanguageStrings.Driver.toLowerCase() + '...'
                                      : chatPartnerName.slice(0, 17) + '...'
                              }`
                            : userLanguageStrings.Typesomething + '...'
                    }
                />
                <Button
                    testID="7c324053-6791-46dc-88aa-3dcad376aa79"
                    type="primary"
                    style={tailwind.style('z-10 absolute right-3 h-[85%] top-[3px] px-4 rounded-[50px]')}
                    accessibilityLabel="Send message"
                    accessibilityRole="button"
                    disabled={isEmptyMessage}
                    onPress={() => {
                        handleSendMessage(message.current);
                    }}>
                    <SendMessageIcon fill={themeColors.Icon_neutralMin} />
                </Button>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonShadow: {
        shadowColor: '#05181A1C',
        shadowRadius: 2.5,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 3.5 },
    },
});
