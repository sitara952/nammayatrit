import React from 'react';
import { ReferralScreenFlow } from '@/src-v2/screens/Referral/Flow.tsx';
import { ReferralPaymentScreen } from '@/src-v2/screens/ReferralPayment/Flow.tsx';
import { ReferralFAQScreen } from '@/src-v2/screens/ReferralFAQ/Flow.tsx';
import { EarningsFlow } from '@/src-v2/screens/ReferralEarnings/Flow.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReferralParamList } from './globalParamList';

const ReferralStack = createNativeStackNavigator<ReferralParamList>();

export type ReferralStackNavigatorProps = {};

export const ReferralStackNavigator: React.FC<ReferralStackNavigatorProps> = () => {
    const initialRouteName = 'referralScreen';
    return (
        <ReferralStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <ReferralStack.Screen name="referralScreen" component={ReferralScreenFlow} />
            <ReferralStack.Screen name="referralPayment" component={ReferralPaymentScreen} />
            <ReferralStack.Screen name="referralFaq" component={ReferralFAQScreen} />
            <ReferralStack.Screen name="referralEarningsScreen" component={EarningsFlow} />
        </ReferralStack.Navigator>
    );
};
