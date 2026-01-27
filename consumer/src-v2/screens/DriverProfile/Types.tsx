import { RideId } from '@/typescript/state/client/booking.ts';
import { driverProfileRes } from '@/readOnly/api/types/DriverProfileRes.gen';
import { strings } from 'config-types';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';

export type DriverProfileViewProps = {
    onBackPress: () => void;
    rideId: RideId | null;
    driverData: driverProfileRes | undefined;
    isLoading: boolean;
    userLanguageStrings: strings;
    driverDefaultProfileUri: string;
    vehicleServiceType: ServiceTierType_serviceTierType | undefined;
};
