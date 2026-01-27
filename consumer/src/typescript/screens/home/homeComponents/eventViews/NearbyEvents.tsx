import { View, StyleSheet, Dimensions, Linking } from 'react-native';
import React, { memo, useContext } from 'react';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import EventListItem from './EventListItem';
import Svg, { Path } from 'react-native-svg';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectBottomSheetStage,
    selectCurrentLocationCoords,
    selectNearbyEvents,
    selectSearchedSource,
} from '@/typescript/state/client/session';
import { MapContext } from '@/typescript/Maps/MapContext';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { getAddressFromComponents } from '@/helpers/utils/Location/LocationUtils.bs';
import { FlatList } from 'react-native-gesture-handler';
import { EventCell } from 'config-types';

const screenWidth = Dimensions.get('screen').width;

const NearbyEvents = () => {
    const eventsData = useAppSelector(selectNearbyEvents);
    const title = eventsData.topTitle;
    const eventsCell = eventsData.eventsCell;
    const bottomImageUrl = eventsData.bottomImageUrl;
    const topLottieUrl = eventsData.topLottieUrl;
    const backgroundColor = eventsData.backgroundColor;
    const source = useAppSelector(selectSearchedSource);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { searchForRides } = useSearchUtils();
    const { mapRef } = useContext(MapContext);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const itemOnPress = ({ item }: { item: EventCell }) => {
        try {
            switch (item.action) {
                case 'openLink': {
                    Linking.openURL(item.actionPayload);
                    break;
                }
                default:
                    {
                        if (source != null && item.rideData) {
                            const newLocation: location = {
                                title: item.rideData.title,
                                subtitle: item.rideData.fullAddress,
                                lat: item.rideData.lat,
                                lng: item.rideData.lon,
                                specialLocation: undefined,
                                placeId: undefined,
                                tag: 'AUTOCOMPLETE',
                                addressComponents:
                                    getAddressFromComponents(item.rideData.fullAddress, undefined, undefined) ??
                                    undefined,
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
                                false,
                            );
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error(error);
        }
    };

    const listRenderItem = ({ item, index }: { item: EventCell; index: number }) => {
        return (
            <EventListItem
                title={item.title}
                subtitle={item.subtitle}
                subtitle2={item.subtitle2}
                image={item.image}
                onPress={() => itemOnPress({ item })}
                buttonImage={item.buttonImage}
                buttonTitle={item.buttonTitle}
                buttonBg={item.buttonBg}
                buttonTextColor={item.buttonTextColor}
                marginLeft={index === 0 ? 20 : 16}
            />
        );
    };
    const animatedTranslateStyle = useAnimatedStyle(() => {
        return {
            // transform: [{ translateX: translateX.value }], // Need to measure scroll value
        };
    });

    if (eventsCell.length === 0) return null;

    return (
        <View style={[styles.container, { backgroundColor: backgroundColor }]}>
            <Svg height="100" width={screenWidth} viewBox={`0 0 ${screenWidth} 100`} style={styles.curve}>
                <Path
                    d={`M 0 30 Q ${screenWidth / 2} -30 ${screenWidth} 30 L ${screenWidth} 0 L 0 0 Z`}
                    fill="#F2F1F4"
                />
            </Svg>
            <LottieWithFallback
                fallback={undefined}
                style={styles.lottieStyle}
                source={{
                    uri: topLottieUrl,
                }}
                autoPlay
                loop
            />
            <View style={styles.subContainer}>
                <Typography
                    style={styles.componentTitle}
                    numberOfLines={undefined}
                    type={'callout-2'}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
                <FlatList
                    data={eventsCell}
                    keyExtractor={item => item.title}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    renderItem={listRenderItem}
                />
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bottom image"
                    style={[styles.imageStyle, animatedTranslateStyle]}
                    source={{ uri: bottomImageUrl }}
                />
            </View>
        </View>
    );
};

export default memo(NearbyEvents);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
    },
    curve: {
        position: 'absolute',
        top: 0,
    },
    subContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40, //curve height
    },
    componentTitle: {
        color: '#2C2A2E',
        marginHorizontal: 100,
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 20,
    },
    imageStyle: {
        flex: 1,
        width: screenWidth * 1.5,
        height: 120,
        resizeMode: 'center', // or 'cover'
        marginTop: 30,
    },
    lottieStyle: {
        position: 'absolute',
        height: 100,
        width: '100%',
        top: 0,
    },
});
