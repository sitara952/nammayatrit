import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import React, { memo } from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { Icon } from '@/typescript/components/Icon';
import ArrowRightV2 from '@/typescript/components/svg/ArrowRightV2';
import TouchEffect from '../sharedRides/TouchEffect';

export type RecentTripItemProps = {
    tripLocationObject: tripLocationObject;
    onPress: () => void;
    style: StyleProp<ViewStyle> | undefined;
};
const RecentTripItem = memo(({ tripLocationObject, onPress, style }: RecentTripItemProps) => {
    return (
        <TouchEffect
            onPress={onPress}
            style={[styles.container, style, styles.itemShadow]}
            effects={['scale']}
            testID="home_recent_trip_item"
            accessible={undefined}
            accessibilityLabel={undefined}>
            <View style={styles.textContainer}>
                <Typography
                    style={styles.title}
                    numberOfLines={1}
                    type={'subhead-1'}
                    isAnimate={undefined}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {tripLocationObject.title}
                </Typography>
                <Typography
                    style={styles.subTitle}
                    numberOfLines={1}
                    type={'body-1'}
                    isAnimate={undefined}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {tripLocationObject.subtitle}
                </Typography>
            </View>
            <View style={styles.iconContainer} accessibilityLabel="Click here to book a ride" accessible={false}>
                <Icon icon={<ArrowRightV2 fillColor="#313233" />} size={13} />
            </View>
        </TouchEffect>
    );
});

export default RecentTripItem;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 18,
        paddingRight: 14,
        marginRight: 18,
        marginBottom: 16,
        marginTop: 6,
        flexDirection: 'row',
        maxWidth: 290,
    },
    textContainer: {
        justifyContent: 'center',
    },
    title: {
        color: '#2F2D32',
        maxWidth: 180,
    },
    subTitle: {
        color: '#78747C',
        marginTop: 4,
        maxWidth: 180,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F5F5',
        height: 42,
        width: 44,
        borderRadius: 14,
        marginLeft: 8,
        alignSelf: 'center',
    },
    itemShadow: {
        borderColor: '#f0f0f0',
        borderWidth: 1,
        // shadowOffset: { width: 0, height: 2 },
        // shadowColor: '#000',
        // shadowOpacity: 0.031,
        // shadowRadius: 5,
        // elevation: 3,
        zIndex: 1,
    },
});
