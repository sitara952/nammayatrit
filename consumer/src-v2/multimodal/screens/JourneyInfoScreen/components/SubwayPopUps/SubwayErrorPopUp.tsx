import { useNavigation } from '@react-navigation/native';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BodyView, PrimaryButton } from './Common';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectSubwayPopUpState, setHideLoader, setSubwayPopUpState } from '@/typescript/state/client/session';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const SubwayErrorPopUp = () => {
    const subwayPopUpState = useAppSelector(selectSubwayPopUpState);
    const popUpProps = subwayPopUpState?.popUpProps;
    const buttonProps = subwayPopUpState?.buttonProps;
    const visible = subwayPopUpState?.visible;
    const { subwayPopUpModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (visible) {
            subwayPopUpModalRef.current?.present();
        } else {
            subwayPopUpModalRef.current?.dismiss();
        }
    }, [visible, subwayPopUpModalRef.current]);

    const handleDismiss = useCallback(() => {
        dispatch(setHideLoader(false));
        dispatch(setSubwayPopUpState(undefined));
        subwayPopUpModalRef.current?.dismiss();
    }, [dispatch]);

    const buttonAction = useCallback(() => {
        try {
            if (buttonProps?.onPress) {
                buttonProps.onPress();
            }
        } catch (error) {
            console.error('Error in subway error pop-up button action:', error);
        } finally {
            handleDismiss();
        }
    }, [buttonProps?.onPress, navigation, handleDismiss]);

    const handleHardwareBackPress = useCallback(() => {
        handleDismiss();
        return true;
    }, [handleDismiss]);

    if (!visible || !popUpProps || !buttonProps) {
        return null;
    }

    return (
        <PopUpModal
            sheetRef={subwayPopUpModalRef}
            isScrollable={false}
            showBackdrop={undefined}
            onHardwareBackPress={handleHardwareBackPress}
            onDismiss={handleDismiss}
            enableDynamicSizing={true}>
            <Animated.View
                style={tailwind.style(
                    `px-[20px] pt-[14px] pb-[${bottom + 20}px] bg-[#ffffff] rounded-tl-[32px] rounded-tr-[32px]`,
                )}>
                <View
                    style={tailwind.style(
                        `bg-[${colors.CrossButton_bg}] w-[46px] h-[4px] rounded-[16px] self-center`,
                    )}></View>
                <Animated.View entering={FadeIn.duration(300)}>
                    <BodyView title={popUpProps.title} body={popUpProps.body} />
                    <PrimaryButton
                        title={buttonProps.title}
                        testId={buttonProps.testId}
                        onPress={buttonAction}
                        isLoading={false}
                        disabled={false}
                    />
                </Animated.View>
            </Animated.View>
        </PopUpModal>
    );
};
