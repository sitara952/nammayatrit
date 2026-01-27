import { StyleSheet, View } from 'react-native';
import React, { memo, useContext, useMemo } from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import IntercityItem from './IntercityItem';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectBottomSheetStage,
    selectCurrentLocationCoords,
    selectRidePackages,
    selectSearchedSource,
} from '@/typescript/state/client/session';
import { MapContext } from '@/typescript/Maps/MapContext';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { getAddressFromComponents } from '@/helpers/utils/Location/LocationUtils.bs';
import { FlatList } from 'react-native-gesture-handler';
import { IntercityData } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { intercitySearchResp } from '@/readOnly/api/types/IntercitySearchResp.gen';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

const Intercity = () => {
    const source = useAppSelector(selectSearchedSource);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { mapRef } = useContext(MapContext);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const fareCacheData = useAppSelector(selectRidePackages);
    const { searchForRides } = useSearchUtils();
    const intercityList: IntercityData[] = useMemo(() => {
        return fareCacheData?.interCityMinimumFareResp
            ? fareCacheData.interCityMinimumFareResp
                  ?.map((resp: intercitySearchResp) => {
                      const interCityDataResp = intercitySearchRespToIntercityData(resp);
                      return interCityDataResp;
                  })
                  .filter((itemVal: IntercityData | undefined) => itemVal != undefined)
            : [];
    }, [fareCacheData]);

    const itemOnPress = ({ item }: { item: IntercityData }) => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        if (source != null) {
            const newLocation: location = {
                title: item.rideData.title,
                subtitle: item.rideData.fullAddress,
                lat: item.rideData.lat,
                lng: item.rideData.lon,
                specialLocation: undefined,
                placeId: undefined,
                tag: 'AUTOCOMPLETE',
                addressComponents:
                    getAddressFromComponents(item.rideData.fullAddress, undefined, undefined) ?? undefined,
                serviceable: true,
                serviceabilityCity: undefined,
                formattedAddress: undefined,
                locationType: undefined,
                distanceFromCurrentLocation: undefined,
                hotSpotInfo: undefined,
            };
            searchForRides(
                false,
                source,
                newLocation,
                mapRef,
                currentLocationCoords,
                bottomSheetStage,
                undefined,
                undefined,
                true,
            );
        }
    };
    const listRenderItem = ({ item, index }: { item: IntercityData; index: number }) => {
        return (
            <IntercityItem
                image={item.image}
                title={item.title}
                description={item.description}
                onPress={() => itemOnPress({ item })}
                buttonImage={item.buttonImage}
                fare={item.fare}
                marginLeft={index == 0 ? 20 : 14}
                marginRight={index === intercityList.length - 1 ? 20 : 0}
            />
        );
    };

    if (intercityList.length === 0) return null;

    return (
        <View style={styles.container} accessible={false}>
            <Typography
                style={styles.componentTitle}
                numberOfLines={undefined}
                type={'callout-1'}
                isAnimate={false}
                accessible={true}
                accessibilityLabel="Intercity"
                accessibilityRole={undefined}>
                {userLanguageStrings.Intercity}
            </Typography>
            <FlatList
                overScrollMode="never"
                data={intercityList}
                keyExtractor={item => item.title}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={listRenderItem}
                accessible={true}
                accessibilityRole="list"
            />
        </View>
    );
};

export default memo(Intercity);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 22,
    },
    componentTitle: {
        color: '#78747C',
        marginLeft: 20,
        marginBottom: 16,
    },
});

const intercitySearchRespToIntercityData = (resp: intercitySearchResp): IntercityData | undefined => {
    const destination = resp?.destinationItem?.destination;
    if (
        resp?.destinationItem?.destinationCityBannerImageUrl !== undefined &&
        destination !== undefined &&
        destination.lat !== undefined &&
        destination.lon !== undefined &&
        resp?.destinationItem?.destinationCity !== undefined
    ) {
        return {
            image: resp?.destinationItem?.destinationCityBannerImageUrl,
            title: 'Trip to ' + resp?.destinationItem?.destinationCity,
            description: '',
            buttonImage:
                'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/img-car_with_arrow-1744123769923.webp',
            rideData: {
                lat: destination.lat,
                lon: destination.lon,
                title: resp?.destinationItem?.destinationCity,
                fullAddress: resp?.destinationItem?.destinationCity,
            },
            fare: resp?.minimumFare ?? 0,
        };
    }
    return undefined;
};
