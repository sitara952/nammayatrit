import { DateFilterOption } from '@/src-v2/screens/MyRides/components/FilterRidesModal';

export const getDateRangeFromFilter = (
    dateFilter: DateFilterOption,
    customStartDate: Date | undefined,
    customEndDate: Date | undefined,
): { fromDate: number | undefined; toDate: number | undefined } => {
    const now = new Date();

    switch (dateFilter) {
        case 'last7days': {
            const sevenDaysAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0));
            return { fromDate: sevenDaysAgo.getTime(), toDate: now.getTime() };
        }
        case 'currentMonth': {
            const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
            return { fromDate: startOfMonth.getTime(), toDate: now.getTime() };
        }
        case 'lastMonth': {
            const year = now.getFullYear();
            const lastMonth = now.getMonth() - 1;

            const adjustedYear = lastMonth < 0 ? year - 1 : year;
            const adjustedMonth = lastMonth < 0 ? 11 : lastMonth;

            const startOfLastMonth = new Date(Date.UTC(adjustedYear, adjustedMonth, 1, 0, 0, 0, 0));

            const endOfLastMonth = new Date(Date.UTC(year, now.getMonth(), 0, 23, 59, 59, 999));

            return { fromDate: startOfLastMonth.getTime(), toDate: endOfLastMonth.getTime() };
        }
        case 'custom': {
            if (customStartDate && customEndDate) {
                const startUTC = new Date(
                    Date.UTC(
                        customStartDate.getFullYear(),
                        customStartDate.getMonth(),
                        customStartDate.getDate(),
                        0,
                        0,
                        0,
                        0,
                    ),
                );
                const endUTC = new Date(
                    Date.UTC(
                        customEndDate.getFullYear(),
                        customEndDate.getMonth(),
                        customEndDate.getDate(),
                        23,
                        59,
                        59,
                        999,
                    ),
                );
                return {
                    fromDate: startUTC.getTime(),
                    toDate: endUTC.getTime(),
                };
            }
            return {
                fromDate: undefined,
                toDate: undefined,
            };
        }
        default:
            return { fromDate: undefined, toDate: undefined };
    }
};
