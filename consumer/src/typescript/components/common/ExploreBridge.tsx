import colors from '../../designSystem/colorPalette';
import React from 'react';
import { View, Text, Linking, StyleSheet, ViewStyle } from 'react-native';
import { APP_BG, BRIGE_WEB_LINK } from '../../constants/common';
import sharedStyles from '../../constants/style';
import { Pressable } from '@/src-v2/primitives/Pressable';

type ExploreBridgeProps = {
    style: ViewStyle | undefined;
};

function ExploreBridge({ style }: ExploreBridgeProps): React.JSX.Element {
    const onPressFn = () => {
        Linking.openURL(BRIGE_WEB_LINK);
    };
    return (
        <View style={{ ...styles.container, ...style }}>
            <View style={styles.borderLine} />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explore Bridge"
                testID="3c0ee933-b29e-4c48-b3fc-599b8d01dbec"
                onPress={onPressFn}>
                <Text style={{ ...styles.textContainer }}>Explore Bridge</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        minHeight: 56,
        alignItems: 'center',
        backgroundColor: APP_BG,
        paddingBottom: 16,
    },
    borderLine: {
        width: '90%',
        borderTopWidth: 1,
        borderColor: `${colors?.recovered?.neutralLow}`,
    },
    textContainer: {
        ...sharedStyles.subHeading1,
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 16,
        paddingVertical: 16,
        color: `${colors?.recovered?.orangeMid}`,
    },
});

export default ExploreBridge;
