import { businessHourResp } from '@/readOnly/api/types/BusinessHourResp.gen';
import {
    TicketServiceData,
    ServiceCategory,
    FlattenedBusinessHourData,
    OperationalDaysData,
    PeopleCategoriesData,
    SlotInterval,
    TimeInterval,
    OperationalDate,
    PeopleCategoriesResp,
} from '../ChooseCategories/Types';
import type { ticketServiceResp as TicketServiceResp_ticketServiceResp } from '@/readOnly/api/types/TicketServiceResp.gen';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { operationalDate } from '@/readOnly/api/types/OperationalDate.gen';
import dayjs from 'dayjs';
import { PlaceType_placeType } from '@/readOnly/api/types/Enums.gen';
import { CustomCategories } from '../ChooseEventScreen/Type';
import { strings } from 'config-types';

export const formatDateToReadable = (dateString: string | undefined, userLanguageStrings: strings): string => {
    if (!dateString) return userLanguageStrings.StartingSoon;
    try {
        const date = dayjs(dateString);
        if (!date.isValid()) return userLanguageStrings.StartingSoon;
        return date.format('ddd, DD MMM');
    } catch {
        return userLanguageStrings.StartingSoon;
    }
};

export const formatDateWithDay = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

export const convertUTCToISTAnd12HourFormat = (timeString: string): string => {
    if (!timeString) return '';

    try {
        const timeParts = timeString.split(':');
        const utcHours = parseInt(timeParts[0] || '0', 10);
        const utcMinutes = parseInt(timeParts[1] || '0', 10);

        if (isNaN(utcHours) || isNaN(utcMinutes)) return timeString;

        const totalMinutes = utcMinutes + 30;
        const minuteOverflow = Math.floor(totalMinutes / 60);
        const istMinutes = totalMinutes % 60;

        const totalHours = utcHours + 5 + minuteOverflow;
        const istHours = totalHours % 24;

        const displayHours = istHours === 0 ? 12 : istHours > 12 ? istHours - 12 : istHours;
        const period = istHours >= 12 ? 'PM' : 'AM';
        const displayMinutes = istMinutes.toString().padStart(2, '0');

        return `${displayHours}:${displayMinutes} ${period}`;
    } catch {
        return timeString;
    }
};

export const findMinPriceCategory = (serviceCategories: ServiceCategory[]): number => {
    if (!serviceCategories || serviceCategories.length === 0) {
        return 0;
    }
    const allPeopleCategories = serviceCategories
        .flatMap(category => category.peopleCategories || [])
        .filter(category => category && category.pricePerUnit > 0);

    if (allPeopleCategories.length === 0) {
        return 0;
    }
    const minPrice = allPeopleCategories.reduce((min, current) =>
        current.pricePerUnit < min.pricePerUnit ? current : min,
    );
    return minPrice.pricePerUnit;
};

export const getFilteredSlots = (slots: SlotInterval[], visitDate: string): SlotInterval[] => {
    const currentDate = new Date().toISOString().split('T')[0];
    const formattedVisitDate = visitDate.split('T')[0];

    if (currentDate === formattedVisitDate) {
        const currentTime = convertUTCtoIST(new Date().toISOString(), 'HH:mm:ss');
        return slots.filter(slot => {
            const slotTimeIST = convertUTCtoIST(slot.slot, 'HH:mm:ss');
            return slotTimeIST > currentTime;
        });
    }

    return slots;
};

export const getFilteredSlotsV2 = (
    slot: string | undefined,
    endingTime: string,
    operationalDate: undefined | operationalDate,
    operationalDays: string[],
    visitDate: string,
): boolean => {
    const currentDate = new Date().toISOString().split('T')[0];
    const formattedVisitDate = visitDate.split('T')[0];
    const visitDayName = new Date(visitDate).toLocaleDateString('en-US', { weekday: 'long' });
    const validOpDay = operationalDays.find(opDay => opDay === visitDayName);
    const currentTime = convertUTCtoIST(new Date().toISOString(), 'HH:mm:ss');
    const slotTime = slot ? convertUTCTimeToISTTimeinHHMMSS(addHoursToTime(slot, 3)) : '';
    if (!validOpDay) {
        return false;
    }
    if (currentDate === formattedVisitDate) {
        if (slot && slotTime > currentTime) {
            return true;
        }
        const endTime = endingTime && endingTime.trim() !== '' ? convertUTCTimeToISTTimeinHHMMSS(endingTime) : '';
        return currentTime <= endTime;
    } else {
        if (!operationalDate || (slot && slot.trim() !== '')) {
            return true;
        }
        const isValidDate = visitDate >= operationalDate.startDate && visitDate <= operationalDate.eneDate;
        return isValidDate;
    }
};

export const shouldDisplayIncDscView = (
    validOpDay: OperationalDaysData | undefined,
    selectedBHId: string | undefined,
): boolean => {
    const slots = validOpDay?.slot || [];
    if (slots.length === 0) {
        return true;
    } else {
        return selectedBHId !== undefined;
    }
};

const groupBy = <T, K>(array: T[], keyFn: (item: T) => K): T[][] => {
    const groups = array.reduce((acc, item) => {
        const key = keyFn(item);
        const existingGroup = acc.get(key);

        return new Map(acc).set(key, existingGroup ? [...existingGroup, item] : [item]);
    }, new Map<K, T[]>());

    return Array.from(groups.values());
};

const isClosed = (specialDayType: string | undefined): boolean => {
    return specialDayType === 'Closed';
};

const generateOperationalDateData = (operationalDateResp: undefined | operationalDate): OperationalDate | undefined => {
    if (!operationalDateResp) return undefined;
    return {
        startDate: operationalDateResp.startDate,
        endDate: operationalDateResp.eneDate,
    };
};

const generatePeopleCategories = (peopleCategoriesResp: PeopleCategoriesResp[]): PeopleCategoriesData[] => {
    return peopleCategoriesResp.map(resp => ({
        peopleCategoryName: resp.name,
        pricePerUnit: Math.ceil(resp.pricePerUnit),
        currentValue: 0,
        peopleCategoryId: resp.id,
        ticketLimitCrossed: false,
        iconUrl: resp.iconUrl,
    }));
};

const flattenBusinessHourData = (businessHours: businessHourResp[]): FlattenedBusinessHourData[] => {
    return businessHours.flatMap(bh =>
        bh.categories.map(category => ({
            id: bh.id,
            slot: bh.slot,
            startTime: bh.startTime,
            endTime: bh.endTime,
            specialDayDescription: bh.specialDayDescription,
            specialDayType: bh.specialDayType,
            operationalDays: bh.operationalDays.slice().sort(),
            operationalDate: generateOperationalDateData(bh.operationalDate),
            category,
            categoryDetails: category.inclusionPoints || [],
        })),
    );
};

const generateSlotData = (businessHours: FlattenedBusinessHourData[]): OperationalDaysData => {
    const headBH = businessHours[0];
    if (!headBH) {
        return {
            operationalDays: [],
            slot: [],
            timeIntervals: [],
        };
    }

    const slots: SlotInterval[] = isClosed(headBH.specialDayType)
        ? []
        : businessHours
              .map(bh => ({
                  bhourId: bh.id,
                  slot: bh.slot || '',
              }))
              .filter(x => x.slot.trim() !== '');

    const timeIntervals2: TimeInterval[] = isClosed(headBH.specialDayType)
        ? []
        : businessHours.map(bh => ({
              bhourId: bh.id,
              startTime: bh.startTime || '',
              endTime: bh.endTime || '',
          }));
    const timeIntervals: TimeInterval[] = timeIntervals2.filter(
        x => x.startTime.trim() !== '' || x.endTime.trim() !== '',
    );

    return {
        operationalDays: headBH.operationalDays,
        slot: slots,
        timeIntervals: timeIntervals,
    };
};

const generateOperationalDaysData = (flattenedData: FlattenedBusinessHourData[]): OperationalDaysData[] => {
    const sortedData = flattenedData.slice().sort((a, b) => {
        const aStr = a.operationalDays.join(',');
        const bStr = b.operationalDays.join(',');
        return aStr.localeCompare(bStr);
    });

    const groupedData = groupBy(sortedData, bh => bh.operationalDays.join(','));

    return groupedData.map(generateSlotData);
};

const generateServiceCategoryData = (
    selOpDay: string,
    flattenedData: FlattenedBusinessHourData[],
): ServiceCategory[] => {
    const operationalDaysData = generateOperationalDaysData(flattenedData);
    const headData = flattenedData[0];

    if (!headData) return [];

    const validOpDay = operationalDaysData.find(opDay => opDay.operationalDays.includes(selOpDay));

    return [
        {
            categoryId: headData.category.id,
            categoryName: headData.category.name,
            availableSeats: headData.category.availableSeats,
            allowedSeats: headData.category.allowedSeats,
            bookedSeats: headData.category.bookedSeats,
            isClosed: headData.category.isClosed,
            peopleCategories: generatePeopleCategories(headData.category.peopleCategories),
            operationalDays: operationalDaysData,
            operationalDate: headData.operationalDate,
            validOpDay: validOpDay,
            noRemainingTicketAvailable: false,
            categoryDetails: headData.categoryDetails,
            maxSelection: headData.category.maxSelection,
        },
    ];
};

const transformBusinessHoursToServiceCategoriesData = (
    businessHours: businessHourResp[],
    selOpDay: string,
): ServiceCategory[] => {
    const flattenedData = flattenBusinessHourData(businessHours);

    const sortedData = flattenedData.slice().sort((a, b) => a.category.id.localeCompare(b.category.id));

    const groupedData = groupBy(sortedData, bh => bh.category.id);

    return groupedData.flatMap(group => generateServiceCategoryData(selOpDay, group));
};

export const transformRespToStateDatav2 = (
    service: TicketServiceResp_ticketServiceResp,
    selOpDay: string,
): TicketServiceData => {
    const serviceCatData = transformBusinessHoursToServiceCategoriesData(service.businessHours, selOpDay);

    return {
        id: service.id,
        serviceName: service.name,
        allowFutureBooking: service.allowFutureBooking,
        shortDesc: service.shortDesc,
        expiry: service.expiry,
        serviceCategories: serviceCatData,
        serviceDetails: service.serviceDetails || [],
        priority: service.priority,
    };
};

export const extractOperationalDays = (services: TicketServiceResp_ticketServiceResp[]): string[] => {
    const allDays = services.flatMap(service => service.businessHours.flatMap(bh => bh.operationalDays));
    return allDays.filter((day, index, array) => array.indexOf(day) === index).sort();
};

export const convertUTCTimeToISTTimeinHHMMSS = (utcTime: string): string => {
    if (!utcTime) return '';
    try {
        const utcDate = new Date(`1970-01-01T${utcTime}Z`);
        return (
            String(utcDate.getHours()).padStart(2, '0') +
            ':' +
            String(utcDate.getMinutes()).padStart(2, '0') +
            ':' +
            String(utcDate.getSeconds()).padStart(2, '0')
        );
    } catch {
        return '';
    }
};

export const getDayName = (dayNumber: number) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[dayNumber];
};

export const addHoursToTime = (timeString: string, hours: number): string => {
    const [hoursStr, minutesStr, secondsStr] = timeString.split(':');
    const totalMinutes = parseInt(hoursStr || '0') * 60 + parseInt(minutesStr || '0') + hours * 60;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${secondsStr || '00'}`;
};

export const getMaxTime = (time1: string, time2: string): string => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = (hours1 || 0) * 60 + (minutes1 || 0);
    const totalMinutes2 = (hours2 || 0) * 60 + (minutes2 || 0);

    return totalMinutes1 >= totalMinutes2 ? time1 : time2;
};

export const formatTicketDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return dateString;
        }
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month}, ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

export const getMappedPlaceTypes = (data: PlaceType_placeType): CustomCategories => {
    if (data === 'Museum' || data === 'ArtGallery') {
        return CustomCategories.Museum;
    } else if (data === 'ThemePark' || data === 'AmusementPark' || data === 'WaterPark') {
        return CustomCategories.ThemePark;
    } else if (data === 'WildLifeSanctuary') {
        return CustomCategories.Wildlife;
    } else if (data === 'HeritageSite') {
        return CustomCategories.Heritage;
    } else if (data === 'ReligiousSite') {
        return CustomCategories.Religious;
    } else {
        return CustomCategories.Other;
    }
};
