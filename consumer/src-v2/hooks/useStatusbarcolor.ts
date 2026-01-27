import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

export const useStatusBarColor = (triggerLightCondition: boolean) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    useFocusEffect(
        useCallback(() => {
            if (navigation && typeof navigation.setOptions === 'function') {
                navigation.setOptions({
                    statusBarStyle: triggerLightCondition ? 'light' : 'dark',
                    statusBarAnimation: 'fade',
                });
            }
        }, [navigation, triggerLightCondition]),
    );

    // Fallback for non-screen components (root navigator etc.)
    useEffect(() => {
        if ((Platform.OS === 'android' && !navigation) || typeof navigation.setOptions !== 'function') {
            StatusBar.setBarStyle(triggerLightCondition ? 'light-content' : 'dark-content', true);
        }
    }, [navigation, triggerLightCondition]);
};
