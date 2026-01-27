import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export type IntercityItemProps = {
    image: string;
    title: string;
    description: string;
    onPress: () => void;
    buttonImage: string;
    fare: number;
    marginLeft: number;
    marginRight: number;
};

const IntercityItem = ({ image, title, onPress, fare, buttonImage, marginLeft, marginRight }: IntercityItemProps) => {
    const { handlers } = useScaleAnimation();
    const currencySymbol = CURRENCY_SYMBOL.value;

    return (
        <Animated.View style={[{ marginLeft, marginRight }]}>
            <Pressable
                testID="home_intercity_item"
                accessibilityRole="button"
                accessibilityLabel={title + ' button'}
                onPress={onPress}
                {...handlers}
                style={styles.container}>
                <Image
                    style={{ height: 214, width: 254 }}
                    source={{ uri: image }}
                    resizeMethod="resize"
                    borderRadius={20}
                    accessible={true}
                    accessibilityLabel="intercity item image"
                />

                <View style={styles.container2}>
                    <View>
                        <Typography
                            style={styles.componentTitle}
                            numberOfLines={undefined}
                            type={'subhead-1'}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {title}
                        </Typography>
                        <Typography
                            style={styles.conponentDescription}
                            numberOfLines={undefined}
                            type={'body-1'}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {fare ? `${currencySymbol}${fare} Onwards` : 'Attractive fares'}
                        </Typography>
                    </View>
                    <View style={styles.flex} />
                    <Button
                        testID="home_intercity_book_now"
                        text={undefined}
                        onPress={onPress}
                        numberOfLines={undefined}
                        style={{ backgroundColor: '#FFCF23', borderRadius: 50 }} // should be dynamic
                        textColor="black" // // should be dynamic
                        showLoader={false}
                        accessible={true}
                        accessibilityLabel="Click here to book a ride"
                        prefix={
                            <Image
                                accessible={true}
                                accessibilityLabel="intercity item button image"
                                source={{
                                    uri: buttonImage,
                                    width: 40,
                                    height: 40,
                                }}
                                resizeMode="contain"
                            />
                        }
                        type={'primary'}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default IntercityItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 20,
    },
    container2: {
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        margin: 3,
        position: 'absolute',
        bottom: 0,
        flex: 1,
        paddingVertical: 13,
        paddingHorizontal: 17,
        flexDirection: 'row',
        alignItems: 'center',
    },
    componentTitle: {
        color: '#2F2D32',
    },
    conponentDescription: {
        color: '#9D9D9D',
        marginTop: 3,
    },
    flex: {
        flex: 1,
    },
});
