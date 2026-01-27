import {
    GenericStopsPicker,
    GenericStopsPickerItem,
} from '@/src-v2/multimodal/screens/SingleModeTicketBooking/components/GenericStopsPicker';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useEffect, useMemo, useRef, useState } from 'react';
import Animated, { LinearTransition, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { getServiceTierImage } from '../../../../utils/BusServiceUtils';
import { BusRouteSheetProps } from './BusRouteSheet';
import { RouteSelectionModal } from './RouteSelectionModal';
import { sortStationsBySequence, findNearestStationForBusOtp, computeFilteredRouteSections } from '../../utils';
import { selectValidBusOtpLastClickLocation } from '@/typescript/state/client/session';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/typescript/state/store';
import {
    selectAvailableRoutes,
    selectCurrentRouteIndex,
    selectShowRouteSelectionModal,
    selectRouteByIndex,
    setShowRouteSelectionModal,
    selectRouteStopMappings,
    selectAllStations,
    updateSourceStation,
    selectFilteredRouteSections,
    updateFilteredRouteSections,
} from '../../busOtp';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Icon } from '../../../../components/common/Icon';
import CrossIcon from '../../../Search/components/svg/CloseIcon';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';

import { FrfsPaymentFlow } from '@/src-v2/multimodal/components/FrfsPayment/FrfsPaymentFlow';
import { JourneyInfoData } from '../Types';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { JourneyDetailsProps } from '../../../../screens/JourneyInfoScreen';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { Platform, View } from 'react-native';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectSuggestedBusDataCumulative, setToastProps } from '@/typescript/state/client/session';
import {
    DestinationPickerWithSections,
    StationSection,
    StationType,
} from '../../../MetroSubwayBooking/components/DestinationPickerWithSections';
import { capitalize } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { EventPrefix, logPrefixEvent } from '@/typescript/utils/logger';
import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';

const StopsPickerShimmer = () => (
    <Animated.View style={tailwind.style('bg-white rounded-[24px] border-[1px] border-[#EFEFEF] p-4')}>
        <Shimmer width={100} height={16} borderRadius={4} />
        <Animated.View style={tailwind.style('mt-3')}>
            {[1, 2, 3].map(index => (
                <Animated.View key={index} style={tailwind.style('mb-2')}>
                    <Shimmer width="100%" height={20} borderRadius={6} />
                </Animated.View>
            ))}
        </Animated.View>
    </Animated.View>
);

const EditSvg = () => {
    return (
        <Svg width="28" height="26" viewBox="0 0 28 26" fill="none">
            <Rect width="28" height="26" rx="8" fill="#EFEFEF" />
            <Path
                d="M7.66351 14.9894C7.3564 15.2965 7.17213 15.7177 7.15458 16.1564L7.00541 19.4908C6.98786 20.0085 7.40904 20.4296 7.91797 20.4033L11.2523 20.2629C11.691 20.2454 12.1034 20.0611 12.4193 19.754L17.649 14.5244L12.8844 9.75977L7.66351 14.9894Z"
                fill="#016ACD"
            />
            <Path
                d="M20.7645 8.30333L19.1061 6.64493C18.2462 5.78502 16.8598 5.78502 15.9999 6.64493L14.7451 7.8997L19.5097 12.6643L20.7645 11.4095C21.6244 10.5496 21.6244 9.16323 20.7645 8.30333Z"
                fill="#016ACD"
            />
        </Svg>
    );
};

/**
 * Props for the PickSourceDestinationContent component
 * This component allows users to select source and destination stops for a bus route
 */
export interface PickSourceDestinationContentProps {
    /** Props for the BusRouteSheet component which handles bus route confirmation */
    busRouteProps: BusRouteSheetProps;

    /** List of all available bus stops that can be selected */
    stops: GenericStopsPickerItem[];

    /** Currently selected source stop */
    selectedSource: GenericStopsPickerItem | null;

    /** Currently selected destination stop */
    selectedDestination: transportStation | null;
    originalSelectedSource: transportStation | undefined;

    /** Callback fired when user selects a source stop
     * @param stop - The selected source stop
     */
    onSourceSelect: (stop: GenericStopsPickerItem) => void;

    /** Callback fired when user selects a destination stop
     * @param stop - The selected destination stop
     */
    onDestinationSelect: (stop: transportStation) => void;

    onEditClicked: () => void;

    /** Type of bus service (e.g., 'AC', 'NON_AC', etc.)
     * Used to display the appropriate service tier image
     */
    busServiceType: FRFSServiceTierType_fRFSServiceTierType | undefined;

    /** List of all available source stops that can be selected */
    destinationStopsList: transportStation[];
    frequentVisitDestinations: transportStation[];

    /** List of all available destination stops that can be selected */
    sourceStopsList: GenericStopsPickerItem[];

    /** Bus number */
    busNumber: string;

    /** OTP */
    otp: string;

    detectedRouteCode: string | null;

    // Journey-related props
    correctedJourneyInfoData: JourneyInfoData;
    currentJourney: journeyData | null;
    currentLocation: location | null;
    publicTransportSearch: JourneyDetailsProps | undefined;
    searchId: string | null;
    isSingleMode: boolean;
    isJourneyConfirmed: boolean;
    loadingDataForLeg: number | null;
    setLoadingDataForLeg: (loading: number | null) => void;
    setIsJourneyConfirmed: (value: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    onMoreOptions: undefined;
    fetchingLegsFare: boolean;
    serviceTypeName: string | undefined;

    /** Callback fired when user presses go back */
    onGoBack: () => void;
    onSwitchRoute: () => void;
    isSwitchRouteEnabled: boolean;

    /** Loading states */
    frfsRouteDataLoading?: boolean;
    frfsRouteDataError?: string | null;
}

export const PickSourceDestinationContent = ({
    // busRouteProps,
    stops,
    selectedSource,
    selectedDestination,
    sourceStopsList,
    destinationStopsList,
    frequentVisitDestinations,
    onSourceSelect,
    busServiceType,
    onDestinationSelect,
    originalSelectedSource,
    detectedRouteCode: _detectedRouteCode,
    busNumber,
    otp,
    correctedJourneyInfoData: _correctedJourneyInfoData,
    publicTransportSearch,

    navigation,
    fetchingLegsFare: _fetchingLegsFare,
    onGoBack,
    onSwitchRoute,
    isSwitchRouteEnabled,
    frfsRouteDataLoading = false,
    onEditClicked,
    frfsRouteDataError: _frfsRouteDataError = null,
    serviceTypeName,
}: PickSourceDestinationContentProps) => {
    const serviceTierImage = useMemo(() => getServiceTierImage('BUS', busServiceType), [busServiceType]);
    const { top } = useSafeAreaInsets();
    const destinationPickerRef = useRef<View>(null);
    const themeColors = useConfigContext().get('themeColors');
    const userLanguageStrings = useConfigContext().get('userLanguageStrings');

    // Redux hooks
    const dispatch = useDispatch();
    const availableRoutes = useSelector((state: RootState) => selectAvailableRoutes(state, otp));
    const routeStopMappings = useSelector((state: RootState) => selectRouteStopMappings(state, otp));
    const allStations = useSelector((state: RootState) => selectAllStations(state, otp));
    const selectedRouteIndex = useSelector((state: RootState) => selectCurrentRouteIndex(state, otp));
    const showRouteModal = useSelector((state: RootState) => selectShowRouteSelectionModal(state, otp));
    const filteredRouteSections = useSelector((state: RootState) => selectFilteredRouteSections(state, otp));
    const [collapseDestinationPicker, setCollapseDestinationPicker] = useState<boolean | undefined>(undefined);
    const suggestedBusData = useAppSelector(selectSuggestedBusDataCumulative);
    const storedLoc = useAppSelector(selectValidBusOtpLastClickLocation);

    const sortedStationsForDestinationPicker = useMemo(() => {
        const reorderedRouteSections: StationSection[] = [...filteredRouteSections];

        if (selectedRouteIndex >= 0 && selectedRouteIndex < reorderedRouteSections.length) {
            const selectedSection = reorderedRouteSections[selectedRouteIndex];
            // eslint-disable-next-line functional/immutable-data
            reorderedRouteSections.splice(selectedRouteIndex, 1);
            // eslint-disable-next-line functional/immutable-data
            if (selectedSection) reorderedRouteSections.unshift(selectedSection);
        }

        if (frequentVisitDestinations && frequentVisitDestinations.length > 0) {
            return [
                {
                    title: `Frequently Visited Destinations`,
                    stations: frequentVisitDestinations,
                    routeCode: undefined,
                    type: StationType.FrequentlyVisitedDestinations,
                },
                ...reorderedRouteSections,
            ];
        }

        return reorderedRouteSections;
    }, [filteredRouteSections, frequentVisitDestinations, selectedRouteIndex]);

    const sortedStationsForRouteModal = useMemo(() => {
        return [
            {
                title: `Frequently Visited Destinations`,
                stations: frequentVisitDestinations,
                routeCode: undefined,
                type: StationType.FrequentlyVisitedDestinations,
            },
            {
                title: `Stations towards ${capitalize(destinationStopsList[destinationStopsList.length - 1]?.name)}`,
                stations: destinationStopsList,
                routeCode: undefined,
                type: StationType.Towards,
            },
        ];
    }, [destinationStopsList, frequentVisitDestinations]);

    const handleDestinationSelectWithRouteUpdate = async (
        station: transportStation,
        _isExpanded: boolean,
        routeCode: string | undefined,
    ) => {
        logPrefixEvent(EventPrefix.NY_BUS_CONFIRM_DESTINATION_STOP, selectedDestination?.name ?? '');
        const routeIndex = routeCode
            ? availableRoutes.findIndex(route => route.code === routeCode)
            : availableRoutes.findIndex(route =>
                  routeStopMappings
                      .filter(mapping => mapping.stopCode === station.code)
                      .map(mapping => mapping.routeCode)
                      .includes(route.code),
              );

        if (routeIndex !== -1 && routeIndex !== selectedRouteIndex) {
            dispatch(selectRouteByIndex({ otp: otp, payload: routeIndex }));

            const newRoute = availableRoutes[routeIndex];
            if (newRoute) {
                const newRouteStations = sortStationsBySequence(allStations, routeStopMappings, newRoute.code);

                const sourceExistsInNewRoute =
                    originalSelectedSource && newRouteStations.some(s => s.code === originalSelectedSource.code);

                if (!sourceExistsInNewRoute && newRouteStations.length > 0) {
                    const userLocationOverride = storedLoc ? { coords: storedLoc.coords } : undefined;
                    const nearestInNewRoute = await findNearestStationForBusOtp(
                        newRouteStations,
                        100,
                        50,
                        userLocationOverride,
                    );
                    if (nearestInNewRoute) {
                        dispatch(updateSourceStation({ otp, payload: nearestInNewRoute }));
                    }
                    dispatch(
                        setToastProps({
                            message: 'Source Stop Changed!',
                            visible: true,
                            useSpannedToast: false,
                            spannerType: 'top',
                            backgroundColor: '#016ACD',
                            autoDismissAfter: 2000,
                            buttons: [],
                            logo: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                            bottomSpanDescription: undefined,
                            dismissButton: undefined,
                        }),
                    );
                }
            }
        }

        onDestinationSelect(station);
    };

    const handleGoBack = () => {
        onGoBack();
        navigation.goBack();
    };

    useEffect(() => {
        if (selectedSource?.code === undefined) {
            return;
        }
        const updateSections = async () => {
            const userLocationOverride = storedLoc ? { coords: storedLoc.coords } : undefined;
            const newFilteredSections = await computeFilteredRouteSections(
                selectedSource.code,
                availableRoutes,
                allStations,
                routeStopMappings,
                userLocationOverride,
            );
            dispatch(updateFilteredRouteSections({ otp, payload: newFilteredSections }));
        };
        updateSections();
    }, [selectedSource?.code, storedLoc]);

    const showPaymentFooter = selectedDestination !== null && selectedDestination.code !== selectedSource?.code;

    // Determine what to show in destination picker
    const renderDestinationPicker = () => {
        if (frfsRouteDataLoading) {
            return <StopsPickerShimmer />;
        }

        const otherContentHeight = 336 + (Platform.OS === 'android' ? 100 : 0) + (showPaymentFooter ? 160 : 0);

        if (stops && stops.length > 0) {
            return (
                <DestinationPickerWithSections
                    stationSections={
                        sortedStationsForDestinationPicker.length === 0 ||
                        (sortedStationsForDestinationPicker.length === 1 &&
                            sortedStationsForDestinationPicker?.[0]?.type === StationType.FrequentlyVisitedDestinations)
                            ? sortedStationsForRouteModal
                            : sortedStationsForDestinationPicker
                    }
                    selectedStation={selectedDestination ?? null}
                    onSelectStation={handleDestinationSelectWithRouteUpdate}
                    onClose={() => {}}
                    sourceStation={originalSelectedSource ?? null}
                    isRouteToggleEnabled={isSwitchRouteEnabled}
                    handleRouteToggle={onSwitchRoute}
                    accessibilityRef={destinationPickerRef}
                    initialExpanded={collapseDestinationPicker === undefined ? true : !collapseDestinationPicker}
                    showSearchBar={true}
                    shouldCollapseAfterSelect={true}
                    routeStartStation={sourceStopsList[0]?.name}
                    title="Destination Stop"
                    onSwitchOrSelectRoute={undefined}
                    otherContentHeight={otherContentHeight}
                    showRouteToggle={sortedStationsForDestinationPicker.length === 0}
                    searchInputStyle={''}
                />
            );
        }

        return null;
    };

    return (
        // <HardwareBackpressHandler>
        <Animated.View style={tailwind.style('flex-1 bg-[#F7F7F7]', `pt-[${top + 12}px]`)}>
            <Animated.View style={tailwind.style('pl-4 flex-row items-center justify-between')}>
                <Pressable
                    onPress={handleGoBack}
                    testID={'8853cdcd-96a0-41e9-bc1c-681015f21eae'}
                    accessibilityRole="button"
                    accessibilityLabel="Go back to previous screen button">
                    <Animated.View
                        style={[tailwind.style(`p-[10px] rounded-full bg-[${themeColors.CrossButton_bg}] `)]}>
                        <Icon icon={<CrossIcon />} size={16} />
                    </Animated.View>
                </Pressable>

                {!frfsRouteDataLoading && (
                    <Animated.View
                        style={tailwind.style('absolute items-center justify-center left-0 right-0')}
                        pointerEvents="box-none">
                        <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[24px] font-areaNormal-extrabold text-[#3B3A3C] text-center',
                                )}>
                                {busNumber}
                            </Animated.Text>
                            <Pressable
                                style={tailwind.style('ml-2')}
                                accessibilityRole="button"
                                accessibilityLabel="Change Route button"
                                testID="change-route-button"
                                onPress={onEditClicked}>
                                <EditSvg />
                            </Pressable>
                        </Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] leading-[18px] font-departureMono-regular text-[#7E7E7E] pt-[5px] text-center uppercase',
                            )}>
                            {serviceTypeName?.split(' ')?.[0] || ''}
                        </Animated.Text>
                    </Animated.View>
                )}

                {!frfsRouteDataLoading && (
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel={`service tier ${serviceTypeName} image`}
                        entering={SlideInRight.delay(500)}
                        source={serviceTierImage}
                        resizeMode="contain"
                        style={tailwind.style('h-[120px] w-[80px] absolute -right-[8px]', {
                            transform: [{ scaleX: -1 }],
                        })}
                    />
                )}
            </Animated.View>
            <Animated.View style={tailwind.style('mt-7 px-4 mx-0.5')}>
                <GenericStopsPicker
                    onSelect={onSourceSelect}
                    initialSelectedItem={
                        selectedSource ?? {
                            id: 0,
                            name: userLanguageStrings.SelectSource,
                            code: undefined,
                        }
                    }
                    list={sourceStopsList}
                    initialExpanded={false}
                    shouldCollapseAfterSelect={true}
                    title={userLanguageStrings.SourceStop}
                    expandedTitle={userLanguageStrings.SourceStop}
                    isStandAlone={false}
                    routeToggle={undefined}
                />
            </Animated.View>
            {/* Source Picker */}
            <Animated.View style={tailwind.style('flex-row items-center justify-center my-[10px]')}>
                <Svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                    <Path
                        d="M0.595077 0.703125L5.03405 5.14209C5.18159 5.28963 5.41251 5.28963 5.56005 5.14209L9.99902 0.703125"
                        stroke="#C9C9C9"
                        strokeWidth="1.60881"
                        strokeMiterlimit="10"
                    />
                </Svg>
            </Animated.View>
            {/* Destination Picker */}
            <Animated.View
                layout={LinearTransition.springify().damping(34).stiffness(240)}
                style={tailwind.style('mx-4 rounded-[24px] overflow-hidden')}>
                {renderDestinationPicker()}
            </Animated.View>

            {/* Fixed bottom payment UI - only shows when destination is selected */}
            {showPaymentFooter ? (
                <FrfsPaymentFlow
                    fromStationCode={selectedSource?.code || ''}
                    toStationCode={selectedDestination?.code || ''}
                    vehicleNumber={otp}
                    routeCode={publicTransportSearch?.routeCode}
                    vehicleType="BUS"
                    busLocationData={suggestedBusData}
                    enabled={!!selectedSource?.code && !!selectedDestination?.code}
                    recentLocationId={undefined}
                    navigation={navigation}
                    serviceTier={busServiceType}
                />
            ) : null}
            {/* Destination Picker */}
            {/* <BusRouteSheet {...busRouteProps} /> */}

            {/* RouteSelectionModal - Shows when there are more than 2 routes */}
            {showRouteModal && (
                <RouteSelectionModal
                    isVisible={showRouteModal}
                    routes={availableRoutes}
                    routeStartStation={sourceStopsList[0]?.name}
                    selectedRouteIndex={selectedRouteIndex}
                    originalSelectedSource={originalSelectedSource ?? null}
                    onRouteSelect={index => {
                        dispatch(selectRouteByIndex({ otp: otp, payload: index }));
                    }}
                    destinationStops={sortedStationsForRouteModal}
                    selectedDestination={selectedDestination}
                    onDestinationSelect={stop => {
                        setCollapseDestinationPicker(true);
                        onDestinationSelect(stop);
                    }}
                    onDismiss={() => {
                        dispatch(setShowRouteSelectionModal({ otp: otp, payload: false }));
                    }}
                    destinationPickerRef={destinationPickerRef}
                />
            )}
        </Animated.View>
        // </HardwareBackpressHandler>
    );
};
