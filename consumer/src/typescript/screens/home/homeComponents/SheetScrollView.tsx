import { ServiceOptionList } from '@/typescript/components/ny-service/ServiceOptionList';
import { FamousSpots } from './FamousSpots';
import FooterView from './FooterView';
import { HomeScreenCarousel } from './HomeScreenCarousel';
import RecentSearches from './RecentSearches';
import Animated from 'react-native-reanimated';
import { getSuggestionDestinations, getSuggestedTrips } from '@/src-v2/helpers/location/utils/LocationCaching';
import {
    selectCityConfig,
    selectCurrentLocation,
    selectFeatureFlags,
    selectHomeScreenModules,
    selectAppConfig,
} from '@/typescript/state/client/session';
import {
    selectCachedDestinations,
    selectActiveBookingIds,
    selectFollowers,
    selectUserProfile,
    selectRecentTrip,
    setRecentTrip,
    selectSuggestedDestination,
    setSuggestedDestination,
} from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { Fragment, useMemo, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import {
    GeolocationResponse,
    locationFromExploreSection,
    locationToTripLocationObject,
} from '@/typescript/utils/location';
import NearbyEvents from './eventViews/NearbyEvents';
import HourlyRentals from './hourlyRentalViews/HourlyRentals';
import Intercity from './intercityViews/Intercity';
import { StyleProp, ViewStyle, StyleSheet, Platform } from 'react-native';
import { FamousDestProps, HomescreenModules } from '@/src-v2/systems/configs/types';
import { LocationObjectCaching } from '@/helpers/utils/Location/LocationCaching.gen';
import HomeActivityComponent from './homeScreenActivities/HomeActivityComponent';
import { selectToken } from '@/typescript/state/client/auth';
import { BottomSheetSectionList, BottomSheetSectionListMethods } from '@gorhom/bottom-sheet';
import { SectionListRenderItem } from 'react-native';
import Favourites from './Favourites/Favourites';

type SheetScrollViewProps = {
    recenterLocation: (zoomLevel: number | undefined, position: GeolocationResponse | undefined) => void;
    style: StyleProp<ViewStyle> | undefined;
};

export type SheetScrollViewRef = {
    scrollToTop: () => void;
};

type SectionItem = {
    id: string;
    component: React.JSX.Element;
};

type SectionData = {
    title: string;
    data: SectionItem[];
};

const homeComponentsList: Record<HomescreenModules, React.JSX.Element> = {
    NEARBY_EVENTS: <NearbyEvents />,
    HOURLY_RENTALS: <HourlyRentals />,
    INTERCITY_RECOMMENDATIONS: <Intercity />,
    NAMMA_SERVICES: <ServiceOptionList showTitle={false} />,
    BANNERS: <HomeScreenCarousel />,
    EXPLORE: <FamousSpots />,
};

const SheetScrollView = forwardRef<SheetScrollViewRef, SheetScrollViewProps>((props, ref) => {
    const sectionListRef = useRef<BottomSheetSectionListMethods>(null);

    useImperativeHandle(ref, () => ({
        scrollToTop: () => {
            sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true });
        },
    }));

    const allCachedDestinations = useAppSelector(selectCachedDestinations);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const featureFlags = useAppSelector(selectFeatureFlags);
    const activeRideIds = useAppSelector(selectActiveBookingIds);
    const haveActiveRides = activeRideIds.length > 0;
    const homeScreenModules = useAppSelector(selectHomeScreenModules);
    const followers = useAppSelector(selectFollowers) ?? [];
    const famousDestinations: FamousDestProps[] = useAppSelector(state => selectCityConfig(state, 'explore_section'));
    const userProfile = useAppSelector(selectUserProfile);
    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();
    const recents = useAppSelector(selectSuggestedDestination) ?? [];
    const recentTrips = useAppSelector(selectRecentTrip) ?? [];
    const appConfig = useAppSelector(selectAppConfig);

    useEffect(() => {
        if (currentLocation) {
            const newSuggested = getSuggestionDestinations(currentLocation, allCachedDestinations);
            const newRecents = getSuggestedTrips(currentLocation, allCachedDestinations);
            dispatch(setSuggestedDestination({ id: userToken, payload: newSuggested }));
            dispatch(setRecentTrip({ id: userToken, payload: newRecents }));
        }
    }, [currentLocation?.lat, currentLocation?.lng, allCachedDestinations]);

    const recentLocations = useMemo(() => {
        return recents.map(recent => locationToTripLocationObject(recent));
    }, [recents]);

    const exploreLocations = useMemo(() => {
        const filteredFamousDestinations = famousDestinations.filter(
            famousDest => famousDest.dynamic_action === undefined,
        );
        return filteredFamousDestinations.map(famousDest =>
            locationToTripLocationObject(locationFromExploreSection(famousDest)),
        );
    }, [famousDestinations]);

    const recentClickedLocations = useMemo(() => {
        const recentLocations = LocationObjectCaching.fetchRecents() ?? [];
        return recentLocations.map(location => locationToTripLocationObject(location));
    }, [LocationObjectCaching.fetchRecents()]);

    const recentLocationList =
        [recentTrips, recentLocations, recentClickedLocations, exploreLocations].find(list => list.length > 0) || [];

    const hideRecentsCondition = recentLocationList.length <= 0 || (followers.length > 0 && haveActiveRides);

    const sectionData = useMemo<SectionData[]>(() => {
        const sections: SectionData[] = [];
        // eslint-disable-next-line functional/no-let
        let itemIndex = 0;

        // Recent searches section
        if (!hideRecentsCondition) {
            // eslint-disable-next-line functional/immutable-data
            sections.push({
                title: 'recents',
                data: [
                    {
                        id: `recents-${itemIndex++}`,
                        component: <RecentSearches locations={recentLocationList} showTitle={false} />,
                    },
                ],
            });
        }

        // Favourites section
        if (featureFlags.favouriteDriver && appConfig.flowConfig.enable_ride_hailing) {
            //eslint-disable-next-line functional/immutable-data
            sections.push({
                title: 'favourites',
                data: [
                    {
                        id: `favourites-${itemIndex++}`,
                        component: <Favourites showFavoriteTitle={false} />,
                    },
                ],
            });
        }

        // Home activity section
        // eslint-disable-next-line functional/immutable-data
        sections.push({
            title: 'activity',
            data: [
                {
                    id: `activity-${itemIndex++}`,
                    component: <HomeActivityComponent />,
                },
            ],
        });

        // Home screen modules section
        const moduleItems: SectionItem[] = homeScreenModules
            .filter(
                (module: HomescreenModules) =>
                    !(module === 'BANNERS' && userProfile?.disability === 'BLIND_LOW_VISION'),
            )
            .map((module: HomescreenModules) => {
                const Comp = homeComponentsList[module];
                if (!Comp) return null;
                return {
                    id: `module-${module}-${itemIndex++}`,
                    component: <Fragment key={module}>{Comp}</Fragment>,
                };
            })
            .filter((item): item is SectionItem => item !== null);

        if (moduleItems.length > 0) {
            // eslint-disable-next-line functional/immutable-data
            sections.push({
                title: 'modules',
                data: moduleItems,
            });
        }

        // Footer section
        // eslint-disable-next-line functional/immutable-data
        sections.push({
            title: 'footer',
            data: [
                {
                    id: `footer-${itemIndex++}`,
                    component: <FooterView />,
                },
                {
                    id: `spacing-${itemIndex++}`,
                    component: <Animated.View style={styles.bottomSpacing} />,
                },
            ],
        });

        return sections;
    }, [
        hideRecentsCondition,
        recentLocationList,
        featureFlags.favouriteDriver,
        appConfig.flowConfig.enable_ride_hailing,
        homeScreenModules,
        userProfile?.disability,
    ]);

    const renderItem: SectionListRenderItem<SectionItem, SectionData> = ({ item }) => {
        return <Animated.View style={props.style}>{item.component}</Animated.View>;
    };

    const renderSectionHeader = () => null;

    return (
        <BottomSheetSectionList
            ref={sectionListRef}
            directionalLockEnabled={true}
            sections={sectionData}
            windowSize={Platform.OS === 'android' ? 4 : 10}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            bounces={true}
            scrollEnabled={true}
            overScrollMode={'always'}
            accessible={true}
            keyExtractor={(item: SectionItem) => item.id}
            contentContainerStyle={[props.style, styles.contentContainer]}
        />
    );
});

export default SheetScrollView;

const styles = StyleSheet.create({
    contentContainer: {
        // gap: 28,
    },
    bottomSpacing: {
        height: 94,
    },
});
