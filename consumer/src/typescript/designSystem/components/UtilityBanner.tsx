import React, { ReactElement, useCallback } from 'react';
import { View, StyleSheet, TextStyle, Platform, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import ArrowRightV2 from '@/typescript/components/svg/ArrowRightV2';
import { Icon } from '@/typescript/components/Icon';
import { colors } from 'config-types/src/domain/default/themes/colors';
import Typography from './primitives/Typography';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

type UtilityBannerProps = {
    onPress: () => void;
    containerBackground: string | undefined;
    titleText: string | undefined;
    subtitleText: string | undefined;
    subTitleStyles: StyleProp<TextStyle> | undefined;
    LeftIcon: ReactElement | undefined;
    RightIcon: ReactElement | undefined;
    titleTextStyleFontSize: number | undefined;
    titleTextFontWeight: TextStyle['fontWeight'] | undefined;
    marginBottom: number | undefined;
    rightIconStyles: StyleProp<ViewStyle> | undefined;
    iconFillColor: string | undefined;
    titleTextStyles: StyleProp<TextStyle> | undefined;
};

export const UtilityBanner: React.FC<UtilityBannerProps> = props => {
    const {
        onPress,
        containerBackground = colors.neutral100,
        subTitleStyles = { color: colors.black900 },
        LeftIcon = <></>,
        iconFillColor = colors.gray700,
        RightIcon = <ArrowRightV2 fillColor={iconFillColor} />,
        titleTextStyleFontSize = 18,
        titleTextFontWeight = '500',
        marginBottom = 15,
        rightIconStyles,
        titleTextStyles,
    } = props;

    const handleOnPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        onPress();
    }, [hapticEffect, onPress]);

    return (
        <TouchableOpacity
            accessibilityRole="button"
            testID="utility-banner"
            style={{
                ...styles.container,
                backgroundColor: containerBackground,
                marginBottom: marginBottom,
            }}
            onPress={handleOnPress}>
            <View style={styles.leftSection}>
                {LeftIcon}
                <View style={{ ...styles.textContainer }}>
                    <Typography
                        style={[
                            {
                                ...styles.titleText,
                                fontSize: titleTextStyleFontSize,
                                fontWeight: titleTextFontWeight,
                            },
                            titleTextStyles,
                        ]}
                        type={'callout-1'}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.titleText}
                    </Typography>

                    {props.subtitleText && (
                        <Typography
                            style={[styles.subTitleText, subTitleStyles]}
                            type={'callout-1'}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {props.subtitleText}
                        </Typography>
                    )}
                </View>
            </View>
            <View style={[styles.rightSection, rightIconStyles]}>
                <Icon style={styles.arrowContainer} size={15} icon={RightIcon} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: 12,
        shadowColor: Platform.OS === 'android' ? '#F5F5F5' : undefined,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 5,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    titleText: {
        lineHeight: 18,
        marginBottom: 2,
        alignContent: 'center',
    },
    subTitleText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 18,
        opacity: 0.8,
    },
    rightSection: {
        marginLeft: 8,
        borderRadius: 25,
        padding: 15,
        backgroundColor: '#F5F5F5',
    },
    arrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
