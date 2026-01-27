import { Action, Resolver } from '@/typescript/utils/common';
import { expiryType } from '@/readOnly/api/types/ExpiryType.gen';
import { ticketServiceResp } from '@/readOnly/api/types/TicketServiceResp.gen';

export type CategoryAction =
    | Action<'PRESSED_BACK'>
    | Action<'SELECTED_TIME_SLOT', { serviceId: string; businessHourId: string }>
    | Action<'SELECTED_CATEGORY', { serviceId: string; categoryId: string }>
    | Action<'INCREMENT_PASSENGER_CATEGORY', { serviceId: string; peopleCategoryId: string; price: number }>
    | Action<'DECREMENT_PASSENGER_CATEGORY', { serviceId: string; peopleCategoryId: string; price: number }>
    | Action<'SHOW_DATE_PICKER'>
    | Action<'SELECTED_DATE', { date: string }>
    | Action<'PAY_NOW'>;

export type SelectedBusinessHours = Record<string, string>;
export type SelectedCategories = Record<string, string>;
export type PassengerCategoryQuantities = Record<string, { quantity: number; pricePerUnit: number }>;

export type MarkedDate = {
    disabled: boolean;
    disableTouchEvent: boolean;
    dotColor: string;
    selected: boolean;
};

export type MarkedDates = Record<string, MarkedDate>;

export type CategoryScreenProps = {
    mpDispatch: Resolver<CategoryAction>;
    services: TicketServiceData[];
    selectedBusinessHours: SelectedBusinessHours;
    selectedCategories: SelectedCategories;
    passengerCategoryQuantities: PassengerCategoryQuantities;
    selectedDate: string;
    numberOfTickets: number;
    totalPrice: number;
    placeName: string | undefined;
    operationalDays: string[];
    markedDates: MarkedDates;
    endDate: string | undefined;
    operationalDate: string;
};

export type ChooseCategoriesProps = {
    placeId: string | undefined;
    placeName: string | undefined;
    shortDesc: string | undefined;
    placeIconUrl: string | undefined;
    serviceInfo: ticketServiceResp[];
    operationalDate: string;
    operationalDays: string[];
    closedDateArray: string[];
    enableToday: boolean;
    endDate: string | undefined;
};

export type ServiceExpiry = {
    buffer: number;
    isInstantConfirmation: boolean;
};

export type OperationalDate = {
    startDate: string;
    endDate: string;
};

export type PeopleCategoriesResp = {
    name: string;
    id: string;
    pricePerUnit: number;
    description: string | undefined;
    iconUrl: undefined | string;
};

export type TicketCategoriesResp = {
    name: string;
    id: string;
    availableSeats: number | undefined;
    isClosed: boolean | undefined;
    allowedSeats: number | undefined;
    bookedSeats: number;
    maxSelection: number | undefined;
    peopleCategories: PeopleCategoriesResp[];
};

export type OperationalDateResp = {
    startDate: string;
    endDate: string;
};

export type BusinessHoursResp = {
    id: string;
    slot: string | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    specialDayDescription: string | undefined;
    specialDayType: string | undefined;
    operationalDays: string[];
    operationalDate: OperationalDateResp | undefined;
    categories: TicketCategoriesResp[];
};

export type TicketServiceResp = {
    id: string;
    placesId: string;
    name: string;
    maxVerification: number;
    allowFutureBooking: boolean;
    shortDesc: string | undefined;
    expiry: ServiceExpiry;
    businessHours: BusinessHoursResp[];
};

export type SlotInterval = {
    bhourId: string;
    slot: string;
};

export type TimeInterval = {
    bhourId: string;
    startTime: string;
    endTime: string;
};

export type OperationalDaysData = {
    operationalDays: string[];
    slot: SlotInterval[];
    timeIntervals: TimeInterval[];
};

export type PeopleCategoriesData = {
    peopleCategoryName: string;
    pricePerUnit: number;
    currentValue: number;
    peopleCategoryId: string;
    ticketLimitCrossed: boolean;
    iconUrl: undefined | string;
};

export type ServiceCategory = {
    categoryId: string;
    categoryName: string;
    availableSeats: number | undefined;
    allowedSeats: number | undefined;
    bookedSeats: number;
    isClosed: boolean | undefined;
    peopleCategories: PeopleCategoriesData[];
    operationalDays: OperationalDaysData[];
    operationalDate: OperationalDate | undefined;
    validOpDay: OperationalDaysData | undefined;
    noRemainingTicketAvailable: boolean;
    categoryDetails: string[];
    maxSelection: number | undefined;
};

export type TicketServiceData = {
    id: string;
    serviceName: string;
    allowFutureBooking: boolean;
    shortDesc: string | undefined;
    expiry: expiryType;
    serviceCategories: ServiceCategory[];
    serviceDetails: string[];
    priority: number | undefined;
};

export type FlattenedBusinessHourData = {
    id: string;
    slot: string | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    specialDayDescription: string | undefined;
    specialDayType: string | undefined;
    operationalDays: string[];
    operationalDate: OperationalDate | undefined;
    category: TicketCategoriesResp;
    categoryDetails: string[];
};
