import { City } from 'config-types';

export interface MockCityScreenProps {
    onBackPress: () => void;
}

export interface MapLocationState {
    lat: number;
    lon: number;
    address: string;
}

export interface Coordinates {
    lat: number;
    lon: number;
}

export interface CityData {
    name: City;
    coordinates: Coordinates; // Default/fallback coordinates
    selectedLocation?: MapLocationState;
}

export const MOCK_CITIES: CityData[] = [
    {
        name: 'chennai',
        coordinates: {
            lat: 13.0827,
            lon: 80.2707,
        },
    },
    {
        name: 'bangalore',
        coordinates: {
            lat: 12.9716,
            lon: 77.5946,
        },
    },
    {
        name: 'kolkata',
        coordinates: {
            lat: 22.5726,
            lon: 88.3639,
        },
    },
    {
        name: 'delhi',
        coordinates: {
            lat: 28.6139,
            lon: 77.209,
        },
    },
    {
        name: 'kochi',
        coordinates: {
            lat: 9.9312,
            lon: 76.2673,
        },
    },
    {
        name: 'bhubaneswar',
        coordinates: {
            lat: 20.2961,
            lon: 85.8245,
        },
    },
];
