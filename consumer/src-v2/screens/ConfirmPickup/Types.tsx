import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { ScrollView } from 'react-native-gesture-handler';
import { AppDispatch } from '@/typescript/state/store';

export type PolylineCoordinate = {
    lat: number | undefined;
    lng: number | undefined;
};

export type PolylineCoordinates = {
    start: PolylineCoordinate;
    end: PolylineCoordinate;
};

export const DEFAULT_POLYLINE_COORDINATES: PolylineCoordinates = {
    start: { lat: undefined, lng: undefined },
    end: { lat: undefined, lng: undefined },
};

export type ConfirmPickupViewProps = {
    isPickup: boolean;
    selectedStopIndex: number;
    destinationIndex: number;
    scrollViewRef: React.RefObject<ScrollView | null>;
    locationList: location[];
    isSpecialLocation: boolean;
    selectedGateId: string | undefined;
    cpDispatch: Resolver<ConfirmPickupScreenAction>;
    setCustomPickupZoneGate: React.Dispatch<location | undefined>;
    customPickupZoneGate: location | undefined;
    isPickupTooFar: boolean;
    reduxDispatch: AppDispatch;
    // Pickup Instructions props
    displayedNote: string;
    modalVisible: boolean;
    userLocation: { lat: number; lon: number } | null;
    closestInstructionData: { instruction: string | null; audioBase64: string | null | undefined } | undefined;
    canEdit: boolean;
    enablePickupInstructions: boolean;
    pickupInstructionsCharLimit: number;
    onModalVisibilityChange: (visible: boolean) => void;
    onAddNote: (note: string) => void;
    onSaveToBackend: (instruction: string) => void;
    onAudioRecordingComplete: (filePath: string) => void;
};

export type ConfirmPickupScreenAction = Action<'LOCATION_CARD_CLICKED', { placeId: string | undefined }>;
