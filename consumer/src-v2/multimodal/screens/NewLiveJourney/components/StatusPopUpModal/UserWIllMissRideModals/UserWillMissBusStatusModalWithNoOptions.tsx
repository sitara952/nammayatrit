import React from 'react';
import Animated from 'react-native-reanimated';
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
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface UserWillMissBusStatusModalWithNoOptionsProps {
    currentBusNumber: string;
    bookDirectRide: () => void;
    onOtherOptionsPress: () => void;
    onClosePress: () => void;
    userHasMissed: boolean;
}

// TODO: Add secondary bus options as well once ready
const UserWillMissBusStatusModalWithNoOptions = ({
    currentBusNumber = 'NA',
    bookDirectRide = () => {},
    onOtherOptionsPress = () => {},
    onClosePress = () => {},
    userHasMissed = false,
}: UserWillMissBusStatusModalWithNoOptionsProps) => {
    const { liveJourneyUserWillMissBusStatusModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const { handlers: otherOptionsButtonHandlers, animatedStyle: otherOptionsButtonAnimatedStyle } =
        useScaleAnimation();
    const ConfigManager = useConfigContext();
    const colors = ConfigManager.get('themeColors');
    const userLangaugeStrings = ConfigManager.get('userLanguageStrings');
    return (
        <PopUpModalConfig
            enableDynamicSizing={true}
            sheetRef={liveJourneyUserWillMissBusStatusModalRef}
            style={'bg-white'}
            enableContentPanningGesture={true}
            onClosePress={onClosePress}
            enablePanDownToClose={false}
            enableOverDrag={false}
            isScrollable={false}>
            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                style={tailwind.style('h-full')}
                contentContainerStyle={tailwind.style('flex-grow')}>
                <Animated.View style={tailwind.style(`pt-[35px] pb-[${(bottom || 16) + 16}px]`)}>
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
                        {userLangaugeStrings.YouHaveMissedTheLastBusPleaseBookTheDirectRideToYourDestinationOrExploreOtherOptions(
                            userHasMissed,
                            currentBusNumber,
                        )}
                    </Animated.Text>

                    <Pressable
                        accessibilityLabel="Book Direct Ride button"
                        testID="skip-and-take-next-bus-button"
                        onPress={() => {
                            bookDirectRide();
                        }}
                        accessibilityRole="button"
                        style={tailwind.style('px-[24px] mt-[18px]')}
                        {...handlers}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    `bg-[${colors.Confirm_button_bg}] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]`,
                                ),
                                animatedStyle,
                            ]}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.Confirm_button_text}]`,
                                )}>
                                {userLangaugeStrings.BookDirectRide}
                            </Animated.Text>
                            <Icon
                                icon={<DoubleChevronRight fill={colors.Confirm_button_text} />}
                                color={colors.Confirm_button_text}
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
                </Animated.View>
            </BottomSheetScrollView>
        </PopUpModalConfig>
    );
};

export default UserWillMissBusStatusModalWithNoOptions;
