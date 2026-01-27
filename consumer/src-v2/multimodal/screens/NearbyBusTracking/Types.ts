import { LatLng } from 'react-native-maps';

export interface NearbyBusTrackingViewState {
    isLoading: boolean;
    nearbyBusesCount: number;
    searchRadius: number;
    currentCenter: LatLng | null;
    isSearching: boolean;
}

export interface NearbyBusTrackingUIProps {
    onBack: () => void;
}
