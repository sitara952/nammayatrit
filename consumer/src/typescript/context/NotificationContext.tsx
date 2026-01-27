import React, { createContext, ReactElement, useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { FCMBasedAccessibility } from '../utils/Accessibility';

export type NotificationData = {
    entity_type: string;
    notification_json: string;
    entity_ids: string;
    entity_data: string;
    notification_type: string;
    show_notification: string;
    driver_notification_payload: string;
};

export const defaultPayloadData: NotificationData = {
    entity_type: '',
    notification_json: '',
    entity_ids: '',
    entity_data: '',
    notification_type: '',
    show_notification: '',
    driver_notification_payload: '',
};
const defaultSetter = (_: NotificationData) => {};

export const NotificationContext = createContext<[NotificationData, (_: NotificationData) => void]>([
    defaultPayloadData,
    defaultSetter,
]);

export type StoredNotification = NotificationData & { receivedAt: number };

const MAX_NOTIFICATION_HISTORY = 10;
const notificationHistoryRef: { current: StoredNotification[] } = { current: [] };

const pushNotificationToHistory = (notificationData: NotificationData) => {
    const updated = [...notificationHistoryRef.current, { ...notificationData, receivedAt: Date.now() }];
    notificationHistoryRef.current = updated.slice(-MAX_NOTIFICATION_HISTORY);
};

export const getNotificationsSince = (msAgo: number): StoredNotification[] => {
    const cutoff = Date.now() - msAgo;
    return notificationHistoryRef.current.filter(n => n.receivedAt >= cutoff);
};

type FCMEventData = Partial<NotificationData>;

export const ReactNotificationContext = ({ children }: { children: ReactElement }) => {
    const [state, setState] = useState<NotificationData>(defaultPayloadData);
    useEffect(() => {
        const nativeEmitter = new NativeEventEmitter(NativeModules['FirebaseMessagingModule']);
        const subscription = nativeEmitter.addListener('onFCMReceived', (data: FCMEventData) => {
            // Destructure data with default values to avoid redundant lookups
            const {
                entity_type = '',
                notification_json = '',
                entity_ids = '',
                entity_data = '',
                notification_type = '',
                show_notification = '',
                driver_notification_payload = '',
            } = data;

            const mappedData: NotificationData = {
                entity_type,
                notification_json,
                entity_ids,
                entity_data,
                notification_type,
                show_notification,
                driver_notification_payload,
            };

            setState(mappedData);
            pushNotificationToHistory(mappedData);
            FCMBasedAccessibility(mappedData);
        });

        return () => subscription.remove();
    });

    return <NotificationContext.Provider value={[state, setState]}>{children}</NotificationContext.Provider>;
};
