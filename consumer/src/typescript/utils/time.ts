export const convertSecondsToUTCCurrentDate = (seconds: number): Date => {
    const midnight = new Date().setHours(0, 0, 0, 0);
    const utcTime = new Date(midnight + seconds * 1000);
    return utcTime;
};

export const getUtcTimestamp = (): string => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
};

export const getTimeDifferenceInSecondsBwTwoDates = (date1: string, date2: string): number => {
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.floor((secondDate.getTime() - firstDate.getTime()) / 1000);
};

export const isWithinNSeconds = (date: string, seconds: number): boolean => {
    const timeDiffInSeconds = getTimeDifferenceInSecondsBwTwoDates(new Date().toISOString(), date);
    return timeDiffInSeconds > 0 && timeDiffInSeconds <= seconds;
};

export const isTimeBetween = (startTime: number, endTime: number): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Convert start and end times to minutes for comparison
    const startTimeInMinutes = startTime * 60;
    const endTimeInMinutes = endTime * 60;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

export const isTimeBetweenUsingSecond = (startTime: number, endTime: number): boolean => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentTimeInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

    // Handle overnight ranges (e.g., 22:15:00 to 04:30:00)
    // When startTime > endTime, it means the range spans midnight
    if (startTime > endTime) {
        return currentTimeInSeconds >= startTime || currentTimeInSeconds <= endTime;
    }

    return currentTimeInSeconds >= startTime && currentTimeInSeconds <= endTime;
};

export const dayOfWeek = (date: string): number => {
    const day = new Date(date).getDay();
    return day;
};

export const isSafetyCheckTime = (safetyCheckStartTime: number, safetyCheckEndTime: number) => {
    const currentHour = new Date().getHours();
    return currentHour >= safetyCheckStartTime / 3600 || currentHour < safetyCheckEndTime / 3600;
};

export const getUTCTimeFromDate = (dateOfBirth: string) => {
    const date = new Date(dateOfBirth);
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    return utcDate.toISOString();
};

export const timeStringToSeconds = (time: string): number | undefined => {
    const [h, m, s] = time.split(':').map(Number);

    if (
        h === undefined ||
        m === undefined ||
        s === undefined ||
        Number.isNaN(h) ||
        Number.isNaN(m) ||
        Number.isNaN(s)
    ) {
        return undefined;
    }

    return h * 3600 + m * 60 + s;
};

export const get12HourFormatText = (time: string) => {
    const [h, m] = time.split(':').map(Number);

    if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) {
        return undefined;
    }

    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;

    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

export function formatTimeOrRelative(isoTime: string): string {
    const date = new Date(isoTime);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        if (diffSeconds < 60) return 'just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
