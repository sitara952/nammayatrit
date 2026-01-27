import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import CustomReanimatedImage from '@/typescript/components/common/CustomAnimatedImage';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import TipGiftIcon from '@/typescript/assets/svg/symbols/TipGiftIcon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Svg, { Path } from 'react-native-svg';

interface AnnaOfferModalProps {
    onClose: () => void;
    onButtonPress: () => void;
    buttonText: string;
    title: string;
    imageUrl?: string;
    videoUrl?: string;
}

export const AnnaOfferModal: React.FC<AnnaOfferModalProps> = ({
    onClose,
    onButtonPress,
    buttonText,
    title,
    imageUrl,
    videoUrl,
}) => {
    const { bottom } = useSafeAreaInsets();

    const steps = [
        { text: 'Install & register on the BHIM App', type: 'dot' as const },
        { text: 'Open Chennai One to book your ticket', type: 'dot' as const },
        { text: 'Use BHIM App to get your ₹1 ticket', type: 'gift' as const },
        { text: 'Get 20% assured cashback on your next tickets', type: 'plus' as const },
    ];

    const renderStepIcon = (type: 'dot' | 'gift' | 'plus', _idx: number) => {
        if (type === 'dot') {
            return (
                <View style={styles.dotIcon}>
                    <View style={styles.dotInner} />
                </View>
            );
        } else if (type === 'gift') {
            return (
                <View style={styles.giftIconContainer}>
                    <View style={tailwind.style('flex-1 justify-center items-center ')}>
                        <TipGiftIcon size={40} background="#A855F7" color="#FFFFFF" />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.plusIconContainer}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M12 5V19M5 12H19"
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </View>
            );
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(28).stiffness(200)}
            style={[styles.container, { paddingBottom: bottom, paddingTop: 20 }]}>
            <View style={styles.headerRow}>
                <Animated.View style={styles.iconContainer}>
                    <Animated.View
                        style={[
                            tailwind.style('flex-1 justify-center items-center relative'),
                            { transform: [{ translateX: -5 }, { translateY: -5 }] },
                        ]}>
                        <TipGiftIcon size={28} background="#F7E8FF" color="#5B6777" />
                    </Animated.View>
                </Animated.View>
            </View>

            <Typography
                type="title-800"
                style={styles.title}
                numberOfLines={3}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {title}
            </Typography>

            <View style={styles.stepsCard}>
                {videoUrl ? (
                    <Animated.View entering={FadeInUp.delay(50)} style={styles.imageContainer}>
                        <VideoPlayer
                            source={{ uri: videoUrl }}
                            style={styles.promoImage}
                            containerStyle={undefined}
                            fallbackElement={undefined}
                            bufferingElement={undefined}
                            onVideoEnd={undefined}
                            autoPlay={true}
                            shouldLoop={true}
                            resizeMode={'cover'}
                            bufferConfig={undefined}
                            videoRef={undefined}
                            pauseVideo={undefined}
                            videoControls={undefined}
                            onStateChange={undefined}
                            onError={undefined}
                            onBuffer={undefined}
                            muted={undefined}
                            bufferingDelay={50}
                            enableNetworkOptimizations={undefined}
                            networkOptimizationConfig={undefined}
                            bufferingElementStyle={undefined}
                            enablePauseOnGesture={undefined}
                            showMuteControl={undefined}
                            muteControlStyle={undefined}
                            onGesturePress={undefined}
                            handleMuteToggle={undefined}
                            disableFocus={true}
                            ignoreSilentSwitch={'obey'}
                            preventsDisplaySleepDuringVideoPlayback={false}
                        />
                    </Animated.View>
                ) : imageUrl ? (
                    <Animated.View entering={FadeInUp.delay(50)} style={styles.imageContainer}>
                        <CustomReanimatedImage
                            cacheKey={imageUrl}
                            source={{ uri: imageUrl }}
                            style={styles.promoImage}
                        />
                    </Animated.View>
                ) : null}
                {!videoUrl &&
                    steps.map((step, idx) => (
                        <View key={idx} style={styles.stepRowContainer}>
                            <View style={styles.stepIconColumn}>
                                {renderStepIcon(step.type, idx)}
                                {idx < steps.length - 1 && <View style={styles.verticalLine} />}
                            </View>
                            <Typography
                                type="body-1"
                                style={styles.stepText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {step.text}
                            </Typography>
                        </View>
                    ))}
            </View>

            <TouchableOpacity
                accessibilityRole="button"
                style={tailwind.style('mt-6 rounded-2xl bg-[#016ACD] py-5')}
                onPress={() => {
                    onButtonPress();
                    onClose();
                }}
                testID={'anna_offer_button_click'}>
                <Typography
                    type="title-800"
                    style={tailwind.style('text-center text-white')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {buttonText}
                </Typography>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        backgroundColor: '#F7E8FF',
        borderRadius: 12,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#101010',
        marginBottom: 14,
        textAlign: 'left',
    },
    stepsCard: {
        backgroundColor: '#F6F7F9',
        padding: 16,
        borderRadius: 12,
    },
    imageContainer: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    promoImage: {
        width: '100%',
        aspectRatio: 1 / 1,
        borderRadius: 10,
    },
    stepRowContainer: {
        flexDirection: 'row',
    },
    stepIconColumn: {
        alignItems: 'center',
        marginRight: 12,
        width: 24,
    },
    dotIcon: {
        width: 14,
        height: 14,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    dotInner: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
    },
    giftIconContainer: {
        backgroundColor: '#A855F7',
        width: 24,
        height: 24,
        borderRadius: 6,
        overflow: 'hidden',
    },
    plusIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verticalLine: {
        width: 2,
        height: 13,
        borderRadius: 2,
        backgroundColor: '#E5E5E5',
        marginVertical: 4,
    },
    stepText: {
        color: '#374151',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});
