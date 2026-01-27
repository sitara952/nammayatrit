import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLazySavedLocationsQuery } from '../state/server/savedLocationListApi';
import { useSavedLocationPostMutation } from '@/api/integrations/rtk/SavedLocationPost';
import { useSavedLocationTagDeleteMutation } from '@/api/integrations/rtk/SavedLocationTagDelete';
import { useDispatch, useSelector } from 'react-redux';
import { selectSavedLocations, setSavedLocations } from '../state/client/user';
import { RootState } from '../state/store';
import { selectToken } from '../state/client/auth';
import { isNil } from 'lodash';
import { createSavedReqLocationReq } from '@/readOnly/api/types/CreateSavedReqLocationReq.gen';

export const useSavedLocations = () => {
    const dispatch = useDispatch();
    const savedLocations = useSelector((state: RootState) => selectSavedLocations(state));
    const token = useSelector((state: RootState) => selectToken(state));
    const [fetchSavedLocations] = useLazySavedLocationsQuery();
    const [savedLocationPost] = useSavedLocationPostMutation();
    const [savedLocationTagDelete] = useSavedLocationTagDeleteMutation();
    const fetchTry = useRef(0);
    const refetchSavedLocations = useCallback(async () => {
        const apiData = await fetchSavedLocations({ forceRefetch: true });
        if (apiData.data) {
            dispatch(setSavedLocations({ id: token, payload: apiData.data }));
        }
    }, [fetchSavedLocations, dispatch, token]);

    // Load saved locations on mount
    useEffect(() => {
        if (fetchTry.current <= 2 && isNil(savedLocations)) {
            ++fetchTry.current;
            refetchSavedLocations();
        }
        if (Array.isArray(savedLocations)) {
            fetchTry.current = 0;
        }
    }, [savedLocations]);

    const saveLocation = useCallback(
        async (body: createSavedReqLocationReq) => {
            try {
                const resp = await savedLocationPost({ body });
                if (resp.data) {
                    await refetchSavedLocations();
                } else {
                    throw new Error('Failed to save location');
                }
            } catch (error) {
                console.error('Error saving location:', error);
                throw error;
            }
        },
        [savedLocationPost, refetchSavedLocations],
    );

    const deleteLocation = useCallback(
        async (tag: string) => {
            try {
                const resp = await savedLocationTagDelete({ tag });
                if (resp.data) {
                    await refetchSavedLocations();
                } else {
                    throw new Error('Failed to delete location');
                }
            } catch (error) {
                console.error('Error deleting location:', error);
                throw error;
            }
        },
        [savedLocationTagDelete, refetchSavedLocations],
    );

    const memoizedReturn = useMemo(() => {
        return {
            savedLocations: isNil(savedLocations) ? undefined : savedLocations,
            saveLocation,
            deleteLocation,
        };
    }, [savedLocations, saveLocation, deleteLocation]);
    return memoizedReturn;
};
