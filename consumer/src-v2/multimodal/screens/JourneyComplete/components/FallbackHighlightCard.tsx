import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useCallback, useRef, useState } from 'react';
import Animated, {
    Extrapolation,
    FadeIn,
    FadeOutRight,
    interpolate,
    LinearTransition,
    SensorType,
    SlideInRight,
    useAnimatedSensor,
    useAnimatedStyle,
    useReducedMotion,
    ZoomIn,
} from 'react-native-reanimated';
import mtIcBusSideView from '../../../../assets/3D-assets/mt_ic_bus_side_view.webp';
import mtIcMetroSideView from '../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcTrainSideView from '../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import mtIcGradientMask from '../../../../assets/mt_ic_gradient_mask.webp';
import { getIconFromType } from '../../../components/PublicTransportCard/PublicTransportCardUtils';
import { Icon } from '../../../components/common/Icon';
import { MetroIcon } from '../../../components/svg/transport';
import { Platform, View } from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { StaticJourneyHighlightCard } from './StaticSharedCard';
import { ShareWithFriendsButton } from './ShareWithFriendsButton';
import RNFS from 'react-native-fs';
import { FallbackHighlightCardProps, PublicMode } from '../types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const FallbackHighlightCard = (props: FallbackHighlightCardProps) => {
    const { mode, timeSaved, costSaved, journeyModes } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const appConfig = useAppSelector(selectAppConfig);

    const viewShotRef = useRef<ViewShot>(null);
    const [shareCardReady, setShareCardReady] = useState(false);

    const handleShare = useCallback(async () => {
        // Get current animated values from Reanimated (if possible)
        // Or, just use 0/defaults for a neutral snapshot
        setShareCardReady(true); // Show static share card in hidden ViewShot
        await new Promise(res => setTimeout(res, 350)); // Wait to render
        try {
            const uri = await viewShotRef.current?.capture?.();
            const filePath = `${RNFS.DocumentDirectoryPath}/imageCaptured.png`;
            if (Platform.OS === 'android') {
                await RNFS.moveFile(uri ?? '', filePath);
            }
            Share.open({
                urls: [Platform.OS === 'ios' ? (uri ?? '') : `file://${filePath}`],
                type: 'image/png',
                message: `${userLanguageStrings.CheckOutMyJourneyCompleteCard}\n\n${userLanguageStrings.DownloadAppFrom(appConfig.textConfig.appReadableName)} \n${Platform.OS === 'ios' ? 'https://apps.apple.com/in/app/namma-yatri-ride-booking-app/id1637429831' : 'https://play.google.com/store/apps/details?id=in.juspay.nammayatri'}`,
            })
                .catch(e => {
                    console.error(e);
                })
                .then(() => {});
        } catch (e) {
            // Fallback: Share text
            console.error(e);
        }
        setShareCardReady(false);
    }, [viewShotRef, appConfig]);

    return (
        <>
            <Animated.View
                style={tailwind.style('mx-6 flex-1 rounded-[32px] items-center mt-6', {
                    backgroundColor: themeColors.share_card_bg_color,
                })}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="app logo image"
                    source={{ uri: appConfig.uiConfig.shareRideCardConfig.shareRideGoldIconUri }}
                    style={
                        appConfig.appType === 'multimodal'
                            ? tailwind.style('w-[88px] h-[81px] -mt-[20px]')
                            : tailwind.style('w-[158px] h-[91px] -mt-[25px]')
                    }
                />
                <Animated.View style={tailwind.style('pt-20 pb-40')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[17px] font-areaNormal-extrabold leading-[23px] -tracking-[0.38px] text-center text-[#FFFFFF]',
                        )}>
                        Thank you for using
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[17px] font-areaNormal-extrabold leading-[23px] -tracking-[0.38px] text-center text-[#FFFFFF] mt-1',
                        )}>
                        Public Transport
                    </Animated.Text>
                    <Animated.View style={tailwind.style('flex-row items-center justify-center mt-4')}>
                        {journeyModes.map((mode, index) => {
                            return (
                                <Animated.View
                                    entering={ZoomIn.delay(index * 300)
                                        .delay(150)
                                        .springify()
                                        .stiffness(250)
                                        .damping(28)}
                                    key={`journey-mode-${index}`}
                                    style={tailwind.style('flex-row items-center gap-1')}>
                                    {index > 0 && (
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[#FFFFFF] text-[20px] leading-[24px] font-areaNormal-semibold ml-1',
                                            )}>
                                            +
                                        </Animated.Text>
                                    )}
                                    {mode === 'metro' ? (
                                        <Icon icon={<MetroIcon />} size={24} color="#FFFFFF" />
                                    ) : (
                                        <Icon icon={getIconFromType(mode, 24, '#FFFFFF')} />
                                    )}
                                </Animated.View>
                            );
                        })}
                    </Animated.View>
                </Animated.View>
                <AnimatedCardBackground mode={mode} />
            </Animated.View>
            <ShareWithFriendsButton onShareWithFriends={handleShare} />
            {shareCardReady && (
                <View style={tailwind.style('opacity-0')}>
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                        <StaticJourneyHighlightCard
                            mode={mode}
                            timeSaved={timeSaved}
                            costSaved={costSaved}
                            journeyModes={journeyModes}
                            isFallback={true}
                        />
                    </ViewShot>
                </View>
            )}
        </>
    );
};

const ROTATE_Y_MAX = 0.2; // Max value of y for full rotation (tweak as needed)
const THRESHOLD = 0.01; // Ignore noise

const AnimatedCardBackground = (props: { mode: PublicMode | undefined }) => {
    const { mode } = props;

    const { sensor, isAvailable } = useAnimatedSensor(SensorType.ROTATION, {
        interval: 'auto',
    });
    console.info(isAvailable);
    const reduceMotion = useReducedMotion();

    const animatedImagePositionStyle = useAnimatedStyle(() => {
        if (!(isAvailable && !reduceMotion)) {
            return {
                transform: [{ translateY: 165 }, { rotate: '0deg' }, { translateX: -105 }],
            };
        }

        // Always access sensor.sensor.value inside animatedStyle
        const { qy } = sensor.value;

        // Only use significant values
        const y = Math.abs(qy) > THRESHOLD ? Math.max(Math.min(qy, ROTATE_Y_MAX), -ROTATE_Y_MAX) : 0;

        // Interpolate y to rotation from 0 to -30deg
        const rotate = interpolate(
            y,
            [0, -ROTATE_Y_MAX], // y from 0 to -0.2
            [0, -4], // degrees: 0deg to -30deg
            Extrapolation.CLAMP,
        );

        return {
            transform: [{ translateY: 135 }, { rotate: `${rotate}deg` }, { translateX: -105 }],
        };
    });

    const animatedTransitModePositionStyle = useAnimatedStyle(() => {
        if (!(isAvailable && !reduceMotion)) {
            return {
                transform: [{ translateX: 0 }],
            };
        }

        // Always access sensor.sensor.value inside animatedStyle
        const { qy } = sensor.value;

        // Only use significant values
        const y = Math.abs(qy) > THRESHOLD ? Math.max(Math.min(qy, ROTATE_Y_MAX), -ROTATE_Y_MAX) : 0;

        // Interpolate y to translation from 0 to 60px for more significant movement
        const translateX = interpolate(
            y,
            [-ROTATE_Y_MAX, ROTATE_Y_MAX], // y from -0.2 to 0.2
            [-8, 8], // pixels: -60px to 60px
            // Extrapolation.CLAMP,
        );

        return {
            transform: [{ translateX }, { scaleX: -1 }],
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify()}
            style={tailwind.style('absolute inset-0 overflow-hidden rounded-[32px]')}>
            <Animated.Image
                accessible={false}
                entering={FadeIn.delay(250).duration(1000)}
                source={mtIcGradientMask}
                style={[tailwind.style('absolute w-[404.61px] h-[472.24px]'), animatedImagePositionStyle]}
            />
            {mode === 'train' && (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="train side view image"
                    entering={SlideInRight.delay(100)}
                    exiting={FadeOutRight.duration(100)}
                    resizeMode={'contain'}
                    source={mtIcTrainSideView}
                    style={[
                        tailwind.style('absolute -bottom-0.5 left-1/3 w-[400px]  h-[95px]'),
                        { aspectRatio: 1524 / 396 },
                        animatedTransitModePositionStyle,
                    ]}
                />
            )}
            {mode === 'bus' && (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus side view image"
                    entering={SlideInRight.delay(100)}
                    exiting={FadeOutRight.duration(100)}
                    resizeMode={'contain'}
                    source={mtIcBusSideView}
                    style={[
                        tailwind.style('absolute -bottom-1 left-1/5 w-[400px]  h-[95px]'),
                        { aspectRatio: 908 / 347 },
                        animatedTransitModePositionStyle,
                    ]}
                />
            )}
            {mode === 'metro' && (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="metro side view image"
                    entering={SlideInRight.delay(100)}
                    exiting={FadeOutRight.duration(100)}
                    resizeMode={'contain'}
                    source={mtIcMetroSideView}
                    style={[
                        tailwind.style('absolute -bottom-0 left-1/3 w-[400px]  h-[95px]'),
                        { aspectRatio: 1446 / 363 },
                        animatedTransitModePositionStyle,
                    ]}
                />
            )}
        </Animated.View>
    );
};
