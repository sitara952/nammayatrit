import { useNavigation } from '@react-navigation/native';
import HyperSdkReact from 'hyper-sdk-react';
import { ReactElement, useCallback } from 'react';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface HardwareBackpressHandlerProps {
    children: ReactElement;
    onHardwareBackPress?: () => void;
}

const HardwareBackpressHandler = ({ children, onHardwareBackPress }: HardwareBackpressHandlerProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const onBackpress = useCallback(() => {
        if (HyperSdkReact.onBackPressed('hyperKey') || HyperSdkReact.onBackPressed('paymentPage')) {
            return true;
        } else if (onHardwareBackPress) {
            onHardwareBackPress();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
        return true;
    }, [onHardwareBackPress, navigation]);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(onBackpress, 1000, [onBackpress]);

    return children;
};

export default HardwareBackpressHandler;
