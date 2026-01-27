import { useCallback, useMemo } from 'react';

import { GenericStopsPickerItem } from '../components/GenericStopsPicker';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

// Custom hook for bus route toggle and stop selection logic
export const useBusRouteToggle = (
    routeStops: Array<{ stopCode: string; stopName: string | undefined }> | undefined,
    sourceCode: string,
    destCode: string,
    setSourceCode: (code: string) => void,
    setDestCode: (code: string) => void,
) => {
    const haptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    // Handlers for selection
    const handleOnChangeSource = useCallback(
        (item: GenericStopsPickerItem) => {
            setSourceCode(item?.code ?? sourceCode);
            haptic?.();
        },
        [setSourceCode, sourceCode],
    );

    const handleOnChangeDestination = useCallback(
        (item: GenericStopsPickerItem) => {
            setDestCode(item?.code || destCode);
            haptic?.();
        },
        [setDestCode, destCode],
    );

    // Generate the stops list based on toggle state
    const stopsList = useMemo(
        () =>
            routeStops?.map((routeStop, index) => ({
                id: index,
                name: routeStop.stopName || routeStop.stopCode,
                code: routeStop.stopCode,
            })),
        [routeStops],
    );

    // Create filtered source stops list (excluding the last stop)
    const sourceStopsList = useMemo(() => {
        if (!stopsList) return [];

        // Always create a new array to avoid modifying the original
        return [...stopsList];
    }, [stopsList]);

    // Create filtered destination stops list (only stops after the selected source)
    const destinationStopsList = useMemo(() => {
        if (!stopsList) return [];
        const slicedStops = [...stopsList].slice(
            stopsList.findIndex(stop => stop.code === sourceCode) + 1,
            stopsList.length,
        );
        return slicedStops;
    }, [stopsList, sourceCode]);

    // Find the currently selected items by code
    const selectedSourceItem = useMemo(
        () => stopsList?.find(stop => stop.code === sourceCode),
        [stopsList, sourceCode],
    );

    const selectedDestinationItem = useMemo(
        () => stopsList?.find(stop => stop.code === destCode),
        [stopsList, destCode],
    );

    return {
        stopsList,
        selectedSourceItem,
        selectedDestinationItem,
        sourceStopsList,
        destinationStopsList,
        handleOnChangeSource,
        handleOnChangeDestination,
    };
};
