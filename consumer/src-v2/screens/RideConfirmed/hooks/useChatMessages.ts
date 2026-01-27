import { useCallback, useEffect, useState, useRef } from 'react';
import { isEmpty } from 'lodash';

type Message = {
    sentBy: string;
    // Add other message properties as needed
};

type UseChatMessagesProps = {
    messagesList: Message[];
    personId: string | undefined;
};

export const useChatMessages = ({ messagesList, personId }: UseChatMessagesProps) => {
    const [showChatBar, setShowChatBar] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTwoArePresentable = useRef(false);

    // Count unread messages from driver
    const messageCountLogic = useCallback(() => {
        return messagesList.reduceRight(
            (acc, message) => {
                // If we've already found a customer message, stop counting
                if (acc.foundCustomer) {
                    return acc;
                }
                if (message?.sentBy === 'Driver' || (message?.sentBy !== 'customer' && message?.sentBy != personId)) {
                    return { ...acc, count: acc.count + 1 };
                }
                if (message?.sentBy === 'customer' || message?.sentBy == personId) {
                    return { ...acc, foundCustomer: true };
                }
                return acc;
            },
            { count: 0, foundCustomer: false },
        ).count;
    }, [messagesList]);

    // Update lastTwoArePresentable if the last two messages are from different people
    useEffect(() => {
        if (messagesList.length >= 2) {
            const lastMessage = messagesList[messagesList.length - 1];
            const secondLastMessage = messagesList[messagesList.length - 2];
            lastTwoArePresentable.current = lastMessage?.sentBy !== secondLastMessage?.sentBy;
        } else if (messagesList.length === 1) {
            // If there's only one message and it's not from the driver, set to true
            const message = messagesList[0];
            lastTwoArePresentable.current = message?.sentBy !== 'Driver';
        } else {
            lastTwoArePresentable.current = false;
        }
    }, [messagesList]);

    // Show chat bar when there are unread messages
    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout for 1 second
        timeoutRef.current = setTimeout(() => {
            const count = messageCountLogic();
            setShowChatBar(count !== 0 || lastTwoArePresentable.current);
        }, 1000);

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [messagesList, messageCountLogic()]);

    // Check if we should enable auto send message
    const shouldEnableAutoSendMessage = isEmpty(messagesList);

    return {
        showChatBar,
        setShowChatBar,
        messageCountLogic,
        shouldEnableAutoSendMessage,
        lastTwoArePresentable: lastTwoArePresentable.current,
    };
};
