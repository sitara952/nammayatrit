import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import DotIcon from '@/typescript/components/svg/DotIcon';

export interface BulletPointProps {
    // Items to display
    items: string[];
    // Optional custom icon component
    icon?: React.ComponentType<{ size: number | undefined; color: string | undefined }>;
    // Icon size (default: 6)
    size?: number;
    // Icon color (default: colors.neutral600)
    color?: string;
    // Spacing between bullet points (default: 8)
    spacing?: number;
    // Optional container style override
    style?: ViewStyle;
    // Max number of lines for each item
    numberOfLines?: number;
    // Optional text style override
    textStyle?: TextStyle;
}

export const BulletPoint: React.FC<BulletPointProps> = ({
    items,
    icon: IconComponent,
    size = 20,
    color = colors.neutral700,
    spacing = 8,
    style,
    numberOfLines,
    textStyle,
}) => {
    if (!items || items.length === 0) {
        return null;
    }

    const textStyles = {
        color: color,
        fontSize: 14,
        lineHeight: 20,
        ...textStyle,
    };

    return (
        <View style={[styles.container, style]}>
            {items.map((item, index) => (
                <View
                    key={`bullet-${index}`}
                    style={[styles.itemContainer, { marginBottom: index === items.length - 1 ? 0 : spacing }]}>
                    <View style={[styles.bulletContainer, { marginRight: 8 }]}>
                        {IconComponent ? (
                            <IconComponent size={size} color={color} />
                        ) : (
                            <Icon icon={<DotIcon />} size={size} color={color} />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Typography
                            type="sub-body-700"
                            style={textStyles}
                            numberOfLines={numberOfLines}
                            isAnimate={false}
                            accessible={undefined}
                            accessibilityLabel={item}
                            accessibilityRole={undefined}>
                            {item}
                        </Typography>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2, // Slight offset to align with text baseline
    },
    textContainer: {
        flex: 1,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default BulletPoint;
