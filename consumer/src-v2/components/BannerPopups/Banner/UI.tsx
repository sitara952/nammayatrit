import React, { memo, useMemo } from 'react';
import { View, Image } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { BannerConfig } from '../types';
import { styles } from './styles';
import Typography from '@/typescript/designSystem/components/primitives/Typography';

export const BannerContent = memo(
    ({
        config,
        onButtonPress,
    }: {
        config: BannerConfig;
        onButtonPress: (buttonConfig: BannerConfig['primaryButton']) => void;
    }) => {
        const content = useMemo(
            () => (
                <View
                    style={[
                        config.imagePosition === 'center'
                            ? { alignItems: 'center' }
                            : { alignItems: 'flex-end', flex: 1 },
                        styles.bannerContainer,
                    ]}>
                    <View style={styles.leftSectionWrapper}>
                        <View style={styles.leftSection}>
                            <Typography
                                type="callout"
                                style={[styles.title, { color: config.textColor }]}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {config.title}
                            </Typography>
                            <View style={styles.buttonContainer}>
                                {config.primaryButton.visible && (
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        testID={`${config.bannerId}-${config.primaryButton.text}`}
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: config.primaryButton.backgroundColor,
                                            },
                                        ]}
                                        onPress={() => onButtonPress(config.primaryButton)}
                                        disabled={config.primaryButton.disabled}>
                                        <Typography
                                            type="callout"
                                            style={[styles.buttonText, { color: config.primaryButton.textColor }]}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {config.primaryButton.text}
                                        </Typography>
                                    </TouchableOpacity>
                                )}

                                {config.secondaryButton && config.secondaryButton.visible && (
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        testID={`${config.bannerId}-${config.secondaryButton.text}`}
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: config.secondaryButton.backgroundColor,
                                            },
                                        ]}
                                        onPress={() => {
                                            if (config.secondaryButton) {
                                                onButtonPress(config.secondaryButton);
                                            }
                                        }}
                                        disabled={config.secondaryButton.disabled}>
                                        <Typography
                                            type="callout"
                                            style={[styles.buttonText, { color: config.secondaryButton.textColor }]}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {config.secondaryButton.text}
                                        </Typography>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.imageWrapper}>
                        {config.imageUrl && (
                            <Image
                                accessible={true}
                                accessibilityLabel="banner image"
                                source={config.imageUrl}
                                style={config.imagePosition === 'center' ? styles.imageCenter : styles.imageFlexDown}
                            />
                        )}
                    </View>
                </View>
            ),
            [config, onButtonPress],
        );

        return content;
    },
    (prevProps, nextProps) => {
        const prev = prevProps.config;
        const next = nextProps.config;

        return (
            prev.title === next.title &&
            prev.textColor === next.textColor &&
            prev.primaryButton.text === next.primaryButton.text &&
            prev.primaryButton.visible === next.primaryButton.visible &&
            prev.primaryButton.disabled === next.primaryButton.disabled &&
            prev.secondaryButton?.text === next.secondaryButton?.text &&
            prev.secondaryButton?.visible === next.secondaryButton?.visible &&
            prev.secondaryButton?.disabled === next.secondaryButton?.disabled &&
            prev.imageUrl === next.imageUrl
        );
    },
);
