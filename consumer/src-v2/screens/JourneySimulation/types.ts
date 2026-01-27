export enum TransportMode {
    METRO = 'METRO',
    BUS = 'BUS',
    SUBURBAN_TRAIN = 'SUBURBAN_TRAIN',
}

export enum MockLocationType {
    STATION = 'STATION',
    TRACK = 'TRACK',
    OTHER = 'OTHER',
}

export enum JourneyStatus {
    COMPLETED = 'COMPLETED',
    CURRENT = 'CURRENT',
    UPCOMING = 'UPCOMING',
}

export interface MockJourneyLocation {
    name: string;
    type: MockLocationType;
    coordinates: {
        lat: number;
        lon: number;
    };
    status?: JourneyStatus;
}

export interface TransportModeConfig {
    name: string;
    icon: string;
}

export interface JourneySimulations {
    id: string;
    routeName: string;
    mode: TransportMode;
    locations: MockJourneyLocation[];
    source: MockJourneyLocation;
    destination: MockJourneyLocation;
    estimatedTime: string;
    lineNumber?: string;
    currentProgress?: number;
    nextStation?: MockJourneyLocation;
}
