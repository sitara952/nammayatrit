import refresh from '../assets/refresh.webp';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import colors from '../designSystem/colorPalette';
import { useNavigation } from '@react-navigation/native';
import { tailwind } from '../tailwindTheme/tailwind';
import Button from '@/src-v2/primitives/Button';
import CloseIcon from '../components/svg/CloseIcon';
import { Icon } from '../components/Icon';
import { useAppSelector } from '../state/hooks';
import { useRefsContext } from '../context/RefsContext';
import { Platform } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import useDebounceBackPress from '../hooks/useDebounceBackPress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { selectAppConfig } from '../state/client/session';

const WebViewScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const appConfig = useAppSelector(selectAppConfig);
    const route = useRoute();
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    const { url, goBack } = route.params as { url: string; goBack: (() => void) | undefined };
    const { redbusStateWebviewRef } = useRefsContext();
    const image = appConfig.assets.appLogoUri;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const handleRefresh = () => {
        if (redbusStateWebviewRef.current) {
            redbusStateWebviewRef.current.reload();
        }
    };

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(
        () => {
            if (goBack) {
                goBack();
            }
            navigation.goBack();
            return true;
        },
        1000,
        [navigation, goBack],
    );

    return (
        <Animated.View style={styles.container}>
            <Animated.View style={[styles.header, Platform.OS === 'ios' ? { marginTop: 50 } : {}]}>
                <Button
                    testID="webview_close"
                    type="secondary-inverse"
                    size="md"
                    style={styles.backButton}
                    onPress={() => {
                        if (goBack) {
                            goBack();
                        }
                        navigation.goBack();
                    }}>
                    <Icon
                        icon={<CloseIcon height={12} width={12} color={undefined} />}
                        style={styles.closeIcon}
                        size={20}
                        color={themeColors.Button_Primary_Disabled_Fill_Base}
                    />
                </Button>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="app logo image"
                    source={{ uri: image }}
                    style={tailwind.style('w-[60px] h-[21px]')}
                />
                <Animated.View style={styles.refreshBody}>
                    <Button
                        testID="webview_refresh"
                        type="secondary-inverse"
                        size="md"
                        style={styles.refreshButton}
                        onPress={handleRefresh}>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="refresh image"
                            source={refresh}
                            style={tailwind.style('w-[22px] h-[22px]')}
                        />
                    </Button>
                </Animated.View>
            </Animated.View>
            <WebView ref={redbusStateWebviewRef} source={{ uri: url }} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    body: {
        marginHorizontal: 24,
        alignItems: 'center',
        marginTop: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 35,
        width: '100%',
        backgroundColor: '#fff',
    },
    backButton: {
        marginHorizontal: 16,
        width: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 25,
        borderColor: colors.primitive.gray?.[14],
        borderWidth: 1,
        borderRadius: 50,
    },
    refreshBody: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    refreshButton: {
        marginHorizontal: 16,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        height: 25,
    },
    closeIcon: {
        borderColor: '#E0E3E8',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: 10,
        height: 10,
    },
});

export default WebViewScreen;
