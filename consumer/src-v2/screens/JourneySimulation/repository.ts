import { JourneySimulations, MockLocationType, TransportMode, JourneyStatus, TransportModeConfig } from './types';

export const transportModeConfigs: Record<TransportMode, TransportModeConfig> = {
    [TransportMode.METRO]: {
        name: 'Metro',
        icon: '🚊',
    },
    [TransportMode.BUS]: {
        name: 'Bus',
        icon: '🚌',
    },
    [TransportMode.SUBURBAN_TRAIN]: {
        name: 'Train',
        icon: '🚆',
    },
};

export const getModeColors = (mode: TransportMode) => {
    switch (mode) {
        case TransportMode.METRO:
            return {
                primary: '#3b82f6',
                background: '#eff6ff',
                accent: '#dbeafe',
            };
        case TransportMode.BUS:
            return {
                primary: '#f59e0b',
                background: '#fffbeb',
                accent: '#fef3c7',
            };
        case TransportMode.SUBURBAN_TRAIN:
            return {
                primary: '#10b981',
                background: '#f0fdf4',
                accent: '#bbf7d0',
            };
        default:
            return {
                primary: '#3b82f6',
                background: '#eff6ff',
                accent: '#dbeafe',
            };
    }
};

const mockRoutes: JourneySimulations[] = [
    {
        id: '1',
        routeName: 'Cubbon-IndiraNagar',
        mode: TransportMode.METRO,
        lineNumber: 'Purple',
        estimatedTime: '6 min',
        currentProgress: 0,
        source: {
            name: 'Cubbon Park',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.9809807692901, lon: 77.59692077280229 },
            status: JourneyStatus.UPCOMING,
        },
        destination: {
            name: 'Indira Nagar',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.97820834516052, lon: 77.63884279725374 },
            status: JourneyStatus.UPCOMING,
        },
        locations: [
            {
                name: 'Before Cubbon Metro',
                type: MockLocationType.OTHER,
                coordinates: { lat: 12.981648238733118, lon: 77.59554789424455 },
                status: JourneyStatus.CURRENT,
            },
            {
                name: 'Cubbon Park',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.9809807692901, lon: 77.59692077280229 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Before MG Road',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.976431336863467, lon: 77.60277936264728 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'MG Road',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.975491606228584, lon: 77.6066711214726 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Trinity',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.972924789473598, lon: 77.61694214785055 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Before Halasuru',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.974108645008709, lon: 77.62387847792729 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Halasuru',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.976366117679634, lon: 77.62669047900852 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'After Halasuru',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.97824023043636, lon: 77.63149856358059 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Indira Nagar',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.978211050458782, lon: 77.63886341948877 },
                status: JourneyStatus.UPCOMING,
            },
        ],
    },
    {
        id: '2',
        routeName: 'Majestic-Yeshwanthpur',
        mode: TransportMode.METRO,
        lineNumber: 'Green',
        estimatedTime: '20 min',
        currentProgress: 0,
        source: {
            name: 'Majestic',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.97571708860055, lon: 77.57293927868864 },
            status: JourneyStatus.UPCOMING,
        },
        destination: {
            name: 'Yeshwanthpur',
            type: MockLocationType.STATION,
            coordinates: { lat: 13.023197489381275, lon: 77.5498777001096 },
            status: JourneyStatus.UPCOMING,
        },
        locations: [
            {
                name: 'Before Majestic',
                type: MockLocationType.OTHER,
                coordinates: { lat: 12.98002486502856, lon: 77.57112463010823 },
                status: JourneyStatus.CURRENT,
            },
            {
                name: 'Majestic',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.97571708860055, lon: 77.57293927868864 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'After Majestic',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.985356527399796, lon: 77.57203359526403 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Sampige Road',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.990466094470415, lon: 77.57082421227227 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Before Srirampura',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.996355147166181, lon: 77.56565434405003 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Srirampura',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.99651053712015, lon: 77.56336094075228 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'MK Road',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.998522574096457, lon: 77.55696047586208 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Rajajinagar',
                type: MockLocationType.STATION,
                coordinates: { lat: 13.00034972084441, lon: 77.5497614857253 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Before Sandal Soap',
                type: MockLocationType.TRACK,
                coordinates: { lat: 13.011053548567078, lon: 77.55029192689554 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Sandal Soap Factory',
                type: MockLocationType.STATION,
                coordinates: { lat: 13.014718352890897, lon: 77.55401687843914 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Yeshwanthpur',
                type: MockLocationType.STATION,
                coordinates: { lat: 13.02320786309673, lon: 77.5498777001096 },
                status: JourneyStatus.UPCOMING,
            },
        ],
    },
    {
        id: '3',
        routeName: 'Lalbagh-Srirampura',
        mode: TransportMode.METRO,
        lineNumber: 'Green',
        estimatedTime: '13 min',
        currentProgress: 0,
        source: {
            name: 'Lalbagh',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.946278911791747, lon: 77.58005470928947 },
            status: JourneyStatus.UPCOMING,
        },
        destination: {
            name: 'Srirampura',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.996563394120637, lon: 77.56322020506225 },
            status: JourneyStatus.UPCOMING,
        },
        locations: [
            {
                name: 'Near Lalbagh',
                type: MockLocationType.OTHER,
                coordinates: { lat: 12.943683791434436, lon: 77.58009794449522 },
                status: JourneyStatus.CURRENT,
            },
            {
                name: 'Lalbagh',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.946278911791747, lon: 77.58005470928947 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'National College',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.950616433743033, lon: 77.57375239165923 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'KR Market',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.960151959855112, lon: 77.57447700428288 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Chickpet',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.9675431138198, lon: 77.5747991098929 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Majestic',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.975698165340797, lon: 77.57284466530268 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Sampige Road',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.990577015103536, lon: 77.57079355902513 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Srirampura',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.996567349224911, lon: 77.56322153257075 },
                status: JourneyStatus.UPCOMING,
            },
        ],
    },
    {
        id: '4',
        routeName: 'Trinity-Halasuru',
        mode: TransportMode.METRO,
        lineNumber: 'Purple',
        estimatedTime: '9 min',
        currentProgress: 0,
        source: {
            name: 'Trinity',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.97326490706431, lon: 77.61689039036719 },
            status: JourneyStatus.UPCOMING,
        },
        destination: {
            name: 'Halasuru',
            type: MockLocationType.STATION,
            coordinates: { lat: 12.97642229143478, lon: 77.62671800447404 },
            status: JourneyStatus.UPCOMING,
        },
        locations: [
            {
                name: 'Trinity',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.97326490706431, lon: 77.61689039036719 },
                status: JourneyStatus.CURRENT,
            },
            {
                name: 'After Trinity',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.97302500489258, lon: 77.62183959379881 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Before Halasuru',
                type: MockLocationType.TRACK,
                coordinates: { lat: 12.974382112492448, lon: 77.6242899663002 },
                status: JourneyStatus.UPCOMING,
            },
            {
                name: 'Halasuru',
                type: MockLocationType.STATION,
                coordinates: { lat: 12.97642229143478, lon: 77.62671800447404 },
                status: JourneyStatus.UPCOMING,
            },
        ],
    },
];

const colors = {
    background: '#f8fafc',
    cardBackground: '#ffffff',
    text: '#1a202c',
    textSecondary: '#718096',
    textMuted: '#a0aec0',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    completed: '#10b981',
    current: '#3b82f6',
    upcoming: '#94a3b8',
};

export { mockRoutes, colors };
