import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ticketPlace } from '@/readOnly/api/types/TicketPlace.gen';
import EventDetailsScreenUI from './UI';
import { ActivityIndicator, Linking } from 'react-native';
import { EventDetailsScreenProps, EventDetailsAction } from './Types';
import { createDispatcher } from '@/typescript/utils/common';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { getGoogleMapsURL } from '@/typescript/constants/common';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { extractOperationalDays, getDayName, getFilteredSlotsV2 } from '../utils/ticketingHelper';
import { useTicketPlacesPlaceIdServicesGetMutation } from '@/api/integrations/rtk/TicketPlacesPlaceIdServicesGet';
import { ticketServiceResp } from '@/readOnly/api/types/TicketServiceResp.gen';
import { useLazyTicketPlacePlaceIdAvailabilityGetQuery } from '@/api/integrations/rtk/TicketPlacePlaceIdAvailabilityGet';
import { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';
import { ticketSubPlace } from '@/readOnly/api/types/TicketSubPlace.gen.tsx';
import { LocationSelectionPopUp } from '../utils/LocationSelectionPopUp';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { useLazyTicketPlacePlaceIdGetQuery } from '@/api/integrations/rtk/TicketPlacePlaceIdGet';

const EventDetailsScreenFlow: React.FC<{
    place: ticketPlace | undefined;
    subPlaces: ticketSubPlace[];
}> = ({ place, subPlaces }) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const currentDate = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [ticketPlacesPlaceIdServicesGet, { data: services, isLoading: serviceApiLoading }] =
        useTicketPlacesPlaceIdServicesGetMutation();
    const [operationalDays, setOperationalDays] = useState<string[]>([]);
    const [operationalDate, setOperationalDate] = useState<string>(currentDate || '');
    const [serviceInfo, setServiceInfo] = useState<ticketServiceResp[]>([]);
    const [subTicketPlaceId, setSubTicketPlaceId] = useState<string | undefined>();
    const [shouldShowLocationModal, setShouldShowLocationModal] = useState<boolean>(true);
    const [getClosedDates, { data: closedDates }] = useLazyTicketPlacePlaceIdAvailabilityGetQuery();
    const enableToday = useRef<boolean>(true);
    const [validServiceSlots, setValidServiceSlots] = useState<ticketServiceResp[] | null>(null);
    const [eventDetails, setEventDetails] = useState<ticketPlace | undefined>(place);
    const [eventSubPlaces, setEventSubPlaces] = useState<ticketSubPlace[]>(subPlaces);
    const [getTicketPlaces, { isLoading: ticketPlaceLoading }] = useLazyTicketPlacePlaceIdGetQuery();

    const getClosedDateArray = useMemo((): string[] => {
        return closedDates && closedDates.length > 0
            ? closedDates.flatMap(closedDate => {
                  const year = new Date().getFullYear();
                  const month = closedDate.month - 1;
                  return closedDate.closedDays
                      .map(day => {
                          const date = new Date(year, month, day);
                          const dateString = date.toISOString().split('T')[0];
                          return dateString;
                      })
                      .filter((dateString): dateString is string => Boolean(dateString));
              })
            : [];
    }, [closedDates]);

    const findNextOperationalDate = useCallback(
        (operationalDays: string[]): string | null => {
            const today = new Date();
            const endDate = eventDetails?.endDate
                ? new Date(eventDetails.endDate)
                : new Date(today.getFullYear(), today.getMonth() + 2, 0);
            const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
                Array.from({ length: daysDiff - 1 }, (_, i) => {
                    const futureDate = new Date(today);
                    futureDate.setDate(today.getDate() + i + 1);
                    const dayName = getDayName(futureDate.getDay());
                    const dateString = futureDate.toISOString().split('T')[0];
                    return dayName &&
                        operationalDays.includes(dayName) &&
                        dateString &&
                        !getClosedDateArray.includes(dateString)
                        ? dateString
                        : null;
                }).find(date => date !== null) || null
            );
        },
        [getClosedDateArray, eventDetails?.endDate],
    );

    const getDirection = useCallback(() => {
        const location: FormatedLocation = {
            area: '',
            address: '',
            lat: eventDetails?.lat ?? 0,
            lng: eventDetails?.lon ?? 0,
        };
        const url = getGoogleMapsURL(location, undefined, 'driving');
        Linking.openURL(url);
    }, [eventDetails]);

    const modifiedSubPlaces = useMemo(() => {
        if (!eventSubPlaces || eventSubPlaces.length === 0) return [];

        return eventSubPlaces.map((subPlace, index) => ({
            id: subPlace.id || '',
            enforcedTicketPlaceId: subPlace.enforcedTicketPlaceId || '',
            name: subPlace.name || '',
            isSelected: index === 0,
        }));
    }, [eventSubPlaces]);

    useEffect(() => {
        if (modifiedSubPlaces.length === 1) {
            const subPlace = modifiedSubPlaces[0];
            if (subPlace?.enforcedTicketPlaceId) {
                setSubTicketPlaceId(subPlace?.id);
                getTicketPlaces({ placeId: subPlace?.enforcedTicketPlaceId })
                    .unwrap()
                    .then((data: ticketPlaceResp) => {
                        setOperationalDate(currentDate || '');
                        setEventDetails(data.ticketPlace);
                        setEventSubPlaces(data.subPlaces);
                    })
                    .catch((error: Error) => {
                        console.error('Error loading boating ticket places:', error);
                    });
            }
        }
    }, [modifiedSubPlaces]);

    useEffect(() => {
        if (eventDetails?.id) {
            ticketPlacesPlaceIdServicesGet({
                placeId: eventDetails?.id,
                date: operationalDate,
                subPlaceId: undefined,
            });
        }
    }, [eventDetails?.id, operationalDate, subTicketPlaceId]);

    useEffect(() => {
        if (eventDetails?.id) {
            getClosedDates({ placeId: eventDetails?.id, forceFresh: undefined, isClosed: undefined });
        }
    }, [eventDetails?.id]);

    useEffect(() => {
        if (services) {
            const extractedOperationalDays = services ? extractOperationalDays(services) : [];
            setOperationalDays(extractedOperationalDays);
            const validServiceSlots = services.filter(ser => {
                return (
                    ser.businessHours.filter(bushrs => {
                        return getFilteredSlotsV2(
                            bushrs.slot,
                            bushrs.endTime || '',
                            bushrs.operationalDate,
                            bushrs.operationalDays,
                            operationalDate || '',
                        );
                    }).length > 0
                );
            });
            setValidServiceSlots(validServiceSlots);
        }
    }, [services]);

    useEffect(() => {
        if (validServiceSlots) {
            if (validServiceSlots.length > 0) {
                setServiceInfo(validServiceSlots);
            } else {
                enableToday.current = false;
                if (operationalDays.length !== 0) {
                    const nextOperationalDate = findNextOperationalDate(operationalDays);
                    if (nextOperationalDate && eventDetails?.id) {
                        setOperationalDate(nextOperationalDate);
                    }
                } else {
                    const currentOperationalDate = new Date(operationalDate);
                    currentOperationalDate.setDate(currentOperationalDate.getDate() + 1);
                    const nextDateString = currentOperationalDate.toISOString().split('T')[0];
                    setOperationalDate(nextDateString || '');
                }
            }
        }
    }, [validServiceSlots]);

    const resolver = useCallback(
        async (action: EventDetailsAction) => {
            switch (action.type) {
                case 'PRESSED_BACK':
                    navigation.goBack();
                    break;
                case 'GET_DIRECTION':
                    getDirection();
                    break;
                case 'GET_TICKETS_HISTORY':
                    navigation.navigate('MyTicketScreen');
                    break;
                case 'BOOK_TICKET':
                    navigation.navigate('ChooseCategories', {
                        placeId: eventDetails?.id,
                        placeName: eventDetails?.name,
                        shortDesc: eventDetails?.shortDesc,
                        placeIconUrl: eventDetails?.iconUrl,
                        serviceInfo,
                        operationalDate,
                        operationalDays,
                        closedDateArray: getClosedDateArray,
                        enableToday: enableToday.current,
                        endDate: eventDetails?.endDate,
                    });
                    break;
            }
        },
        [
            eventDetails,
            getDirection,
            navigation,
            serviceInfo,
            getClosedDateArray,
            operationalDays,
            operationalDate,
            subTicketPlaceId,
        ],
    );
    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <>
            {serviceInfo.length > 0 && eventDetails && !serviceApiLoading && !ticketPlaceLoading ? (
                (() => {
                    const viewState: EventDetailsScreenProps = {
                        event: eventDetails,
                        mpDispatch,
                        operationalDate,
                        businessHour: serviceInfo.map(ser => ser.businessHours).flat(),
                        eventStatus: place?.status,
                    };
                    return <EventDetailsScreenUI {...viewState} />;
                })()
            ) : (
                <ActivityIndicator
                    size="large"
                    color={'#000'}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
            )}
            {modifiedSubPlaces.length > 1 && (
                <AnimatedModal
                    visible={shouldShowLocationModal}
                    setVisible={setShouldShowLocationModal}
                    onClose={() => {
                        setShouldShowLocationModal(false);
                    }}
                    animationDuration={300}
                    allowCloseOnBackdropPress={false}
                    onHardwareBackPress={() => {
                        setShouldShowLocationModal(false);
                        navigation.goBack();
                        return true;
                    }}>
                    <LocationSelectionPopUp
                        locations={modifiedSubPlaces}
                        setShouldShowLocationModal={setShouldShowLocationModal}
                        onLocationSelect={(subPlaceId: string, enforcedTicketPlaceId: string) => {
                            if (setSubTicketPlaceId) {
                                setShouldShowLocationModal(false);
                                setSubTicketPlaceId(subPlaceId);
                                getTicketPlaces({ placeId: enforcedTicketPlaceId })
                                    .unwrap()
                                    .then((data: ticketPlaceResp) => {
                                        setOperationalDate(currentDate || '');
                                        setEventDetails(data.ticketPlace);
                                        setEventSubPlaces(data.subPlaces);
                                    })
                                    .catch((error: Error) => {
                                        console.error('Error loading boating ticket places:', error);
                                    });
                            }
                        }}
                    />
                </AnimatedModal>
            )}
        </>
    );
};

export const EventDetailsScreen = () => {
    const route: RouteProp<{ params: { place: ticketPlace | ticketPlaceResp | undefined } }, 'params'> = useRoute();
    const { place } = route.params;

    if (place && 'id' in place && 'name' in place) {
        return <EventDetailsScreenFlow place={place} subPlaces={[]} />;
    } else if (place) {
        return <EventDetailsScreenFlow place={place.ticketPlace} subPlaces={place.subPlaces || []} />;
    }
    return (
        <ActivityIndicator
            size="large"
            color={'#000'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
    );
};
