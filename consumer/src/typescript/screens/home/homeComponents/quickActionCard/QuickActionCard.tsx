import Button from '@/src-v2/primitives/Button';
import FromToLocationHorizontal from '@/typescript/assets/svg/symbols/FromToLocationHorizontal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { dayOfWeek, isTimeBetween } from '@/typescript/utils/time';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import React, { memo, useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectBottomSheetStage,
    selectCurrentLocation,
    selectCurrentLocationCoords,
    selectSearchedSource,
} from '@/typescript/state/client/session';
import { getDistanceBwCordinatesInKm, getLocationFromSavedLoc } from '@/typescript/utils/location';
import { MapContext } from '@/typescript/Maps/MapContext';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import { showFirstWordIfLengthIsGreatherThan } from '@/typescript/utils/common';
import { Pressable } from '@/src-v2/primitives/Pressable';
import CarSideWithArrow from '@/typescript/components/svg/CarWithArrow';
import { useSavedLocations } from '@/typescript/hooks/useSavedLocations';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';

const QuickActionCard = () => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { savedLocations } = useSavedLocations();
    const source = useAppSelector(selectSearchedSource);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { mapRef } = useContext(MapContext);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const { searchForRides } = useSearchUtils();
    const savedHomeAddress = useMemo(
        () => savedLocations?.find((item: savedReqLocationAPIEntity) => item.tag == 'Home'),
        [savedLocations],
    );
    const savedWorkAddress = useMemo(
        () => savedLocations?.find((item: savedReqLocationAPIEntity) => item.tag == 'Work'),
        [savedLocations],
    );
    const isMorning = isTimeBetween(0, 12);
    const isWeekend = dayOfWeek(new Date().toISOString()) === 0 || dayOfWeek(new Date().toISOString()) === 6;
    const addressToShow = isMorning ? savedWorkAddress : savedHomeAddress;
    const maybeLocationAddress = addressToShow ? getLocationFromSavedLoc(addressToShow) : undefined;
    const distDiffBwLocations =
        currentLocation &&
        currentLocation.lat &&
        currentLocation.lng &&
        maybeLocationAddress?.lat &&
        maybeLocationAddress?.lng
            ? getDistanceBwCordinatesInKm(
                  currentLocation.lat,
                  currentLocation.lng,
                  maybeLocationAddress?.lat,
                  maybeLocationAddress?.lng,
              )
            : undefined;

    const { addressTitle, description } = {
        addressTitle: maybeLocationAddress ? maybeLocationAddress.title : undefined,
        description: maybeLocationAddress ? maybeLocationAddress.subtitle : undefined,
    };

    const onPress = () => {
        if (!addressToShow || !source) return;
        const newLocation = getLocationFromSavedLoc(addressToShow);
        searchForRides(
            true,
            source,
            newLocation,
            mapRef,
            currentLocationCoords,
            bottomSheetStage,
            undefined,
            undefined,
            false,
        );
    };

    if (!addressTitle || !description || isWeekend || (distDiffBwLocations && distDiffBwLocations < 1)) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]} entering={FadeIn} exiting={FadeOut}>
            <Pressable
                testID="home_quick_action_card"
                accessibilityRole="button"
                accessibilityLabel="Rides button"
                {...handlers}
                onPress={onPress}
                style={styles.flex1_row}>
                <View style={{ flex: 1 }}>
                    <View style={styles.flex1_row}>
                        <Typography
                            type={'subhead-1'}
                            style={styles.title}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {/* TODO : use from API response */}
                            {'Rides'}
                        </Typography>
                        <View style={styles.bridgeContainer}>
                            <FromToLocationHorizontal />
                        </View>
                        <Typography
                            type={'subhead-1'}
                            style={styles.subtitle}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {showFirstWordIfLengthIsGreatherThan(7, addressTitle)}
                        </Typography>
                    </View>
                    <Typography
                        type={'body-2'}
                        style={styles.description}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {description}
                    </Typography>
                </View>
                <Button
                    testID="home_quick_action_card_action"
                    type="primary"
                    style={[styles.button, { backgroundColor: themeColors.where_you_going_bg }]}
                    showLoader={false}
                    onPress={onPress}>
                    <CarSideWithArrow fillColor={themeColors.where_you_going_text} />
                </Button>
            </Pressable>
        </Animated.View>
    );
};

export default memo(QuickActionCard);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginHorizontal: 20,
        overflow: 'hidden',
    },
    button: {
        backgroundColor: '#F9D758',
        borderRadius: 20,
        height: 40,
    },
    flex1_row: {
        flexDirection: 'row',
        flex: 1,
    },
    description: {
        color: '#78747C',
        marginTop: 6,
    },
    title: {
        color: '#2F2D32',
        maxWidth: '40%',
    },
    subtitle: {
        color: '#2F2D32',
        maxWidth: 150,
    },
    bridgeContainer: {
        marginHorizontal: 12,
    },
    flex1: {
        flex: 1,
    },
});
