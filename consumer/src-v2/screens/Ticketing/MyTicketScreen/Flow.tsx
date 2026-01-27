import React, { useCallback, useMemo } from 'react';
import MyTicketScreen from './UI';
import { MyTicketAction, MyTicketScreenProps, TicketMappedData } from './Types';
import { ticketBookingAPIEntityV2 } from '@/readOnly/api/types/TicketBookingAPIEntityV2.gen';
import { ticketBookingAPIEntityV2Array } from '@/readOnly/api/types/TicketBookingAPIEntityV2Array.gen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher } from '@/typescript/utils/common';

export const transformTicketData = (ticketData: ticketBookingAPIEntityV2Array): TicketMappedData[] => {
    return ticketData.map((ticket: ticketBookingAPIEntityV2) => {
        return {
            id: ticket.ticketShortId,
            placeName: ticket.ticketPlaceName,
            placeType: ticket.placeType,
            passengerCategory:
                ticket.peopleTicketQuantity?.map(item => item.bookedSeats + ' ' + item.name + ' ').join('') || '',
            date: ticket.visitDate,
            time: '',
            totalPrice: ticket.amountWithCurrency.amount,
            status: ticket.status,
            iconUrl: ticket.iconUrl,
            ticketShortId: ticket.ticketShortId,
        };
    });
};

const MyTicketScreenFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const resolver = useCallback(
        async (action: MyTicketAction) => {
            switch (action.type) {
                case 'PRESSED_BACK':
                    navigation.goBack();
                    break;
            }
        },
        [navigation],
    );
    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);
    const viewState: MyTicketScreenProps = {
        mpDispatch,
    };

    return <MyTicketScreen {...viewState} />;
};

export default MyTicketScreenFlow;
