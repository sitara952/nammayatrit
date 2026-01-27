import { StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';

export type ChildrenType = React.ReactNode | React.ReactNode[];
export type StyleType = StyleProp<ViewStyle> | StyleProp<AnimatedStyle>;

export type PROJECT_ENUMS = 'bridge' | 'namma_yatri' | 'multimodal';

export type CurrencyType = 'INR' | 'USD' | 'EUR';
