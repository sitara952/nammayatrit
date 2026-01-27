import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ChooseCategoriesUI from './UI';
import {
    CategoryAction,
    CategoryScreenProps,
    SelectedBusinessHours,
    SelectedCategories,
    PassengerCategoryQuantities,
    TicketServiceData,
    MarkedDates,
} from './Types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createDispatcher } from '@/typescript/utils/common';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { getDayName, getFilteredSlotsV2, transformRespToStateDatav2 } from '../utils/ticketingHelper';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { useTicketPlacesPlaceIdServicesGetMutation } from '@/api/integrations/rtk/TicketPlacesPlaceIdServicesGet';
import { ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ticketServiceResp } from '@/readOnly/api/types/TicketServiceResp.gen';

export type TicketBookingRequest = {
    services: Array<{
        businessHourId: string;
        categories: Array<{
            categoryId: string;
            peopleCategories: Array<{
                numberOfUnits: number;
                peopleCategoryId: string;
            }>;
        }>;
        serviceId: string;
    }>;
    visitDate: string;
};

export const ChooseCategoriesScreen = () => {
    const {
        placeId,
        placeName,
        shortDesc,
        placeIconUrl,
        operationalDays,
        serviceInfo,
        operationalDate,
        closedDateArray,
        enableToday,
        endDate,
    } = useRoute<RouteProp<MainNavigationParamList, 'ChooseCategories'>>().params;

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [selectedBusinessHours, setSelectedBusinessHours] = useState<SelectedBusinessHours>({});
    const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({});
    const [passengerCategoryQuantities, setPassengerCategoryQuantities] = useState<PassengerCategoryQuantities>({});
    const [ticketPlacesPlaceIdServicesGet, { data: services, isLoading }] = useTicketPlacesPlaceIdServicesGetMutation();
    const [transformedServices, setTransformedServices] = useState<TicketServiceData[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(operationalDate);
    const [validServiceSlots, setValidServiceSlots] = useState<ticketServiceResp[] | null>(null);
    const { datePickerRef } = useRefsContext();
    const datePickerRenderRef = useRef<boolean>(false);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const today = new Date();
    const operationalDateObj = new Date(operationalDate);
    const lastDate = endDate ? new Date(endDate) : new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const daysDiff = Math.ceil((lastDate.getTime() - operationalDateObj.getTime()) / (1000 * 60 * 60 * 24));

    useEffect(() => {
        const activeService = validServiceSlots ?? serviceInfo;
        if (activeService && activeService.length > 0) {
            const convertedServices = activeService.map(ser => {
                const dayName = selectedDate
                    ? convertUTCtoIST(selectedDate, 'dddd')
                    : convertUTCtoIST(new Date().toISOString(), 'dddd');

                return transformRespToStateDatav2(ser, dayName);
            });
            setTransformedServices(convertedServices);
        }
    }, [serviceInfo, validServiceSlots, selectedDate]);

    useEffect(() => {
        if (!services) {
            return;
        }
        const validServiceSlots = services.filter(ser => {
            return (
                ser.businessHours.filter(bushrs => {
                    return getFilteredSlotsV2(
                        bushrs.slot,
                        bushrs.endTime || '',
                        bushrs.operationalDate,
                        bushrs.operationalDays,
                        selectedDate,
                    );
                }).length > 0
            );
        });
        setValidServiceSlots(validServiceSlots);
    }, [services]);

    useEffect(() => {
        const newSelectedCategories: SelectedCategories = transformedServices.reduce((acc, service) => {
            if (service.serviceCategories.length === 1) {
                const category = service.serviceCategories[0];
                if (category) {
                    return { ...acc, [service.id]: category.categoryId };
                }
            }
            return acc;
        }, {});

        if (Object.keys(newSelectedCategories).length > 0) {
            setSelectedCategories(newSelectedCategories);
        }
    }, [transformedServices]);

    const { totalTickets: numberOfTickets, totalPrice } = useMemo(() => {
        const totalTickets = Object.values(passengerCategoryQuantities).reduce(
            (sum, { quantity }) => sum + quantity,
            0,
        );
        const totalPrice = Object.values(passengerCategoryQuantities).reduce(
            (sum, { quantity, pricePerUnit }) => sum + quantity * pricePerUnit,
            0,
        );
        return { totalTickets, totalPrice };
    }, [passengerCategoryQuantities]);

    const resolver = useCallback(
        async (action: CategoryAction) => {
            switch (action.type) {
                case 'PRESSED_BACK':
                    navigation.goBack();
                    break;
                case 'SELECTED_TIME_SLOT':
                    if (action.payload) {
                        const { serviceId, businessHourId } = action.payload;
                        const key = `${serviceId}`;
                        if (selectedBusinessHours[key] === businessHourId) {
                            return;
                        }
                        setSelectedBusinessHours({
                            [key]: businessHourId,
                        });
                        setPassengerCategoryQuantities(prev =>
                            Object.fromEntries(
                                Object.entries(prev).filter(([key]) => !key.startsWith(`${serviceId}__`)),
                            ),
                        );
                    }
                    break;
                case 'SELECTED_CATEGORY':
                    if (action.payload) {
                        const { serviceId, categoryId } = action.payload;
                        const key = `${serviceId}`;
                        if (selectedCategories[key] === categoryId) {
                            return;
                        }
                        setSelectedCategories(prev => ({ ...prev, [key]: categoryId }));
                        setSelectedBusinessHours(prev =>
                            Object.fromEntries(Object.entries(prev).filter(([key]) => key !== serviceId)),
                        );
                        setPassengerCategoryQuantities(prev =>
                            Object.fromEntries(
                                Object.entries(prev).filter(([key]) => !key.startsWith(`${serviceId}__`)),
                            ),
                        );
                    }
                    break;
                case 'INCREMENT_PASSENGER_CATEGORY':
                    if (action.payload) {
                        const { serviceId, peopleCategoryId, price } = action.payload;
                        const key = `${serviceId}__${peopleCategoryId}`;
                        setPassengerCategoryQuantities(prev => ({
                            ...prev,
                            [key]: {
                                quantity: (prev[key]?.quantity || 0) + 1,
                                pricePerUnit: price,
                            },
                        }));
                    }
                    break;
                case 'DECREMENT_PASSENGER_CATEGORY':
                    if (action.payload) {
                        const { serviceId, peopleCategoryId, price } = action.payload;
                        const key = `${serviceId}__${peopleCategoryId}`;
                        const currentQuantity = passengerCategoryQuantities[key]?.quantity || 0;
                        if (currentQuantity > 0) {
                            setPassengerCategoryQuantities(prev => ({
                                ...prev,
                                [key]: {
                                    quantity: currentQuantity - 1,
                                    pricePerUnit: price,
                                },
                            }));
                        }
                    }
                    break;
                case 'SHOW_DATE_PICKER':
                    datePickerRef?.current?.present();
                    break;
                case 'SELECTED_DATE':
                    if (action.payload?.date && action.payload?.date !== selectedDate) {
                        setSelectedDate(action.payload.date);
                        if (placeId) {
                            ticketPlacesPlaceIdServicesGet({
                                placeId: placeId,
                                date: action.payload.date,
                                subPlaceId: undefined,
                            });
                        }
                    }
                    datePickerRef?.current?.dismiss();
                    break;
                case 'PAY_NOW': {
                    const flattenedQuantities = Object.fromEntries(
                        Object.entries(passengerCategoryQuantities).map(([key, { quantity }]) => [key, quantity]),
                    );

                    navigation.navigate('ReviewBooking', {
                        placeId,
                        placeName,
                        shortDesc,
                        placeIconUrl,
                        selectedDate: selectedDate,
                        selectedBusinessHours,
                        selectedCategories,
                        passengerCategoryQuantities: flattenedQuantities,
                        servicesInfo: transformedServices,
                    });
                    break;
                }
            }
        },
        [
            navigation,
            passengerCategoryQuantities,
            selectedDate,
            placeId,
            placeName,
            shortDesc,
            placeIconUrl,
            selectedBusinessHours,
            selectedCategories,
            transformedServices,
        ],
    );

    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const markedDates = useMemo((): MarkedDates => {
        const todayString = today.toISOString().split('T')[0];

        const markedDatesArray = Array.from({ length: daysDiff }, (_, i) => {
            const date = new Date(operationalDateObj.getTime());
            date.setDate(today.getDate() + i + 1);
            const dateString = date.toISOString().split('T')[0];
            const dayName = getDayName(date.getDay());

            if (dateString) {
                if (dateString === todayString && !enableToday) {
                    return {
                        [dateString]: { disabled: true, disableTouchEvent: true, dotColor: '#B2B9C7', selected: false },
                    };
                } else if (
                    dateString &&
                    (closedDateArray.includes(dateString) || (dayName && !operationalDays.includes(dayName)))
                ) {
                    return {
                        [dateString]: { disabled: true, disableTouchEvent: true, dotColor: '#B2B9C7', selected: false },
                    };
                }
            }
            return null;
        });

        const disbaleDates =
            todayString && operationalDate > todayString
                ? [
                      ...[
                          {
                              [todayString]: {
                                  disabled: true,
                                  disableTouchEvent: true,
                                  dotColor: '#B2B9C7',
                                  selected: false,
                              },
                          },
                      ],
                      ...markedDatesArray,
                  ]
                : markedDatesArray;

        return disbaleDates
            .filter(
                (
                    item,
                ): item is Record<
                    string,
                    { disabled: boolean; disableTouchEvent: boolean; dotColor: string; selected: boolean }
                > => item !== null,
            )
            .reduce((acc, item) => ({ ...acc, ...item }), {});
    }, [operationalDays, operationalDateObj]);

    const viewState: CategoryScreenProps = {
        services: transformedServices,
        selectedBusinessHours,
        selectedCategories,
        passengerCategoryQuantities,
        selectedDate,
        numberOfTickets,
        totalPrice,
        placeName,
        operationalDays,
        markedDates,
        mpDispatch,
        operationalDate,
        endDate: lastDate.toISOString().split('T')[0],
    };

    const isReady = useMemo(() => !isLoading && transformedServices.length > 0, [isLoading, transformedServices]);

    useEffect(() => {
        if (isReady && datePickerRenderRef.current === false) {
            datePickerRenderRef.current = true;
            if (datePickerRef?.current) {
                datePickerRef.current.present();
            }
        }
        return () => {};
    }, [isReady]);

    return isReady ? (
        <ChooseCategoriesUI {...viewState} />
    ) : (
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
        </Animated.View>
    );
};
