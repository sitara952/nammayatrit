import { FlatList } from 'react-native-gesture-handler';
import React, { FC, memo, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { emptyAllSearchedStops, setIsPickup } from '@/typescript/state/client/session';
import Animated from 'react-native-reanimated';
import { tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import RecentTripItem from './recentTrips/RecentTripItem';
import { StyleSheet } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import {
    selectBottomSheetStage,
    selectCurrentLocationCoords,
    selectSearchedSource,
} from '../../../state/client/session';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface RecentSearchesProps {
    locations: tripLocationObject[];
    showTitle: boolean;
}
const RecentSearches: FC<RecentSearchesProps> = ({ locations, showTitle }) => {
    const dispatch = useAppDispatch();
    const { mapRef } = useContext(MapContext);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const source = useAppSelector(selectSearchedSource);
    const { searchForRides } = useSearchUtils();

    const handleOnPress = (location: tripLocationObject) => {
        dispatch(emptyAllSearchedStops());
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        const hasSpecialLoction = location.specialLocation?.gatesInfo.every(gate => gate.gateType === 'Drop');
        dispatch(setIsPickup(!hasSpecialLoction));
        if (location.isTrip && location.sourceLocation) {
            const source = location.sourceLocation;
            const dest = location;
            searchForRides(
                false,
                source,
                dest,
                mapRef,
                currentLocationCoords,
                bottomSheetStage,
                undefined,
                undefined,
                false,
            );
        } else if (source) {
            searchForRides(
                true,
                source,
                location,
                mapRef,
                currentLocationCoords,
                bottomSheetStage,
                undefined,
                undefined,
                false,
            );
        }
    };

    const handleRenderLocation = (locDetails: tripLocationObject, index: number) => {
        return (
            <RecentTripItem
                tripLocationObject={locDetails}
                onPress={() => handleOnPress(locDetails)}
                style={index === 0 ? { marginLeft: 20 } : undefined}
            />
        );
    };

    const firstLocation = locations.at(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View>
            {showTitle && (
                <Typography
                    type="callout-1"
                    style={{
                        color: '#78747C',
                        paddingLeft: 24,
                        paddingBottom: 8,
                        fontSize: 15,
                        fontWeight: '800',
                        lineHeight: 20,
                    }}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Recents}
                </Typography>
            )}

            {locations.length > 1 ? (
                <FlatList
                    overScrollMode="never"
                    horizontal={true}
                    data={locations}
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    accessibilityLabel="Suggested Locations."
                    renderItem={renderItemProps => handleRenderLocation(renderItemProps.item, renderItemProps.index)}
                />
            ) : firstLocation ? (
                <RecentTripItem
                    tripLocationObject={firstLocation}
                    onPress={() => handleOnPress(firstLocation)}
                    style={styles.recentTripItem}
                />
            ) : null}
        </Animated.View>
    );
};

export default memo(RecentSearches);

const styles = StyleSheet.create({
    recentTripItem: {
        marginLeft: 20,
        marginRight: 21,
    },
});
