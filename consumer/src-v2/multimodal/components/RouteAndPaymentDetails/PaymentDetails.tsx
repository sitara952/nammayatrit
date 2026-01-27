import React from 'react';
import { View, Text } from 'react-native';
import CollapsibleCard from '../RouteAndPaymentDetailsCard/CollapsibleCard';
import { tailwind } from '../../../tailwind-theme/tailwind';

interface PaymentDetailsProps {
    data: PaymentDetailsData;
}

export type PaymentDetailsData = {
    orderId: string | undefined;
    totalAmount: string | undefined;
    dateAndTime: string | undefined;
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ data }) => {
    return (
        <CollapsibleCard title="Payment Details">
            <View>
                <View style={tailwind.style('flex-row justify-between mb-4')}>
                    <View style={tailwind.style('flex-1 mr-4')}>
                        <Text style={tailwind.style('text-[12px] font-areaNormal-bold  text-[#89898A]')}>
                            Transaction ID
                        </Text>
                        <Text style={tailwind.style('text font-areaNormal-bold text-[#37313E]')}>{data?.orderId}</Text>
                    </View>
                    <View style={tailwind.style('flex-1')}>
                        <Text style={tailwind.style('text-[12px] font-areaNormal-bold  text-[#89898A]')}>
                            Total Amount
                        </Text>
                        <Text style={tailwind.style('text font-areaNormal-bold text-[#37313E]')}>
                            ₹{Math.round(Number(data?.totalAmount)) || ''}
                        </Text>
                    </View>
                </View>
                {/* <View>
                    <Text style={tailwind.style('text-[12px] font-areaNormal-bold  text-[#89898A]')}>Date & Time</Text>
                    <Text style={tailwind.style('text font-areaNormal-bold text-[#37313E]')}>
                        {formatDateAndTime(data?.dateAndTime)}
                    </Text>
                </View> */}
            </View>
        </CollapsibleCard>
    );
};

export default PaymentDetails;
