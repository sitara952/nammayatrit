import { FC } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { interpolate, SharedValue, useAnimatedStyle, FadeOutDown, FadeInDown } from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import token from '@/typescript/designSystem/tokens';
import { cancellationBannerTexts } from '@/src-v2/systems/configs/types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserProfileLanguage } from '@/typescript/state/client/user';
import { getShortLanguage } from '@/src-v2/utils/common';

import mtIcHighCancellationImage from '@/src-v2/assets/mt_ic_high_cancellation_icon.webp';

type CancellationWarningBannerProps = {
    onDismiss: () => void;
    visible: boolean;
    sheetAnimatedIndex: SharedValue<number> | undefined;
    sheetAnimatedPosition: SharedValue<number> | undefined;
    additionalOffset: number | undefined;
    bannerTexts: cancellationBannerTexts | undefined;
};

export const CancellationWarningBanner: FC<CancellationWarningBannerProps> = ({
    onDismiss,
    visible,
    sheetAnimatedIndex,
    sheetAnimatedPosition,
    additionalOffset = 0,
    bannerTexts,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguage = useAppSelector(selectUserProfileLanguage);

    // Get texts based on user's language, fallback to English
    const lang = userLanguage ? getShortLanguage(userLanguage) : 'en';
    const title = bannerTexts?.title?.[lang] || bannerTexts?.title?.en || 'High cancellation rate!';
    const description =
        bannerTexts?.description?.[lang] ||
        bannerTexts?.description?.en ||
        'Avoid cancelling to ensure uninterrupted service.';

    const animatedStyle = useAnimatedStyle(() => {
        if (!sheetAnimatedPosition || !sheetAnimatedIndex) {
            return {
                opacity: visible ? 1 : 0,
                transform: [{ translateY: 0 }],
            };
        }

        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 185 - additionalOffset,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });

    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[styles.container, tailwind.style(`px-[${token?.spacing[16]}]`), animatedStyle]}>
            <Animated.View
                entering={FadeInDown.duration(500)}
                exiting={FadeOutDown.duration(500)}
                style={[
                    styles.banner,
                    {
                        backgroundColor: themeColors.Fill_neutralMin,
                    },
                ]}>
                {/* Left: Warning Icon */}
                <View style={styles.iconContainer}>
                    <Image style={{ width: 40, height: 40 }} source={mtIcHighCancellationImage} resizeMode="contain" />
                </View>

                {/* Center: Two lines of text */}
                <View style={styles.textContainer}>
                    <Typography
                        type="body-6"
                        style={[styles.boldText]}
                        numberOfLines={2}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                    <Typography
                        type="body-8"
                        style={[styles.secondaryText]}
                        numberOfLines={2}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {description}
                    </Typography>
                </View>

                {/* Right: Okay Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        testID="cancellation_warning_okay_btn"
                        size="sm"
                        type="primary"
                        showLoader={false}
                        onPress={onDismiss}
                        text="Okay"
                        textColor="#000000"
                        bgColor="#FFD54F"
                        style={styles.okayButton}
                    />
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        zIndex: 100,
        pointerEvents: 'box-none',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    iconContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginRight: 12,
        paddingTop: 4,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000000',
    },
    secondaryText: {
        fontSize: 14,
        color: '#5B6777',
        marginTop: 2,
        lineHeight: 20,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    okayButton: {
        minWidth: 70,
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 16,
        alignItems: 'center',
    },
});
