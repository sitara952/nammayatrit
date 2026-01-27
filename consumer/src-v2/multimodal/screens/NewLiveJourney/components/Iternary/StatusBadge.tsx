import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { JourneyStatus } from './types';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Spinner } from '@/src-v2/multimodal/components/common/Spinner/UI';
import { LocationStatus } from '@/typescript/context/LocationStatusContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';

interface StatusBadgeProps {
    currentStatus: JourneyStatus;
    onPress: () => void;
    isLive: boolean;
    locationStatus: LocationStatus;
}

const getStatusColor = (status: JourneyStatus, isLive: boolean): string => {
    switch (status) {
        case 'LIVE':
            return isLive ? 'bg-[#188b2a]' : 'bg-[#e97f06]';
        case 'OFFTRACK':
            return 'bg-[#FF683A]';
        case 'NOTMOVING':
            return 'bg-[#656565]';
    }
};

const getStatusText = (
    status: JourneyStatus,
    isLive: boolean,
    locationStatus: LocationStatus,
    userLanguageStrings: strings,
): string => {
    switch (status) {
        case 'LIVE':
            if (locationStatus === 'refreshing') {
                return userLanguageStrings.RefreshingLocationType;
            }
            return isLive ? userLanguageStrings.LiveType : userLanguageStrings.FixLocationType;
        case 'OFFTRACK':
            return userLanguageStrings.FarAwayType;
        case 'NOTMOVING':
            return userLanguageStrings.NotMovingType;
    }
};
export const StatusBadge: React.FC<StatusBadgeProps> = ({ currentStatus, isLive, onPress, locationStatus }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (locationStatus === 'error') {
            scale.value = withSequence(
                withTiming(1.1, { duration: 500 }),
                withTiming(1, { duration: 500 }),
                withTiming(1.1, { duration: 500 }),
                withTiming(1, { duration: 500 }),
                withTiming(1.1, { duration: 500 }),
                withTiming(1, { duration: 500 }),
            );
        }
    }, [locationStatus]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Pressable
            accessibilityRole="button"
            testID="status-badge"
            accessibilityLabel={`Location status button`}
            onPress={onPress}
            style={tailwind.style('active:opacity-80')}
            disabled={locationStatus === 'success' || locationStatus === 'refreshing'}>
            <Animated.View
                style={[
                    tailwind.style(
                        `${getStatusColor(currentStatus, isLive)} rounded-[11px] px-[10px] mr-2 flex-row justify-center items-center gap-[5px] h-5`,
                        'shadow-sm',
                    ),
                    animatedStyle,
                ]}>
                {locationStatus === 'refreshing' ? (
                    <Spinner size="xs" themeColor="primary" stroke="border-white" />
                ) : (
                    <Animated.View style={tailwind.style('bg-white w-[6px] h-[6px] rounded')} />
                )}
                <Text
                    style={tailwind.style(
                        'text-white font-bold text-[12px] font-departureMono-regular leading-[14px]',
                    )}>
                    {getStatusText(currentStatus, isLive, locationStatus, userLanguageStrings)}
                </Text>
            </Animated.View>
        </Pressable>
    );
};
