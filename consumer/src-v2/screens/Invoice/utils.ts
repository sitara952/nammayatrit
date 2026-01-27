import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
dayjs.extend(utc);

export function getISTWithFormat(utcTime: string | Date, format: string): string {
    const utcDateTime = dayjs(utcTime).utc();
    const istDateTime = utcDateTime.add(5, 'hour').add(30, 'minute');
    return istDateTime.format(format);
}

export async function requestNotificationPermission() {
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    type tempAny = any;
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    const status = await request((PERMISSIONS.ANDROID as tempAny).POST_NOTIFICATIONS); // TO-CHECK: if working fine

    switch (status) {
        case RESULTS.GRANTED:
            console.info('Notification permission granted');
            return true;
        case RESULTS.DENIED:
            console.warn('Notification permission denied but requestable');
            return false;
        case RESULTS.BLOCKED:
            console.info('Notification permission denied and not requestable');
            return false;
        case RESULTS.UNAVAILABLE:
            console.error('Notification feature is unavailable on this device');
            return false;
        default:
            console.error('Unhandled notification permission status:', status);
            return false;
    }
}
