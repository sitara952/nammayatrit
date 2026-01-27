import { PathConfig, StaticMarker, TrackedEntity } from './trackingTypes';

// --- CHENNAI DUMMY DATA ---

export const DUMMY_PATHS: PathConfig[] = [
    // Route A: Chennai Central → Fort St. George → Marina → Santhome → TIDEL Park (OMR)
    {
        id: 'bus-route-chennai-central-to-omr',
        coordinates: [
            { latitude: 13.083634, longitude: 80.27421 }, // Chennai Central
            { latitude: 13.0821, longitude: 80.2798 },
            { latitude: 13.079589, longitude: 80.287452 }, // Fort St. George
            { latitude: 13.07, longitude: 80.2855 },
            { latitude: 13.06, longitude: 80.2845 },
            { latitude: 13.053438, longitude: 80.283366 }, // Marina Beach (mid)
            { latitude: 13.043, longitude: 80.2795 },
            { latitude: 13.0335, longitude: 80.2733 }, // Santhome Basilica
            { latitude: 13.015, longitude: 80.261 },
            { latitude: 13.003, longitude: 80.254 },
            { latitude: 12.990478, longitude: 80.250392 }, // TIDEL Park (OMR)
        ],
        style: {
            strokeColor: '#E63946', // Red-ish
            strokeWidth: 5,
        },
    },

    // Route B: Chennai Airport (MAA) → Guindy → Saidapet → AG-DMS → Chennai Central (Anna Salai corridor)
    {
        id: 'bus-route-airport-to-central',
        coordinates: [
            { latitude: 12.982222, longitude: 80.163611 }, // MAA Airport
            { latitude: 12.9945, longitude: 80.1888 },
            { latitude: 13.010236, longitude: 80.215652 }, // Guindy
            { latitude: 13.0168, longitude: 80.221 },
            { latitude: 13.020817, longitude: 80.223954 }, // Saidapet
            { latitude: 13.0305, longitude: 80.24 }, // Nandanam (approx)
            { latitude: 13.04589, longitude: 80.24829 }, // AG–DMS
            { latitude: 13.056, longitude: 80.257 }, // Thousand Lights (approx)
            { latitude: 13.0705, longitude: 80.26 }, // LIC/Egmore (approx)
            { latitude: 13.083634, longitude: 80.27421 }, // Chennai Central
        ],
        style: {
            strokeColor: '#1D7874', // Teal
            strokeWidth: 5,
        },
    },
];

export const DUMMY_TRACKED_ENTITIES: TrackedEntity[] = [
    {
        id: 'bus-omr-1',
        pathId: 'bus-route-chennai-central-to-omr',
        captionText: 'bus-omr-1',
        // Start at Chennai Central on Route A
        location: { latitude: 13.083634, longitude: 80.27421 },
        style: {
            iconType: 'multimodal',
            multimodalVariant: 'Bus',
        },
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'bus-anna-salai-1',
        pathId: 'bus-route-airport-to-central',
        captionText: 'bus-anna-salai-1',
        // Start at Airport on Route B
        location: { latitude: 12.982222, longitude: 80.163611 },
        style: {
            iconType: 'multimodal',
            multimodalVariant: 'Bus',
        },
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
];

export const DUMMY_STATIC_MARKERS: StaticMarker[] = [
    // Route A stops
    {
        id: 'stop-central',
        location: { latitude: 13.083634, longitude: 80.27421 },
        style: { iconType: 'stops' },
        title: 'Chennai Central',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-fort',
        location: { latitude: 13.079589, longitude: 80.287452 },
        style: { iconType: 'stops' },
        title: 'Fort St. George',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-marina',
        location: { latitude: 13.053438, longitude: 80.283366 },
        style: { iconType: 'stops' },
        title: 'Marina Beach',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-santhome',
        location: { latitude: 13.0335, longitude: 80.2733 },
        style: { iconType: 'stops' },
        title: 'Santhome Basilica',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-tidel',
        location: { latitude: 12.990478, longitude: 80.250392 },
        style: { iconType: 'stops' },
        title: 'TIDEL Park (OMR)',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },

    // Route B stops
    {
        id: 'stop-airport',
        location: { latitude: 12.982222, longitude: 80.163611 },
        style: { iconType: 'stops' },
        title: 'Chennai Intl. Airport (MAA)',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-guindy',
        location: { latitude: 13.010236, longitude: 80.215652 },
        style: { iconType: 'stops' },
        title: 'Guindy',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-saidapet',
        location: { latitude: 13.020817, longitude: 80.223954 },
        style: { iconType: 'stops' },
        title: 'Saidapet',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-agdms',
        location: { latitude: 13.04589, longitude: 80.24829 },
        style: { iconType: 'stops' },
        title: 'AG–DMS',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
    {
        id: 'stop-central-2',
        location: { latitude: 13.083634, longitude: 80.27421 },
        style: { iconType: 'stops' },
        title: 'Chennai Central',
        stopName: undefined,
        stopCode: undefined,
        showCallout: undefined,
        busStopEtaCallout: undefined,
        primaryEtaMinutes: undefined,
        secondaryEtaMinutes: undefined,
        displayCalloutOnPress: undefined,
    },
];
