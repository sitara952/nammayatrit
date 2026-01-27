import { useCallback, useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { selectCurrentChatSessionIdWithId, setCurrentChatSessionId } from '@/typescript/state/client/ride.ts';
import { selectCurrentEmergencyContact, setCurrentEmergencyContact } from '@/typescript/state/client/session';
import { selectEmergencyContacts, selectUserId } from '@/typescript/state/client/user.ts';
import { addSession } from '@/typescript/state/client/chat.ts';
import { initialRideChatSession } from '@/typescript/screens/chat/Constants.tsx';
import { initialFollowRideChatSession } from '../../FollowRide/components/Suggestion.ts';
import { chatHelpers } from '@/typescript/screens/chat/Hooks.tsx';
import { getChannelId } from '@/typescript/screens/chat/utils.tsx';
import { personDefaultEmergencyNumberAPIEntity as emergencyContactNumber } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { Linking } from 'react-native';
import { RideId } from '@/typescript/state/client/booking.ts';
import { BookingId } from '@/typescript/state/client/user.ts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLazyProfileDefaultEmergencyNumbersGetQuery } from '@/api/integrations/rtk/ProfileDefaultEmergencyNumbersGet.ts';

type UseChatSessionsProps = {
    rideId: RideId | null;
    bookingId: BookingId | undefined;
    bookingDetailsId: string | undefined;
    rideStatus: string | undefined;
    bppRideId: string | undefined;
    bookingTag: string | undefined;
};

export const useChatSessions = ({
    rideId,
    bookingId,
    bookingDetailsId,
    rideStatus,
    bppRideId,
    bookingTag,
}: UseChatSessionsProps) => {
    const dispatch = useAppDispatch();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatClicked, setChatClicked] = useState(false);
    const [isDriver, setIsDriver] = useState(true);

    const currentChatSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const emergencyContacts = useAppSelector(selectEmergencyContacts);
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const personId = useAppSelector(selectUserId);

    const [getEmergencyContacts] = useLazyProfileDefaultEmergencyNumbersGetQuery();

    // Get emergency contact with priority 0, 1, or 2
    const contactWithPriorityZero: emergencyContactNumber | undefined = emergencyContacts.find(
        contact =>
            (contact.priority === 0 && contact.contactPersonId && contact.contactPersonId !== '') ||
            (contact.priority === 1 && contact.contactPersonId && contact.contactPersonId !== '') ||
            (contact.priority === 2 && contact.contactPersonId && contact.contactPersonId !== ''),
    );

    // Get active chat user
    const activeChatUserId =
        currentChatSessionId?.split('$').length === 0
            ? currentChatSessionId?.split('$')[0]
            : currentChatSessionId?.split('$')[1];

    const activeChatUser: emergencyContactNumber | undefined = emergencyContacts.find(
        (user: emergencyContactNumber) => user.contactPersonId === activeChatUserId,
    );

    const contactId =
        currentChatSessionId === bookingDetailsId
            ? contactWithPriorityZero
            : (activeChatUser ?? contactWithPriorityZero);

    const callNumber = currentEmergencyContact?.mobileNumber;

    // Initialize new chat sessions for emergency contacts
    const initializeNewSessions = useCallback(
        async (newContacts: emergencyContactNumber[]) => {
            newContacts.forEach(item => {
                if (item.contactPersonId && item.contactPersonId !== '') {
                    const initialSession = {
                        ...cloneDeep(initialFollowRideChatSession(false)),
                        currentUser: personId || 'FollowRideUser',
                        channelId: getChannelId(item.priority, rideId, item.contactPersonId),
                    };
                    dispatch(
                        addSession({
                            id: bookingId + '$' + item.contactPersonId,
                            payload: initialSession,
                        }),
                    );

                    chatHelpers(
                        [
                            {
                                channelId: initialSession.channelId,
                                sessionId: bookingId + '$' + item.contactPersonId,
                                currentUser: initialSession.currentUser,
                            },
                        ],
                        dispatch,
                    );
                }
            });
        },
        [bookingId, rideId, personId, dispatch],
    );

    // Initialize chat session
    useEffect(() => {
        if (bookingDetailsId && bppRideId) {
            const session = {
                ...initialRideChatSession,
                channelId: bppRideId,
            };

            if (
                (rideStatus !== 'INPROGRESS' || (rideStatus === 'INPROGRESS' && bookingTag === 'RENTAL')) &&
                (currentChatSessionId === null ||
                    currentEmergencyContact === undefined ||
                    emergencyContacts.length === 0)
            ) {
                dispatch(addSession({ id: bookingDetailsId, payload: session }));
                dispatch(
                    setCurrentChatSessionId({
                        id: rideId,
                        payload: bookingDetailsId,
                    }),
                );

                setTimeout(() => {
                    chatHelpers(
                        [
                            {
                                channelId: session.channelId,
                                sessionId: bookingId + '',
                                currentUser: session.currentUser,
                            },
                        ],
                        dispatch,
                    );
                    if (emergencyContacts.length === 0) {
                        dispatch(setCurrentEmergencyContact(undefined)); // Reset processed contacts
                    }
                }, 5000);
            } else {
                initializeNewSessions(emergencyContacts);
                if (contactId) {
                    dispatch(setCurrentEmergencyContact(contactId));
                    dispatch(
                        setCurrentChatSessionId({
                            id: rideId,
                            payload: bookingId + '$' + contactId?.contactPersonId,
                        }),
                    );
                }
            }
        }
    }, [emergencyContacts, currentEmergencyContact, rideStatus, bookingDetailsId, bppRideId]);

    // Handle emergency contact reset when there's only one contact with no contactPersonId
    useEffect(() => {
        if (
            currentEmergencyContact !== undefined &&
            emergencyContacts.length == 1 &&
            (emergencyContacts[0]?.contactPersonId == undefined || emergencyContacts[0]?.contactPersonId == '')
        ) {
            dispatch(setCurrentEmergencyContact(undefined));
        }
    }, [emergencyContacts, currentEmergencyContact, dispatch]);

    // Load emergency contacts
    useEffect(() => {
        getEmergencyContacts({});
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [getEmergencyContacts]);

    // Handle chat button click
    const handleChatClick = useCallback(() => {
        setChatClicked(true);
    }, []);

    // Handle call button click
    const handleCallClick = useCallback(
        (callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>) => {
            if (currentEmergencyContact === undefined) {
                callDriverBottomsheetModalRef?.current?.present();
            } else {
                try {
                    Linking.openURL(`tel:${callNumber}`);
                } catch (error) {
                    console.error(error);
                }
            }
        },
        [currentEmergencyContact, callNumber],
    );

    return {
        isChatOpen,
        setIsChatOpen,
        isChatClicked,
        setChatClicked,
        isDriver,
        setIsDriver,
        currentChatSessionId,
        contactWithPriorityZero,
        handleChatClick,
        handleCallClick,
        initializeNewSessions,
        getEmergencyContacts,
        personId,
    };
};
