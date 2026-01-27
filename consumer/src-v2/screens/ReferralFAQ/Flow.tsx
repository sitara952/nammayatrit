import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ReferralFAQUI } from './UI.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectReferralPayoutConfigV2 } from '@/typescript/state/client/session';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const ReferralFAQScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleBackPress = () => {
        navigation.goBack();
    };
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);

    return (
        <ReferralFAQUI
            onBackPress={handleBackPress}
            userLanguageStrings={userLanguageStrings}
            themeColors={themeColors}
            referralPayoutConfigV2={referralPayoutConfigV2}
        />
    );
};
