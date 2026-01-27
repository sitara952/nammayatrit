// import firestore from '@react-native-firebase/firestore';
import { collection, query, getFirestore, doc, addDoc, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { addMessage, Message, Messages } from '@/typescript/state/client/chat';
import { RootState } from '@/typescript/state/store';

// Debug flag for chat hooks - set to true to enable logs
const enableChatDebugLogs = false;

// Chat hook debug logger
const chatDebugLog = (...args: (string | object | number | boolean)[]) => {
    if (enableChatDebugLogs) {
        console.info('chatHooks', ...args);
    }
};

type ChatListeners = {
    [key: string]: ChatListener;
};

type ChatListener = {
    listener: (val: Messages) => void;
    sendMessage: (message: string) => void;
};

// Instead of a mutable global variable, using a ref-like object:
const chatListenersRef: { current: ChatListeners } = { current: {} };

type CreateChatLister = {
    channelId: string | null;
    sessionId: string | null;
    currentUser: string;
};

export const chatHelpers = (
    request: CreateChatLister[],
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) => {
    chatDebugLog('chatHelpers called with request:', request);

    const updatedChatListeners = request.reduce<ChatListeners>((acc, { channelId, sessionId, currentUser }) => {
        chatDebugLog('Processing request:', { channelId, sessionId, currentUser });

        if (channelId && sessionId && !acc[sessionId]) {
            chatDebugLog('Creating new listener for sessionId:', sessionId);

            const listener = (messages: Messages) => {
                chatDebugLog(
                    'Listener triggered for sessionId:',
                    sessionId,
                    'with messages:',
                    Object.keys(messages).length,
                );

                Object.entries(messages).forEach(([key, value]) => {
                    chatDebugLog('Dispatching message:', { key, value });

                    dispatch(
                        addMessage({
                            id: sessionId,
                            payload: { id: key, message: value },
                        }),
                    );
                });
            };

            onCollectionUpdate(channelId).onSnapshot(listener);
            const sendMessage = (message: string) => {
                chatDebugLog('Sending message in channel:', channelId, 'by user:', currentUser);

                const db = getFirestore();
                const chatsCollection = collection(db, 'Chats');
                const channelDoc = doc(chatsCollection, channelId);
                const messagesCollection = collection(channelDoc, 'messages');

                addDoc(messagesCollection, {
                    message,
                    timestamp: Date.now(),
                    sentBy: currentUser,
                })
                    .then(() => {
                        chatDebugLog('Message sent successfully!');
                        console.info('Message sent successfully!');
                    })
                    .catch((error: Error) => {
                        chatDebugLog('Error sending message:', error);
                        console.error('Error sending message: ', error);
                    });
            };
            // return a new object with the new property.
            return { ...acc, [sessionId]: { listener, sendMessage } };
        }
        return acc;
    }, chatListenersRef.current);

    // Update the ref immutably.
    chatListenersRef.current = updatedChatListeners;
    chatDebugLog('Updated chatListenersRef:', Object.keys(chatListenersRef.current));

    // Return a function that references the updated chat listeners.
    return (sessionId: string) => {
        chatDebugLog('Getting sendMessage function for sessionId:', sessionId);
        return updatedChatListeners[sessionId]?.sendMessage;
    };
};

// It listens to the chat collection and is triggered when the collection is modified.
const onCollectionUpdate = (collectionId: string) => {
    chatDebugLog('Setting up collection update listener for:', collectionId);

    return {
        onSnapshot: (callback: (messages: Messages) => void) => {
            chatDebugLog('Creating snapshot listener for collection:', collectionId);

            const db = getFirestore();
            const chatsCollection = collection(db, 'Chats');
            const channelDoc = doc(chatsCollection, collectionId);
            const messagesCollection = collection(channelDoc, 'messages');
            const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'));

            return onSnapshot(
                messagesQuery,
                querySnapshot => {
                    chatDebugLog('Snapshot received with changes:', querySnapshot.docChanges().length);

                    // Build a new messages object immutably.
                    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                    const messages = querySnapshot.docChanges().reduce<Messages>((acc: Messages, snap: any) => {
                        if (snap.type === 'added') {
                            const data = snap.doc.data();
                            chatDebugLog('New message added:', { id: snap.doc.id, data });

                            const chatObject: Message = {
                                message: data['message'],
                                sentBy: data['sentBy'],
                                timestamp: data['timestamp'],
                            };
                            return { ...acc, [snap.doc.id]: chatObject };
                        }
                        return acc;
                    }, {});
                    callback(messages);
                },
                (error: Error) => {
                    chatDebugLog('Error updating collection:', error);
                    console.error('Error updating collection: ', error);
                },
            );
        },
    };
};
