import React, { useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModalConfig } from '../PopUpModalConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import busGoingToMissPng from '@/src-v2/assets/3D-assets/live-journey/bus-going-to-miss.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { CloseButton } from '../CloseButton';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronDown, ChevronUp } from '@/src-v2/assets/svg/ChevronArrows';
import { BusIcon } from '@/src-v2/multimodal/components/svg/transport';
import TriangleArrowUp from '@/src-v2/assets/svg/TriangleArrowUp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';

export interface UserWillMissBusStatusModalProps {
    nextBusesList: { busNumber: string; timeInMins: string }[];
    currentBusNumber: string;
    onSkipAndTakeNextBusPress: () => void;
    onOtherOptionsPress: () => void;
    onSwitchBusPress: (busNumber: string) => void;
    onConfirmBusPress: (busNumber: string) => void;
    onClosePress: () => void;
    onTimerEnd: () => void;
    userHasMissed: boolean;
}

interface BusItemProps {
    busNumber: string;
    timeInMins: string;
    onSwitchPress: (busNumber: string) => void;
}

const BusItem: React.FC<BusItemProps> = ({ busNumber, timeInMins, onSwitchPress }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLangaugeStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut.duration(100)}
            style={tailwind.style(
                `rounded-[16px] h-[50px] border border-[${colors.CrossButton_bg}] mt-[16px] px-[18px] flex-row items-center justify-between`,
            )}>
            <Animated.View style={tailwind.style('flex-row items-center')}>
                <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                    {busNumber}
                </Animated.Text>
                <Animated.View style={tailwind.style('h-[18px] ml-[15px] mr-[12px] w-[1px] bg-[#D9D9D9]')} />
                <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#09941E]')}>
                    {timeInMins}
                </Animated.Text>
            </Animated.View>

            <Pressable
                accessibilityLabel="Switch button"
                testID="switch-bus-button"
                onPress={() => onSwitchPress(busNumber)}
                accessibilityRole="button"
                {...handlers}>
                <Animated.View style={[tailwind.style('flex-row items-center gap-[8px]'), animatedStyle]}>
                    <Animated.Text
                        style={tailwind.style(
                            `text-[14px] leading-[15px] font-areaNormal-extrabold text-[${color.blue200}]`,
                        )}>
                        {userLangaugeStrings.Switch}
                    </Animated.Text>
                    <Icon icon={<DoubleChevronRight fill={color.blue200} />} color={color.blue200} size={15} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

interface BusSelectorItemProps {
    busNumber: string;
    selectedBusNumber: string | undefined;
    onChangeBusPress: (busNumber: string) => void;
}

const BusSelectorItem: React.FC<BusSelectorItemProps> = ({ busNumber, selectedBusNumber, onChangeBusPress }) => {
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        const isSelected = busNumber === selectedBusNumber;
        return {
            backgroundColor: withTiming(isSelected ? '#3B3A3C' : '#FFFFFF', { duration: 300 }),
        };
    }, [selectedBusNumber, busNumber]);

    const animatedTextStyle = useAnimatedStyle(() => {
        const isSelected = busNumber === selectedBusNumber;
        return {
            color: withTiming(isSelected ? '#FFFFFF' : '#3B3A3C', { duration: 300 }),
        };
    }, [selectedBusNumber, busNumber]);

    return (
        <Pressable
            accessibilityLabel={`Select bus ${busNumber}`}
            accessibilityRole="button"
            key={busNumber}
            testID={`select-bus-button-${busNumber}`}
            onPress={() => onChangeBusPress(busNumber)}>
            <Animated.View style={tailwind.style('flex-col items-center gap-[5px]')}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'h-[34px] px-[9px] flex-row items-center rounded-[10px] border border-[#F1F2F2]',
                        ),
                        animatedBackgroundStyle,
                    ]}>
                    <Animated.Text style={[tailwind.style('text-[13px] font-areaNormal-extrabold'), animatedTextStyle]}>
                        {busNumber}
                    </Animated.Text>
                </Animated.View>
                {busNumber === selectedBusNumber && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Icon icon={<TriangleArrowUp />} color="#3B3A3C" size={10} />
                    </Animated.View>
                )}
            </Animated.View>
        </Pressable>
    );
};

type SwitchBusContentProps = {
    nextBusesList: { busNumber: string; timeInMins: string }[];
    selectedBusNumber: string | undefined;
    onChangeBusPress: (busNumber: string) => void;
    onConfirmBusPress: (busNumber: string) => void;
};

const SwitchBusContent = ({
    nextBusesList,
    selectedBusNumber,
    onChangeBusPress = () => {},
    onConfirmBusPress = () => {},
}: SwitchBusContentProps) => {
    const { bottom } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLangaugeStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style(`pt-[32px] pb-[${bottom || 16}px]`)}>
            <Animated.View style={tailwind.style('flex-row items-center px-[24px] justify-between')}>
                <Animated.View>
                    <Animated.Text
                        style={tailwind.style('text-[16px] leading-[27px] font-areaNormal-extrabold text-[#313131]')}>
                        {userLangaugeStrings.Bus88BIs3StopsAway}{' '}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold text-[#09941E] leading-[14px] mt-[8px]',
                        )}>
                        {userLangaugeStrings.YouWillReach10MinsBeforeTheBus}
                    </Animated.Text>
                </Animated.View>
                <Animated.View
                    style={tailwind.style(
                        'h-[48px] w-[48px] flex-row items-center justify-center rounded-[17px] bg-[#FFE898]',
                    )}>
                    <Icon icon={<BusIcon />} color="#470F2D" size={24} />
                </Animated.View>
            </Animated.View>

            <Pressable
                accessibilityLabel="Confirm this bus button"
                testID="confirm-this-bus-button"
                onPress={() => onConfirmBusPress(selectedBusNumber || '')}
                accessibilityRole="button"
                style={tailwind.style('px-[24px] mt-[24px]')}
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style(
                            `bg-[${colors.Button_for_modes_bg}] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]`,
                        ),
                        animatedStyle,
                    ]}>
                    <Animated.Text
                        style={tailwind.style(
                            `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.Button_for_modes_text}]`,
                        )}>
                        {userLangaugeStrings.ConfirmThisBus}
                    </Animated.Text>
                    <Icon
                        icon={<DoubleChevronRight fill={colors.Button_for_modes_text} />}
                        color={colors.Button_for_modes_text}
                        size={15}
                    />
                </Animated.View>
            </Pressable>

            <Animated.View style={[tailwind.style('flex-row gap-[10px] pt-[24px] justify-center')]}>
                {nextBusesList?.map(bus => (
                    <BusSelectorItem
                        key={bus.busNumber}
                        busNumber={bus.busNumber}
                        selectedBusNumber={selectedBusNumber}
                        onChangeBusPress={onChangeBusPress}
                    />
                ))}
            </Animated.View>
        </Animated.View>
    );
};

// TODO: Add secondary bus options as well once ready
const UserWillMissBusStatusModal = ({
    nextBusesList,
    currentBusNumber = 'NA',
    onSkipAndTakeNextBusPress = () => {},
    onOtherOptionsPress = () => {},
    onSwitchBusPress = () => {},
    onConfirmBusPress = () => {},
    onClosePress = () => {},
    onTimerEnd = () => {},
    userHasMissed = false,
}: UserWillMissBusStatusModalProps) => {
    const [selectedBusNumber, setSelectedBusNumber] = useState<string | undefined>('88B');
    const [showSwitchBusContent, setShowSwitchBusContent] = useState(false);
    const { liveJourneyUserWillMissBusStatusModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const { handlers: otherOptionsButtonHandlers, animatedStyle: otherOptionsButtonAnimatedStyle } =
        useScaleAnimation();
    const [showAllBuses, setShowAllBuses] = useState(false);
    const configManager = useConfigContext();
    const userLangaugeStrings = configManager.get('userLanguageStrings');

    // Countdown timer state
    const [countdown, setCountdown] = React.useState(8);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset timer when modal is reopened (showSwitchBusContent goes from true to false)
    React.useEffect(() => {
        if (!showSwitchBusContent && userHasMissed) {
            setCountdown(8);
        }
    }, [showSwitchBusContent, userHasMissed]);

    React.useEffect(() => {
        if (!showSwitchBusContent && userHasMissed && countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (!showSwitchBusContent && userHasMissed && countdown === 0) {
            onTimerEnd?.();
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [countdown, showSwitchBusContent, onTimerEnd, userHasMissed]);

    const displayedBuses = showAllBuses ? nextBusesList : nextBusesList.slice(0, 3);

    return (
        <PopUpModalConfig
            enableDynamicSizing={false}
            sheetRef={liveJourneyUserWillMissBusStatusModalRef}
            snapPoints={showSwitchBusContent ? ['30%'] : ['71%', '90%']}
            style={'bg-white'}
            enableContentPanningGesture={true}
            enablePanDownToClose={false}
            onClosePress={onClosePress}
            enableOverDrag={false}
            isScrollable={false}>
            {!showSwitchBusContent ? (
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    style={tailwind.style('h-full')}
                    contentContainerStyle={tailwind.style('flex-grow')}>
                    <Animated.View style={tailwind.style(`pt-[35px] pb-[${bottom || 16}px]`)}>
                        <CloseButton
                            onPress={onClosePress}
                            closeButtonStyle="bg-[#E5E5E5]"
                            style=" absolute top-[20px] left-[20px]"
                        />
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="you are going to miss bus image"
                            style={tailwind.style('w-[181px] h-[69px] mx-auto')}
                            source={busGoingToMissPng}
                        />
                        <Animated.Text
                            style={tailwind.style(
                                'text-center text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pt-[16px] leading-[24px] px-[44px]',
                            )}>
                            {userLangaugeStrings.YouHaveMissedTheBusButTheNextBusArrivesAtIn(
                                userHasMissed,
                                currentBusNumber,
                                nextBusesList?.[0]?.busNumber ?? '',
                                nextBusesList?.[0]?.timeInMins ?? '',
                            )}
                        </Animated.Text>

                        <Pressable
                            accessibilityLabel={`Skip & Take Next Bus${userHasMissed ? ` (${countdown}s)` : ''} button`}
                            testID="skip-and-take-next-bus-button"
                            onPress={() => {
                                setShowSwitchBusContent(true);
                                onSkipAndTakeNextBusPress();
                            }}
                            accessibilityRole="button"
                            style={tailwind.style('px-[24px] mt-[18px]')}
                            {...handlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-[#3B3A3C] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]',
                                    ),
                                    animatedStyle,
                                ]}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[#fff]',
                                    )}>
                                    {userLangaugeStrings.SkipAndTakeNextBus(countdown, userHasMissed)}
                                </Animated.Text>
                                <Icon
                                    icon={<DoubleChevronRight fill={color.neutral100} />}
                                    color={color.neutral100}
                                    size={15}
                                />
                            </Animated.View>
                        </Pressable>

                        <Pressable
                            accessibilityLabel="Other Options button"
                            testID="other-options-button"
                            onPress={onOtherOptionsPress}
                            accessibilityRole="button"
                            style={tailwind.style('pt-[22px]')}
                            {...otherOptionsButtonHandlers}>
                            <Animated.View style={otherOptionsButtonAnimatedStyle}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] text-center font-areaNormal-extrabold text-[#656565]',
                                    )}>
                                    {userLangaugeStrings.OtherOptions}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>

                        <Animated.View
                            layout={LinearTransition}
                            style={tailwind.style('border-t border-[#F4F4F4] mt-[22px] mx-[24px]')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold text-[#7E7E7E] pt-[14px] leading-[24px]',
                                )}>
                                {userLangaugeStrings.BusesInNext20Mins}
                            </Animated.Text>

                            {displayedBuses.map(bus => (
                                <BusItem
                                    key={bus.busNumber}
                                    busNumber={bus.busNumber}
                                    timeInMins={bus.timeInMins}
                                    onSwitchPress={onSwitchBusPress}
                                />
                            ))}

                            {nextBusesList.length > 3 && (
                                <Pressable
                                    accessibilityLabel={showAllBuses ? 'View less button' : 'Check more buses button'}
                                    accessibilityRole="button"
                                    testID="toggle-buses-button"
                                    onPress={() => {
                                        setShowAllBuses(!showAllBuses);
                                        liveJourneyUserWillMissBusStatusModalRef.current?.snapToIndex(
                                            !showAllBuses ? 1 : 0,
                                        );
                                    }}
                                    style={tailwind.style('mt-[26px]')}>
                                    <Animated.View
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={tailwind.style('flex-row items-center justify-center gap-[8px]')}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] leading-[15px] font-areaNormal-extrabold text-[#016ACD]',
                                            )}>
                                            {showAllBuses
                                                ? userLangaugeStrings.ViewLess
                                                : userLangaugeStrings.CheckMoreBuses(nextBusesList.length)}
                                        </Animated.Text>
                                        <Icon
                                            icon={showAllBuses ? <ChevronUp /> : <ChevronDown />}
                                            color="#016ACD"
                                            size={11}
                                        />
                                    </Animated.View>
                                </Pressable>
                            )}
                        </Animated.View>
                    </Animated.View>
                </BottomSheetScrollView>
            ) : null}
            {showSwitchBusContent ? (
                <SwitchBusContent
                    nextBusesList={nextBusesList.slice(0, 5)}
                    selectedBusNumber={selectedBusNumber}
                    onChangeBusPress={setSelectedBusNumber}
                    onConfirmBusPress={onConfirmBusPress}
                />
            ) : null}
        </PopUpModalConfig>
    );
};

export default UserWillMissBusStatusModal;
