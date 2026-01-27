import colors from '../../designSystem/colorPalette';
import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    useWindowDimensions,
    AccessibilityInfo,
    ImageSourcePropType,
    NativeModules,
    Platform,
} from 'react-native';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import Animated, { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated';
import ForwardArrow from '../../components/svg/ForwardArrow';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EventName, logEvent } from '@/typescript/utils/logger';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { logger } from '@/src-v2/systems/logger';
import { events, EventType } from '@/src-v2/systems/events/events';
import { useAppDispatch, useAppSelector } from '../../state/hooks';

import { tailwind } from '@/typescript/tailwindTheme/tailwind';

import {
    selectAppName,
    selectAppBasedOnboarding,
    setUtmParams,
    UtmParams,
    setToastProps,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { OnboardingNavigationParamList } from '@/typescript/navigation/globalParamList';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { MultimodalOnboarding } from './components/MultimodalOnboarding';
import { useProfileMarketingEventsPostMutation } from '@/api/integrations/rtk/ProfileMarketingEventsPost';
import { getBoolItem, MMKVKey, setBoolItem } from '@/typescript/utils/MMKV';
import { recordCampaignMetric } from '@/typescript/utils/marketingTracking';
import NewOnboarding from '@/src-v2/multimodal/screens/NewOnboarding/NewOnboarding';
import { VERSION } from '../../../version';
import { useStatusBarColor } from '@/src-v2/hooks/useStatusbarcolor';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const { InstallReferrer } = NativeModules;
interface CarouselItemProps {
    item: {
        image: ImageSourcePropType | undefined;
        title: string;
        description: string;
    };
}

function CarouselItemCentered({ item }: CarouselItemProps): React.JSX.Element {
    return (
        <View style={styles.carouselItem}>
            <View style={[styles.eduCarousal]}>
                <Image
                    source={item.image}
                    style={styles.carouselImage}
                    accessible={true}
                    accessibilityLabel="onboarding carousel item image"
                />
            </View>
            <View style={styles.eduCarousalContainer}>
                <Text style={[styles.carouselTitle, { textAlign: 'center' }]}>{item.title}</Text>
                <Text style={[styles.carouselDescription, { textAlign: 'center' }]}>{item.description}</Text>
            </View>
        </View>
    );
}

function CarouselItemDefault({ item }: CarouselItemProps): React.JSX.Element {
    return (
        <View style={styles.carouselItem}>
            <View style={[styles.eduCarousal]}>
                <Image
                    source={item.image}
                    style={styles.carouselImage}
                    accessible={true}
                    accessibilityLabel="onboarding carousel item image"
                />
            </View>
            <View style={styles.eduCarousalContainer}>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>
            </View>
        </View>
    );
}

interface GettingStartedCarouselProps {
    navigation: NativeStackNavigationProp<OnboardingNavigationParamList>;
}

function GettingStartedCarousel({ navigation }: GettingStartedCarouselProps): React.JSX.Element {
    useStatusBarColor(true);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppName);
    const appConfig = useAppSelector(selectAppConfig);

    const carouselItems = appConfig.screenConfig.gettingStartedCarouselScreenConfig.gettingStartedCarousalConfig;

    const windowWidth = useWindowDimensions().width;
    const { bottom } = useSafeAreaInsets();
    const scrollOffsetValue = useSharedValue<number>(0);
    const [isAutoPlay] = React.useState<boolean>(true);
    const [isFast] = React.useState<boolean>(false);
    const [isPagingEnabled] = React.useState<boolean>(true);
    const currentPageIndex = useSharedValue<number>(0);
    const dispatch = useAppDispatch();
    const [postCall] = useProfileMarketingEventsPostMutation();
    const [_, setLogoClickCount] = React.useState<number>(0);
    const utmParamsRef = React.useRef<UtmParams | null>(null);

    const handleLogoClick = () => {
        setLogoClickCount(prev => {
            const next = prev + 1;
            if (next >= 10) {
                handleGetStartedButtonLongPress(utmParamsRef.current);
                return 0;
            }
            return next;
        });
    };

    useEffect(() => {
        const getUtmRefer = async () => {
            try {
                const data = await InstallReferrer.getReferrerDetails();

                // Map campaignId from utm_campaign or id (from native)
                const campaignId = data.utm_campaign || data.id || data.campaignId;
                const utmData: UtmParams = {
                    ...data,
                    campaignId: campaignId,
                };
                utmParamsRef.current = utmData;

                if (!(utmData.gclid || (utmData.utm_medium !== 'organic' && utmData.utm_source !== 'google-play'))) {
                    setBoolItem(MMKVKey.UTM_DATA_SEND, true);
                    return;
                }

                if (campaignId) {
                    recordCampaignMetric(campaignId, 'installs');
                }

                postCall({
                    body: {
                        marketingParams: {
                            gclId: utmData.gclid,
                            userType: 'NEW',
                            utmCampaign: utmData.utm_campaign || utmData.campaignId,
                            utmContent: utmData.utm_content,
                            utmCreativeFormat: utmData.utm_creative_format,
                            utmMedium: utmData.utm_medium,
                            utmSource: utmData.utm_source,
                            utmTerm: utmData.utm_term,
                            appName: appName,
                        },
                        merchantName: appName,
                    },
                });
                dispatch(setUtmParams(utmData));
            } catch (e) {
                logger.logError(`Fetching Utm params - ${e}`, 'Onboarding');
            }
        };
        const isUtmDataSend = getBoolItem(MMKVKey.UTM_DATA_SEND) ?? false;
        if (!isUtmDataSend && Platform.OS === 'android') getUtmRefer();
    }, []);

    const baseOptions = {
        vertical: false,
        width: windowWidth,
    } as const;

    const renderItemCentered = ({ item }: { item: CarouselItemProps['item'] }) => {
        return <CarouselItemCentered item={item} />;
    };

    const renderItemDefault = ({ item }: { item: CarouselItemProps['item'] }) => {
        return <CarouselItemDefault item={item} />;
    };

    useEffect(() => {
        events.markFirstScreenRender(EventType.ON_CREATE_TO_ONBOARDING);
    }, []);

    const renderCenteredUI = () => {
        return (
            <View style={[styles.mainContainer]}>
                <TouchableWithoutFeedback
                    accessibilityRole="button"
                    onPress={handleLogoClick}
                    testID="onboarding_logo_click1">
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="about app logo image"
                        source={{ uri: 'about_app_logo' }}
                        style={[styles.carouselLogo]}
                    />
                </TouchableWithoutFeedback>
                <View
                    style={tailwind.style(`flex-1 justify-center items-center`)}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants">
                    <Carousel
                        {...baseOptions}
                        loop
                        enabled
                        defaultScrollOffsetValue={scrollOffsetValue}
                        autoPlay={isAutoPlay}
                        autoPlayInterval={isFast ? 100 : 2000}
                        scrollAnimationDuration={800}
                        onProgressChange={currentPageIndex}
                        data={carouselItems}
                        pagingEnabled={isPagingEnabled}
                        renderItem={renderItemCentered}
                    />
                </View>
                <View style={[styles.centeredFooter, { paddingBottom: bottom - 16 }]}>
                    <View
                        style={styles.paginationContainer}
                        accessibilityElementsHidden={true}
                        importantForAccessibility="no-hide-descendants">
                        <Pagination.Custom
                            progress={currentPageIndex}
                            data={carouselItems}
                            size={8}
                            dotStyle={{
                                borderRadius: 16,
                                backgroundColor: '#B2B9C7',
                            }}
                            activeDotStyle={{
                                borderRadius: 8,
                                width: 20,
                                height: 8,
                                overflow: 'hidden',
                                backgroundColor: '#14171F',
                            }}
                            containerStyle={{
                                gap: 5,
                                marginBottom: 20,
                                alignItems: 'center',
                                height: 10,
                            }}
                            horizontal
                            customReanimatedStyle={(progress: number, index: number, length: number) => {
                                const adjustedVal =
                                    index === 0 && progress > length - 1
                                        ? Math.abs(progress - length)
                                        : Math.abs(progress - index);

                                return {
                                    transform: [
                                        {
                                            translateY: interpolate(adjustedVal, [0, 1], [0, 0], Extrapolation.CLAMP),
                                        },
                                    ],
                                };
                            }}
                        />
                    </View>
                    <View style={styles.centeredButtonContainer}>
                        <Button
                            type="primary"
                            text={userLanguageStrings.GetStarted}
                            accessibilityRole="button"
                            testID="onboarding_get_started_centered"
                            style={[
                                styles.centeredButton,
                                tailwind.style(`bg-[${themeColors.Button_primary_default_fill_base}]`),
                            ]}
                            onPress={handleGetStartedButton}></Button>
                    </View>
                </View>
            </View>
        );
    };

    const renderDefaultUI = () => {
        return (
            <View style={[styles.mainContainer]}>
                <TouchableWithoutFeedback
                    accessibilityRole="button"
                    onPress={handleLogoClick}
                    testID="onboarding_logo_click">
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="about app logo image"
                        source={{ uri: 'about_app_logo' }}
                        style={[styles.carouselLogo]}
                    />
                </TouchableWithoutFeedback>
                <View
                    style={tailwind.style(`flex-1 justify-center items-center`)}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants">
                    <Carousel
                        {...baseOptions}
                        loop
                        enabled
                        defaultScrollOffsetValue={scrollOffsetValue}
                        autoPlay={isAutoPlay}
                        autoPlayInterval={isFast ? 100 : 2000}
                        scrollAnimationDuration={800}
                        onProgressChange={currentPageIndex}
                        data={carouselItems}
                        pagingEnabled={isPagingEnabled}
                        renderItem={renderItemDefault}
                    />
                </View>
                <View style={[styles.eduFooter, { paddingBottom: bottom }]}>
                    <View
                        style={styles.paginationContainer}
                        accessibilityElementsHidden={true}
                        importantForAccessibility="no-hide-descendants">
                        <Pagination.Custom
                            progress={currentPageIndex}
                            data={carouselItems}
                            size={8}
                            dotStyle={{
                                borderRadius: 16,
                                backgroundColor: '#B2B9C7',
                            }}
                            activeDotStyle={{
                                borderRadius: 8,
                                width: 20,
                                height: 8,
                                overflow: 'hidden',
                                backgroundColor: '#14171F',
                            }}
                            containerStyle={{
                                gap: 5,
                                marginBottom: 10,
                                alignItems: 'center',
                                height: 10,
                            }}
                            horizontal
                            customReanimatedStyle={(progress: number, index: number, length: number) => {
                                const adjustedVal =
                                    index === 0 && progress > length - 1
                                        ? Math.abs(progress - length)
                                        : Math.abs(progress - index);

                                return {
                                    transform: [
                                        {
                                            translateY: interpolate(adjustedVal, [0, 1], [0, 0], Extrapolation.CLAMP),
                                        },
                                    ],
                                };
                            }}
                        />
                    </View>
                    <View
                        style={[
                            styles.rightView,
                            tailwind.style(`bg-[${themeColors.Button_primary_default_fill_base}]`),
                        ]}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="onboarding_get_started"
                            style={[
                                styles.rightView,
                                tailwind.style(`bg-[${themeColors.Button_primary_default_fill_base}]`),
                            ]}
                            onPress={handleGetStartedButton}>
                            <Text
                                style={{
                                    color: themeColors.Button_Primary_Default_Text_Base,
                                    paddingTop: 3,
                                    fontSize: 14,
                                    fontWeight: '700',
                                    marginRight: 5,
                                }}>
                                {userLanguageStrings.GetStarted}
                            </Text>
                            <ForwardArrow fill={themeColors.Button_Primary_Default_Text_Base} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderEduContent = () => {
        return appConfig.screenConfig.gettingStartedCarouselScreenConfig.showCenteredGetStartedButton
            ? renderCenteredUI()
            : renderDefaultUI();
    };

    const handleGetStartedButton = () => {
        logEvent(EventName.NY_USER_GET_STARTED);
        navigation.navigate('LoginScreen');
    };

    const handleGetStartedButtonLongPress = (params: UtmParams | null = null) => {
        dispatch(
            setToastProps({
                visible: true,
                message:
                    'Bundle Version - ' +
                    (VERSION || '--') +
                    '\n\n' +
                    (params ? JSON.stringify(params, null, 2) : 'No UTM Params'),
                backgroundColor: '#374151',
                autoDismissAfter: undefined,
                logo: undefined,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                customToast: undefined,
                margin: undefined,
            }),
        );
    };

    const onboardingType = useAppSelector(selectAppBasedOnboarding);

    useEffect(() => {
        AccessibilityInfo.announceForAccessibility(`Welcome Screen`);
    }, []);

    const handleGetStartedButtonNammaTransit = React.useCallback(() => {
        logEvent(EventName.NY_USER_GET_STARTED);
        navigation.navigate('LoginScreen');
    }, [navigation]);

    return (
        <>
            {onboardingType === 'MULTIMODAL' ? (
                <MultimodalOnboarding
                    onPressGetStartedButton={handleGetStartedButton}
                    onLongPressGetStartedButton={() => handleGetStartedButtonLongPress()}
                />
            ) : onboardingType === 'NAMMA_TRANSIT' ? (
                <NewOnboarding onPressGetStartedButton={handleGetStartedButtonNammaTransit} />
            ) : onboardingType === 'NO_MULTIMODAL' ? (
                <SafeAreaView style={styles.parentContainer}>{renderEduContent()}</SafeAreaView>
            ) : (
                <SafeAreaView style={styles.parentContainer}>{renderEduContent()}</SafeAreaView>
            )}
        </>
    );
}

export default GettingStartedCarousel;

const styles = StyleSheet.create({
    carouselItem: {
        flex: 1,
    },
    carouselLogo: {
        height: 100,
        width: '50%',
        marginTop: 50,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    eduCarousal: {
        flex: 3,
        maxHeight: '79%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eduCarousalContainer: {
        flex: 1,
        paddingTop: 24,
    },
    parentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mainContainer: {
        flex: 1,
    },
    carouselImage: {
        width: 350,
        height: 350,
        resizeMode: 'contain',
    },
    carouselTitle: {
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '800',
        color: colors?.primitive?.black?.[2],
        paddingHorizontal: 20,
        paddingVertical: 5,
        textAlign: 'left',
        fontFamily: 'Area Normal',
    },
    carouselDescription: {
        fontFamily: 'Area Normal',
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '600',
        color: colors?.recovered?.greyHigh,
        paddingHorizontal: 20,
        paddingVertical: 5,
        textAlign: 'left',
    },
    eduFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        marginBottom: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        flex: 2,
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
    },
    paginationButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 10,
        borderRadius: 20,
        // marginHorizontal: 4,
    },
    activeButton: {
        backgroundColor: '#2C2F3A',
        width: 20,
        height: 10,
        borderRadius: 25,
    },
    rightView: {
        padding: 8,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredFooter: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    centeredButtonContainer: {
        width: '100%',
        paddingBottom: 20,
    },
    centeredButton: {
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
