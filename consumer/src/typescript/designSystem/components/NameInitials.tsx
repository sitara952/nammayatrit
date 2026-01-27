import React from 'react';
import { View, ViewStyle, TextStyle, StyleSheet, StyleProp } from 'react-native';
import colors from '../../designSystem/colorPalette';
import Typography from './primitives/Typography';

interface NameInitialsProps {
    nameInitial: string;
    style: StyleProp<ViewStyle>;
    textStyle: TextStyle | undefined;
}

const NameInitials: React.FC<NameInitialsProps> = ({ nameInitial, style, textStyle }) => {
    return (
        <View style={[styles.container, style]}>
            <Typography
                type="subhead-1"
                style={[styles.textStyle, textStyle]}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {(nameInitial ?? '').toUpperCase()}
            </Typography>
        </View>
    );
};

export default NameInitials;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.recovered.yellowHigh,
        borderRadius: 50,
        height: 39,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        color: colors.primitive.white[10],
        alignContent: 'center',
    },
});
