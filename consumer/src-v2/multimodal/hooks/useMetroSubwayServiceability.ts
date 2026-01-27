import { useMemo } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectIsMetroServiceable, selectIsSubwayServiceable } from '@/typescript/state/client/session';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';

interface UseMetroSubwayServiceabilityReturn {
    isServiceable: boolean;
    isMetroServiceable: boolean | undefined;
    isSubwayServiceable: boolean | undefined;
}

/**
 * Custom hook to check serviceability for Metro and Subway services
 * @param vehicleType - The type of vehicle
 * @returns Object containing serviceability status
 */
export const useMetroSubwayServiceability = (
    vehicleType: VehicleCategory_vehicleCategory | undefined,
): UseMetroSubwayServiceabilityReturn => {
    const isMetroServiceable = useAppSelector(selectIsMetroServiceable);
    const isSubwayServiceable = useAppSelector(selectIsSubwayServiceable);

    const isServiceable = useMemo(() => {
        if (!vehicleType) return true;

        if (vehicleType === 'METRO') {
            return isMetroServiceable ?? true;
        }

        if (vehicleType === 'SUBWAY') {
            return isSubwayServiceable ?? true;
        }

        return true;
    }, [vehicleType, isMetroServiceable, isSubwayServiceable]);

    return {
        isServiceable,
        isMetroServiceable,
        isSubwayServiceable,
    };
};
