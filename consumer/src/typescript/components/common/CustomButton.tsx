import { FC } from 'react';
import colors from '../../designSystem/colorPalette';
import { View, StyleSheet, Text, ActivityIndicator, ViewProps, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
// import sharedStyle from "../../constants/style";

interface CustomButtonProps extends ViewProps {
    style?: object;
    textStyle?: object;
    bgColor?: string;
    textColor?: string;
    buttonText: string;
    marginTop?: number;
    marginBottom?: number;
    disabled?: boolean;
    loading?: boolean;
    borderWidth?: number;
    elevationValue?: number;
    borderColor?: string;
    borderRadius?: number;
    paddingHorizontal?: number;
    onClick: () => void;
    leftIcon: ImageSourcePropType | undefined;
    testID: string;
}

const CustomButton: FC<CustomButtonProps> = ({
    style,
    bgColor,
    textStyle,
    marginTop,
    marginBottom,
    textColor,
    buttonText,
    disabled = false,
    loading = false,
    borderWidth = 0,
    elevationValue,
    borderColor,
    children,
    onClick,
    accessibilityLabel,
    borderRadius = 10,
    paddingHorizontal = 16,
    leftIcon,
    testID,
}) => {
    return (
        <View
            accessibilityRole="button"
            style={{
                ...styles.touchableWrapper,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingHorizontal: paddingHorizontal,
                ...style,
            }}>
            <TouchableOpacity
                testID={testID}
                disabled={disabled || loading}
                onPress={onClick}
                style={{ width: '100%', borderRadius: 10 }}
                accessible
                accessibilityLabel={accessibilityLabel ?? buttonText}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled }}>
                <View
                    style={{
                        ...styles.signInContainer,
                        backgroundColor: bgColor,
                        borderWidth: borderWidth,
                        borderRadius: borderRadius,
                        borderColor: borderColor,
                        elevation: elevationValue,
                    }}>
                    <View style={styles.centeredContainerRow}>
                        {leftIcon && (
                            <Image
                                resizeMode={'contain'}
                                source={leftIcon}
                                style={{ width: 24, height: 24 }}
                                accessible={false}
                            />
                        )}
                        {children}
                        <Text
                            style={{
                                ...styles.googleSingInButton,
                                color: textColor,
                                ...textStyle,
                            }}>
                            {buttonText}
                        </Text>
                        {loading && <ActivityIndicator size="small" color={textColor} />}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    touchableWrapper: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    centeredContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInContainer: {
        alignItems: 'center',
        borderWidth: 0.1,
        width: '100%',
        overflow: 'hidden',
        borderColor: `${colors?.recovered?.neutralMidLow}`,
        borderRadius: 10,
        padding: 7,
    },
    googleSingInButton: {
        padding: 9,
        paddingLeft: 12,
        alignItems: 'center',
    },
});

export default CustomButton;
