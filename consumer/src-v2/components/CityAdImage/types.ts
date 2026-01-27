import { ViewStyle } from 'react-native';

export interface CityAdImageProps {
    imageSource: 'reviewFeedback' | 'rideConfirmed';
    testID: string;
    viewUnitId: string;
    containerStyle?: ViewStyle;
    useAnimatedView?: boolean;
    additionalCondition?: boolean;
}
