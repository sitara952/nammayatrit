import { useAnimatedStyle, AnimatedStyle } from 'react-native-reanimated';

export const useAppAnimatedStyle = <T extends object>(fn: () => T): AnimatedStyle<T> => {
    return useAnimatedStyle(() => fn());
};
