import { Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';

// TODO:: Deprecate this function as it is not used anywhere
export const useGetAvailableScreenHeight = () => {
    const { height: screenHeight } = Dimensions.get('window');
    const insets = useSafeAreaInsets();
    const safeAreaAndStatusbar = StatusBar.currentHeight || 0 + insets.top + insets.bottom;
    return screenHeight - safeAreaAndStatusbar;
};
