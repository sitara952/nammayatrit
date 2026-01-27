import { Dimensions, Image, StyleSheet, View } from 'react-native';
import React from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';

const screenWidth = Dimensions.get('screen').width;

export type EventListItemProps = {
    title: string;
    subtitle: string;
    subtitle2: string;
    image: string;
    onPress: () => void;
    buttonImage: string;
    buttonTitle: string;
    buttonBg: string;
    buttonTextColor: string;
    marginLeft: number;
};

const EventListItem = ({
    title,
    subtitle,
    subtitle2,
    image,
    onPress,
    buttonImage,
    buttonTitle,
    buttonBg,
    buttonTextColor,
    marginLeft,
}: EventListItemProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    return (
        <Animated.View style={[styles.container, animatedStyle, { marginLeft }]}>
            <Pressable
                testID="home_event_list_item"
                accessibilityRole="button"
                accessibilityLabel={title + ' button'}
                onPress={onPress}
                {...handlers}>
                <Typography
                    style={styles.titleStyle}
                    numberOfLines={2}
                    type={'callout-2'}
                    isAnimate={undefined}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
                <Typography
                    style={styles.subtitleStyle}
                    numberOfLines={2}
                    type={'body-2'}
                    isAnimate={undefined}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {subtitle}
                </Typography>

                <View style={styles.container2}>
                    <Image
                        accessible={false}
                        style={styles.imageStyle}
                        source={{
                            uri: image,
                        }}
                    />
                    <View style={styles.container3}>
                        <Typography
                            style={styles.subtitle2}
                            numberOfLines={2}
                            type={'callout-2'}
                            isAnimate={undefined}
                            accessible={true}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {subtitle2}
                        </Typography>
                        <View style={{ flex: 1 }} />
                        <Button
                            testID="home_event_list_item_action"
                            text={buttonTitle}
                            onPress={onPress}
                            numberOfLines={1}
                            textType="callout-2"
                            style={{ backgroundColor: buttonBg, borderRadius: 20, height: 40 }}
                            textColor={buttonTextColor}
                            showLoader={false}
                            prefix={
                                <Image
                                    accessible={false}
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
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default EventListItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginVertical: 10,
    },
    container2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 19,
    },
    imageStyle: {
        width: 87,
        height: 87,
        resizeMode: 'cover',
        borderRadius: 12,
    },
    container3: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 16,
        maxWidth: screenWidth / 2,
    },
    titleStyle: {
        maxWidth: screenWidth * (3 / 4),
        color: '#2F2D32',
        marginBottom: 2,
    },
    subtitleStyle: {
        maxWidth: screenWidth * (3 / 4),
        color: '#9D9D9D',
    },
    subtitle2: {
        color: '#2F2D32',
        maxWidth: screenWidth / 3,
        fontSize: 13,
        lineHeight: 19,
    },
});
