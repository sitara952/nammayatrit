import { useFetchFareCachePostMutation } from '@/api/integrations/rtk/FetchFareCachePost';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { City_city } from '@/readOnly/api/types/Enums.gen';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../src/typescript/state/hooks';
import { selectRidePackages, setRidePackages } from '../../src/typescript/state/client/session';
import { capitalize } from 'lodash';

export const useFetchFareCache = (currentCity: string, currentLocation: location | null, isMultimodal: boolean) => {
    const [apiCall] = useFetchFareCachePostMutation();
    const city = cityStrToCityObj(currentCity);
    const dispach = useAppDispatch();
    const ridePackageData = useAppSelector(selectRidePackages);
    useEffect(() => {
        if (currentLocation?.lat && currentLocation.lng && !ridePackageData && !isMultimodal) {
            apiCall({
                body: { currentCity: city, currentLatLong: { lat: currentLocation.lat, lon: currentLocation.lng } },
            }).then(resp => {
                if (resp && resp.data) dispach(setRidePackages(resp?.data));
            });
        }
    }, [currentLocation?.lat, currentLocation?.lng]);
};

const cityStrToCityObj = (cityStr: string): City_city => {
    return capitalize(cityStr) as City_city;
};
