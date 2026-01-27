import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { MultimodalConfirmationModal } from './Iternary/MultimodalConfirmationModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const ExitStation = ({
    onPress,
    isNextLegTransit,
    mode,
}: {
    onPress: () => void;
    isNextLegTransit: boolean | undefined;
    mode: MultimodalTravelMode_multimodalTravelMode;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const exitMetroConfirmation = useRef<BottomSheetModal>(null);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const getExitText = () => {
        if (mode === 'Subway') {
            return isNextLegTransit
                ? userLanguageStrings.IveArrivedSwitchTrain
                : userLanguageStrings.IveArrivedExitStation;
        }
        return isNextLegTransit ? userLanguageStrings.IveArrivedSwitchMetro : userLanguageStrings.IveArrivedExitMetro;
    };
    return (
        <>
            <Pressable
                testID="switch-to-auto-button"
                onPress={() => {
                    exitMetroConfirmation.current?.present();
                }}
                accessibilityLabel="Exit metro button"
                accessibilityRole="button"
                style={tailwind.style('px-[24px]')}
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'bg-[#F4F4F4] h-[57px] flex-row items-center gap-[8px] justify-center rounded-2xl',
                        ),
                        animatedStyle,
                    ]}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style('text-[15px] font-areaNormal-extrabold tracking-[0.2px] text-[#3B3A3C]')}>
                        {getExitText()}
                    </Animated.Text>
                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <Path
                            d="M12.0703 7.34668L12.7578 7.99902L12.0703 8.65137L7.18262 13.2949L6.5625 12.6416L5.94336 11.9893L9.19727 8.89844H2.16406V7.09863H9.19629L5.94336 4.00781L6.5625 3.35547L7.18262 2.70312L12.0703 7.34668Z"
                            fill="#3B3A3C"
                        />
                    </Svg>
                </Animated.View>
            </Pressable>
            <MultimodalConfirmationModal
                ref={exitMetroConfirmation}
                onConfirm={() => {
                    onPress();
                    exitMetroConfirmation.current?.dismiss();
                }}
                onCancel={() => {
                    exitMetroConfirmation.current?.dismiss();
                }}
                heading={userLanguageStrings.ExitMetro}
                description={userLanguageStrings.YourCurrentModeWillBeSkipped}
                primaryButtonText={userLanguageStrings.Exit}
                secondaryButtonText={userLanguageStrings.Cancel}
                accessibilityRef={undefined}
                onModalContentReady={undefined}
            />
        </>
    );
};
