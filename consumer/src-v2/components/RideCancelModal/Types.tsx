import { BookingId } from '@/typescript/state/client/user';
import { RideId } from '@/typescript/state/client/booking';
import { MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { VehicleVariant_vehicleVariant } from '@/readOnly/api/types/Enums.gen';

export type RideCancelModalFlowProps = {
    setShowCancellationChargesModal: React.Dispatch<React.SetStateAction<boolean>>;
    cancellationFee: number | undefined;
    onConfirmCancel: () => void;
    onReallocate: () => void;
    bookingId: BookingId | null;
    rideId: RideId | null;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    vehicleVariant: VehicleVariant_vehicleVariant | undefined;
    setImageKey: React.Dispatch<React.SetStateAction<string>> | undefined;
    imageKey: string;
};

export type RideCancelModalUIProps = {
    onClose: () => void;
    onConfirmCancel: () => void;
    onFindAnotherDriver: () => void;
    cancellationFee: number;
    isLoading: boolean;
    vehicleVariant: VehicleVariant_vehicleVariant | undefined;
    setImageKey: React.Dispatch<React.SetStateAction<string>> | undefined;
};
