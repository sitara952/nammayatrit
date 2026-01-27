export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function toISTDateParts(date: Date) {
    try {
        const parts = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).formatToParts(date);

        const y = Number(parts.find(p => p.type === 'year')?.value ?? 0);
        const m = Number(parts.find(p => p.type === 'month')?.value ?? 0); // 1..12
        const d = Number(parts.find(p => p.type === 'day')?.value ?? 0);
        return { y, m, d };
    } catch {
        // Fallback: shift the timestamp by IST offset and read UTC date parts.
        // Using UTC methods avoids host-local timezone interference.
        const shifted = new Date(date.getTime() + IST_OFFSET_MS);
        const y = shifted.getUTCFullYear();
        const m = shifted.getUTCMonth() + 1; // 1..12
        const d = shifted.getUTCDate();
        return { y, m, d };
    }
}

export function makeDateAtISTMidnight(year: number, month1to12: number, day: number): Date {
    const utcMillisForISTMidnight = Date.UTC(year, month1to12 - 1, day) - IST_OFFSET_MS;
    return new Date(utcMillisForISTMidnight);
}

export function daysInMonthUTC(year: number, month1to12: number): number {
    // Day 0 of the following month = last day of desired month
    return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function candidateEndDate(startDate: Date): Date {
    const { y, m, d } = toISTDateParts(startDate);

    const [nextY, nextM] = d === 1 ? [y, m] : m === 12 ? [y + 1, 1] : [y, m + 1];

    const daysInNextMonth = daysInMonthUTC(nextY, nextM);
    const endDay = d === 1 || d > daysInNextMonth ? daysInNextMonth : d - 1;

    return makeDateAtISTMidnight(nextY, nextM, endDay);
}

export function formatDateToYYYYMMDD(date: Date): string {
    const { y, m, d } = toISTDateParts(date);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function formatDateToString(date: Date, showTodayText: boolean = true, todayText: string = 'Today'): string {
    // Try using Intl with timeZone if available; otherwise fall back to
    // shifting timestamp by IST offset and extracting UTC parts.
    try {
        const todayIST = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        const dateIST = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

        if (showTodayText && dateIST === todayIST) {
            return todayText;
        }

        const formatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const parts = formatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const year = parts.find(p => p.type === 'year')?.value;

        return `${day} - ${month} - ${year}`;
    } catch {
        // Fallback: compute IST date by shifting timestamp by IST offset and reading UTC parts
        const now = new Date();
        const shiftedNow = new Date(now.getTime() + IST_OFFSET_MS);
        const shiftedDate = new Date(date.getTime() + IST_OFFSET_MS);

        const yyyyMMdd = (d: Date) =>
            `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(
                2,
                '0',
            )}`;

        if (showTodayText && yyyyMMdd(shiftedNow) === yyyyMMdd(shiftedDate)) {
            return todayText;
        }

        const day = String(shiftedDate.getUTCDate());
        const monthIndex = shiftedDate.getUTCMonth();
        const year = String(shiftedDate.getUTCFullYear());
        const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = MONTH_SHORT[monthIndex] ?? String(monthIndex + 1);

        return `${day} - ${month} - ${year}`;
    }
}

/**
 * Converts a `dd - MMM - yyyy` formatted date string to an ordinal date.
 * Returns the original string if the input format is invalid.
 *
 * Expected format: "dd - MMM - yyyy"
 *
 * @param dateString - Date string to convert
 * @returns Ordinal date (e.g. "1st Feb") or original string if invalid
 */
export function toOrdinalDate(dateString: string): string {
    // Expected format: "dd - MMM - yyyy"
    const [dd, month] = dateString.split(' - ');

    const day = Number(dd);

    if (Number.isNaN(day) || !month) {
        return dateString; // fail-safe
    }

    const ordinal = (() => {
        if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
        switch (day % 10) {
            case 1:
                return `${day}st`;
            case 2:
                return `${day}nd`;
            case 3:
                return `${day}rd`;
            default:
                return `${day}th`;
        }
    })();

    return `${ordinal} ${month}`;
}
