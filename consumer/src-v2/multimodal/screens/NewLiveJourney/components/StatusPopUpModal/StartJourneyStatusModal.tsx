import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import React from 'react';
import Animated from 'react-native-reanimated';
import { PopUpModalConfig } from './PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';

import { ShowTicketButton } from './ShowTicketButton';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CloseButton } from './CloseButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../../../src/typescript/state/hooks';
import { selectAppConfig } from '../../../../../../src/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
export interface StartJourneyStatusModalProps {
    onClosePress: () => void;
    transportType: string;
    onPressBookRide: () => void;
    onShowTicketPress: () => void;
}

const StartJourneyStatusModal = ({
    onClosePress,
    transportType = 'NA',
    onPressBookRide,
    onShowTicketPress,
}: StartJourneyStatusModalProps) => {
    const { liveJourneyStartJourneyStatusModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <PopUpModalConfig
            sheetRef={liveJourneyStartJourneyStatusModalRef}
            onHardwareBackPress={onClosePress}
            onClosePress={onClosePress}>
            <CloseButton onPress={onClosePress} style={'absolute top-[16px] right-[16px] z-1'} />
            <Animated.View style={tailwind.style(`pb-[${bottom || 16}px] pt-[25px]`)}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[19px] font-areaNormal-extrabold text-[#313131] leading-[26px] tracking-[0.14px] text-center pt-[37px] w-[301px] mx-auto',
                    )}>
                    {userLanguageStrings.YouShouldStartYourJourney}!
                </Animated.Text>
                <Animated.View style={tailwind.style('px-[46px] pt-[24px]')}>
                    <Animated.Image
                        accessible={false}
                        style={tailwind.style('w-full h-[400px]')}
                        source={{ uri: appConfig.assets.journeyStartTicketImageUri }}
                        resizeMode="contain"
                    />
                </Animated.View>
                <ShowTicketButton
                    text={transportType === 'auto' || transportType === 'taxi' ? 'Book Auto' : 'Start Journey'}
                    onPress={transportType === 'auto' || transportType === 'taxi' ? onPressBookRide : onClosePress}
                    wrapperStyle="mt-[-58px] px-[32px]"
                />

                <Animated.View style={tailwind.style('pt-[26px] pb-[16px] mx-[25px]')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] text-center tracking-[0.2px] leading-[24px]',
                        )}>
                        {userLanguageStrings.LetsGetStarted}!
                    </Animated.Text>
                    <Pressable
                        accessibilityRole="button"
                        testID="track-bus-button"
                        onPress={onShowTicketPress}
                        accessibilityLabel={`View ticket button`}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] font-areaNormal-extrabold text-center tracking-[0.2px] text-[#016ACD]',
                            )}>
                            {' '}
                            {userLanguageStrings.ViewTicket} →
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </PopUpModalConfig>
    );
};

export default StartJourneyStatusModal;
