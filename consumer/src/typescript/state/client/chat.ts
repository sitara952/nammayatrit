/* eslint-disable functional/immutable-data */
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { epochToHumanTime } from '../../screens/chat/utils';
import { RootState } from '../store';
import { PURGE } from 'redux-persist';
import { cloneDeep, isNull } from 'lodash';
import { initialRideChatSession } from '@/typescript/screens/chat/Constants';
import { initialFollowRideChatSession } from '@/src-v2/screens/FollowRide/components/Suggestion';

const safeSet = (stateObj: ChatSessionDict, id: SessionId) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptySession);
    return stateObj[id];
};

export type SessionId = string;

export type Message = {
    message: string;
    sentBy: string;
    timestamp: number;
};

export type ReadableMessage = Message & {
    time: string;
    id: string;
};

export type Suggestions = { [key: string]: string[] } & object;

export type SuggestionDefinitions = {
    [key: string]: {
        en_us: string;
        ta_in: string;
        kn_in: string;
        hi_in: string;
        ml_in: string;
        bn_in: string;
        te_in: string;
    };
} & object;

export type Messages = { [key: string]: Message } & object;

export type ReadableSuggestion = {
    suggestion: string;
    id: string;
};

export interface ChatSession {
    messages: Messages;
    currentUser: string;
    readableMessages: ReadableMessage[];
    readableSuggestion: ReadableSuggestion[];
    channelId: string | null;
    suggestions: {
        maps: Suggestions;
        defs: SuggestionDefinitions;
    };
    followRide: string | undefined;
}

export const emptySession: ChatSession = {
    messages: {},
    readableMessages: [],
    readableSuggestion: [],
    channelId: null,
    currentUser: 'customer',
    suggestions: {
        maps: {},
        defs: {},
    },
    followRide: undefined,
};

export interface ChatSessionDict {
    [sessionId: SessionId]: ChatSession;
}

type ChatPayload<T> = {
    id: SessionId | null;
    payload: T;
};

type ChatPayloadAction<T> = PayloadAction<ChatPayload<T>>;

const REDUCER_NAME = 'chat' as string;

const INITIAL_STATE: ChatSessionDict = {};

export const chatSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        addSession: (state, action: ChatPayloadAction<ChatSession>) => {
            if (isNull(action.payload.id) || state[action.payload.id]) {
                console.error('Session ID is null or Session With This ID already exists. Please Check the code');
                return;
            }
            const newSession = updateReadableSuggestion(action.payload.payload);
            state[action.payload.id] = newSession;
        },
        setChannelId: (state, action: ChatPayloadAction<string>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).channelId = action.payload.payload;
            return undefined;
        },
        addMessage: (state, action: ChatPayloadAction<{ id: string; message: Message }>) => {
            const { id } = action.payload;
            if (isNull(id) || !state[id]) {
                console.error(`Session doesn't exist for sessionId: ${id}`);
                return state;
            }
            const session = state[id];
            session.messages[action.payload.payload.id] = action.payload.payload.message;
            session.readableMessages = convertMessage(session);

            const updatedSession = updateReadableSuggestion(session);
            if (state[id]) {
                state[id] = {
                    ...state[id], // Retain existing properties to satisfy type checking
                    ...updatedSession,
                };
            }
            return undefined;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, _state => {
            return INITIAL_STATE;
        });
    },
});

const convertMessage = (session: ChatSession): ReadableMessage[] => {
    return Object.entries(session.messages)
        .map(([key, value]) => {
            if (!value) return null;
            const message = session.suggestions.defs[value.message]?.en_us || value.message;
            return {
                ...value,
                message,
                time: epochToHumanTime(value.timestamp, 'hh:mm A'),
                id: key,
            };
        })
        .filter((msg): msg is ReadableMessage => msg !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
};

const updateReadableSuggestion = (session: ChatSession): ChatSession => {
    if (session.readableMessages.length > 0) {
        const sessionId = session.readableMessages[session.readableMessages.length - 1];
        if (sessionId !== undefined) {
            const lastMessage = session.messages[sessionId.id];
            if (lastMessage !== undefined) {
                const showSuggestion = lastMessage.sentBy !== session.currentUser;
                const defaultSuggestions = () => {
                    switch (session.followRide) {
                        case 'follower':
                            return initialFollowRideChatSession(true).readableSuggestion;
                        case 'following':
                            return initialFollowRideChatSession(false).readableSuggestion;
                        default:
                            return initialRideChatSession.readableSuggestion;
                    }
                };
                const newSession = {
                    ...session,
                    readableSuggestion: showSuggestion
                        ? session.suggestions.maps[lastMessage.message]
                            ? (session.suggestions.maps[lastMessage.message] || []).map(item => {
                                  return {
                                      id: item,
                                      suggestion: session.suggestions.defs[item]?.en_us || '', // TODO: fix it properly
                                  };
                              })
                            : defaultSuggestions()
                        : session.readableSuggestion,
                };
                return newSession;
            }
            console.error('lastMessage is undefined');
            return session;
        }
        console.error('sessionId is undefined');
        return session;
    }
    return session;
};

// Helper function to get the chat state
const selectChatState = (state: RootState) => (state.chat || INITIAL_STATE) as ChatSessionDict;

// Memoized selector to get the entire chat state
export const selectChat = createSelector([selectChatState], chatState => chatState);

// Create a stable reference to emptySession for the selector to return
const MEMOIZED_EMPTY_SESSION = emptySession;

// Memoized selector to get a chat session by ID
export const selectChatSessionWithId = createSelector(
    [selectChatState, (_state: RootState, sessionId: SessionId | null) => sessionId],
    (chatSessionDict, sessionId) => {
        if (sessionId && chatSessionDict && chatSessionDict[sessionId]) {
            return chatSessionDict[sessionId] as ChatSession;
        }
        return MEMOIZED_EMPTY_SESSION;
    },
);

export const { addSession, setChannelId, addMessage } = chatSlice.actions;

export default chatSlice;
