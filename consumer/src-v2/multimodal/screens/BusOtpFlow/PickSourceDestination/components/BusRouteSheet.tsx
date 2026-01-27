import busTransit from '@/src-v2/assets/3D-assets/full-asset/bus_transit.webp';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import BottomSheet, { BottomSheetTextInput, BottomSheetView, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import Animated, {
    FadeIn,
    FadeInDown,
    interpolate,
    LinearTransition,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const BottomSheetInputComponent = ({
    onBusNumberChange,
}: {
    onBusNumberChange: ((value: string) => void) | undefined;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const { busRouteInputModalRef } = useRefsContext();

    return (
        <BottomSheetTextInput
            onBlur={() => {
                busRouteInputModalRef?.current?.snapToIndex(0);
                setIsFocused(false);
            }}
            style={tailwind.style(
                'w-full text-center pt-6 pb-2 text-[36px] font-areaNormal-extrabold leading-[46px] tracking-[0.3px] border-b-[2px] max-w-[200px] min-h-[46px]',
                isFocused ? 'border-[#3B3A3C]' : 'border-[#C9C9C9]',
            )}
            onFocus={() => {
                setIsFocused(true);
            }}
            onChangeText={value => onBusNumberChange?.(value)}
            returnKeyType="done"
            returnKeyLabel="done"
            autoCapitalize="characters"
        />
    );
};

/**
 * Props for the BusRouteSheet component.
 * This component handles the bus route confirmation and number input.
 */
export interface BusRouteSheetProps {
    /** Type of bus service (e.g., 'AC', 'NON_AC', 'DELUXE', 'EXPRESS') */
    busServiceType: string;

    /** Name or code of the starting bus stop */
    busStartPoint: string;

    /** Name or code of the ending bus stop */
    busEndPoint: string;

    /**
     * Callback fired when user confirms the route.
     * Called when the user taps the "Confirm Route Number" button
     * and the bus number is valid.
     */
    handleConfirmRoute: () => void;

    /**
     * Handler for bus number input changes.
     * @param busNumber - The new bus number value
     */
    onBusNumberChange: (busNumber: string) => void;

    /** Whether the current bus number is valid and can be confirmed */
    isBusNumberValid: boolean;
}

export const BusRouteSheet = (props: BusRouteSheetProps) => {
    const { busServiceType, busStartPoint, busEndPoint, handleConfirmRoute, onBusNumberChange, isBusNumberValid } =
        props;
    const { handlers, animatedStyle } = useScaleAnimation();
    const { busRouteInputModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const animatedSheetPosition = useSharedValue(0);
    const animatedSheetIndex = useSharedValue(-1);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const animatedBusTransitStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -(SCREEN_HEIGHT - animatedSheetPosition.value - 52) }, { translateX: -92.5 }],
            opacity: interpolate(animatedSheetIndex.value, [-1, 0], [0.4, 1]),
        };
    });

    useAnimatedReaction(
        () => animatedSheetIndex.value,
        newValue => {
            runOnJS(setIsSheetOpen)(newValue !== -1);
        },
    );

    return (
        <>
            {isSheetOpen ? (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus transit image"
                    entering={FadeIn.springify().damping(34).stiffness(240)}
                    source={busTransit}
                    style={[
                        tailwind.style('absolute bottom-0 left-1/2 w-[185px] h-[104px] z-20'),
                        animatedBusTransitStyle,
                    ]}
                />
            ) : null}
            <BottomSheet
                index={-1}
                animatedIndex={animatedSheetIndex}
                handleComponent={null}
                enablePanDownToClose
                style={tailwind.style('bg-white rounded-t-[36px] overflow-visible')}
                animatedPosition={animatedSheetPosition}
                ref={busRouteInputModalRef}>
                <BottomSheetView style={tailwind.style('pt-16 rounded-t-[36px] bg-white')}>
                    <Animated.View
                        layout={LinearTransition.springify().damping(34).stiffness(240)}
                        style={tailwind.style('items-center')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#C9C9C9] font-areaNormal-extrabold text-[14px] leading-[17px] tracking-[-0.02px]',
                            )}>
                            {userLanguageStrings.EnterBusNumber}
                        </Animated.Text>
                        <BottomSheetInputComponent onBusNumberChange={onBusNumberChange} />
                        <Animated.View
                            layout={LinearTransition.springify().damping(34).stiffness(240)}
                            style={tailwind.style('pt-4 items-center px-6')}>
                            {busServiceType && (
                                <Animated.Text
                                    entering={FadeInDown}
                                    style={tailwind.style(
                                        'text-[#7E7E7E] uppercase font-departureMono-regular text-[18px] leading-[28px] tracking-[0.02px]',
                                    )}>
                                    {busServiceType}
                                </Animated.Text>
                            )}
                            {busStartPoint && busEndPoint ? (
                                <Animated.View entering={FadeInDown} style={tailwind.style('pt-4 flex-row gap-2')}>
                                    <Animated.Text
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[#7E7E7E] flex-1 text-right font-areaNormal-extrabold text-[14px] leading-[17px] tracking-[0.2px]',
                                        )}>
                                        {busStartPoint}
                                    </Animated.Text>
                                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <Rect width="20" height="20" rx="6" fill="#E6E6E6" />
                                        <Path
                                            d="M5.21094 7H13.6952"
                                            stroke="#656565"
                                            strokeWidth="1.22724"
                                            strokeMiterlimit="10"
                                        />
                                        <Path
                                            d="M11.2734 9.99711L14.1043 7.16628C14.1984 7.07219 14.1984 6.92492 14.1043 6.83083L11.2734 4"
                                            stroke="#656565"
                                            strokeWidth="1.22724"
                                            strokeMiterlimit="10"
                                        />
                                        <Path
                                            d="M14.9589 13H6.47461"
                                            stroke="#656565"
                                            strokeWidth="1.22724"
                                            strokeMiterlimit="10"
                                        />
                                        <Path
                                            d="M8.89651 10.0039L6.06568 12.8347C5.9716 12.9288 5.9716 13.0761 6.06568 13.1702L8.89651 16.001"
                                            stroke="#656565"
                                            strokeWidth="1.22724"
                                            strokeMiterlimit="10"
                                        />
                                    </Svg>
                                    <Animated.Text
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[#7E7E7E] flex-1 font-areaNormal-extrabold text-[14px] leading-[17px] tracking-[0.2px]',
                                        )}>
                                        {busEndPoint}
                                    </Animated.Text>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    </Animated.View>

                    <Pressable
                        testID="activate-ticket-button"
                        accessibilityRole="button"
                        accessibilityLabel={`Confirm Route Number button`}
                        style={tailwind.style('w-full px-6 pt-6 pb-5')}
                        {...handlers}
                        disabled={!isBusNumberValid}
                        onPress={() => handleConfirmRoute()}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    'h-[58px] rounded-[16px] gap-[12px] items-center justify-center flex-row  bg-[#C9C9C9]',
                                    isBusNumberValid ? 'bg-[#047AEA]' : 'bg-[#C9C9C9]',
                                ),
                                animatedStyle,
                            ]}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-white font-areaNormal-extrabold text-[15px] leading-[17px]',
                                )}>
                                {userLanguageStrings.ConfirmRouteNumber}
                            </Animated.Text>
                            <Icon icon={<DoubleArrowsWhite fill="" />} size={16} />
                        </Animated.View>
                    </Pressable>
                </BottomSheetView>
            </BottomSheet>
        </>
    );
};
