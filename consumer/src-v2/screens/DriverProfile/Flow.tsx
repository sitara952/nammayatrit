import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DriverProfileScreen from './UI';
import { MainNavigationParamList } from '../../../src/typescript/navigation/globalParamList';
import { useKnowYourDriverRideIdGetQuery } from '../../../src/api/integrations/rtk/KnowYourDriverRideIdGet';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useKnowYourFavDriverDriverIdGetQuery } from '@/api/integrations/rtk/KnowYourFavDriverDriverIdGet';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';

export const DriverProfileFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<MainNavigationParamList, 'driverProfile'>>();
    const appConfig = useAppSelector(selectAppConfig);
    const rideId = route.params.rideId;
    const driverId = route.params.driverId;
    const vehicleServiceType = route.params.vehicleServiceType;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { data: favDriverData, isLoading: favDriverLoading } = useKnowYourFavDriverDriverIdGetQuery(
        {
            driverId: driverId ?? '',
            isImages: true,
        },
        {
            skip: !driverId, // Skip if driverId is not provided
        },
    );

    const { data: knowYourDriverData, isLoading: knowYourDriverLoading } = useKnowYourDriverRideIdGetQuery(
        {
            rideId: rideId ?? '',
            isImages: true,
        },
        {
            skip: !!driverId, // Skip if driverId is provided
        },
    );

    const data = driverId ? favDriverData : knowYourDriverData;
    const isLoading = driverId ? favDriverLoading : knowYourDriverLoading;

    const onBackPress = () => {
        navigation.goBack();
    };

    return (
        <DriverProfileScreen
            onBackPress={onBackPress}
            rideId={rideId}
            driverData={data?.response}
            isLoading={isLoading}
            userLanguageStrings={userLanguageStrings}
            vehicleServiceType={vehicleServiceType}
            driverDefaultProfileUri={appConfig.assets.driverDefaultProfileUri}
        />
    );
};

export default DriverProfileFlow;
