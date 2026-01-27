import { ActivityIndicator } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTicketPlacesGetMutation } from '@/api/integrations/rtk/TicketPlacesGet';
import { ticketPlaceArray } from '@/readOnly/api/types/TicketPlaceArray.gen';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { Resolver } from '@/typescript/utils/common';
import { CustomCategories, TicketingAction, TicketingScreenProps } from './Type';
import TicketingScreenUI from './UI';
import mtIcParksActive from '@/typescript/assets/ticketing/ys_ic_park_active.webp';
import mtIcParksInActive from '@/typescript/assets/ticketing/mt_ic_park_inActive.webp';
import museumIconActive from '@/typescript/assets/ticketing/ys_museum_icon_active.webp';
import museumIconInActive from '@/typescript/assets/ticketing/ys_museum_icon_inActive.webp';
import heritageIconActive from '@/typescript/assets/ticketing/ys_heritage_site_active.webp';
import heritageIconInActive from '@/typescript/assets/ticketing/ys_heritage_site_inActive.webp';
import religiousSiteIconActive from '@/typescript/assets/ticketing/ys_religious_site_active.webp';
import religiousSiteIconInActive from '@/typescript/assets/ticketing/ys_religious_site_inActive.webp';
import zooIconActive from '@/typescript/assets/ticketing/ys_zoo_active.webp';
import zooIconInActive from '@/typescript/assets/ticketing/ys_zoo_inActive.webp';
import { ticketPlace } from '../../../../src/readOnly/api/types/TicketPlace.gen';
import { getMappedPlaceTypes } from '../utils/ticketingHelper';

export const getTabIcon = (placeType: CustomCategories, activeTab: boolean) => {
    if (placeType === CustomCategories.ThemePark) {
        return activeTab ? mtIcParksActive : mtIcParksInActive;
    } else if (placeType === CustomCategories.Museum) {
        return activeTab ? museumIconActive : museumIconInActive;
    } else if (placeType === CustomCategories.Religious) {
        return activeTab ? religiousSiteIconActive : religiousSiteIconInActive;
    } else if (placeType === CustomCategories.Heritage) {
        return activeTab ? heritageIconActive : heritageIconInActive;
    } else if (placeType === CustomCategories.Wildlife) {
        return activeTab ? zooIconActive : zooIconInActive;
    }
    return;
};

export const TicketingScreen = () => {
    const [ticketPlacesGet, { isLoading }] = useTicketPlacesGetMutation();
    const [ticketPlaces, setTicketPlaces] = useState<ticketPlaceArray | undefined>(undefined);
    const [filteredTicketPlaces, setFilteredTicketPlaces] = useState<ticketPlaceArray | undefined>(undefined);
    const [tabs, setTabs] = useState<CustomCategories[]>([]);

    useEffect(() => {
        ticketPlacesGet({})
            .unwrap()
            .then((data: ticketPlaceArray) => {
                console.info(data);
                setTicketPlaces(data);
                const customeTabs = data.map((item: ticketPlace) => getMappedPlaceTypes(item.placeType));
                const uniquePlaceTypes = Array.from(new Set(customeTabs));
                const sortedPlaceTypes = [...uniquePlaceTypes].sort((a, b) => {
                    if (a === CustomCategories.Other) return 1;
                    if (b === CustomCategories.Other) return -1;
                    return 0;
                });
                setTabs(sortedPlaceTypes);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    useEffect(() => {
        setFilteredTicketPlaces(ticketPlaces?.filter(place => place.status !== 'Inactive'));
    }, [ticketPlaces]);

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const resolver: Resolver<TicketingAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'PRESSED_BACK':
                    navigation.goBack();
                    break;
                case 'GET_TICKETS_HISTORY':
                    navigation.navigate('MyTicketScreen');
                    break;
                case 'FILTER_EVENTS':
                    if (action.payload?.tag) {
                        setFilteredTicketPlaces(
                            ticketPlaces?.filter(
                                place =>
                                    getMappedPlaceTypes(place.placeType) === action.payload?.tag &&
                                    place.status !== 'Inactive',
                            ),
                        );
                    }
                    break;
                case 'GET_EVENT_DETAIL':
                    if (action.payload?.placeId) {
                        const place = ticketPlaces?.find(place => place.id === action.payload?.placeId);
                        navigation.navigate('EventDetails', { place });
                    }
                    break;
            }
        },
        [ticketPlaces, navigation],
    );

    const viewState: TicketingScreenProps = {
        ticketPlaces: filteredTicketPlaces,
        mpDispatch: resolver,
        tabsOptions: tabs,
    };

    return isLoading ? (
        <ActivityIndicator
            size="large"
            color={'#000'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
    ) : (
        <TicketingScreenUI {...viewState} />
    );
};
