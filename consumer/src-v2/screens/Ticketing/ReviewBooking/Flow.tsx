import { useCallback, useState, useMemo } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { ReviewBookingAction, ReviewBookingScreenProps, EventDetails, PaymentSummary, ServiceSlot } from './Types';
import { PeopleCategoriesData, ServiceCategory, TicketServiceData, TimeInterval } from '../ChooseCategories/Types';
import ReviewBookingUI from './UI';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { ticketBookingReq } from '@/readOnly/api/types/TicketBookingReq.gen';
import { ticketBookingServicesReq } from '@/readOnly/api/types/TicketBookingServicesReq.gen';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { TICKETING_PLATFORM_FEES } from '@/typescript/constants/common';

const generateCatData = (category: ServiceCategory) => {
    return {
        categoryId: category.categoryId,
        peopleCategories: category.peopleCategories.map((pc: PeopleCategoriesData) => ({
            peopleCategoryId: pc.peopleCategoryId,
            numberOfUnits: pc.currentValue,
        })),
    };
};

export const ReviewBookingScreen = () => {
    const {
        placeId,
        placeName,
        shortDesc,
        placeIconUrl,
        selectedDate,
        selectedBusinessHours,
        selectedCategories,
        passengerCategoryQuantities,
        servicesInfo,
    } = useRoute<RouteProp<MainNavigationParamList, 'ReviewBooking'>>().params;
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const createServiceSlotArray = useMemo((): ServiceSlot[] => {
        return Object.entries(passengerCategoryQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .flatMap(([key, quantity]) => {
                const [serviceId, peopleCategoryId] = key.split('__');

                if (!serviceId || !peopleCategoryId) return [];

                const service = servicesInfo.find(s => s.id === serviceId);

                if (!service) return [];

                const selectedCategoryId = selectedCategories[serviceId];
                if (!selectedCategoryId) return [];

                const selectedCategory = service.serviceCategories.find(cat => cat.categoryId === selectedCategoryId);

                if (!selectedCategory) return [];

                const foundPeopleCategory = selectedCategory.peopleCategories.find(
                    pc => pc.peopleCategoryId === peopleCategoryId,
                );

                if (!foundPeopleCategory) return [];

                return [
                    {
                        serviceName: service.serviceName,
                        peopleCategory: foundPeopleCategory.peopleCategoryName,
                        noOfTickets: quantity,
                        totalPrice: quantity * foundPeopleCategory.pricePerUnit,
                    },
                ];
            });
    }, [passengerCategoryQuantities, servicesInfo, selectedCategories]);

    const updateServiceCategories = (serviceCategories: ServiceCategory[], serviceId: string): ServiceCategory[] => {
        return serviceCategories.map(cat => ({
            ...cat,
            peopleCategories: cat.peopleCategories
                .filter((pc: PeopleCategoriesData) => {
                    const key = `${serviceId}__${pc.peopleCategoryId}`;
                    const currentValue = passengerCategoryQuantities[key] || 0;
                    return currentValue > 0;
                })
                .map((pc: PeopleCategoriesData) => ({
                    ...pc,
                    currentValue: passengerCategoryQuantities[`${serviceId}__${pc.peopleCategoryId}`] || 0,
                })),
        }));
    };

    const getMbTimeInterval = (cat: ServiceCategory): TimeInterval | null => {
        if (!cat.validOpDay) return null;
        return cat.validOpDay.timeIntervals[0] || null;
    };

    const getBHIdForSelectedTimeIntervals = useCallback(
        (categories: ServiceCategory[]): string | null => {
            const cat = categories[0];
            if (!cat) return null;

            const timeInterval = getMbTimeInterval(cat);
            return timeInterval ? timeInterval.bhourId : null;
        },
        [getMbTimeInterval],
    );

    const createPeopleCategoriesRespRequest = useCallback(
        (service: TicketServiceData): ticketBookingServicesReq[] => {
            const filteredSelCategories = service.serviceCategories.filter((category: ServiceCategory) => {
                const selectedCategoryId = selectedCategories[service.id];
                return selectedCategoryId && category.categoryId === selectedCategoryId;
            });
            const updateFilteredSCOntheBasisOfPC = updateServiceCategories(filteredSelCategories, service.id);
            const finalCategories = updateFilteredSCOntheBasisOfPC.filter(sc => sc.peopleCategories.length > 0);
            const mbbusinessHourId =
                selectedBusinessHours[service.id] || getBHIdForSelectedTimeIntervals(finalCategories);

            if (!mbbusinessHourId) return [];

            const generatedCatsData = finalCategories.map(generateCatData);

            if (generatedCatsData.length === 0) return [];

            return [
                {
                    serviceId: service.id,
                    businessHourId: mbbusinessHourId,
                    categories: generatedCatsData,
                },
            ];
        },
        [selectedCategories, updateServiceCategories, getBHIdForSelectedTimeIntervals, selectedBusinessHours],
    );

    const createTicketServiceRequest = useCallback(
        (servicesInfo: TicketServiceData[]): ticketBookingServicesReq[] => {
            return servicesInfo
                .flatMap(service => createPeopleCategoriesRespRequest(service))
                .filter(service => service !== null);
        },
        [createPeopleCategoriesRespRequest],
    );

    const createTicketBookingApiData = useMemo((): ticketBookingReq => {
        return {
            services: createTicketServiceRequest(servicesInfo),
            visitDate: selectedDate || '',
            ticketSubPlaceId: undefined,
        };
    }, [createTicketServiceRequest, servicesInfo, selectedDate]);

    const eventDetails: EventDetails = useMemo(
        () => ({
            name: placeName || '',
            subtitle: shortDesc || '',
            image: placeIconUrl || '',
            date: convertUTCtoIST(selectedDate || '', 'ddd, DD MMM'),
            ticketItem: createServiceSlotArray,
        }),
        [placeName, shortDesc, placeIconUrl, selectedDate, createServiceSlotArray],
    );

    const orderAmount = useMemo(() => {
        return createServiceSlotArray.reduce((total, slot) => total + slot.totalPrice, 0);
    }, [createServiceSlotArray]);

    const paymentSummary: PaymentSummary = useMemo(() => {
        return {
            grandTotal: orderAmount,
            otherCharges: [
                {
                    name: 'Item Total',
                    amount: orderAmount / TICKETING_PLATFORM_FEES,
                },
                {
                    name: 'Convenience Fee',
                    amount: orderAmount - orderAmount / TICKETING_PLATFORM_FEES,
                },
            ],
        };
    }, [orderAmount]);

    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
    const [isLoading, _setIsLoading] = useState(false);

    const resolver: Resolver<ReviewBookingAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'PRESSED_BACK':
                    navigation.goBack();
                    break;
                case 'TOGGLE_PRICE_BREAKDOWN':
                    setShowPriceBreakdown(prev => !prev);
                    break;
                case 'CHOOSE_PAYMENT_METHOD': {
                    const apiData = createTicketBookingApiData;
                    navigation.navigate('PaymentView', {
                        apiData: apiData,
                        placeId: placeId || '',
                        useOldPayload: false,
                    });
                    break;
                }
            }
        },
        [navigation, placeId, createTicketBookingApiData],
    );

    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const viewState: ReviewBookingScreenProps = {
        mpDispatch,
        eventDetails,
        paymentSummary,
        showPriceBreakdown,
    };

    return isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={'#000'} />
        </View>
    ) : (
        <ReviewBookingUI {...viewState} />
    );
};
