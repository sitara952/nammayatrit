import nyIcCancellationHigh from '@/resources/assets/png/ny_ic_cancellation_high.webp';
import React from 'react';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Text, Image, View, ViewProps, StyleSheet } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';
import colors from '../../designSystem/colorPalette';

type CancellationHighBannerProps = ViewProps & {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    bannerPosition: SharedValue<number>;
};

const CancellationHighBanner = (props: CancellationHighBannerProps) => {
    const { sheetAnimatedIndex, sheetAnimatedPosition, bannerPosition } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appName = useAppSelector(selectAppReadableName);
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - bannerPosition.value - 10,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });
    return (
        <Animated.View onLayout={props.onLayout} style={[styles.container, floatingHeaderStyle]}>
            <View style={styles.bannerContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{userLanguageStrings.YourCancellationRateIsHigh}</Text>
                    <Text style={styles.descriptionText}>
                        {userLanguageStrings.AvoidFurtherCancellationsToKeepUsingApp(appName)}
                    </Text>
                </View>
                <Image
                    source={nyIcCancellationHigh}
                    style={styles.image}
                    accessible={true}
                    accessibilityLabel="cancellation high banner image"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 14,
    },
    bannerContent: {
        borderRadius: 10,
        backgroundColor: `${colors?.recovered?.lightOrange}`,
        flexDirection: 'row',
        marginHorizontal: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        marginVertical: 12,
        marginLeft: 16,
        flex: 1,
    },
    titleText: {
        fontSize: 18,
        color: '#000000',
        marginBottom: 3,
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: 14,
        color: '#000000',
        marginBottom: 3,
    },
    image: {
        width: 70,
        height: 70,
        alignSelf: 'flex-end',
        marginLeft: 4,
        marginRight: 14,
    },
});

export default CancellationHighBanner;
