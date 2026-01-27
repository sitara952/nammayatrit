import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { type journeyLeg } from '@/readOnly/api/types/JourneyLeg.gen';
import { type legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';
import { type routeDetail } from '@/readOnly/api/types/RouteDetail.gen';

/**
 * Converts journeyLeg[] to legInfo[] format for use with useTimetables hook
 * @param journeyLegs Array of journey legs in journeyLeg format
 * @returns Array of legInfo objects with essential fields mapped
 */
export const convertJourneyLegsToLegInfo = (journeyLegs: journeyLeg[]): legInfo[] => {
    const journeyLegsStartTime = new Date().toISOString();

    const result = journeyLegs.map(journeyLeg => {
        // Handle different journey modes
        // eslint-disable-next-line functional/no-let
        let legExtraInfo: legExtraInfo;

        if (journeyLeg.journeyMode === 'Metro') {
            // Metro journey with wait time calculation
            const routeDetails = journeyLeg.routeDetails || [];
            const lineColor = journeyLeg.color || 'default';

            const routeInfo = routeDetails.map((route: routeDetail, routeIndex: number) => {
                const routeInfoItem = {
                    routeCode: route.routeCode || '',
                    allAvailableRoutes: [route.routeCode || ''],
                    originStop: {
                        code: route.fromStationCode || '',
                        name: route.fromStationCode || '',
                        lat: route.fromStationLatLong?.lat || 0,
                        lon: route.fromStationLatLong?.lon || 0,
                        address: undefined,
                        hindiName: undefined,
                        parentStopCode: undefined,
                        timeTakenToTravelUpcomingStop: undefined,
                        regionalName: undefined,
                        routeCodes: undefined,
                    },
                    destinationStop: {
                        code: route.toStationCode || '',
                        name: route.toStationCode || '',
                        lat: route.toStationLatLong?.lat || 0,
                        lon: route.toStationLatLong?.lon || 0,
                        address: undefined,
                        hindiName: undefined,
                        parentStopCode: undefined,
                        timeTakenToTravelUpcomingStop: undefined,
                        regionalName: undefined,
                        routeCodes: undefined,
                    },
                    subOrder: routeIndex + 1,
                    frequency: undefined,
                    journeyStatus: undefined,
                    lineColor: lineColor,
                    lineColorCode: journeyLeg.colorCode,
                    platformNumber: undefined,
                    trackingStatus: undefined,
                    trackingStatusLastUpdatedAt: undefined,
                    trainNumber: undefined,
                };

                return routeInfoItem;
            });

            legExtraInfo = {
                TAG: 'Metro',
                _0: {
                    routeInfo: routeInfo,
                    bookingId: undefined,
                    categories: undefined,
                    providerName: undefined,
                    refund: undefined,
                    ticketNo: undefined,
                    ticketValidity: undefined,
                    tickets: undefined,
                    ticketsCreatedAt: undefined,
                },
            };
        } else if (journeyLeg.journeyMode === 'Subway') {
            // Subway journey
            const routeDetails = journeyLeg.routeDetails || [];
            const lineColor = journeyLeg.color || 'default';

            const routeInfo = routeDetails.map((route, routeIndex) => ({
                routeCode: route.routeCode || '',
                allAvailableRoutes: [route.routeCode || ''],
                originStop: {
                    code: route.fromStationCode || '',
                    name: route.fromStationCode || '',
                    lat: route.fromStationLatLong?.lat || 0,
                    lon: route.fromStationLatLong?.lon || 0,
                    address: undefined,
                    hindiName: undefined,
                    parentStopCode: undefined,
                    timeTakenToTravelUpcomingStop: undefined,
                    regionalName: undefined,
                    routeCodes: undefined,
                },
                destinationStop: {
                    code: route.toStationCode || '',
                    name: route.toStationCode || '',
                    lat: route.toStationLatLong?.lat || 0,
                    lon: route.toStationLatLong?.lon || 0,
                    address: undefined,
                    hindiName: undefined,
                    parentStopCode: undefined,
                    timeTakenToTravelUpcomingStop: undefined,
                    regionalName: undefined,
                    routeCodes: undefined,
                },
                subOrder: routeIndex + 1,
                frequency: undefined,
                journeyStatus: undefined,
                lineColor: lineColor,
                lineColorCode: journeyLeg.colorCode,
                platformNumber: undefined,
                trackingStatus: undefined,
                trackingStatusLastUpdatedAt: undefined,
                trainNumber: undefined,
            }));

            legExtraInfo = {
                TAG: 'Subway',
                _0: {
                    routeInfo: routeInfo,
                    bookingId: undefined,
                    deviceId: undefined,
                    providerName: undefined,
                    categories: undefined,
                    providerRouteId: undefined,
                    refund: undefined,
                    sdkToken: undefined,
                    selectedServiceTier: undefined,
                    ticketNo: undefined,
                    ticketTypeCode: undefined,
                    ticketValidity: undefined,
                    ticketValidityHours: [],
                    tickets: undefined,
                    ticketsCreatedAt: undefined,
                },
            };
        } else if (journeyLeg.journeyMode === 'Bus') {
            // Bus journey
            legExtraInfo = {
                TAG: 'Bus',
                _0: {
                    routeCode: journeyLeg.routeDetails?.[0]?.routeCode || '',
                    routeName: journeyLeg.routeDetails?.[0]?.routeCode || '',
                    originStop: {
                        code: journeyLeg.fromStationCode || '',
                        name: journeyLeg.fromStationCode || '',
                        lat: journeyLeg.fromLatLong?.lat || 0,
                        lon: journeyLeg.fromLatLong?.lon || 0,
                        address: undefined,
                        hindiName: undefined,
                        parentStopCode: undefined,
                        timeTakenToTravelUpcomingStop: undefined,
                        regionalName: undefined,
                        routeCodes: undefined,
                    },
                    destinationStop: {
                        code: journeyLeg.toStationCode || '',
                        name: journeyLeg.toStationCode || '',
                        lat: journeyLeg.toLatLong?.lat || 0,
                        lon: journeyLeg.toLatLong?.lon || 0,
                        address: undefined,
                        hindiName: undefined,
                        parentStopCode: undefined,
                        timeTakenToTravelUpcomingStop: undefined,
                        regionalName: undefined,
                        routeCodes: undefined,
                    },
                    alternateShortNames: [],
                    bookingId: undefined,
                    categories: undefined,
                    discounts: undefined,
                    fleetNo: undefined,
                    frequency: undefined,
                    providerName: undefined,
                    refund: undefined,
                    selectedServiceTier: undefined,
                    busConductorId: undefined,
                    busDriverId: undefined,
                    ticketNo: undefined,
                    ticketValidity: undefined,
                    tickets: undefined,
                    ticketsCreatedAt: undefined,
                    trackingStatus: undefined,
                    trackingStatusLastUpdatedAt: undefined,
                },
            };
        } else if (journeyLeg.journeyMode === 'Taxi') {
            // Taxi journey
            legExtraInfo = {
                TAG: 'Taxi',
                _0: {
                    batchConfig: undefined,
                    bookingId: undefined,
                    bppRideId: undefined,
                    chargeableRideDistance: undefined,
                    destination: {
                        lat: journeyLeg.toLatLong?.lat || 0,
                        lon: journeyLeg.toLatLong?.lon || 0,
                        address: {
                            area: undefined,
                            areaCode: undefined,
                            building: undefined,
                            city: undefined,
                            country: undefined,
                            door: undefined,
                            extras: undefined,
                            instructions: undefined,
                            placeId: undefined,
                            state: undefined,
                            street: undefined,
                            title: undefined,
                            ward: undefined,
                        },
                        createdAt: new Date().toISOString(),
                        id: journeyLeg.journeyLegId || '',
                        updatedAt: new Date().toISOString(),
                    },
                    driverMobileNumber: undefined,
                    driverName: undefined,
                    exoPhoneNumber: undefined,
                    extraDistanceFare: undefined,
                    extraTimeFare: undefined,
                    fareProductType: undefined,
                    origin: {
                        lat: journeyLeg.fromLatLong?.lat || 0,
                        lon: journeyLeg.fromLatLong?.lon || 0,
                        address: {
                            area: undefined,
                            areaCode: undefined,
                            building: undefined,
                            city: undefined,
                            country: undefined,
                            door: undefined,
                            extras: undefined,
                            instructions: undefined,
                            placeId: undefined,
                            state: undefined,
                            street: undefined,
                            title: undefined,
                            ward: undefined,
                        },
                        createdAt: new Date().toISOString(),
                        id: journeyLeg.journeyLegId || '',
                        updatedAt: new Date().toISOString(),
                    },
                    otp: undefined,
                    rideEndTime: undefined,
                    rideId: undefined,
                    rideStartTime: undefined,
                    serviceTierName: undefined,
                    tollDifference: undefined,
                    trackingStatus: undefined,
                    trackingStatusLastUpdatedAt: undefined,
                    vehicleIconUrl: undefined,
                    vehicleNumber: undefined,
                    waitingCharges: undefined,
                },
            };
        } else {
            // Walk journey (default fallback)
            legExtraInfo = {
                TAG: 'Walk',
                _0: {
                    id: journeyLeg.journeyLegId || '',
                    origin: {
                        lat: journeyLeg.fromLatLong?.lat || 0,
                        lon: journeyLeg.fromLatLong?.lon || 0,
                        address: {
                            area: undefined,
                            areaCode: undefined,
                            building: undefined,
                            city: undefined,
                            country: undefined,
                            door: undefined,
                            extras: undefined,
                            instructions: undefined,
                            placeId: undefined,
                            state: undefined,
                            street: undefined,
                            title: undefined,
                            ward: undefined,
                        },
                        createdAt: new Date().toISOString(),
                        id: journeyLeg.journeyLegId || '',
                        updatedAt: new Date().toISOString(),
                    },
                    destination: {
                        lat: journeyLeg.toLatLong?.lat || 0,
                        lon: journeyLeg.toLatLong?.lon || 0,
                        address: {
                            area: undefined,
                            areaCode: undefined,
                            building: undefined,
                            city: undefined,
                            country: undefined,
                            door: undefined,
                            extras: undefined,
                            instructions: undefined,
                            placeId: undefined,
                            state: undefined,
                            street: undefined,
                            title: undefined,
                            ward: undefined,
                        },
                        createdAt: new Date().toISOString(),
                        id: journeyLeg.journeyLegId || '',
                        updatedAt: new Date().toISOString(),
                    },
                    trackingStatus: undefined,
                    trackingStatusLastUpdatedAt: undefined,
                },
            };
        }

        const legInfo: legInfo = {
            travelMode: journeyLeg.journeyMode,
            order: journeyLeg.journeyLegOrder,
            legExtraInfo: legExtraInfo,
            startTime: journeyLegsStartTime,
            estimatedDuration: journeyLeg.duration || undefined,
            estimatedDistance: journeyLeg.distance
                ? {
                      unit: journeyLeg.distance.unit,
                      value: journeyLeg.distance.value,
                  }
                : undefined,
            bookingAllowed: false,
            merchantId: '',
            merchantOperatingCityId: '',
            personId: '',
            searchId: '',
            actualDistance: undefined,
            hasApplicablePasses: undefined,
            bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
            entrance: undefined,
            estimatedChildFare: undefined,
            estimatedMaxFare: journeyLeg.estimatedMaxFare
                ? {
                      amount: journeyLeg.estimatedMaxFare,
                      currency: 'INR',
                  }
                : undefined,
            estimatedMinFare: journeyLeg.estimatedMinFare
                ? {
                      amount: journeyLeg.estimatedMinFare,
                      currency: 'INR',
                  }
                : undefined,
            estimatedTotalFare: undefined,
            exit: undefined,
            journeyLegId: journeyLeg.journeyLegId,
            pricingId: undefined,
            totalFare: undefined,
            validTill: journeyLeg.validTill || undefined,
        };

        return legInfo;
    });

    const filteredResult = result.filter((item): item is legInfo => item !== null);

    return filteredResult;
};

const DEFAULT_WAIT_TIMES = {
    peak: 3,
    offPeak: 5,
    night: 8,
};

export const getMetroWaitTimeConstant = (date: Date, _line: string | undefined): number => {
    const hour = date.getHours();

    // eslint-disable-next-line functional/no-let
    let bucket: keyof typeof DEFAULT_WAIT_TIMES;
    if (hour >= 7 && hour < 10) {
        bucket = 'peak'; // 7, 8, 9 AM
    } else if (hour >= 17 && hour < 20) {
        bucket = 'peak'; // 5, 6, 7 PM
    } else if (hour >= 10 && hour < 17) {
        bucket = 'offPeak'; // 10, 11, 12, 1, 2, 3, 4 PM
    } else {
        bucket = 'night'; // 12, 1, 2, 3, 4, 5, 6 AM, 8, 9, 10, 11 PM
    }

    const waitMinutes = DEFAULT_WAIT_TIMES[bucket];
    const waitSeconds = waitMinutes * 60;

    return waitSeconds;
};
