import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigationParamList, PassesTabParamList } from './globalParamList';
import { slideFromRightOptions } from './utils/transitionOptions';
import { RouteProp, useRoute } from '@react-navigation/native';
import { TakePhotoFlow } from '@/src-v2/screens/Passes/TakePhoto/Flow';
import { PassHistoryFlow } from '@/src-v2/screens/Passes/BusPass/PassHistory/Flow';

const PassesStack = createStackNavigator<PassesTabParamList>();

export type PassesTabRoute = 'uploadPhoto' | 'takePhoto' | 'passHistory';

export const PassesStackNavigator: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'PassesTab'>>();
    const { screen } = route.params ?? {};
    const initialScreen = screen || 'takePhoto';
    return (
        <PassesStack.Navigator
            initialRouteName={initialScreen}
            screenOptions={{
                headerShown: false,
                ...slideFromRightOptions,
            }}>
            <PassesStack.Screen name="takePhoto" component={TakePhotoFlow} />
            <PassesStack.Screen name="passHistory" component={PassHistoryFlow} />
        </PassesStack.Navigator>
    );
};
