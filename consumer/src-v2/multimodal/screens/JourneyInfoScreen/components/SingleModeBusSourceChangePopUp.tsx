import React, { useCallback } from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../../../../primitives/Pressable';
import { Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import CloseIcon from '@/typescript/components/svg/CloseIcon.tsx';
import busUserAtSourceZone from '@/src-v2/assets/bus-user-at-source-zone.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type SingleModeBusSourceChangePopUpProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    sourceStopName: string | undefined;
    routeNumber: string | undefined;
    handleOnConfirm: () => void | undefined;
};

const SingleModeBusSourceChangePopUp: React.FC<SingleModeBusSourceChangePopUpProps> = ({
    visible,
    setVisible,
    handleOnConfirm,
    routeNumber,
    sourceStopName,
}) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const onConfirm = () => {
        if (handleOnConfirm) {
            handleOnConfirm();
        }
        setVisible(false);
    };

    const onClose = useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    const handleHardwareBackPress = () => {
        onConfirm();
        return true;
    };

    return (
        <AnimatedModal
            visible={visible}
            setVisible={setVisible}
            onClose={onClose}
            onHardwareBackPress={handleHardwareBackPress}
            allowCloseOnBackdropPress={true}
            animationDuration={300}
            contentStyle={tailwind.style('rounded-t-[20px]', {
                paddingBottom: bottom,
            })}>
            <Animated.View style={tailwind.style('px-4 py-6 items-center relative w-full')}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close button"
                    style={tailwind.style(
                        'absolute top-4 right-4 w-[32px] h-[32px] rounded-full bg-[#E5E5E5] items-center justify-center shadow-sm',
                    )}
                    onPress={onConfirm}
                    testID="close-modal-button">
                    <CloseIcon width={16} height={16} color="#3B3A3C" />
                </Pressable>

                <Animated.View style={tailwind.style('mb-6 mt-6')}>
                    <Image
                        accessible={true}
                        accessibilityLabel="bus user at source zone image"
                        source={busUserAtSourceZone}
                        style={tailwind.style('w-[270px] h-[149px]')}
                        resizeMode="contain"
                    />
                    <View style={tailwind.style('w-full h-[1px] bg-[#000000] mt-2')} />
                </Animated.View>

                <Animated.Text
                    style={tailwind.style('text-[19px] text-[#313131] text-center mb-2 font-areaNormal-extrabold')}>
                    {userLanguageStrings.SourceStopSwitched}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style(
                        'text-[14px] text-[#3B3A3C] text-center mb-6 font-areaNormal-extrabold leading-[28px] tracking-[0.2px] px-4',
                    )}>
                    {userLanguageStrings.RouteDoesntStopAtNearest(routeNumber || '', sourceStopName || '')}
                </Animated.Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Confirm Source Stop button"
                    style={tailwind.style(
                        'bg-[#3B3A3C] rounded-[12px] py-4 w-full h-[57px] items-center justify-center',
                    )}
                    onPress={onConfirm}
                    testID="confirm-source-stop">
                    <Animated.Text
                        style={tailwind.style(
                            'text-white text-[15px] font-areaNormal-extrabold tracking-[0.2px] leading-[19px]',
                        )}>
                        {userLanguageStrings.ConfirmSourceStop}
                    </Animated.Text>
                </Pressable>
            </Animated.View>
        </AnimatedModal>
    );
};

export default SingleModeBusSourceChangePopUp;
