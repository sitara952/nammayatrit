import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ReferralPaymentUI } from './UI';
import { selectPayoutVpa, selectReferralAmountToCollect } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { MainNavigationParamList, ReferralParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const ReferralPaymentScreen: React.FC = () => {
    const route = useRoute<RouteProp<ReferralParamList, 'referralPayment'>>();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const payoutVpa = useAppSelector(selectPayoutVpa);
    const initialReferralAmountToCollect = useAppSelector(selectReferralAmountToCollect);
    const [referralAmountToCollect] = React.useState(initialReferralAmountToCollect);

    const handleDonePress = () => {
        if (route.params?.fromReviewFeedback) {
            navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
        } else {
            navigation.goBack();
        }
    };

    return (
        <ReferralPaymentUI
            themeColors={themeColors}
            onDonePress={handleDonePress}
            userLanguageStrings={userLanguageStrings}
            payoutVpa={payoutVpa ?? ''}
            referralAmountToCollect={referralAmountToCollect ?? 0}
        />
    );
};
