import { FlatList, Platform, StyleSheet, View } from 'react-native';
import React from 'react';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import CloseCross from '../../../src/typescript/components/svg/CloseCross';
import CustomReanimatedImage from '../../../src/typescript/components/common/CustomAnimatedImage';
import { ScheduledRideItem, ScheduledRideProps } from './types';
import { createAction } from '../../../src/typescript/utils/common';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import ArrowRightV2 from '@/typescript/components/svg/ArrowRightV2';
import { colors } from 'config-types/src/domain/default/themes/colors';

function RideScheduledBottomSheetUI({ scheduledRideList, schRideDispatch }: ScheduledRideProps): React.JSX.Element {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const renderItem = ({ item, index }: { item: ScheduledRideProps['scheduledRideList'][number]; index: number }) => {
        return <RideScheduledItem schRideDispatch={schRideDispatch} index={index} item={item} />;
    };

    return (
        <Animated.View style={[styles.container, { paddingBottom: bottom + 16 }]}>
            <Animated.View style={styles.header}>
                <Typography
                    type="body"
                    style={styles.headerTitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.youHavexUpomingRides(scheduledRideList.length)}
                </Typography>
                <Pressable
                    accessibilityLabel={`Close button`}
                    accessibilityRole="button"
                    testID="scheduled_ride_bottom_sheet_close"
                    onPress={() => {
                        schRideDispatch(createAction('CLOSE', undefined));
                    }}>
                    <CloseCross />
                </Pressable>
            </Animated.View>

            <FlatList
                data={scheduledRideList}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                style={styles.flatList}
                scrollEnabled={true}
            />
        </Animated.View>
    );
}

export default RideScheduledBottomSheetUI;

function RideScheduledItem({ schRideDispatch, item }: ScheduledRideItem): React.JSX.Element {
    return (
        <Pressable
            accessibilityLabel={`Scheduled ride: ${item.type}${item.destination ? ' to ' + item.destination : ''} on ${item.date} button`}
            accessibilityRole="button"
            testID={`scheduled_ride_bottom_sheet_ride_${item.id}`}
            onPress={() => schRideDispatch(createAction('CLICKED', { id: item.id }))}>
            <Animated.View style={[styles.itemContainer, styles.itemShadow]}>
                <CustomReanimatedImage cacheKey={item.image} source={{ uri: item.image }} style={[styles.itemImage]} />
                <Animated.View style={styles.flex_1}>
                    <View style={styles.titleContainer}>
                        <Typography
                            type={'subhead-1'}
                            style={styles.title}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {item.type}
                        </Typography>
                        {item.destination && (
                            <>
                                <Icon
                                    style={{ marginHorizontal: 6 }}
                                    icon={<ArrowRightV2 fillColor={colors.black1000} />}
                                    size={12}
                                    color={colors.black1000}
                                />
                                <Typography
                                    type={'subhead-1'}
                                    style={styles.flex_1}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {item.destination}
                                </Typography>
                            </>
                        )}
                    </View>
                    <Typography
                        type="sub-body-700"
                        numberOfLines={1}
                        style={styles.subTitle}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {item.date}
                    </Typography>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingHorizontal: 16,
        backgroundColor: colors.neutral200,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.neutral900,
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        marginTop: 16,
    },
    flatList: {
        maxHeight: 350,
        flex: 1,
    },
    itemContainer: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.neutral100,
        borderColor: colors.neutral100,
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
    },
    itemImage: {
        maxWidth: 70,
        height: 48,
        flex: 1,
        marginRight: 7,
        resizeMode: 'contain',
    },
    itemShadow: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: Platform.OS === 'android' ? colors.white250 : undefined,
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subTitle: {
        color: colors.neutral700,
        marginTop: 4,
    },
    title: {
        maxWidth: 150,
    },
    flex_1: {
        flex: 1,
    },
});
