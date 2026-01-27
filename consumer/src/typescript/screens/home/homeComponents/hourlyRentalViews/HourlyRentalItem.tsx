import { Image, Platform, StyleSheet } from 'react-native';
import React from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export type HourlyRentalItemProps = {
    image: string;
    title: string;
    duration: number; // in hrs
    fare: number;
    onPress: () => void;
    marginLeft: number;
    marginRight: number;
};

const HourlyRentalItem = ({ image, title, fare, onPress, marginLeft, marginRight }: HourlyRentalItemProps) => {
    const { handlers } = useScaleAnimation();
    const currencySymbol = CURRENCY_SYMBOL.value;

    return (
        <Animated.View style={[styles.container, styles.containerShadow, { marginLeft, marginRight }]}>
            <Pressable
                testID="home_hourly_rental_item"
                accessibilityRole="button"
                accessibilityLabel={title + ' button'}
                {...handlers}
                onPress={onPress}>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    accessible={true}
                    accessibilityLabel="hourly rental item image"
                />
                <Typography
                    type={'subhead-1'}
                    style={styles.title}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
                <Typography
                    type={'body-1'}
                    style={styles.subtitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {fare ? `${currencySymbol}${fare} onwards` : 'Low fares'}
                </Typography>
            </Pressable>
        </Animated.View>
    );
};

export default HourlyRentalItem;

const styles = StyleSheet.create({
    image: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        marginTop: 20,
        minWidth: 120,
    },
    title: {
        color: '#2F2D32',
        marginTop: 16,
    },
    subtitle: {
        color: '#9D9D9D',
        marginTop: 5,
    },
    containerShadow: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#F5F5F5' : undefined,
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 1,
    },
});
