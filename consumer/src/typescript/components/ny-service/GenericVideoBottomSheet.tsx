import { VideoPlayer } from '../../../../src-v2/components/VideoPlayer/VideoPlayer';
import { Icon } from '../../../../src-v2/multimodal/components/common/Icon';
import { AutoIcon } from '../../../../src-v2/multimodal/components/svg/transport/AutoIcon';
import { MetroIcon } from '../../../../src-v2/multimodal/components/svg/transport/MetroIcon';
import { VideoBottomSheetConfig } from '../../../../src-v2/systems/configs/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { VideoRef } from 'react-native-video';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import NammaTransitBufferImg from '../../assets/namma_transit_buffer.webp';
import colors from '../../designSystem/colorPalette';
import { useScaleAnimation } from '../../utils/useScaleAnimation';
import { PopUpModal } from '../PopUpModal';
import { LottieWithFallback } from '../common/LottieWithFallback';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GenericVideoBottomSheetProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    config: VideoBottomSheetConfig;
    onButtonPress?: () => void;
}

// Icon component mapping
const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return undefined;

    switch (iconName) {
        case 'AutoIcon':
            return <AutoIcon />;
        case 'MetroIcon':
            return <MetroIcon />;
        default:
            return undefined;
    }
};

// Fallback image mapping
const getFallbackImage = (imageName: string | undefined) => {
    switch (imageName) {
        case 'namma_transit_buffer.webp':
        default:
            return NammaTransitBufferImg;
    }
};

export const GenericVideoBottomSheet: React.FC<GenericVideoBottomSheetProps> = ({
    sheetRef,
    config,
    onButtonPress: customOnButtonPress,
}) => {
    const videoRef = useRef<VideoRef>(null);
    const { handlers, animatedStyle } = useScaleAnimation();
    const isVideoPaused = false;
    const [isVideoMuted, setIsVideoMuted] = useState(config.media?.muted || false);

    const handleClose = useCallback(() => {
        sheetRef.current?.dismiss();
    }, [sheetRef]);

    const handleButtonPress = useCallback(() => {
        if (customOnButtonPress) {
            customOnButtonPress();
        } else {
            handleClose();
        }
    }, [customOnButtonPress, handleClose]);

    // Don't render if config is disabled
    if (!config.enabled) {
        return null;
    }

    const fallbackImage = getFallbackImage(config.media?.fallbackImageUrl);
    const isVideoMode = config.media?.type === 'video';
    const isLottieMode = config.media?.type === 'lottie';
    const hasIcons = config.icons && (config.icons.leftIcon || config.icons.rightIcon);
    const hasTitle = !!config.title;
    const hasButton = !!config.buttonText;

    return (
        <PopUpModal
            showHandle={false}
            sheetRef={sheetRef}
            isScrollable={false}
            showBackdrop={true}
            enableDynamicSizing={true}
            snapPoints={undefined}
            onHardwareBackPress={handleClose}
            borderRadius={36}>
            <View
                style={[
                    styles.container,
                    !hasButton && styles.containerNoButton,
                    !hasTitle && !hasIcons && styles.containerMinimal,
                ]}>
                {/* Icons Row - Only show if icons are configured */}
                {hasIcons && (
                    <View style={tailwind.style('flex-row items-center gap-x-2 mt-6')}>
                        {config.icons?.leftIcon && (
                            <View
                                style={[
                                    tailwind.style('rounded-[12.8px] p-2'),
                                    { backgroundColor: config.icons.leftIcon.backgroundColor },
                                ]}>
                                {(() => {
                                    const iconComponent = getIconComponent(config.icons.leftIcon.component);
                                    return iconComponent ? (
                                        <Icon icon={iconComponent} size={20} color={config.icons.leftIcon.iconColor} />
                                    ) : null;
                                })()}
                            </View>
                        )}

                        {config.icons?.showPlusSign && config.icons?.leftIcon && config.icons?.rightIcon && (
                            <Text style={tailwind.style('text-[#7E7E7E] text-[16px] font-bold')}> + </Text>
                        )}

                        {config.icons?.rightIcon && (
                            <View
                                style={[
                                    tailwind.style('rounded-[12.8px] p-2'),
                                    { backgroundColor: config.icons.rightIcon.backgroundColor },
                                ]}>
                                {(() => {
                                    const iconComponent = getIconComponent(config.icons.rightIcon.component);
                                    return iconComponent ? (
                                        <Icon icon={iconComponent} size={20} color={config.icons.rightIcon.iconColor} />
                                    ) : null;
                                })()}
                            </View>
                        )}
                    </View>
                )}

                {/* Title - Only show if title is provided */}
                {hasTitle && (
                    <Text style={[styles.headerTitle, !hasIcons && styles.headerTitleNoIcons]}>{config.title}</Text>
                )}

                {/* Media Container - Video or Image */}
                <View style={[styles.mediaContainer, !hasTitle && styles.mediaContainerNoTitle]}>
                    {isVideoMode ? (
                        <VideoPlayer
                            source={{ uri: config.media.url }}
                            videoRef={videoRef}
                            shouldLoop={config.media.shouldLoop || false}
                            autoPlay={config.media.autoPlay || false}
                            resizeMode={config.resizeMode || 'contain'}
                            style={styles.media}
                            containerStyle={undefined}
                            fallbackElement={
                                <Image
                                    resizeMode={config.resizeMode || 'cover'}
                                    accessible={true}
                                    accessibilityLabel="fallback image"
                                    source={fallbackImage}
                                    style={tailwind.style('w-full h-full')}
                                />
                            }
                            bufferingElement={
                                <Image
                                    resizeMode={config.resizeMode || 'cover'}
                                    accessible={true}
                                    accessibilityLabel="buffering image"
                                    source={fallbackImage}
                                    style={tailwind.style('w-full h-full')}
                                />
                            }
                            onVideoEnd={() => {}}
                            bufferConfig={undefined}
                            pauseVideo={isVideoPaused}
                            videoControls={false}
                            onStateChange={undefined}
                            onError={() => {}}
                            onBuffer={() => {}}
                            muted={isVideoMuted}
                            bufferingDelay={config.media.videoPlayerConfig?.bufferingDelay || 1000}
                            enableNetworkOptimizations={
                                config.media.videoPlayerConfig?.enableNetworkOptimizations || true
                            }
                            networkOptimizationConfig={{
                                minBufferMs:
                                    config.media.videoPlayerConfig?.networkOptimizationConfig?.minBufferMs ?? 3000,
                                maxBufferMs:
                                    config.media.videoPlayerConfig?.networkOptimizationConfig?.maxBufferMs ?? 15000,
                                bufferForPlaybackMs:
                                    config.media.videoPlayerConfig?.networkOptimizationConfig?.bufferForPlaybackMs ??
                                    1000,
                                bufferForPlaybackAfterRebufferMs:
                                    config.media.videoPlayerConfig?.networkOptimizationConfig
                                        ?.bufferForPlaybackAfterRebufferMs ?? 2000,
                            }}
                            bufferingElementStyle={undefined}
                            showMuteControl={true}
                            muteControlStyle={undefined}
                            onGesturePress={() => {
                                setIsVideoMuted(prev => !prev);
                            }}
                            enablePauseOnGesture={true}
                            handleMuteToggle={() => {
                                setIsVideoMuted(prev => !prev);
                            }}
                            disableFocus={true}
                            ignoreSilentSwitch={isVideoMuted ? 'obey' : 'ignore'}
                            preventsDisplaySleepDuringVideoPlayback={true}
                        />
                    ) : isLottieMode ? (
                        <LottieWithFallback
                            source={{ uri: config.media.url }}
                            style={styles.media}
                            autoPlay={config.media.lottieConfig?.autoPlay ?? true}
                            loop={config.media.lottieConfig?.loop ?? true}
                            resizeMode={config.resizeMode === 'stretch' ? 'cover' : config.resizeMode || 'contain'}
                            fallback={
                                <Image
                                    source={fallbackImage}
                                    resizeMode={config.resizeMode || 'contain'}
                                    accessible={true}
                                    accessibilityLabel="promotional image"
                                    style={styles.media}
                                />
                            }
                        />
                    ) : (
                        <Image
                            source={{ uri: config.media.url }}
                            resizeMode={config.resizeMode || 'contain'}
                            accessible={true}
                            accessibilityLabel="promotional image"
                            style={styles.media}
                        />
                    )}
                </View>

                {/* Action Button - Only show if button text is provided */}
                {hasButton && (
                    <Pressable
                        testID="generic-video-bottom-sheet-action-button"
                        accessibilityRole="button"
                        accessibilityLabel={config.buttonText}
                        style={[styles.getStartedButton, animatedStyle, !hasTitle && styles.getStartedButtonNoMedia]}
                        onPress={handleButtonPress}
                        {...handlers}>
                        <Text style={styles.getStartedButtonText}>{config.buttonText}</Text>
                    </Pressable>
                )}
            </View>
        </PopUpModal>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 37,
        paddingTop: 10,
        paddingBottom: 30,
        borderRadius: 36,
    },
    containerNoButton: {
        paddingBottom: 24, // Less padding when no button
    },
    containerMinimal: {
        paddingTop: 20, // More top padding for minimal layout
        paddingBottom: 20, // Less bottom padding
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'AreaNormal-ExtraBold',
        color: colors?.recovered?.neutralUltraHigh || '#000000',
        textAlign: 'left',
        marginBottom: 10,
        marginTop: 31,
    },
    headerTitleNoIcons: {
        marginTop: 16, // Less top margin when no icons
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'AreaNormal-Medium',
        color: colors?.recovered?.neutralHigh || '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
    mediaContainer: {
        height: SCREEN_HEIGHT * 0.3745,
        width: SCREEN_WIDTH - 74,
        backgroundColor: '#000000',
        borderRadius: 19,
        overflow: 'hidden',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        marginTop: 20,
    },
    mediaContainerNoTitle: {
        marginTop: 32, // More top margin when no title
    },
    media: {
        width: '100%',
        height: '100%',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    fallbackText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'AreaNormal-Medium',
    },
    descriptionContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    descriptionTitle: {
        fontSize: 18,
        fontFamily: 'AreaNormal-Bold',
        color: colors?.recovered?.neutralUltraHigh || '#000000',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 24,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'AreaNormal-Medium',
        color: colors?.recovered?.neutralHigh || '#666666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    getStartedButton: {
        backgroundColor: '#3B3A3C',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    getStartedButtonNoMedia: {
        marginTop: 10, // Extra margin when no title/content above
    },
    getStartedButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'AreaNormal-ExtraBold',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors?.recovered?.neutralLow || '#E0E0E0',
    },
    closeButtonText: {
        color: colors?.recovered?.neutralHigh || '#666666',
        fontSize: 14,
        fontFamily: 'AreaNormal-Medium',
        textAlign: 'center',
    },
});
