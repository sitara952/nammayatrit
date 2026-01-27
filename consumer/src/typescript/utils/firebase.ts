import { getAnalytics, logEvent as firebaseLogEvent } from '@react-native-firebase/analytics';

export const logEvent: (
    eventName: string,
    props?: { [key: string]: string | number | boolean | object | Date | null | undefined },
) => void = (eventName, props) => {
    const analytics = getAnalytics();
    firebaseLogEvent(analytics, eventName, props);
};
