import mtIcNammaTransit from '@/src-v2/assets/3D-assets/mt_ic_metro_side.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import {
    enabledMainCategory,
    enabledServicesV3Conf,
    ServiceTag,
    ServiceTagConfig,
} from '@/src-v2/systems/configs/types';
import mtIcCarIntercity from '@/typescript/assets/ny-service/mt_ic_intercity.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { strings } from 'config-types';
import { colors } from 'config-types/src/domain/default/themes/colors';
import React, { useCallback, useMemo } from 'react';
import { ImageSourcePropType, ImageStyle, Platform, StyleProp, StyleSheet, View } from 'react-native';
import Animated, { SlideInLeft, ZoomIn } from 'react-native-reanimated';
import mtIcDelivery from '../../assets/ny-service/mt_ic_3ddelivery.webp';
import mtIcMetroTicket from '../../assets/ny-service/mt_ic_3dmetro.webp';
import mtIcAmbulance from '../../assets/ny-service/mt_ic_ambulance.webp';
import mtIcBookBike from '../../assets/ny-service/mt_ic_bike.webp';
import mtIcBusTicket from '../../assets/ny-service/mt_ic_busticket.webp';
import mtIcCarInstant from '../../assets/ny-service/mt_ic_instant.webp';
import mtIcIntercityBus from '../../assets/ny-service/mt_ic_intercity_bus.webp';
import mtIcCarRentals from '../../assets/ny-service/mt_ic_rental_new.webp';
import mtIcSchedule from '../../assets/ny-service/mt_ic_schedule.webp';
import mtIcTickets from '../../assets/ny-service/mt_ic_tickets.webp';
import mtIcBoating from '../../assets/ny-service/mt_ic_boating_icon.webp';
import mtIcDurgaPuja from '../../assets/ny-service/mt_ic_durgaPuja.webp';
import mtIcTrackBus from '../../assets/ny-service/mt_ic_track_bus.webp';
import { useRefsContext } from '../../context/RefsContext';
import Typography from '../../designSystem/components/primitives/Typography';
import {
    APP_CONFIG,
    selectCityConfig,
    selectTabScreensConfig,
    selectBoatingPlaceConfig,
} from '../../state/client/session';
import { useAppSelector } from '../../state/hooks';
import { PopUpModal } from '../PopUpModal';
import { NammaTransitVideoBottomSheet } from './NammaTransitVideoBottomSheet';
import { ServiceOptionCard } from './ServiceOptionCard';
import { ActionConfig } from '@/src-v2/systems/configs/types';
import { useLazyTicketPlacePlaceIdGetQuery } from '@/api/integrations/rtk/TicketPlacePlaceIdGet';
import type { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';

const MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN = 3;
const SERVICES_PER_ROW = 2;

type ServiceOptionListProps = {
    showTitle: boolean;
};

const createFallbackService = (
    enabledService: enabledServicesV3Conf,
    enabledServicesLength: number,
    handleBoatingPress: (() => void) | undefined,
): ServiceOption => {
    // serviceTag is already ServiceTag type, convert to string for formatting
    const serviceTagStr = String(enabledService.serviceTag);
    const imgSrc = enabledService.serviceImageUrl ? { uri: enabledService.serviceImageUrl } : { uri: '' }; // Empty URI as last resort - should be handled by image component

    return {
        imgSrc,
        label: serviceTagStr
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
        description: '', // Empty string - only used in flex grow view which is rarely shown
        allowFlexGrow: enabledServicesLength < MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN ? enabledService.allowGrow : false,
        serviceTag: enabledService.serviceTag, // Already ServiceTag type, no assertion needed
        category: enabledService.category,
        tagConfig: enabledService.tag,
        onClick: enabledService.onClick,
        onPressOverride: enabledService.serviceTag === 'BOATING' ? handleBoatingPress : undefined,
    };
};

export type ServiceOption = {
    imgSrc: ImageSourcePropType | { uri: string }; // Path to the image source or remote URL
    label: string; // Label for the service
    description: string; // Description of the service
    allowFlexGrow: boolean; // Whether the service card can grow flexibly
    serviceTag: ServiceTag; // Enum for the service tag
    category: enabledMainCategory; // Enum for the service tag
    tagConfig: ServiceTagConfig | undefined; // Tag/badge configuration from remote config
    onClick: ActionConfig | undefined; // Type-safe action configuration
    onPressOverride: (() => void) | undefined; // Optional override for direct function calls
};

export const serviceOptionList = (
    userLanguageStrings: strings,
    enabledServices: enabledServicesV3Conf[],
    handleBoatingPress: (() => void) | undefined,
) => {
    const allServices: ServiceOption[] = [
        {
            imgSrc: mtIcNammaTransit,
            label: APP_CONFIG.value.textConfig.publicTransitText,
            description: userLanguageStrings.Futureofcommute,
            allowFlexGrow: false,
            serviceTag: 'NAMMATRANSIT',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'showNammaTransitPopup', actionData: undefined },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcCarIntercity,
            label: userLanguageStrings.Intercity,
            description: userLanguageStrings.IntercityTravel,
            allowFlexGrow: false,
            serviceTag: 'INTERCITY',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToStage', actionData: 'Search' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcCarInstant,
            label: userLanguageStrings.Instant,
            description: userLanguageStrings.TravelAroundTheCity,
            allowFlexGrow: false,
            serviceTag: 'INSTANT',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToStage', actionData: 'Search' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcCarRentals,
            label: userLanguageStrings.Rentals,
            description: userLanguageStrings.TimeBasedPackages,
            allowFlexGrow: false,
            serviceTag: 'RENTAL',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'servicesTab',
                    screen: 'extendedBookingNavigator',
                    params: { screen: 'rentalsScreen' },
                    pop: true,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcBusTicket,
            label: 'Bus Ticket',
            description: userLanguageStrings.SaveWithPublicTransport,
            allowFlexGrow: false,
            serviceTag: 'BUS',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'servicesTab',
                    screen: 'singleModeBookingNavigator',
                    params: {
                        screen: 'singleModeSearch',
                        params: {
                            bookingType: 'Bus',
                            sourceStop: undefined,
                            fallbackView: false,
                            otp: undefined,
                        },
                    },
                    pop: true,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcBusTicket,
            label: 'Bus Ticket',
            description: userLanguageStrings.SaveWithPublicTransport,
            allowFlexGrow: false,
            serviceTag: 'BUS_V2',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'servicesTab',
                    screen: 'singleModeBookingNavigator',
                    params: {
                        screen: 'singleModeSearch',
                        params: {
                            bookingType: 'Bus',
                            sourceStop: undefined,
                            fallbackView: false,
                            otp: undefined,
                        },
                    },
                    pop: true,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcBusTicket,
            label: 'Bus Ticket',
            description: userLanguageStrings.SaveWithPublicTransport,
            allowFlexGrow: false,
            serviceTag: 'BUS_OTP',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'homeTab',
                    screen: 'busOtpFlow',
                    params: {
                        state: 'Booking',
                        params: undefined,
                        displaySearchBar: true,
                        activePassId: undefined,
                        locationData: undefined,
                    },
                    pop: true,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcIntercityBus,
            label: userLanguageStrings.IntercityBus,
            description: userLanguageStrings.IntercityTickets,
            allowFlexGrow: false,
            serviceTag: 'INTERCITY_BUS',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'redbus', actionData: 'https://app-nammayatri.redbus.in/' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcAmbulance,
            label: 'Ambulance',
            description: userLanguageStrings.EmergencyMedicalServices,
            allowFlexGrow: false,
            serviceTag: 'AMBULANCE_SERVICE',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToStage', actionData: 'Search' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcTickets,
            label: userLanguageStrings.Experiences,
            description: userLanguageStrings.SkipTheLine,
            allowFlexGrow: false,
            serviceTag: 'TICKETING',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'root',
                    screen: 'Ticketing',
                    params: undefined,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcTickets,
            label: 'Tickets',
            description: userLanguageStrings.SkipTheLine,
            allowFlexGrow: false,
            serviceTag: 'HYBRID_TICKETING',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'root',
                    screen: 'Ticketing',
                    params: undefined,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcBoating,
            label: 'Boating',
            description: '',
            allowFlexGrow: false,
            serviceTag: 'BOATING',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'openBoating', actionData: undefined },
            onPressOverride: handleBoatingPress,
        },
        {
            imgSrc: mtIcDurgaPuja,
            label: userLanguageStrings.DiscoverPandals,
            description: userLanguageStrings.SkipTheLine,
            allowFlexGrow: false,
            serviceTag: 'DURGA_PUJO',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: { actionName: 'openBoating', actionData: undefined },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcSchedule,
            label: 'Schedule',
            description: userLanguageStrings.BookARideInAdvance,
            allowFlexGrow: false,
            serviceTag: 'SCHEDULE',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToStage', actionData: 'Search' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcBookBike,
            label: 'Book Bike',
            description: userLanguageStrings.AffordableCityTravel,
            allowFlexGrow: false,
            serviceTag: 'BIKE_TAXI',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToStage', actionData: 'Search' },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcMetroTicket,
            label: 'Metro',
            description: userLanguageStrings.ReliableAndFast,
            allowFlexGrow: false,
            serviceTag: 'METRO',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'homeTab',
                    screen: 'baseHybridFlow',
                    params: {
                        viewParam: 'mt',
                        sharedPrefValues: {},
                    },
                    pop: undefined,
                },
            },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcDelivery,
            label: 'Parcel',
            description: userLanguageStrings.AnywhereInTheCity,
            allowFlexGrow: false,
            serviceTag: 'DELIVERY',
            category: 'PRIVATE',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToHybridFlow', actionData: { viewParam: 'delivery' } },
            onPressOverride: undefined,
        },
        {
            imgSrc: mtIcMetroTicket,
            label: 'Metro',
            description: userLanguageStrings.ReliableAndFast,
            allowFlexGrow: false,
            serviceTag: 'METRO_V2',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: {
                actionName: 'navigateToScreen',
                actionData: {
                    navigator: 'servicesTab',
                    screen: 'singleModeBookingNavigator',
                    params: {
                        screen: 'metroSubwayBooking',
                        params: {
                            vehicleType: 'METRO',
                            station: undefined,
                            triggerEditDestination: undefined,
                        },
                    },
                    pop: true,
                },
            },
            onPressOverride: undefined,
        },
        {
            // Where's My Bus separate config for Kolkata Hybrid flow
            imgSrc: mtIcTrackBus,
            label: 'Track Bus',
            description: userLanguageStrings.TrackBus,
            allowFlexGrow: false,
            serviceTag: 'BUS_HYBRID',
            category: 'PUBLIC',
            tagConfig: undefined,
            onClick: { actionName: 'navigateToHybridFlow', actionData: { viewParam: 'bt' } },
            onPressOverride: undefined,
        },
    ];

    // Filter and sort services based on enabledServices order
    return enabledServices.map(enabledService => {
        const service = allServices.find(s => s.serviceTag === enabledService.serviceTag);

        // If service found in allServices, merge with config values
        if (service) {
            // Resolve image: config URL takes priority, fallback to hardcoded asset
            const imgSrc = enabledService.serviceImageUrl ? { uri: enabledService.serviceImageUrl } : service.imgSrc;

            return {
                ...service,
                imgSrc,
                allowFlexGrow:
                    enabledServices.length < MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN ? enabledService.allowGrow : false,
                category: enabledService.category,
                tagConfig: enabledService.tag,
                onClick: enabledService.onClick || service.onClick,
            };
        }

        // Fallback: create service from config only (for new services not in allServices)
        return createFallbackService(enabledService, enabledServices.length, handleBoatingPress);
    });
};

export const ServiceOptionList: React.FC<ServiceOptionListProps> = ({ showTitle }) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const enabledServicesV3 = useAppSelector(state => selectCityConfig(state, 'enabled_services_v3'));
    const { viewAllServicesRef, nammaTransitVideoBottomSheetModalRef } = useRefsContext();
    const boatingPlaceConfig = useAppSelector(selectBoatingPlaceConfig);
    const [getTicketPlaces] = useLazyTicketPlacePlaceIdGetQuery();
    const tabScreensConfig = useAppSelector(selectTabScreensConfig);

    const handleBoatingPress = useCallback(() => {
        const boatingPlaceId = boatingPlaceConfig.boatingPlaceId;
        if (boatingPlaceId) {
            getTicketPlaces({ placeId: boatingPlaceId })
                .unwrap()
                .then((data: ticketPlaceResp) => {
                    navigation.navigate('EventDetails', { place: data });
                })
                .catch((error: Error) => {
                    console.error('Error loading boating ticket places:', error);
                });
        }
    }, [boatingPlaceConfig.boatingPlaceId, getTicketPlaces, navigation]);

    const servicesList = useMemo(
        () => serviceOptionList(userLanguageStrings, enabledServicesV3.services, handleBoatingPress),
        [userLanguageStrings, enabledServicesV3, handleBoatingPress],
    );
    const getImageTransformStyle = (label: ServiceTag): StyleProp<ImageStyle> => {
        switch (label) {
            case 'RENTAL':
                return { transform: [{ scale: 1.4 }, { translateY: -6 }] };
            case 'INTERCITY_BUS':
            case 'INTERCITY':
                return { transform: [{ scale: 1.4 }, { translateY: -6 }, { translateX: 8 }] };
            case 'INSTANT':
            case 'BUS':
                return { transform: [{ scale: 1.4 }, { translateY: 1 }] };
            case 'METRO':
                return { transform: [{ scale: 1.4 }, { translateY: 1 }] };
            case 'BIKE_TAXI':
            case 'DELIVERY':
            case 'AMBULANCE_SERVICE':
            case 'TICKETING':
            case 'SCHEDULE':
                return { transform: [{ scale: 1 }] };
            case 'METRO_V2':
                return { transform: [{ scale: 1.4 }, { translateY: -6 }] };
            case 'NAMMATRANSIT':
                return { transform: [{ scale: 1.3 }, { translateY: -6 }, { translateX: -12 }] };
            case 'BUS_HYBRID':
                return { transform: [{ scale: 1.4 }, { translateY: 1 }] };
            case 'BUS_V2':
            default:
                return {};
        }
    };

    const viewAllServices = useCallback(() => {
        if (tabScreensConfig.tabs.includes('ServicesTab')) {
            navigation.navigate('mainTabNavigation', { screen: 'serviceTab_homeScreen' }, { pop: true });
        } else {
            viewAllServicesRef.current?.present();
        }
    }, [tabScreensConfig, navigation]);
    return (
        servicesList.length > 0 && (
            <View style={[styles.container]}>
                {showTitle && (
                    <View style={[styles.titleContainer]}>
                        <Typography
                            type="callout-1"
                            style={[styles.titleText]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Services}
                        </Typography>
                    </View>
                )}
                <Animated.View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 6,
                        width: '100%',
                        paddingHorizontal: 20,
                    }}>
                    {servicesList.slice(0, MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN).map((service, index) => {
                        return (
                            <ServiceOptionCard
                                testID={`service_option_${index}`}
                                index={index}
                                key={service.serviceTag}
                                label={service.label}
                                imgSrc={service.imgSrc}
                                allowFlexGrow={false}
                                description={service.description}
                                serviceTag={service.serviceTag}
                                entering={SlideInLeft.delay((MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN - index) * 100)}
                                imageStyle={undefined}
                                cardStyle={undefined}
                                containerStyle={{ height: 120, width: '100%', flex: 1 }}
                                textStyle={undefined}
                                tagConfig={service.tagConfig}
                                onClick={service.onClick}
                                onPressOverride={service.onPressOverride}
                            />
                        );
                    })}
                </Animated.View>
                {servicesList.length > MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN && (
                    <Pressable
                        testID="ViewAllServices"
                        onPress={viewAllServices}
                        style={styles.viewAllButton}
                        accessibilityRole="button"
                        accessibilityLabel={'View all services button'}>
                        <Typography
                            type="callout"
                            style={[styles.viewAllText]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.ViewAll}
                        </Typography>
                    </Pressable>
                )}

                {servicesList.length > MAX_SERVICES_TO_SHOW_ON_HOME_SCREEN && (
                    <PopUpModal
                        sheetRef={viewAllServicesRef}
                        onHardwareBackPress={undefined}
                        style={styles.modalContainer}
                        backgroundStyle={{ backgroundColor: '#f1f1f2' }}
                        showBackdrop={undefined}
                        isScrollable={false}>
                        <Typography
                            type="subhead-800"
                            style={[styles.titleText, styles.allServicesText]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.AllServices}
                        </Typography>
                        <View style={styles.modalServicesContainer}>
                            {Array.from({ length: Math.ceil(servicesList.length / SERVICES_PER_ROW) }).map(
                                (_, rowIndex) => (
                                    <View key={`row-${rowIndex}`} style={styles.serviceRow}>
                                        {servicesList
                                            .slice(
                                                rowIndex * SERVICES_PER_ROW,
                                                rowIndex * SERVICES_PER_ROW + SERVICES_PER_ROW,
                                            )
                                            .map((service, index) => (
                                                <ServiceOptionCard
                                                    testID={`ServiceOptionCardPopUpModal-${index}`}
                                                    index={rowIndex * SERVICES_PER_ROW + index}
                                                    key={`${service.serviceTag}-modal-${rowIndex}-${index}`}
                                                    label={service.label}
                                                    imgSrc={service.imgSrc}
                                                    allowFlexGrow={false}
                                                    description={service.description}
                                                    serviceTag={service.serviceTag}
                                                    entering={ZoomIn.delay((index + 1) * 100)}
                                                    imageStyle={getImageTransformStyle(service.serviceTag)}
                                                    cardStyle={{}}
                                                    containerStyle={{
                                                        height: 150,
                                                        marginHorizontal: 8,
                                                        width: '45%',
                                                    }}
                                                    textStyle={{ fontSize: 12 }}
                                                    tagConfig={service.tagConfig}
                                                    onClick={service.onClick}
                                                    onPressOverride={service.onPressOverride}
                                                />
                                            ))}
                                    </View>
                                ),
                            )}
                        </View>
                    </PopUpModal>
                )}

                {/* NammaTransit Video Bottom Sheet */}
                <NammaTransitVideoBottomSheet sheetRef={nammaTransitVideoBottomSheetModalRef} />
            </View>
        )
    );
};

const styles = StyleSheet.create({
    viewAllButton: {
        backgroundColor: '#fff',
        marginTop: 23,
        maxWidth: 170,
        width: '100%',
        margin: 'auto',
        borderRadius: 20,
        paddingVertical: 9,
        paddingHorizontal: 18,
    },
    titleContainer: {
        alignSelf: 'center',
    },
    viewAllText: {
        color: '#464544',
        fontWeight: 800,
        alignSelf: 'center',
        fontSize: 14,
    },
    titleText: {
        fontSize: 15,
        color: '#78747C',
        fontWeight: 800,
        lineHeight: 20,
        paddingBottom: 14,
        paddingLeft: 4,
    },
    container: {
        marginLeft: 0,
        marginTop: 20,
        borderRadius: 14,
        width: '100%',
    },
    modalContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    modalServicesContainer: {
        marginBottom: 40,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    allServicesText: {
        color: colors.neutral900,
        fontWeight: 'bold',
        fontSize: 16,
    },
    viewAllCard: {
        flexDirection: 'column',
        alignSelf: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#F5F5F5' : undefined,
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F5F5F5',
    },
    viewAllCardContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
    },
    viewAllCardLabel: {
        color: '#2C2C2C',
        fontSize: 12,
        lineHeight: 12,
        textAlign: 'center',
        paddingHorizontal: 7,
        fontFamily: 'AreaNormal-Extrabold',
    },
    viewAllCardDescription: {
        color: '#656565',
        paddingHorizontal: 7,
        fontSize: 9,
        lineHeight: 12,
        textAlign: 'center',
        fontFamily: 'AreaNormal-Bold',
        paddingTop: 3,
    },
    viewAllIconContainer: {
        position: 'absolute',
        bottom: 8,
        width: '100%',
        alignItems: 'center',
    },
});
