import React, { useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ScreenHeaderProps } from '../types';
import TicketSimple from '@/src-v2/multimodal/components/svg/TicketSimple';
import { Cross } from '@/src-v2/multimodal/components/svg/Cross';

export const ScreenHeader = ({ onGoBack, onShowTicket }: ScreenHeaderProps) => {
    const { top } = useSafeAreaInsets();

    const handleGoBack = useCallback(() => {
        if (onGoBack !== undefined) {
            onGoBack();
        }
    }, [onGoBack]);

    const handleShowTicket = useCallback(() => {
        if (onShowTicket !== undefined) {
            onShowTicket();
        }
    }, [onShowTicket]);

    return (
        <Animated.View style={tailwind.style(`pt-[${top + 12}px] px-5 z-10`)}>
            <Animated.View style={tailwind.style('flex-row justify-between items-center')}>
                <Animated.View
                    style={tailwind.style(
                        'w-[42px] h-10 rounded-[24px] bg-white opacity-70 border-[1px] border-[#F4F4F5] items-center justify-center',
                    )}>
                    <Pressable
                        onPress={handleGoBack}
                        testID="close-screen"
                        accessibilityRole="button"
                        accessibilityLabel="Close button"
                        style={tailwind.style('w-full h-full items-center justify-center')}>
                        <Cross fill="#047AEA" />
                    </Pressable>
                </Animated.View>
                <Animated.View
                    style={tailwind.style(
                        'w-[42px] h-10 rounded-[24px] bg-white opacity-70 border-[1px] border-[#F4F4F5] items-center justify-center',
                    )}>
                    <Pressable
                        onPress={handleShowTicket}
                        testID="show-ticket"
                        accessibilityLabel="Show ticket button"
                        accessibilityRole="button"
                        style={tailwind.style('w-full h-full items-center justify-center')}>
                        <TicketSimple />
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
