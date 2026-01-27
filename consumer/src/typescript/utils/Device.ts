import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useHasDynamicIsland = () => {
    const insets = useSafeAreaInsets();
    return Platform.OS === 'ios' && insets.top > 50;
};
