import { useTrackVehiclesGetQuery } from '@/api/integrations/rtk/TrackVehiclesGet';
import { EnhancedStopMapping } from '../screens/SingleModeTicketBooking/Types';
import { transportRoute, transportStation } from '../../../src/readOnly/api/types/PublicTransportData.gen';
import { VehicleCategory_vehicleCategory } from '../../../src/readOnly/api/types/Enums.gen';
import { latLong } from '../../../src/readOnly/api/types/LatLong.gen';
import { useMemo } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';

interface UseBusTrackingLogicProps {
    initialRoute: transportRoute | string | undefined;
    initialRouteStops: EnhancedStopMapping[] | undefined;
    vehicleType: VehicleCategory_vehicleCategory;
    initialWaypoints: latLong[] | undefined;
    sourceStop: transportStation | undefined;
    destinationStop: transportStation | undefined;
    city: string;
    enabled: boolean;
    callFrfs: boolean;
}

export const useBusTrackingLogic = ({
    initialRoute,
    vehicleType,
    sourceStop,
    destinationStop,
    enabled = true,
}: UseBusTrackingLogicProps) => {
    const routeCode = useMemo(() => {
        if (!enabled) return undefined;
        return typeof initialRoute === 'string' ? initialRoute : initialRoute?.code;
    }, [initialRoute, enabled]);

    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);

    const { data: trackVehiclesData } = useTrackVehiclesGetQuery(
        {
            routeCode: routeCode || '',
            vehicleType,
            platformType: 'MULTIMODAL',
            currentLat: currentLocationCoords?.coords?.latitude,
            currentLon: currentLocationCoords?.coords?.longitude,
            selectedSourceStopCode: sourceStop?.code,
            selectedDestinationStopCode: destinationStop?.code,
        },
        {
            pollingInterval: 5000,
            skip: !enabled || !routeCode,
        },
    );

    return {
        trackVehiclesData,
    };
};
