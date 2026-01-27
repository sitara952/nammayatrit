import { useEffect } from 'react';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    selectDropTime,
    selectPickupTime,
    selectRetrySearch,
    selectSearchedSource,
    selectSearchedStops,
} from '@/typescript/state/client/session';
import { selectFareProductType } from '@/typescript/state/client/session';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';
/* eslint-disable myCustomPlugin/no-any-in-modified-files */
export const useSearchExpiry = (handleRideSearch: (searchParams: any) => Promise<void>) => {
    const source = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const startTime = useAppSelector(selectPickupTime);
    const dropTime = useAppSelector(selectDropTime);
    const retrySearch = useAppSelector(selectRetrySearch);
    const fareProductType = useAppSelector(selectFareProductType);
    const { isInterCity } = useCheckForInterCity(source, stops);
    useEffect(() => {
        if (retrySearch) {
            handleRideSearch({
                source,
                stops,
                startTime,
                dropTime,
                isInterCity,
                isFareProductOneway: fareProductType !== 'RENTAL',
                isAmbulance: fareProductType === 'AMBULANCE',
            });
        }
    }, [retrySearch]);
};
