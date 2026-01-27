import { useKaptureCustomerLoginPostMutation } from '@/api/integrations/rtk/KaptureCustomerLoginPost';
import { logger } from '@/src-v2/systems/logger';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/typescript/state/hooks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectOperatingCity, selectKaptureConfig } from '@/typescript/state/client/session.ts';
import { selectUserProfile } from '@/typescript/state/client/user.ts';
import { buildKaptureUrl } from '@/typescript/utils/common';
import { MERCHANT_CLIENT_CONFIG } from '@/typescript/constants/common';

export const useHelpAndSupportHandler = () => {
    const [kaptureCustomerLoginPost] = useKaptureCustomerLoginPostMutation();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configs = MERCHANT_CLIENT_CONFIG.value;
    const merchantId = configs.mobilityMid;
    const profile = useAppSelector(selectUserProfile);
    const customerId = profile?.id;
    const operatingCity = useAppSelector(selectOperatingCity);
    const kaptureConfig = useAppSelector(selectKaptureConfig);

    const fetchKaptureLogin = async (rideId: string | undefined) => {
        const response = await kaptureCustomerLoginPost({
            ticketType: rideId ? 'RIDE_RELATED' : 'APP_RELATED',
        });
        if (response.error) {
            console.error('Error in kaptureCustomerLoginPost:', response.error);
            return;
        }
        return response.data;
    };

    const onHelpAndSupportPress = async (rideId: string | undefined, ticketId: string | undefined) => {
        const data = await fetchKaptureLogin(rideId);
        if (!data || !data.encryptedIv || !data.encryptedCc) {
            logger.logError(
                'Missing or invalid encryptedIv or encryptedCc, data: ' + JSON.stringify(data),
                'KaptureLoginError',
            );
            return;
        }

        const kaptureUrl = rideId
            ? kaptureConfig.kaptureUrl.onClick.actionData.rideRelated.url
            : kaptureConfig.kaptureUrl.onClick.actionData.appRelated.url;

        const navigationUrl = buildKaptureUrl(
            kaptureUrl,
            data.encryptedIv,
            data.encryptedCc,
            merchantId,
            operatingCity,
            customerId,
            rideId,
            ticketId,
        );

        navigation.navigate(
            'ProfileTab',
            {
                screen: 'helpAndSupportNavigator',
                params: {
                    screen: 'kaptureWebViewScreen',
                    params: {
                        url: navigationUrl,
                        goBack: undefined,
                        ticketId: ticketId,
                    },
                },
            },
            { pop: true },
        );
    };

    return onHelpAndSupportPress;
};
