import { PickupInstructionsProps } from '@/src-v2/utils/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { Linking } from 'react-native';
import { PickupInstructionsUI } from './UI';
import { useCallback } from 'react';

export const PickupInstructionsFlow = () => {
    const route: RouteProp<{ params: PickupInstructionsProps }, 'params'> = useRoute();
    const props = route.params;

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const handleButtonPress = useCallback(() => {
        try {
            Linking.openURL(props.openMapsUri);
        } catch (error) {
            console.error(error);
        }
    }, [props.openMapsUri]);

    return (
        <PickupInstructionsUI
            instructions={props.instructions}
            navigation={navigation}
            handleButtonPress={handleButtonPress}
        />
    );
};
