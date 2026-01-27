import { useServiceabilityIsInterCityPostMutation } from '../../readOnly/api/integrations/rtk/ServiceabilityIsInterCityPost';
import { useEffect, useRef, useState } from 'react';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { checkForInterCityLegacy } from '@/typescript/utils/placeUtils';
import { useAppSelector } from '../state/hooks';
import { selectAppConfig } from '../state/client/session';

export const useCheckForInterCity = (
    source: location | null,
    stops: (location | null)[],
): { isInterCity: boolean; isLoading: boolean } => {
    const [isIntercityPost, { isLoading }] = useServiceabilityIsInterCityPostMutation();
    const appConfig = useAppSelector(selectAppConfig);
    const [isInterCity, setIsInterCity] = useState<boolean>(false);
    const requestIdRef = useRef(0);

    const checkForInterCity = async (
        srcLat: number | undefined,
        srcLng: number | undefined,
        destLat: number | undefined,
        destLng: number | undefined,
    ): Promise<boolean> => {
        const currentId = ++requestIdRef.current;
        if (srcLat && srcLng && destLat && destLng) {
            const isIntercityReq = {
                pickupLatLong: { lat: srcLat, lon: srcLng },
                mbDropLatLong: { lat: destLat, lon: destLng },
            };
            try {
                const payload = await isIntercityPost({ body: isIntercityReq }).unwrap();
                const { isCrossCity, isInterCity: interCityFlag } = payload;
                const isValid = interCityFlag && !isCrossCity;
                if (requestIdRef.current === currentId) return isValid;
            } catch (error) {
                console.error('IS_INTERCITY_REQ_ERROR', error);
                if (requestIdRef.current === currentId) return false;
            }
        }
        return false;
    };

    useEffect(() => {
        const checkAllStops = async () => {
            // First check legacy method
            const isLegacyInterCity = checkForInterCityLegacy(source, stops);
            // Use legacy result if known OR if app is 'anna'
            if (
                (isLegacyInterCity !== 'Unknown' || appConfig.appType === 'multimodal') &&
                appConfig.uiConfig.enableLegacyIntercityCheck
            ) {
                setIsInterCity(isLegacyInterCity === 'Intercity');
                return;
            }

            // If legacy check is unknown, check all consecutive stops
            const allStops = [source, ...stops].filter((stop): stop is location => stop !== null);

            // eslint-disable-next-line functional/no-let
            for (let i = 0; i < allStops.length - 1; i++) {
                const currentStop = allStops[i];
                const nextStop = allStops[i + 1];

                if (!currentStop || !nextStop) continue;

                const isIntercity = await checkForInterCity(
                    currentStop.lat,
                    currentStop.lng,
                    nextStop.lat,
                    nextStop.lng,
                );

                if (isIntercity) {
                    setIsInterCity(true);
                    return;
                }
            }

            setIsInterCity(false);
        };

        checkAllStops();
        return () => {
            ++requestIdRef.current;
        };
    }, [source?.lat, source?.lng, ...stops.map(stop => stop?.lat), ...stops.map(stop => stop?.lng)]);

    return { isInterCity, isLoading };
};
