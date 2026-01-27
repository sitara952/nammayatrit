import React from 'react';
import { View, Text, Image } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import ulaaTicketImage from '@/src-v2/assets/ulaa_ticket.webp';
import { CurrentDateTime } from '@/src-v2/screens/Passes/BusPass/components/passes/BusPass';

export interface UlaaActiveTicketProps {
    date?: string;
    time?: string;
    price?: number;
    ticketName?: string;
}

export const UlaaActiveTicket: React.FC<UlaaActiveTicketProps> = ({
    price = 100,
    ticketName = 'Chennai Ula Ticket',
}) => {
    return (
        <View style={tailwind.style('w-full')}>
            <View style={tailwind.style('bg-white mx-auto rounded-[40px] shadow-sm overflow-hidden')}>
                {/* Main Ticket Image - Contains all backgrounds and landmarks */}
                <View style={tailwind.style('w-[360px] h-[450px] mx-auto')}>
                    <Image
                        source={ulaaTicketImage}
                        style={tailwind.style(' w-full h-full  rounded-t-[40px]')}
                        resizeMode="cover"
                        accessible={true}
                        accessibilityLabel="Chennai Ula ticket with landmarks"
                    />
                </View>

                {/* Date and Time Box */}
                <View
                    style={[
                        tailwind.style(
                            'absolute h-[60px] left-[220px] top-[362px] bg-white rounded-[11px] justify-center items-center py-2.5 px-3.5',
                        ),
                        {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.03,
                            shadowRadius: 8.24695,
                            elevation: 3,
                        },
                    ]}>
                    <CurrentDateTime isZoomed={false} />
                </View>

                {/* Ticket Name */}
                <View style={tailwind.style('flex-row justify-between items-center px-5 py-5 ')}>
                    <Text
                        style={tailwind.style(
                            ' max-w-55 font-areaNormal-extrabold text-[26px] leading-[34px] tracking-[-0.1px] text-[#4A4A4A]',
                        )}>
                        {ticketName}
                    </Text>

                    {/* Price */}
                    <Text
                        style={tailwind.style(
                            '   font-inter-semibold text-[26px] leading-[33px] tracking-[-0.1px] text-[#4A4A4A] text-right',
                        )}>
                        ₹ <Text style={tailwind.style('text-[26px] font-areaNormal-extrabold')}>{price}</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default UlaaActiveTicket;
