import suburbanGoingToMissPng from '@/src-v2/assets/3D-assets/live-journey/suburban-going-to-miss.webp';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useRefsContext } from '@/typescript/context/RefsContext';
import React from 'react';
import Animated from 'react-native-reanimated';
import { CloseButton } from '../CloseButton';
import { PopUpModalConfig } from '../PopUpModalConfig';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors as color } from 'config-types/src/domain/default/themes/colors';

export interface UserWillMissSuburbanProps {
    onSkipAndTakeNextPress: () => void;
    onOtherOptionsPress: () => void;
    onClosePress: () => void;
    destination: string;
    nextTrainArrivalTime: string;
    userHasMissed: boolean;
    onTimerEnd: () => void;
}

const UserWillMissSuburban = ({
    onSkipAndTakeNextPress = () => {},
    onOtherOptionsPress = () => {},
    onClosePress = () => {},
    destination = 'NA',
    nextTrainArrivalTime = 'NA mins',
    userHasMissed = false,
    onTimerEnd = () => {},
}: UserWillMissSuburbanProps) => {
    const { liveJourneyUserWillMissSuburbanModalRef } = useRefsContext();
    const { handlers, animatedStyle } = useScaleAnimation();
    const { handlers: otherOptionsButtonHandlers, animatedStyle: otherOptionsButtonAnimatedStyle } =
        useScaleAnimation();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Countdown timer state
    const [countdown, setCountdown] = React.useState(8);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            onTimerEnd();
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [countdown, onTimerEnd]);

    // Optionally reset timer when modal is opened/closed
    // React.useEffect(() => {
    //     setCountdown(8);
    // }, [/* add a prop or context that changes when modal opens */]);

    return (
        <PopUpModalConfig
            enableDynamicSizing={true}
            sheetRef={liveJourneyUserWillMissSuburbanModalRef}
            style={'bg-white'}
            snapPoints={['50%']}
            enableContentPanningGesture={true}
            enablePanDownToClose={false}
            enableOverDrag={false}
            onClosePress={onClosePress}
            isScrollable={false}>
            <Animated.View style={tailwind.style(`pt-[35px] pb-[${bottom || 16}px]`)}>
                <CloseButton
                    onPress={onClosePress}
                    closeButtonStyle="bg-[#E5E5E5]"
                    style=" absolute top-[20px] left-[20px]"
                />
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="suburban going to miss"
                    style={tailwind.style('w-[169px] h-[52px] mx-auto')}
                    source={suburbanGoingToMissPng}
                />
                <Animated.Text
                    style={tailwind.style(
                        'text-center text-[14px] font-areaNormal-extrabold text-[#3B3A3C] pt-[16px] leading-[24px] px-[44px]',
                    )}>
                    {userLanguageStrings.YouHaveMissedTheTrainToDestinationButTheNextTrainArrivesAtIn(
                        destination,
                        nextTrainArrivalTime,
                    )}
                </Animated.Text>

                <Pressable
                    accessibilityLabel={`Skip & Take Next Train${userHasMissed ? ` (${countdown} seconds)` : ''} button`}
                    testID="skip-and-take-next-bus-button"
                    onPress={() => {
                        onSkipAndTakeNextPress();
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
                            {userLanguageStrings.SkipAndTakeNextTrain(userHasMissed, countdown)}
                        </Animated.Text>
                        <Icon icon={<DoubleChevronRight fill={color.blue200} />} color={color.blue200} size={15} />
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
                            style={tailwind.style('text-[14px] text-center font-areaNormal-extrabold text-[#656565]')}>
                            {userLanguageStrings.OtherOptions}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </PopUpModalConfig>
    );
};

export default UserWillMissSuburban;
