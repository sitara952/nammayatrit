import { useCallback, useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import useDebounceBackPress from '../hooks/useDebounceBackPress';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '../tailwindTheme/tailwind';
import { selectAppConfig, selectAppReadableName } from '../state/client/session';
import { useAppSelector } from '../state/hooks';
import { useRefsContext } from '../context/RefsContext';
import { HelpAndSupportParamList, MainNavigationParamList } from '../navigation/globalParamList';
import Typography from '../designSystem/components/primitives/Typography';
import { useConfigContext } from '../context/ConfigContext';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import ChevronLeftIcon from '../components/common/ChevronLeftIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '../components/Icon';
import { RedirectIcon } from '@/src-v2/assets/svg/RedirectIcon';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const KaptureWebViewScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const config = useConfigContext();
    const userLanguageStrings = config.get('userLanguageStrings');
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'kaptureWebViewScreen'>>();
    const { goBack, url, ticketId } = route.params;
    const readableAppName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const image = appConfig.assets.appLogoUri;
    const { kaptureWebViewRef } = useRefsContext();
    const { bottom, top } = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(9);
    const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
    const [isPostLoadDelay, setIsPostLoadDelay] = useState(false);
    const loadEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleLoadStart = useCallback(() => {
        if (loadEndTimeoutRef.current) {
            clearTimeout(loadEndTimeoutRef.current);
            loadEndTimeoutRef.current = null;
        }
        setIsLoading(true);
        setLoadError(false);
        setLoadStartTime(Date.now());
        setRemainingSeconds(9);
        setIsPostLoadDelay(false);
    }, []);

    const handleLoadEnd = useCallback(() => {
        if (loadEndTimeoutRef.current) {
            clearTimeout(loadEndTimeoutRef.current);
        }
        // Transition to post-load delay countdown
        setIsPostLoadDelay(true);
        setRemainingSeconds(3);
    }, []);

    const handleLoadError = useCallback(() => {
        if (loadEndTimeoutRef.current) {
            clearTimeout(loadEndTimeoutRef.current);
            loadEndTimeoutRef.current = null;
        }
        setIsLoading(false);
        setLoadError(true);
        setIsPostLoadDelay(false);
    }, []);

    const handleRefresh = useCallback(() => {
        if (kaptureWebViewRef.current) {
            setIsLoading(true);
            setLoadError(false);
            kaptureWebViewRef.current.reload();
        }
    }, []);

    const onWebViewMessage = useCallback((event: WebViewMessageEvent) => {
        if (event?.nativeEvent?.data === 'CONTENT_READY') {
            setIsLoading(false);
        }
    }, []);

    const injectedContentReadyScript = `
        (function() {
            function reportReady() {
                try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('CONTENT_READY'); } catch (e) {}
            }
            document.addEventListener('DOMContentLoaded', function() {
                if (document.body && document.body.children && document.body.children.length > 0) reportReady();
            });
            window.addEventListener('load', function() {
                if (document.body && document.body.children && document.body.children.length > 0) reportReady();
            });
            try {
                var observer = new MutationObserver(function() {
                    if (document.body && document.body.children && document.body.children.length > 0) {
                        reportReady();
                        observer.disconnect();
                    }
                });
                observer.observe(document.documentElement || document, { childList: true, subtree: true });
            } catch (e) {}
        })();
        true;
    `;

    const onEndChat = useCallback(() => {
        if (goBack) {
            goBack();
        }

        navigation.goBack();
    }, [goBack, navigation]);

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

    // Countdown timer for loading overlay
    useEffect(() => {
        if (!isLoading || !loadStartTime) {
            return;
        }

        const intervalId = setInterval(() => {
            if (isPostLoadDelay) {
                // Post-load delay countdown
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        return 0;
                    }
                    return prev - 1;
                });
            } else {
                // Loading countdown based on elapsed time
                const elapsed = Math.floor((Date.now() - loadStartTime) / 1000);
                const remaining = Math.max(0, 9 - elapsed);
                setRemainingSeconds(remaining);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isLoading, loadStartTime, isPostLoadDelay]);

    useEffect(() => {
        return () => {
            if (loadEndTimeoutRef.current) {
                clearTimeout(loadEndTimeoutRef.current);
                loadEndTimeoutRef.current = null;
            }
        };
    }, []);

    return (
        <Animated.View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
            <Animated.View style={{ flex: 1, backgroundColor: colors.neutral100 }}>
                <Animated.View
                    style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <Pressable
                        testID="back-button-kapture-webview"
                        style={{ position: 'absolute', left: 16 }}
                        onPress={onEndChat}
                        accessibilityLabel="Go Back button"
                        accessibilityRole="button">
                        <ChevronLeftIcon />
                    </Pressable>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="app logo image"
                        source={{ uri: image }}
                        resizeMode="contain"
                        style={tailwind.style(
                            appConfig.appType === 'multimodal' ? 'size-[50px] mr-15' : 'w-[90px] h-[35px]',
                        )}
                    />
                </Animated.View>
                {ticketId && (
                    <Typography
                        type="body"
                        style={{ padding: 12 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.TicketID + ': ' + ticketId}
                    </Typography>
                )}
                {url ? (
                    <Animated.View style={{ flex: 1, position: 'relative' }}>
                        {Platform.OS === 'android' ? (
                            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'height'} keyboardVerticalOffset={50}>
                                <WebView
                                    ref={kaptureWebViewRef}
                                    source={{ uri: url }}
                                    onLoadStart={handleLoadStart}
                                    onLoadEnd={handleLoadEnd}
                                    onError={handleLoadError}
                                    cacheEnabled={true}
                                    startInLoadingState={false}
                                    style={{ flex: 1 }}
                                    onMessage={onWebViewMessage}
                                    injectedJavaScriptBeforeContentLoaded={injectedContentReadyScript}
                                />
                            </KeyboardAvoidingView>
                        ) : (
                            <WebView
                                ref={kaptureWebViewRef}
                                source={{ uri: url }}
                                onLoadStart={handleLoadStart}
                                onLoadEnd={handleLoadEnd}
                                onError={handleLoadError}
                                cacheEnabled={true}
                                startInLoadingState={false}
                                style={{ flex: 1 }}
                                onMessage={onWebViewMessage}
                                injectedJavaScriptBeforeContentLoaded={injectedContentReadyScript}
                            />
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <Icon icon={<RedirectIcon fill="#FFD870" />} size={108} color={'#FFD870'} />
                                    <Typography
                                        type="body-1"
                                        style={styles.redirectText}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.RedirectingIn + ' ' + remainingSeconds + 's...'}
                                    </Typography>
                                    <Typography
                                        type="body-1"
                                        style={styles.loadingText}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.PleaseWaitWhileWeConnectYouTo(readableAppName)}
                                    </Typography>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
                        <Typography
                            type="body-7"
                            style={[tailwind.style(`text-black mb-4 px-4 text-[20px] text-center`), { lineHeight: 25 }]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {loadError
                                ? userLanguageStrings.FailedToLoadContentPleaseCheckYourInternetConnection
                                : userLanguageStrings.Somethingwentwrong}
                        </Typography>

                        {isLoading && url && (
                            <Button
                                testID="kapture-retry-btn"
                                type="primary"
                                size="md"
                                style={[styles.button, { marginBottom: 16 }]}
                                text={userLanguageStrings.Retry}
                                onPress={handleRefresh}
                            />
                        )}

                        <Button
                            testID="kapture-go-back-btn"
                            type="secondary"
                            size="md"
                            style={styles.button}
                            text={userLanguageStrings.GoBack}
                            onPress={() => {
                                if (goBack) {
                                    goBack();
                                }
                                navigation.goBack();
                            }}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral100,
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
        justifyContent: 'space-between',
        height: 50,
        width: '100%',
    },
    refreshBody: {
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
    button: {
        alignSelf: 'center',
        width: '100%',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: colors.neutral100,
    },
    loadingContainer: {
        backgroundColor: colors.neutral100,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 200,
    },
    loadingText: {
        marginTop: 16,
        textAlign: 'center',
        color: colors.neutral700,
        marginHorizontal: 20,
    },
    redirectText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        color: colors.neutral900,
        fontWeight: '700',
    },
});

export default KaptureWebViewScreen;
