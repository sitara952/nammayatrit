import { StyleSheet, View } from 'react-native';
import React, { memo, useContext, useMemo } from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import HourlyRentalItem from './HourlyRentalItem';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectBottomSheetStage,
    selectCurrentLocationCoords,
    selectSearchedSource,
} from '@/typescript/state/client/session';
import { MapContext } from '@/typescript/Maps/MapContext';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import { FlatList } from 'react-native-gesture-handler';
import { HourlyRentalsData } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectRidePackages } from '@/typescript/state/client/session';
import { rentalsSearchResp } from '@/readOnly/api/types/RentalsSearchResp.gen';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

const HourlyRentals = () => {
    const source = useAppSelector(selectSearchedSource);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { mapRef } = useContext(MapContext);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const configManager = useConfigContext();
    const fareCacheData = useAppSelector(selectRidePackages);
    const { searchForRides } = useSearchUtils();
    const hourlyRentalsList: HourlyRentalsData[] = useMemo(
        () =>
            fareCacheData?.rentalsMininumFareResp
                ? fareCacheData.rentalsMininumFareResp
                      .map((resp: rentalsSearchResp) => rentalsSearchRespToHourlyRentalsData(resp))
                      .filter((itemVal: HourlyRentalsData | undefined) => itemVal !== undefined)
                : [],
        [fareCacheData],
    );

    const userLanguageStrings = configManager.get('userLanguageStrings');

    const itemOnPress = ({ item }: { item: HourlyRentalsData }) => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        if (source == null) return;
        searchForRides(
            false,
            source,
            undefined,
            mapRef,
            currentLocationCoords,
            bottomSheetStage,
            {
                duration: item.duration,
            },
            undefined,
            false,
        );
    };

    const listRenderItem = ({ item, index }: { item: HourlyRentalsData; index: number }) => {
        return (
            <HourlyRentalItem
                image={item.image}
                title={item.title}
                duration={item.duration}
                onPress={() => itemOnPress({ item })}
                fare={item.fare}
                marginLeft={index === 0 ? 20 : 16}
                marginRight={index === hourlyRentalsList.length - 1 ? 20 : 0}
            />
        );
    };

    if (hourlyRentalsList.length === 0) return null;

    return (
        <View style={styles.container}>
            <Typography
                style={styles.componentTitle}
                numberOfLines={undefined}
                type={'callout-1'}
                isAnimate={false}
                accessible={true}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.hourly_rental}
            </Typography>
            <FlatList
                overScrollMode="never"
                data={hourlyRentalsList}
                keyExtractor={item => item.title}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={listRenderItem}
            />
        </View>
    );
};

export default memo(HourlyRentals);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 32,
    },
    componentTitle: {
        color: '#78747C',
        marginLeft: 20,
    },
});

const rentalsSearchRespToHourlyRentalsData = (resp: rentalsSearchResp): HourlyRentalsData | undefined => {
    if (
        resp?.rentalElement !== undefined &&
        resp?.rentalElement?.rentalDuration !== undefined &&
        resp?.rentalElement?.rentalImageUrl !== undefined &&
        resp?.minimumFare !== undefined
    ) {
        return {
            title: resp.rentalElement.rentalDuration / 3600 + ' hrs',
            image:
                resp.rentalElement.rentalImageUrl ??
                'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/homeScreenInterCityRentals/img-ic_rental_fetch_fare_cache-1744111342288.webp',
            description: '',
            duration: resp.rentalElement.rentalDuration / 3600,
            fare: resp.minimumFare,
        };
    }
    return undefined;
};
