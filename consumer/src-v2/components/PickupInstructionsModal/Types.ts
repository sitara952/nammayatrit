import { ClosestPickupInstructionResp } from '../../../src/typescript/state/server/pickupInstructionsApi';
import { location } from '../../../src/helpers/utils/Location/LocationTypes.gen';

export interface PickupInstructionsPillOption {
    id: string;
    text: string;
    isFromBackend?: boolean;
    audioBase64?: string | null;
}

export interface PickupInstructionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAddNote: (note: string) => void;
    headerText?: string;
    placeholder?: string;
    buttonText?: string;
    maxLength: number;
    inline?: boolean;
    savedInstructions?: string | null;
    onRemoveNote?: () => void;
    showNewBadge?: boolean;
    backendInstructions?: string[];
    onSaveToBackend?: (instruction: string) => void;
    canEdit?: boolean;
    onAudioRecordingComplete?: (filePath: string) => void;
    closestInstructionData?: ClosestPickupInstructionResp | null;
    currentLocation?: { lat: number; lon: number } | null;
    currentLocationObject?: location | undefined; // location object from LocationTypes
    fromConfirmPickup?: boolean; // New prop to identify ConfirmPickup flow
}

export interface PickupInstructionsModalUIProps extends PickupInstructionsModalProps {
    pillOptions: PickupInstructionsPillOption[];
    onDeleteInstruction?: () => void;
}

export interface AudioRecordingModalProps {
    isVisible: boolean;
    onClose: () => void;
    onRecordingComplete: (filePath: string) => void;
    headerText?: string;
    existingAudioBase64?: string | null;
    openedFromAudioPill?: boolean;
    inline?: boolean;
    fromRideConfirmed?: boolean; // New prop to identify RideConfirmed usage
    fromConfirmPickup?: boolean; // New prop to identify ConfirmPickup usage
    currentLocation?: { lat: number; lon: number } | null; // For API calls
    onRecorderStateChange?: (state: { hasRecording: boolean; filePath: string | null }) => void; // For RideConfirmed Save button
}

export interface DeleteConfirmationModalProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
