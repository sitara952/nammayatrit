import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { colors } from 'config-types/src/domain/default/themes/colors';
import LinearGradient from 'react-native-linear-gradient';
import { DriverConditionType } from '@/src-v2/hooks/useDriverHighlightMessage';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

/**
 * Component that displays a positive driver highlight message to reduce cancellations
 *
 * @param message - The message to display, if null nothing will be rendered
 * @param conditionType - The type of condition met that determines the gradient color
 * @returns A banner containing the message or null if no message provided
 */
interface DriverHighlightBannerProps {
    message: string | null;
    conditionType: DriverConditionType | undefined;
}

const getGradientColors = (conditionType: DriverConditionType | undefined): string[] => {
    switch (conditionType) {
        case DriverConditionType.FAVORITE:
            return ['rgba(255, 98, 174, 0.24)', 'rgba(255, 255, 255, 0.24)'];
        case DriverConditionType.WELL_RATED:
            return ['rgba(98, 180, 242, 0.24)', 'rgba(255, 255, 255, 0.24)'];
        case DriverConditionType.LOW_CANCELLATION:
            return ['rgba(134, 210, 167, 0.24)', 'rgba(255, 255, 255, 0.24)'];
        case DriverConditionType.NEARBY:
            return ['rgba(229, 200, 108, 0.24)', 'rgba(255, 255, 255, 0.24)'];
        case DriverConditionType.EXPERIENCED:
            return ['rgba(148, 87, 245, 0.24)', 'rgba(255, 255, 255, 0.24)'];
        default:
            return ['rgba(255, 98, 174, 0.24)', 'rgba(255, 255, 255, 0.24)'];
    }
};

const DriverHighlightBanner: React.FC<DriverHighlightBannerProps> = ({ message, conditionType }) => {
    if (!message) return null;

    const gradientColors = getGradientColors(conditionType);

    return (
        <View style={[styles.container]}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                accessible={true}
                style={styles.container}
                accessibilityLabel={message}>
                <View style={styles.contentContainer}>
                    <Typography
                        type="body-2"
                        style={tailwind.style(
                            `text-[${colors.neutral800}] font-extrabold ${Platform.OS === 'android' ? 'text-sm' : 'text-sm'}`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={message}
                        accessibilityRole={undefined}>
                        {message}
                    </Typography>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 45,
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: -5,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100%',
        paddingHorizontal: 16,
    },
});

export default DriverHighlightBanner;
