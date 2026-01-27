import { StyleSheet, View } from 'react-native';
import React, { memo } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import SharedRides from '../sharedRides/SharedRides';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectActiveBookingIds, selectFollowers } from '@/typescript/state/client/user';
import RideScheduled from '@/src-v2/components/ScheduledCard/UI';

const HomeActivityComponent = () => {
    const activeRideIds = useAppSelector(selectActiveBookingIds);
    const haveActiveRides = activeRideIds.length > 0;
    const followers = useAppSelector(selectFollowers) ?? [];
    const hasContent = followers.length > 0 || haveActiveRides;

    if (!hasContent) {
        return null;
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityCardContainerScroll}>
            <View style={styles.activityCardContainer}>
                {followers.length > 0 ? <SharedRides /> : null}
                {haveActiveRides ? <RideScheduled /> : null}
            </View>
        </ScrollView>
    );
};

export default memo(HomeActivityComponent);

const styles = StyleSheet.create({
    activityCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
        paddingRight: 20,
    },
    activityCardContainerScroll: {
        paddingLeft: 20,
        marginTop: 18,
    },
});
