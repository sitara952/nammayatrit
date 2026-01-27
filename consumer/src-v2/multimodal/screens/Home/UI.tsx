import mtIcUnserviceableLocation from '@/typescript/assets/mt_ic_unserviceable_location.webp';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { MultiTransitCard } from './Components/MultiTransitCard';
import { WhereAreYouGoingButton } from './Components/WhereAreYouGoingButton';
import { HomeScreenProps } from './Types';
import Animated from 'react-native-reanimated';
import FavouritesComponentFlow from '@/src-v2/components/FavouritesComponent/Flow';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BottomSheetStage, selectAppConfig } from '@/typescript/state/client/session';
import { logPrefixEvent, EventPrefix } from '@/typescript/utils/logger';
import { FamousSpots } from '@/typescript/screens/home/homeComponents/FamousSpots';
import { HomeScreenCarousel } from '@/typescript/screens/home/homeComponents/HomeScreenCarousel';
import { useNearbyVehicleMarkers } from '@/src-v2/hooks/useNearbyVehicleMarkers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAppSelector } from '@/typescript/state/hooks';

export const HomeScreenUI: React.FC<HomeScreenProps> = ({
    mpDispatch,
    isCurrentLocationServiceable,
    favoritesOnClick,
    isVisible,
    onHeightChange,
    bottomSheetStage,
    isLiveBusTracking,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const appConfig = useAppSelector(selectAppConfig);

    useNearbyVehicleMarkers({
        bottomSheetStage,
        enabled: appConfig.flowConfig.nearByBusConfig.showNearbyBus,
        travelMode: 'Bus',
        navigation,
        startTracking: isLiveBusTracking,
    });

    const handlePlanJourneyPress = () => {
        mpDispatch({ type: 'PLAN_JOURNEY' }, userLanguageStrings);
    };

    if (isCurrentLocationServiceable !== undefined && !isCurrentLocationServiceable) {
        return (
            <View style={styles.serviceabilityContainer}>
                <Image
                    style={styles.image}
                    source={mtIcUnserviceableLocation}
                    accessible={true}
                    accessibilityLabel="unserviceable location image"
                />
                <Text>{userLanguageStrings.Currentlocationisnotserviceable}</Text>
            </View>
        );
    }

    return (
        <>
            <View
                style={tailwind.style('pb-4', { display: isVisible ? 'flex' : 'none' })}
                onLayout={e => {
                    const height = e.nativeEvent.layout.height;
                    if (onHeightChange) onHeightChange(height);
                }}>
                <Animated.View style={tailwind.style('px-5')}>
                    <WhereAreYouGoingButton onPress={handlePlanJourneyPress} />
                </Animated.View>

                <Animated.View style={tailwind.style('px-5 pt-[24px]')}>
                    <MultiTransitCard
                        onPressMore={() => {}}
                        onPressModes={mode => {
                            logPrefixEvent(EventPrefix.MT_HOME, mode);
                            mpDispatch(
                                { type: 'GO_TO_SINGLE_MODE_BOOKING', payload: { bookingType: mode } },
                                userLanguageStrings,
                            );
                        }}
                    />
                </Animated.View>
                {bottomSheetStage === BottomSheetStage.Home && (
                    <View style={tailwind.style('pb-2')}>
                        <HomeScreenCarousel />
                    </View>
                )}
                <Animated.View style={tailwind.style('')}>
                    <Animated.Text
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[14px] text-[#969696] pb-[14px] pl-[20px]',
                        )}>
                        {userLanguageStrings.Favorites}
                    </Animated.Text>
                    <FavouritesComponentFlow
                        onFavouriteItemPress={favoritesOnClick}
                        showTitle={false}
                        initialLeftPadding={0}
                        gap={10}
                        favTagsStyle={undefined}
                        isMultiModal={true}
                    />
                </Animated.View>
            </View>

            {bottomSheetStage === BottomSheetStage.Home && (
                <View style={tailwind.style('pb-20 -mt-4')}>
                    <FamousSpots />
                </View>
            )}
        </>
    );
};

export default HomeScreenUI;

const styles = StyleSheet.create({
    serviceabilityContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 24,
        pointerEvents: 'none',
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginTop: 16,
    },
});
