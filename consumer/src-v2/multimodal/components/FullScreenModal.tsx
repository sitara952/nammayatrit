import React from 'react';
import { Modal, View, Platform } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import CrossIcon from '../screens/Search/components/svg/CloseIcon';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

interface FullScreenModalProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    contentStyle?: StyleProp<ViewStyle>; // New prop for content styling
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({ isVisible, onClose, children, contentStyle }) => {
    const { top, bottom } = useSafeAreaInsets();

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}>
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={tailwind.style(
                    'flex-1 justify-center items-center bg-black bg-opacity-90 p-4',
                    Platform.OS === 'ios' ? `pt-[${top}px]` : '',
                )}>
                <View style={[tailwind.style('bg-white rounded-[20px] p-5 items-center justify-center'), contentStyle]}>
                    {children}
                </View>
            </Animated.View>
            <Pressable
                testID={'close-full-screen-modal'}
                accessibilityRole="button"
                accessibilityLabel="Close full screen modal"
                style={tailwind.style(
                    'absolute bottom-4 left-1/2 ml-[-18px] w-9 h-9 rounded-full bg-[#E6E6E6] justify-center items-center',
                    Platform.OS === 'ios' ? `mb-[${top}px]` : `mb-[${bottom}px]`, // Adjust bottom margin for iOS safe area
                )}
                onPress={onClose}>
                <CrossIcon />
            </Pressable>
        </Modal>
    );
};
