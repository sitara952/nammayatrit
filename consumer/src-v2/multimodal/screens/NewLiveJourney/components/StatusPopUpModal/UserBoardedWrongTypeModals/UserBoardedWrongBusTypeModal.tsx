import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PopUpModalConfig } from '../PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Line, Svg } from 'react-native-svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { ScrollView } from 'react-native-gesture-handler';
import acBusPng from '@/src-v2/assets/3D-assets/live-journey/ac-bus.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const UserBoardedWrongBusTypeModal = ({
    busNumbers = [],
    switchTicketPrice = 0,
    boardedBusType = 'NA',
    ticketBoughtForBusType = 'NA',
    onSwitchTicketPress = () => {},
}: {
    busNumbers: string[];
    switchTicketPrice: number;
    boardedBusType: string;
    ticketBoughtForBusType: string;
    onSwitchTicketPress: () => void;
}) => {
    const { liveJourneyBoardedWrongBusTypeModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <PopUpModalConfig
            sheetRef={liveJourneyBoardedWrongBusTypeModalRef}
            onClosePress={() => {}}
            enablePanDownToClose={false}
            isScrollable={false}>
            <BottomSheetView style={tailwind.style(`pt-[31px] pb-[${bottom || 16}px]`)}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] px-[20px] text-center leading-[24px] tracking-[0.2px]',
                    )}>
                    {userLanguageStrings.LooksLikeYouHaveBoardedOnABusWithATicketForBusNoWorriesSwitchTheTicketWithJust(
                        boardedBusType,
                        ticketBoughtForBusType,
                        switchTicketPrice,
                    )}
                </Animated.Text>

                <Animated.View style={tailwind.style('bg-white rounded-[16px] py-4 mt-[28px] mx-[24px]')}>
                    <Animated.Image
                        accessible={false}
                        source={acBusPng}
                        style={tailwind.style('w-[100px] h-[88px] absolute top-0 right-0')}
                    />
                    <Animated.View style={tailwind.style('px-[16px]')}>
                        <Animated.Text
                            style={tailwind.style('text-[32px] font-areaNormal-extrabold', 'text-[#3B3A3C]')}>
                            <Animated.Text style={tailwind.style('text-[13px]')}>₹ </Animated.Text>
                            {switchTicketPrice}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] pt-[12px] font-departureMono-regular',
                                'text-[#595959]',
                            )}>
                            {ticketBoughtForBusType} {userLanguageStrings.To} {boardedBusType}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View entering={FadeIn} style={tailwind.style('mt-[12px] mx-[14px]')}>
                        <Svg height={1}>
                            <Line
                                strokeDasharray="5.2, 7"
                                x1={0}
                                x2={SCREEN_WIDTH}
                                y1={1}
                                y2={1}
                                stroke="#F5F5F5"
                                strokeWidth="2"
                            />
                        </Svg>
                    </Animated.View>

                    <Animated.View style={tailwind.style('pt-[12px]')}>
                        <Animated.Text
                            style={tailwind.style('text-[11px] px-[14px] font-areaNormal-extrabold', 'text-[#969696]')}>
                            {userLanguageStrings.ThisTicketIsAlsoValidIn}
                        </Animated.Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={tailwind.style('px-[14px] pt-[8px]')}>
                            {busNumbers.map((busNumber, index) => (
                                <Animated.View
                                    key={index}
                                    style={tailwind.style(
                                        'h-[27px] px-[9px] rounded-[9px] border border-[#F1F2F2] flex-row items-center mr-[8px]',
                                    )}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[11px] font-areaNormal-extrabold',
                                            'text-[#3B3A3C]',
                                        )}>
                                        {busNumber}
                                    </Animated.Text>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>

                <Pressable
                    testID="switch-ticket-button"
                    onPress={onSwitchTicketPress}
                    accessibilityRole="button"
                    accessibilityLabel="Upgrade & Switch button"
                    {...handlers}>
                    <Animated.View
                        style={[
                            tailwind.style(
                                `bg-[${colors.view_ticket_bg}] h-[57px] gap-[7px] rounded-[14px] flex-row items-center justify-center mt-[24px] mx-[24px]`,
                            ),
                            animatedStyle,
                        ]}>
                        <Animated.Text
                            style={tailwind.style(
                                `text-[14px] font-areaNormal-extrabold text-[${colors.view_ticket_text}]`,
                            )}>
                            {userLanguageStrings.UpgradeAndSwitch}
                        </Animated.Text>
                        <Icon
                            icon={<DoubleArrowsWhite fill={colors.view_ticket_text} />}
                            size={14}
                            color={colors.view_ticket_text}
                        />
                    </Animated.View>
                </Pressable>
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

export default UserBoardedWrongBusTypeModal;
