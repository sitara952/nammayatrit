import Button from '@/src-v2/primitives/Button';
import { Icon } from '@/typescript/components/Icon';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import colors from '@/typescript/designSystem/colorPalette';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { selectToken } from '@/typescript/state/client/auth';
import { selectAppConfig, selectRedbusWebviewUrl } from '@/typescript/state/client/session';
import { selectMobileNumber, setMbpermissionForRedbus, RedBusState } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { selectAppReadableName } from '../../../state/client/session';

const RedBusModal = () => {
    const { redbusWebviewRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const userToken = useAppSelector(selectToken);
    const mobileNumber = useAppSelector(selectMobileNumber);
    const redBusUrl = useAppSelector(selectRedbusWebviewUrl);
    const appName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const dispatch = useAppDispatch();

    const handleRedBusYes = () => {
        redbusWebviewRef.current?.close();
        dispatch(setMbpermissionForRedbus({ id: userToken, payload: RedBusState.Allow }));
        navigation.navigate('webView', {
            url: redBusUrl?.concat(`?mobileNo=${mobileNumber}`),
            goBack: undefined,
        });
    };

    const handleRedBusNo = () => {
        redbusWebviewRef.current?.close();
        dispatch(setMbpermissionForRedbus({ id: userToken, payload: RedBusState.Deny }));
        navigation.navigate('webView', {
            url: redBusUrl,
            goBack: undefined,
        });
    };

    return (
        <PopUpModal
            sheetRef={redbusWebviewRef}
            enableDynamicSizing={true}
            onHardwareBackPress={undefined}
            showBackdrop={undefined}
            isScrollable={false}>
            <Animated.View style={style.bottomSheetContent}>
                <Animated.View style={tailwind.style(`rounded-[50px] px-5 py-8`)}>
                    <Animated.View style={tailwind.style(`flex-row justify-between`)}>
                        <Animated.View style={tailwind.style(`flex-col justify-between pb-${token?.spacing?.[8]}`)}>
                            <Typography
                                style={tailwind.style('pb-[4px]')}
                                type="title-3"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.SharePhoneNoRedBus}
                            </Typography>
                        </Animated.View>
                        <Button
                            testID="home_redbus_modal_close"
                            type="secondary-inverse"
                            size="md"
                            style={style.closeBody}
                            onPress={() => {
                                redbusWebviewRef?.current?.close();
                            }}>
                            <Icon
                                icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                                style={style.closeIcon}
                                size={25}
                                color={themeColors.Button_Primary_Disabled_Fill_Base}
                            />
                        </Button>
                    </Animated.View>
                    <Animated.View style={style.nyRedbusImage}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="redbus banner image"
                            source={{ uri: appConfig.assets.redBusBannerUri }}
                            style={tailwind.style('w-70 h-[80px] ')}
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style(`pt-[${token?.spacing?.[10]}]`)}>
                        <Typography
                            style={tailwind.style('pb-[4px]')}
                            type="body-1"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.RedbusDescription(appName)}
                        </Typography>
                    </Animated.View>

                    <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[10]}]`)}>
                        <Button
                            testID="home_redbus_modal_allow"
                            type="primary"
                            text={userLanguageStrings.Allow}
                            onPress={handleRedBusYes}
                        />
                    </Animated.View>
                    <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[10]}]`)}>
                        <Button
                            testID="home_redbus_modal_deny"
                            type="secondary-inverse"
                            text={userLanguageStrings.Deny}
                            textColor="#5B6777"
                            style={style.denyButton}
                            onPress={handleRedBusNo}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </PopUpModal>
    );
};

const style = StyleSheet.create({
    nyRedbusImage: {
        alignItems: 'center',
        marginTop: 20,
    },
    denyButton: {
        backgroundColor: '#F1F2F7',
        justifyContent: 'center',
        color: '#5B6777',
    },
    closeBody: {
        borderColor: colors.primitive.gray?.[14],
        borderWidth: 1,
    },
    closeIcon: {
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    bottomSheetContent: {
        backgroundColor: '#F8F9FB',
        borderRadius: 20,
    },
});

export default RedBusModal;
