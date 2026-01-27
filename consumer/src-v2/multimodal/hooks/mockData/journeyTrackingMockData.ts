/* eslint-disable functional/no-let */
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { type latLong as LatLongType } from '../../../../src/readOnly/api/types/LatLong.gen';
import {
    type ProcessedLegInfo,
    type Stop,
    type UserState,
    type VehicleState,
    type StopsInformationItem,
} from '../../types/journeyTracking';
import { isLegOrderGreaterThan } from '../../utils/journeyTrackingUtils';
import { type geoJsonGeometry } from '@/api/apiTypes/ServiceabilityApi.gen';

export const MOCK_ORIGIN_AREA: geoJsonGeometry = {
    coordinates: [
        {
            lon: 80.22334052295133,
            lat: 13.014125325515437,
        },
        {
            lon: 80.22334052295133,
            lat: 13.014125325515437,
        },
        {
            lon: 80.22390213100414,
            lat: 13.014613881376135,
        },
        {
            lon: 80.22378178653958,
            lat: 13.014776732899733,
        },
        {
            lon: 80.22410939091566,
            lat: 13.015011238904663,
        },
        {
            lon: 80.22420967797007,
            lat: 13.014874443761741,
        },
        {
            lon: 80.22435007984569,
            lat: 13.01497866863997,
        },
        {
            lon: 80.22450385332769,
            lat: 13.014783246958586,
        },
        {
            lon: 80.22426985020235,
            lat: 13.014587825123101,
        },
        {
            lon: 80.22436345145206,
            lat: 13.014457543813862,
        },
        {
            lon: 80.22412944832672,
            lat: 13.014262121721643,
        },
        {
            lon: 80.22400241805849,
            lat: 13.014405431270177,
        },
        {
            lon: 80.22347423957467,
            lat: 13.013968988293897,
        },
        {
            lon: 80.22335389510908,
            lat: 13.014138354316984,
        },
    ],
};

export const MOCK_MG_ROAD_METRO: geoJsonGeometry = {
    coordinates: [
        {
            lon: 77.60657299,
            lat: 12.975452131,
        },
        {
            lon: 77.606128078,
            lat: 12.975602584,
        },
        {
            lon: 77.606220098,
            lat: 12.975895503,
        },
        {
            lon: 77.607608158,
            lat: 12.975572891,
        },
        {
            lon: 77.607510053,
            lat: 12.975214449,
        },
        {
            lon: 77.606887684,
            lat: 12.975376586,
        },
        {
            lon: 77.60674821,
            lat: 12.974754725,
        },
        {
            lon: 77.606724025,
            lat: 12.974656837,
        },
        {
            lon: 77.606514607,
            lat: 12.974710462,
        },
        {
            lon: 77.606459142,
            lat: 12.97472201,
        },
        {
            lon: 77.60657299,
            lat: 12.975452131,
        },
    ],
};

export type JourneySimulationEvent =
    | { type: 'MOVE_VEHICLE_FORWARD'; legIndex: number }
    | { type: 'MOVE_USER_FORWARD'; legIndex: number }
    | { type: 'USER_CHECK_IN'; legIndex: number }
    | { type: 'MARK_LEG_COMPLETE'; legIndex: number }
    | { type: 'SKIP_CURRENT_VEHICLE'; legIndex: number };

const NEARBY_THRESHOLD_METERS = 200;
const REACHED_THRESHOLD_METERS = 100;
const DEFAULT_MOVEMENT_INCREMENT_DEGREES = 0.0002; // Approx 22 meters

function haversineDistance(coords1: LatLongType, coords2: LatLongType): number {
    const R = 6371e3;
    const lat1 = (coords1.lat * Math.PI) / 180;
    const lat2 = (coords2.lat * Math.PI) / 180;
    const deltaLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
    const deltaLon = ((coords2.lon - coords1.lon) * Math.PI) / 180;
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const mkMockStop = (
    stopCode: string,
    name: string,
    sequenceNum: number,
    distance: number,
    vehicleType: string,
    lat: number = 13.00748,
    lon: number = 80.23669,
): Stop => ({
    name,
    code: stopCode,
    parsedGatesInfo: undefined,
    parsedGeoJson: undefined,
    lat,
    lon,
    vehicleType,
    stopCode,
    sequenceNum,
    distance,
    timeFromPrev: 150,
});

const initialCurrentLegGlobal = '1';

const firstMile = false;
const pristineJourneyLegsData: Readonly<ProcessedLegInfo[]> = [
    {
        currentLeg: initialCurrentLegGlobal,
        insideSpecialZone: false,
        userState: firstMile ? 'WAITING' : 'WALK',
        vehicleState: firstMile ? 'RIDESTARTED' : 'VEHICLEISARRIVING',
        transitMode: firstMile ? 'AUTO' : 'WALK',
        riderLocationHistory: [],
        staticInfo: {
            categories: [],
            isLoading: false,
            searchId: 'd907d3a1-998e-4187-8134-a0ef88904600',
            selectedQuoteId: '0f76d5d8-0b57-4757-a5b4-5de0d9d08880',
            selectedServiceTierName: 'Auto',
            busConductorId: undefined,
            busDriverId: undefined,
            duration: 733,
            distance: 926.04,
            legOrder: '0',
            travelMode: firstMile ? 'Taxi' : 'Walk',
            stops: [],
            onRouteStops: [],
            routeWaypoints: [
                firstMile ? { lat: 13.011, lon: 80.2364 } : { lat: 13.01, lon: 80.2364 },
                { lat: 13.009, lon: 80.2365 },
                { lat: 13.008, lon: 80.2366 },
                { lat: 13.007548887457071, lon: 80.23669670269454 },
            ],
            filteredRouteWaypoints: [
                firstMile
                    ? { lat: 13.011, lon: 80.2364, stopInfo: undefined, timeFromStart: undefined }
                    : { lat: 13.01, lon: 80.2364, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.009, lon: 80.2365, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.008, lon: 80.2366, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.007548887457071, lon: 80.23669670269454, stopInfo: undefined, timeFromStart: undefined },
            ],
            origin: {
                stopCode: 'WALK_ORIGIN_0',
                entryGate: 'Anna university Start',
                exitGate: undefined,
                stationName: 'Anna university',
                latLong: { lat: 13.01, lon: 80.2364 },
                geoJson: undefined,
                regionalName: undefined,
            },
            towardsStation: undefined,
            destination: {
                stopCode: 'WALK_DEST_0',
                entryGate: undefined,
                exitGate: 'Anna university Bus Stop',
                stationName: 'Anna university',
                latLong: { lat: 13.007548887457071, lon: 80.23669670269454 },
                geoJson: undefined,
                regionalName: undefined,
            },
            preDestination: {
                stopCode: 'WALK_PRE_DEST_0',
                name: 'Anna university Bus Stop',
            },
            vehicleName: firstMile ? 'KA01AB1234' : null,
            tickets: [],
            ticketCreatedAt: [],
            alternateRoutesNames: [],
            platform: undefined,
            timetable: undefined,
            startTime: '2025-06-14T07:35:29Z',
            driverNumber: '9671102079',
            exoNumber: '8888888888',
            otp: '1234',
            fare: {
                amount: 100,
                currency: 'INR',
            },
            vehicleIconUrl: undefined,
            lineColor: undefined,
            bookingStatus: undefined,
            ticketNumber: undefined,
            allSourceStations: [],
            allDestinationStations: [],
            allTowardsStations: [],
            allLineColors: [],
        },
        realTimeInfo: {
            frequency: 0,
            originStopETAInMinutes: 0,
            destinationStopETAInMinutes: 12,
            upcomingVehicleArrivals: [],
            remainingStops: 0,
            currentStop: undefined,
            confirmedBoardingData: undefined,
            busFleetNumber: undefined,
            possibleCheckInStations: [],
            currentLiveVehicle: undefined,
            liveVehicleData: [
                {
                    id: 'TAXI_KA-01-AB-1234',
                    loc: { lat: 13.011, lon: 80.2364 },
                    stopsInformation: [],
                },
            ],
        },
        riderLocation: { lat: 13.01, lon: 80.2364, timestamp: Date.now(), accuracy: 0, isManual: false },
        displayTransitType: firstMile ? 'AUTO' : 'WALK',
        vehicleIdentifier: firstMile ? 'KA01AB1234' : 'Walking',
        durationInMinutes: 12,
        distanceValue: 926,
        isFirstLeg: true,
        isLastLeg: true,
        splitUpOrientation: 'horizontal',
        isPotentialCurrentLeg: false,
        confirmationCount: 0,
        bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
        trackingStatus: 'InPlan',
        previousTravelModeStatusConfirmed: undefined,
        farawayTarget: undefined,
    },
    {
        currentLeg: initialCurrentLegGlobal,
        insideSpecialZone: false,
        userState: 'WAITING',
        vehicleState: 'VEHICLEARRIVED',
        transitMode: 'BUS',
        riderLocationHistory: [],
        staticInfo: {
            categories: [],
            busConductorId: undefined,
            busDriverId: undefined,
            isLoading: false,
            searchId: 'a2e15b35-84f7-4658-9dd9-46713558dcaf',
            duration: 255,
            distance: 2191.48,
            legOrder: '1',
            travelMode: 'Bus',
            towardsStation: undefined,
            stops: [
                mkMockStop('BUS_ORIGIN_1', 'Anna university Bus Stop', 1, 0, 'BUS', 13.00748, 80.23669),
                mkMockStop('BUS_STOP_A', 'Midpoint A', 2, 500, 'BUS', 13.009, 80.233),
                mkMockStop('BUS_STOP_B', 'Midpoint B', 3, 1000, 'BUS', 13.011, 80.23),
                mkMockStop('BUS_STOP_C', 'Midpoint C', 4, 1500, 'BUS', 13.013, 80.227),
                mkMockStop('BUS_DEST_1', 'Little mount Bus Stop', 5, 2191, 'BUS', 13.0156, 80.22503),
            ],
            onRouteStops: [
                mkMockStop('BUS_ORIGIN_1', 'Anna university Bus Stop', 1, 0, 'BUS', 13.00748, 80.23669),
                mkMockStop('BUS_STOP_A', 'Midpoint A', 2, 500, 'BUS', 13.009, 80.233),
                mkMockStop('BUS_STOP_B', 'Midpoint B', 3, 1000, 'BUS', 13.011, 80.23),
                mkMockStop('BUS_STOP_C', 'Midpoint C', 4, 1500, 'BUS', 13.013, 80.227),
                mkMockStop('BUS_DEST_1', 'Little mount Bus Stop', 5, 2191, 'BUS', 13.0156, 80.22503),
            ],
            routeWaypoints: [
                { lat: 13.006599, lon: 80.241352 },
                { lat: 13.00748, lon: 80.23669 },
                { lat: 13.009, lon: 80.233 },
                { lat: 13.011, lon: 80.23 },
                { lat: 13.013, lon: 80.227 },
                { lat: 13.0156, lon: 80.22503 },
            ],
            filteredRouteWaypoints: [
                { lat: 13.006599, lon: 80.241352, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.00748, lon: 80.23669, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.009, lon: 80.233, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.011, lon: 80.23, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.013, lon: 80.227, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.0156, lon: 80.22503, stopInfo: undefined, timeFromStart: undefined },
            ],
            origin: {
                stopCode: 'BUS_ORIGIN_1',
                entryGate: 'Anna university Bus Stop',
                exitGate: undefined,
                stationName: 'Anna university',
                latLong: { lat: 13.00748, lon: 80.23669 },
                geoJson: undefined,
                regionalName: undefined,
            },
            destination: {
                stopCode: 'BUS_DEST_1',
                entryGate: undefined,
                exitGate: 'Little mount Bus Stop',
                stationName: 'Little mount',
                latLong: { lat: 13.0156, lon: 80.22503 },
                geoJson: undefined,
                regionalName: undefined,
            },
            preDestination: {
                stopCode: 'BUS_PRE_DEST_1',
                name: 'Midpoint B',
            },
            vehicleName: '5B',
            tickets: ['Ticket123'],
            ticketCreatedAt: [],
            alternateRoutesNames: ['5B', '19B'],
            startTime: '2025-06-14T07:47:00Z',
            platform: '1A',
            driverNumber: undefined,
            exoNumber: undefined,
            timetable: undefined,
            otp: undefined,
            fare: undefined,
            vehicleIconUrl: undefined,
            lineColor: undefined,
            bookingStatus: undefined,
            ticketNumber: undefined,
            allSourceStations: [],
            allDestinationStations: [],
            allTowardsStations: [],
            allLineColors: [],
        },
        realTimeInfo: {
            frequency: 15,
            originStopETAInMinutes: 5,
            destinationStopETAInMinutes: 15,
            remainingStops: 5,
            upcomingVehicleArrivals: [5],
            currentStop: undefined,
            confirmedBoardingData: undefined,
            busFleetNumber: undefined,
            currentLiveVehicle: undefined,
            possibleCheckInStations: [],
            liveVehicleData: [
                {
                    id: 'BUS_5B_01',
                    loc: { lat: 13.006599, lon: 80.241352 },
                    stopsInformation: [
                        { sequenceNumber: 1, stopCode: 'BUS_ORIGIN_1', eta: 5 },
                        { sequenceNumber: 2, stopCode: 'BUS_STOP_A', eta: 8 },
                        { sequenceNumber: 3, stopCode: 'BUS_STOP_B', eta: 10 },
                        { sequenceNumber: 4, stopCode: 'BUS_STOP_C', eta: 12 },
                        { sequenceNumber: 5, stopCode: 'BUS_DEST_1', eta: 15 },
                    ],
                },
                {
                    id: 'BUS_5B_02',
                    loc: { lat: 13.0035, lon: 80.245 },
                    stopsInformation: [
                        { sequenceNumber: 1, stopCode: 'BUS_ORIGIN_1', eta: 15 },
                        { sequenceNumber: 2, stopCode: 'BUS_STOP_A', eta: 18 },
                        { sequenceNumber: 3, stopCode: 'BUS_STOP_B', eta: 20 },
                        { sequenceNumber: 4, stopCode: 'BUS_STOP_C', eta: 22 },
                        { sequenceNumber: 5, stopCode: 'BUS_DEST_1', eta: 25 },
                    ],
                },
            ],
        },
        riderLocation: { lat: 13.01, lon: 80.2364, timestamp: Date.now(), accuracy: 0, isManual: false },
        displayTransitType: 'BUS',
        vehicleIdentifier: '5B',
        durationInMinutes: 10,
        distanceValue: 2191,
        isFirstLeg: false,
        isLastLeg: false,
        splitUpOrientation: 'horizontal',
        isPotentialCurrentLeg: false,
        confirmationCount: 0,
        bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
        trackingStatus: 'InPlan',
        previousTravelModeStatusConfirmed: undefined,
        farawayTarget: undefined,
    },
    {
        currentLeg: initialCurrentLegGlobal,
        userState: 'WALK',
        insideSpecialZone: false,
        vehicleState: 'VEHICLEISARRIVING',
        transitMode: 'WALK',
        riderLocationHistory: [],
        staticInfo: {
            categories: [],
            busConductorId: undefined,
            busDriverId: undefined,
            isLoading: false,
            searchId: 'a2e15b35-84f7-4658-9dd9-46713558dcaf',
            duration: 167,
            distance: 183.41,
            legOrder: '2',
            travelMode: 'Walk',
            towardsStation: undefined,
            origin: {
                stopCode: 'WALK_ORIGIN_2',
                entryGate: 'Little mount Bus Stop',
                exitGate: undefined,
                stationName: 'Little mount',
                latLong: { lat: 13.0156, lon: 80.22503 },
                geoJson: undefined,
                regionalName: undefined,
            },
            destination: {
                stopCode: 'WALK_DEST_2',
                entryGate: undefined,
                exitGate: 'Metro Station Entrance',
                stationName: 'Metro Station',
                latLong: { lat: 13.0145467, lon: 80.224248 },
                geoJson: undefined,
                regionalName: undefined,
            },
            preDestination: {
                stopCode: 'WALK_PRE_DEST_2',
                name: 'Metro Station Exit',
            },
            stops: [],
            onRouteStops: [],
            routeWaypoints: [
                { lat: 13.015, lon: 80.2248 },
                { lat: 13.0145467, lon: 80.224248 },
            ],
            filteredRouteWaypoints: [
                { lat: 13.015, lon: 80.2248, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.0145467, lon: 80.224248, stopInfo: undefined, timeFromStart: undefined },
            ],
            vehicleName: null,
            tickets: [],
            ticketCreatedAt: [],
            alternateRoutesNames: [],
            platform: undefined,
            startTime: '2025-06-14T07:57:00Z',
            driverNumber: undefined,
            exoNumber: undefined,
            timetable: undefined,
            otp: undefined,
            fare: undefined,
            vehicleIconUrl: undefined,
            lineColor: undefined,
            bookingStatus: undefined,
            ticketNumber: undefined,
            allSourceStations: [],
            allDestinationStations: [],
            allTowardsStations: [],
            allLineColors: [],
        },
        realTimeInfo: {
            frequency: 0,
            originStopETAInMinutes: 0,
            currentStop: undefined,
            remainingStops: undefined,
            destinationStopETAInMinutes: 3,
            confirmedBoardingData: undefined,
            busFleetNumber: undefined,
            upcomingVehicleArrivals: [],
            currentLiveVehicle: undefined,
            possibleCheckInStations: [],
            liveVehicleData: [],
        },
        riderLocation: { lat: 13.01, lon: 80.2364, timestamp: Date.now(), accuracy: 0, isManual: false },
        displayTransitType: 'WALK',
        vehicleIdentifier: 'Walking',
        durationInMinutes: 3,
        distanceValue: 183,
        isFirstLeg: false,
        isLastLeg: true,
        splitUpOrientation: 'horizontal',
        isPotentialCurrentLeg: false,
        confirmationCount: 0,
        bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
        trackingStatus: 'InPlan',
        previousTravelModeStatusConfirmed: undefined,
        farawayTarget: undefined,
    },
    {
        currentLeg: initialCurrentLegGlobal,
        insideSpecialZone: false,
        userState: 'WAITING',
        vehicleState: 'VEHICLEISARRIVING',
        transitMode: 'METRO',
        riderLocationHistory: [],
        staticInfo: {
            categories: [],
            busConductorId: undefined,
            busDriverId: undefined,
            isLoading: false,
            searchId: 'a2e15b35-84f7-4658-9dd9-46713558dcaf',
            duration: 255,
            distance: 2191.48,
            legOrder: '3',
            travelMode: 'Metro',
            towardsStation: undefined,
            origin: {
                stopCode: 'Metro_ORIGIN_1',
                entryGate: 'Metro Station Entrance',
                exitGate: undefined,
                stationName: 'Metro Station',
                latLong: { lat: 13.0145467, lon: 80.224248 },
                geoJson: undefined,
                regionalName: undefined,
            },
            destination: {
                stopCode: 'Metro_DEST_1',
                entryGate: undefined,
                exitGate: 'Metro Station Exit',
                stationName: 'Metro Station',
                latLong: { lat: 13.000398426389083, lon: 80.19409939798767 },
                geoJson: undefined,
                regionalName: undefined,
            },
            preDestination: {
                stopCode: 'Metro_PRE_DEST_1',
                name: 'Metro Station Exit',
            },
            stops: [
                mkMockStop(
                    'Metro_ORIGIN_1',
                    'Metro Station Entrance',
                    1,
                    0,
                    'METRO',
                    13.01453904055365,
                    80.2242480664533,
                ),
                mkMockStop('Metro_STOP_A', 'Midpoint A', 2, 500, 'METRO', 13.009392139302168, 80.21307469082312),
                mkMockStop('BUS_STOP_B', 'Midpoint B', 3, 1000, 'METRO', 13.007495457364602, 80.20587658394419),
                mkMockStop('Metro_STOP_C', 'Midpoint C', 4, 1500, 'METRO', 13.004267086965532, 80.20152187121988),
                mkMockStop(
                    'Metro_DEST_1',
                    'Metro Station Exit',
                    5,
                    2191,
                    'METRO',
                    13.000398426389083,
                    80.19409939798767,
                ),
            ],
            onRouteStops: [
                mkMockStop(
                    'Metro_ORIGIN_1',
                    'Metro Station Entrance',
                    1,
                    0,
                    'METRO',
                    13.01453904055365,
                    80.2242480664533,
                ),
                mkMockStop('Metro_STOP_A', 'Midpoint A', 2, 500, 'METRO', 13.009392139302168, 80.21307469082312),
                mkMockStop('BUS_STOP_B', 'Midpoint B', 3, 1000, 'METRO', 13.007495457364602, 80.20587658394419),
                mkMockStop('Metro_STOP_C', 'Midpoint C', 4, 1500, 'METRO', 13.004267086965532, 80.20152187121988),
                mkMockStop(
                    'Metro_DEST_1',
                    'Metro Station Exit',
                    5,
                    2191,
                    'METRO',
                    13.000398426389083,
                    80.19409939798767,
                ),
            ],
            routeWaypoints: [
                { lat: 13.0145467, lon: 80.224248 },
                { lat: 13.009392139302168, lon: 80.21307469082312 },
                { lat: 13.007495457364602, lon: 80.20587658394419 },
                { lat: 13.004267086965532, lon: 80.20152187121988 },
                { lat: 13.000398426389083, lon: 80.19409939798767 },
            ],
            filteredRouteWaypoints: [
                { lat: 13.0145467, lon: 80.224248, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.009392139302168, lon: 80.21307469082312, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.007495457364602, lon: 80.20587658394419, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.004267086965532, lon: 80.20152187121988, stopInfo: undefined, timeFromStart: undefined },
                { lat: 13.000398426389083, lon: 80.19409939798767, stopInfo: undefined, timeFromStart: undefined },
            ],
            vehicleName: 'Blueline',
            tickets: [],
            ticketCreatedAt: [],
            alternateRoutesNames: [],
            startTime: '2025-06-14T07:47:00Z',
            platform: '2',
            driverNumber: undefined,
            exoNumber: undefined,
            timetable: undefined,
            otp: undefined,
            fare: undefined,
            vehicleIconUrl: undefined,
            lineColor: undefined,
            bookingStatus: undefined,
            ticketNumber: undefined,
            allSourceStations: [],
            allDestinationStations: [],
            allTowardsStations: [],
            allLineColors: [],
        },
        realTimeInfo: {
            frequency: 15,
            originStopETAInMinutes: 5,
            destinationStopETAInMinutes: 15,
            upcomingVehicleArrivals: [5],
            currentLiveVehicle: undefined,
            confirmedBoardingData: undefined,
            busFleetNumber: undefined,
            possibleCheckInStations: [],
            remainingStops: 5,
            currentStop: undefined,
            liveVehicleData: [],
        },
        riderLocation: { lat: 13.01, lon: 80.2364, timestamp: Date.now(), accuracy: 0, isManual: false },
        displayTransitType: 'METRO',
        vehicleIdentifier: 'Blueline',
        durationInMinutes: 10,
        distanceValue: 2191,
        isFirstLeg: false,
        isLastLeg: true,
        platformInfo: '2',
        splitUpOrientation: 'horizontal',
        isPotentialCurrentLeg: false,
        confirmationCount: 0,
        bookingStatus: { TAG: 'Initial', _0: 'BOOKING_PENDING' },
        trackingStatus: 'InPlan',
        previousTravelModeStatusConfirmed: undefined,
        farawayTarget: undefined,
    },
];

function getNextPosition(
    currentPos: LatLongType,
    targetPos: LatLongType,
    waypoints: Readonly<LatLongType[]>,
    currentWaypointIndex: number | undefined,
): { newPosition: LatLongType; newWaypointIndex: number | undefined } {
    const nextWpIndex = typeof currentWaypointIndex === 'number' ? currentWaypointIndex + 1 : 0;
    if (waypoints.length > 0 && nextWpIndex < waypoints.length) {
        const nextWaypoint = waypoints[nextWpIndex];
        if (nextWaypoint) return { newPosition: nextWaypoint, newWaypointIndex: nextWpIndex };
    }
    const distToTarget = haversineDistance(currentPos, targetPos);
    if (distToTarget < DEFAULT_MOVEMENT_INCREMENT_DEGREES * 111000 * 0.5) {
        return { newPosition: targetPos, newWaypointIndex: undefined };
    }
    const dx = targetPos.lon - currentPos.lon;
    const dy = targetPos.lat - currentPos.lat;
    const angle = Math.atan2(dy, dx);
    const newLat = currentPos.lat + DEFAULT_MOVEMENT_INCREMENT_DEGREES * Math.sin(angle);
    const newLon = currentPos.lon + DEFAULT_MOVEMENT_INCREMENT_DEGREES * Math.cos(angle);
    return { newPosition: { lat: newLat, lon: newLon }, newWaypointIndex: undefined };
}

function getDerivedVehicleState(
    leg: ProcessedLegInfo,
    vehicleLoc: LatLongType | undefined,
    originLoc: LatLongType,
    destLoc: LatLongType,
    _nextStopLoc: LatLongType | undefined,
    userIsOnBoard: boolean,
): VehicleState {
    if (!vehicleLoc || leg.transitMode === 'WALK') return leg.vehicleState;
    const distToOrigin = haversineDistance(vehicleLoc, originLoc);
    const distToDest = haversineDistance(vehicleLoc, destLoc);
    if (userIsOnBoard) {
        if (distToDest < REACHED_THRESHOLD_METERS) return 'RIDEREACHEDDESTINATION';
        if (distToDest < NEARBY_THRESHOLD_METERS) return 'RIDECLOSETODESTINATION';
        return 'RIDESTARTED';
    }
    if (leg.vehicleState === 'VEHICLEWASMISSED') return 'VEHICLEWASMISSED';
    if (leg.vehicleState === 'VEHICLEWILLBEMISSED') return 'VEHICLEWILLBEMISSED';
    if (distToOrigin < REACHED_THRESHOLD_METERS) return 'VEHICLEARRIVED';
    if (distToOrigin < NEARBY_THRESHOLD_METERS) return 'VEHICLEALMOSTARRIVED';
    return leg.vehicleState === 'SEARCHINGFORVEHICLE' ? 'SEARCHINGFORVEHICLE' : 'VEHICLEISARRIVING';
}

function getDerivedUserState(
    leg: ProcessedLegInfo,
    riderLoc: LatLongType | undefined,
    vehicleState: VehicleState,
    _originLoc: LatLongType,
): UserState {
    if (leg.transitMode === 'WALK') return 'WALK';
    if (!riderLoc) return leg.userState;
    if (['RIDESTARTED', 'RIDECLOSETODESTINATION', 'RIDEREACHEDDESTINATION'].includes(vehicleState)) return 'INVEHICLE';
    if (vehicleState === 'VEHICLEWASMISSED') return 'FARAWAY';
    if (vehicleState === 'VEHICLEWILLBEMISSED') return 'FARAWAY';
    if (['SEARCHINGFORVEHICLE', 'VEHICLEISARRIVING', 'VEHICLEALMOSTARRIVED', 'VEHICLEARRIVED'].includes(vehicleState))
        return 'WAITING';
    return 'NONE';
}

export function simulateJourneyEvents(
    events: JourneySimulationEvent[],
    currentJourneyDataInput: ProcessedLegInfo[],
): ProcessedLegInfo[] {
    return events.reduce((journeyData, event) => {
        const activeLegIndex = event.legIndex;
        if (activeLegIndex < 0 || activeLegIndex >= journeyData.length) {
            console.warn('Invalid legIndex in event:', event);
            return [...journeyData];
        }

        let finalGlobalCurrentLeg = journeyData[activeLegIndex]?.currentLeg ?? '0';
        let userLocation = journeyData[activeLegIndex]?.riderLocation;

        const updatedJourneyData = journeyData.map((leg, index) => {
            if (index !== activeLegIndex) {
                return { ...leg, riderLocation: userLocation ?? leg.riderLocation };
            }

            let newActiveLegState = { ...leg };

            switch (event.type) {
                case 'MOVE_VEHICLE_FORWARD': {
                    if (newActiveLegState.transitMode === 'WALK') break;
                    const currentVehiclePos =
                        newActiveLegState.realTimeInfo.liveVehicleData[0]?.loc ||
                        newActiveLegState.staticInfo.origin.latLong;
                    let currentVehWpIndex: number | undefined = undefined;
                    if (newActiveLegState.staticInfo.routeWaypoints.length > 0) {
                        for (let i = newActiveLegState.staticInfo.routeWaypoints.length - 1; i >= 0; i--) {
                            const waypoint = newActiveLegState.staticInfo.routeWaypoints[i];
                            if (
                                waypoint &&
                                haversineDistance(currentVehiclePos, waypoint) < REACHED_THRESHOLD_METERS * 0.5
                            ) {
                                currentVehWpIndex = i;
                                break;
                            }
                        }
                    }
                    const { newPosition: newVehiclePos } = getNextPosition(
                        currentVehiclePos,
                        newActiveLegState.staticInfo.destination.latLong,
                        newActiveLegState.staticInfo.routeWaypoints,
                        currentVehWpIndex,
                    );

                    const newLiveVehicleData =
                        newActiveLegState.realTimeInfo.liveVehicleData.length === 0
                            ? [
                                  {
                                      loc: newVehiclePos,
                                      id: newActiveLegState.vehicleIdentifier ?? 'mockVehicle',
                                      stopsInformation: [],
                                      remainingStops: 0,
                                      originStopETAInMinutes: 0,
                                      destinationStopETAInMinutes: 0,
                                  },
                              ]
                            : newActiveLegState.realTimeInfo.liveVehicleData[0]
                              ? [
                                    { ...newActiveLegState.realTimeInfo.liveVehicleData[0], loc: newVehiclePos },
                                    ...newActiveLegState.realTimeInfo.liveVehicleData.slice(1),
                                ]
                              : [];

                    let newRiderLocation = newActiveLegState.riderLocation;
                    if (newActiveLegState.userState === 'INVEHICLE') {
                        newRiderLocation = { ...newVehiclePos, timestamp: Date.now(), accuracy: 0, isManual: false };
                        userLocation = newRiderLocation;
                    }

                    const nextStopIndex = newActiveLegState.staticInfo.stops.findIndex(s => {
                        if (!newVehiclePos) return false;
                        const stopLoc = { lat: s.lat ?? 0, lon: s.lon ?? 0 };
                        return (
                            haversineDistance(newVehiclePos, stopLoc) > REACHED_THRESHOLD_METERS &&
                            (newActiveLegState.staticInfo.stops.findIndex(prevS => prevS.stopCode === s.stopCode) ===
                                0 ||
                                !newActiveLegState.staticInfo.stops
                                    .slice(
                                        0,
                                        newActiveLegState.staticInfo.stops.findIndex(
                                            prevS => prevS.stopCode === s.stopCode,
                                        ),
                                    )
                                    .find(
                                        prevS =>
                                            haversineDistance(newVehiclePos, {
                                                lat: prevS.lat ?? 0,
                                                lon: prevS.lon ?? 0,
                                            }) < REACHED_THRESHOLD_METERS,
                                    ))
                        );
                    });
                    const nextStopData =
                        nextStopIndex !== -1 ? newActiveLegState.staticInfo.stops[nextStopIndex] : undefined;
                    const nextStopLoc =
                        nextStopData && typeof nextStopData.lat === 'number' && typeof nextStopData.lon === 'number'
                            ? { lat: nextStopData.lat, lon: nextStopData.lon }
                            : undefined;

                    const newVehicleState = getDerivedVehicleState(
                        newActiveLegState,
                        newVehiclePos,
                        newActiveLegState.staticInfo.origin.latLong,
                        newActiveLegState.staticInfo.destination.latLong,
                        nextStopLoc,
                        newActiveLegState.userState === 'INVEHICLE',
                    );
                    const newUserState = getDerivedUserState(
                        newActiveLegState,
                        newRiderLocation || undefined,
                        newVehicleState,
                        newActiveLegState.staticInfo.origin.latLong,
                    );

                    const currentVehicleData = newLiveVehicleData[0];
                    const newStopsInformation =
                        newVehiclePos && currentVehicleData
                            ? currentVehicleData.stopsInformation.filter(stopInfo => {
                                  const stopData = newActiveLegState.staticInfo.stops.find(
                                      s => s.stopCode === stopInfo.stopCode,
                                  );
                                  if (!stopData || !stopData.lat || !stopData.lon) return true;
                                  return (
                                      haversineDistance(newVehiclePos, { lat: stopData.lat, lon: stopData.lon }) >
                                      -REACHED_THRESHOLD_METERS
                                  );
                              })
                            : currentVehicleData?.stopsInformation;

                    let updatedLiveVehicleData = [...newLiveVehicleData];
                    if (updatedLiveVehicleData[0] && newStopsInformation) {
                        const updatedVehicle = {
                            ...updatedLiveVehicleData[0],
                            stopsInformation: newStopsInformation,
                        };
                        updatedLiveVehicleData = [updatedVehicle, ...updatedLiveVehicleData.slice(1)];
                    }

                    newActiveLegState = {
                        ...newActiveLegState,
                        riderLocation: newRiderLocation,
                        vehicleState: newVehicleState,
                        userState: newUserState,
                        realTimeInfo: {
                            ...newActiveLegState.realTimeInfo,
                            liveVehicleData: updatedLiveVehicleData,
                        },
                    };
                    break;
                }
                case 'MOVE_USER_FORWARD': {
                    if (newActiveLegState.transitMode !== 'WALK') break;
                    const currentUserPos =
                        newActiveLegState.riderLocation || newActiveLegState.staticInfo.origin.latLong;
                    let currentUserWpIndex: number | undefined = undefined;
                    if (newActiveLegState.staticInfo.routeWaypoints.length > 0 && currentUserPos) {
                        for (let i = newActiveLegState.staticInfo.routeWaypoints.length - 1; i >= 0; i--) {
                            const waypoint = newActiveLegState.staticInfo.routeWaypoints[i];
                            if (
                                waypoint &&
                                haversineDistance(currentUserPos, waypoint) < REACHED_THRESHOLD_METERS * 0.5
                            ) {
                                currentUserWpIndex = i;
                                break;
                            }
                        }
                    }
                    const { newPosition: newUserPos } = getNextPosition(
                        currentUserPos,
                        newActiveLegState.staticInfo.destination.latLong,
                        newActiveLegState.staticInfo.routeWaypoints,
                        currentUserWpIndex,
                    );
                    let newVehicleS: VehicleState = 'VEHICLEISARRIVING';
                    if (
                        newUserPos &&
                        haversineDistance(newUserPos, newActiveLegState.staticInfo.destination.latLong) <
                            REACHED_THRESHOLD_METERS
                    ) {
                        newVehicleS = 'RIDEREACHEDDESTINATION';
                    }
                    userLocation = { ...newUserPos, timestamp: Date.now(), accuracy: 0, isManual: false };
                    newActiveLegState = {
                        ...newActiveLegState,
                        riderLocation: { ...newUserPos, timestamp: Date.now(), accuracy: 0, isManual: false },
                        userState: 'WALK',
                        vehicleState: newVehicleS,
                    };
                    break;
                }
                case 'USER_CHECK_IN': {
                    if (
                        newActiveLegState.transitMode !== 'WALK' &&
                        newActiveLegState.userState === 'WAITING' &&
                        (newActiveLegState.vehicleState === 'VEHICLEARRIVED' ||
                            newActiveLegState.vehicleState === 'VEHICLEALMOSTARRIVED')
                    ) {
                        const newRiderLoc = newActiveLegState.realTimeInfo.liveVehicleData[0]?.loc
                            ? { ...newActiveLegState.realTimeInfo.liveVehicleData[0]?.loc }
                            : newActiveLegState.riderLocation;
                        userLocation = { ...newRiderLoc, timestamp: Date.now(), accuracy: 0, isManual: false };
                        newActiveLegState = {
                            ...newActiveLegState,
                            userState: 'INVEHICLE',
                            vehicleState: 'RIDESTARTED',
                            riderLocation: { ...newRiderLoc, timestamp: Date.now(), accuracy: 0, isManual: false },
                        };
                    }
                    break;
                }
                case 'SKIP_CURRENT_VEHICLE': {
                    // Remove the first/live vehicle (current approaching vehicle)
                    const [, ...remainingVehicles] = newActiveLegState.realTimeInfo.liveVehicleData;

                    newActiveLegState = {
                        ...newActiveLegState,
                        userState: 'WAITING',
                        vehicleState: 'VEHICLEISARRIVING',
                        realTimeInfo: {
                            ...newActiveLegState.realTimeInfo,
                            liveVehicleData: remainingVehicles,
                        },
                    };
                    break;
                }
            }
            // Check for leg completion and determine if globalCurrentLeg needs update
            const finalDestLoc = newActiveLegState.staticInfo.destination.latLong;
            const relevantLoc =
                newActiveLegState.transitMode === 'WALK'
                    ? newActiveLegState.riderLocation
                    : newActiveLegState.realTimeInfo.liveVehicleData[0]?.loc;
            if (
                (relevantLoc && haversineDistance(relevantLoc, finalDestLoc) < REACHED_THRESHOLD_METERS) ||
                event.type === 'MARK_LEG_COMPLETE'
            ) {
                newActiveLegState = {
                    ...newActiveLegState,
                    vehicleState: 'RIDEREACHEDDESTINATION',
                };
                if (newActiveLegState.transitMode === 'WALK') {
                    newActiveLegState = { ...newActiveLegState, userState: 'NONE' };
                }
                if (activeLegIndex < journeyData.length - 1) {
                    const nextLegData = journeyData[activeLegIndex + 1];
                    if (nextLegData) finalGlobalCurrentLeg = nextLegData.staticInfo.legOrder;
                }
            }
            return newActiveLegState;
        });

        // Final pass to update currentLeg for all legs based on potential advancement
        return updatedJourneyData.map(leg => {
            let legToReturn = leg;
            if (
                leg.staticInfo.legOrder === finalGlobalCurrentLeg &&
                isLegOrderGreaterThan(leg.staticInfo.legOrder, activeLegIndex + '')
            ) {
                // Initialize next active leg
                if (leg.transitMode === 'WALK') {
                    legToReturn = {
                        ...leg,
                        userState: 'WALK',
                        vehicleState: 'VEHICLEISARRIVING',
                        riderLocation: {
                            ...leg.staticInfo.origin.latLong,
                            timestamp: Date.now(),
                            accuracy: 0,
                            isManual: false,
                        },
                    };
                    userLocation = legToReturn.riderLocation;
                } else {
                    legToReturn = {
                        ...leg,
                        userState: 'WAITING',
                        vehicleState: 'VEHICLEISARRIVING',
                    };
                }
            }
            return {
                ...legToReturn,
                currentLeg: finalGlobalCurrentLeg,
                riderLocation: userLocation ?? legToReturn.riderLocation,
            };
        });
    }, currentJourneyDataInput);
}

const MOCKDATA_RAW = safeJsonParse<ProcessedLegInfo[]>(
    JSON.stringify(pristineJourneyLegsData),
    [],
    'pristineJourneyLegsData',
);

const MOCKDATA_SIMULATED = simulateJourneyEvents(
    [
        { type: 'MOVE_USER_FORWARD', legIndex: 0 },
        { type: 'MOVE_USER_FORWARD', legIndex: 0 },
        { type: 'MOVE_USER_FORWARD', legIndex: 0 },
        { type: 'MOVE_VEHICLE_FORWARD', legIndex: 1 },
        { type: 'USER_CHECK_IN', legIndex: 1 },
        { type: 'MOVE_VEHICLE_FORWARD', legIndex: 1 },
        { type: 'MOVE_VEHICLE_FORWARD', legIndex: 1 },
        { type: 'MOVE_VEHICLE_FORWARD', legIndex: 1 },
        { type: 'MOVE_VEHICLE_FORWARD', legIndex: 1 },
        // { type: 'MOVE_USER_FORWARD', legIndex: 2 },
        // { type: 'MOVE_VEHICLE_FORWARD', legIndex: 3 },
        // { type: 'USER_CHECK_IN', legIndex: 3 },
    ],
    MOCKDATA_RAW,
);

// console.log('MOCKDATA_SIMULATED', JSON.stringify(MOCKDATA_SIMULATED, null, 2));
export const MOCKDATA = MOCKDATA_SIMULATED.map((leg: ProcessedLegInfo) => {
    if (leg.transitMode !== 'WALK' && leg.transitMode !== 'TAXI' && leg.realTimeInfo.liveVehicleData[0]) {
        const vehicleData = leg.realTimeInfo.liveVehicleData[0];
        const originStopInfo = vehicleData.stopsInformation?.find(
            (s: StopsInformationItem) => s.stopCode === leg.staticInfo.origin.stopCode,
        );
        const destinationStopInfo = vehicleData.stopsInformation?.find(
            (s: StopsInformationItem) => s.stopCode === leg.staticInfo.destination.stopCode,
        );

        let mutableRemainingStopsCount = 0;
        if (
            leg.userState === 'INVEHICLE' ||
            leg.vehicleState === 'RIDESTARTED' ||
            leg.vehicleState === 'RIDECLOSETODESTINATION'
        ) {
            const currentVehicleStopSequence = vehicleData.stopsInformation?.[0]?.sequenceNumber;
            const destinationStopData = leg.staticInfo.stops.find(
                (s: Stop) => s.stopCode === leg.staticInfo.destination.stopCode,
            );
            const destinationStopSequence = destinationStopData?.sequenceNum;

            if (currentVehicleStopSequence !== undefined && destinationStopSequence !== undefined) {
                mutableRemainingStopsCount = leg.staticInfo.stops.filter(
                    (s: Stop) =>
                        s.sequenceNum >= currentVehicleStopSequence && s.sequenceNum <= destinationStopSequence,
                ).length;
            } else {
                mutableRemainingStopsCount = vehicleData.stopsInformation?.length || 0;
            }
        } else if (
            leg.vehicleState === 'VEHICLEARRIVED' ||
            leg.vehicleState === 'VEHICLEISARRIVING' ||
            leg.vehicleState === 'VEHICLEALMOSTARRIVED' ||
            leg.vehicleState === 'SEARCHINGFORVEHICLE'
        ) {
            const originStopData = leg.staticInfo.stops.find(
                (s: Stop) => s.stopCode === leg.staticInfo.origin.stopCode,
            );
            const originStopSequence = originStopData?.sequenceNum;
            const currentVehicleStopSequence = vehicleData.stopsInformation?.[0]?.sequenceNumber;
            if (originStopSequence !== undefined && currentVehicleStopSequence !== undefined) {
                mutableRemainingStopsCount = leg.staticInfo.stops.filter(
                    (s: Stop) => s.sequenceNum >= currentVehicleStopSequence && s.sequenceNum <= originStopSequence,
                ).length;
            } else {
                mutableRemainingStopsCount = leg.staticInfo.stops?.length || 0;
            }
        }

        const updatedVehicleData = {
            ...vehicleData,
            originStopETAInMinutes: originStopInfo?.eta,
            destinationStopETAInMinutes: destinationStopInfo?.eta,
            remainingStops: mutableRemainingStopsCount,
        };

        return {
            ...leg,
            realTimeInfo: {
                ...leg.realTimeInfo,
                liveVehicleData: [updatedVehicleData, ...leg.realTimeInfo.liveVehicleData.slice(1)],
            },
        };
    }
    return leg;
});
