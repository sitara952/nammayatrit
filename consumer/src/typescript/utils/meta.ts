import { AppEventsLogger } from 'react-native-fbsdk-next';

export const logEvent: (eventName: string, props?: { [key: string]: any }) => void = (eventName, props) => {
    AppEventsLogger.logEvent(eventName, props ?? {});
};
