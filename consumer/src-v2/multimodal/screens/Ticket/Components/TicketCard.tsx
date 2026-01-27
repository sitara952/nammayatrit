import React from 'react';
import { View, Image } from 'react-native';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import BusList from '../../SingleModeSearch/Components/BusList';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Svg, Line } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface TicketCardProps {
    price: number;
    ticketType: string;
    busNumber: string;
    validRoutes: string[];
    busImage: string;
}

const TicketCard: React.FC<TicketCardProps> = ({ price, ticketType, busNumber, validRoutes, busImage }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind`bg-white shadow rounded-[24px] p-4 mt-4`}>
            <View style={tailwind`flex-row justify-between items-center`}>
                <View>
                    <Animated.Text style={tailwind.style('text-[32px] font-areaNormal-extrabold text-[#313131]')}>
                        <Animated.Text style={tailwind.style('text-[15px] font-inter-bold ')}> ₹{' '}</Animated.Text>
                        {price}
                    </Animated.Text>
                    <Animated.Text style={tailwind`mt-2 font-departureMono-regular text-sm text-gray-500`}>
                        {ticketType} | {busNumber}
                    </Animated.Text>
                </View>
                <Image
                    accessible={true}
                    accessibilityLabel="bus image"
                    source={{ uri: busImage }}
                    style={{ width: 100, height: 50 }}
                />
            </View>
            <Animated.View entering={FadeIn} style={tailwind.style('my-3')}>
                <Svg height={1}>
                    <Line
                        strokeDasharray="5.2, 7"
                        x1={0}
                        x2={SCREEN_WIDTH}
                        y1={1}
                        y2={1}
                        stroke="#F5F5F5"
                        strokeWidth="2"
                    />
                </Svg>
            </Animated.View>
            <Animated.Text
                style={tailwind.style('text-[#969696] text-[11px] leading-[18px] font-areaNormal-extrabold ')}>
                {userLanguageStrings.ThisTicketIsAlsoValidIn}{' '}
            </Animated.Text>
            <BusList
                busList={validRoutes.map(route => ({
                    routeCode: route,
                    routeNumber: route,
                    handleOnPress: () => {},
                }))}
                isLoading={false}
                showIcon={false}
                isTicket={true}
            />
        </View>
    );
};

export default TicketCard;
