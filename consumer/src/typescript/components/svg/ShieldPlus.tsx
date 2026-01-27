import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

export const ShieldPlus = ({ fill = '#ffffff', stroke = '#FF6F00', size = 25 }) => {
    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
                <G clipPath="url(#clip0_17123_53933)">
                    <Path
                        d="M3 4.232l.197 6.26A6.814 6.814 0 0010 17.077a6.814 6.814 0 006.803-6.587L17 4.232l-7-.3-7 .3z"
                        fill={fill}
                    />
                    <Path d="M10 7v6M13 10H7" stroke={stroke} strokeWidth={1.5} strokeMiterlimit={10} />
                </G>
                <Defs>
                    <ClipPath id="clip0_17123_53933">
                        <Path fill={fill} d="M0 0H20V20H0z" />
                    </ClipPath>
                </Defs>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 22,
        height: 22,
    },
});
