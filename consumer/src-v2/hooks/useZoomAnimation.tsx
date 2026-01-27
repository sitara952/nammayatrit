import { useContext, useEffect, useRef } from 'react';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectRouteInfo } from '@/typescript/state/client/search';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const useZoomAnimations = (_: number, source: location | null, stops: (location | null)[], animate: boolean) => {
    const routeInfo = useAppSelector(state => selectRouteInfo(state, null));
    const canAnimate = useRef(true);
    const { mapRef } = useContext(MapContext);
    const isCancelledRef = useRef(false);

    const zoomIn = async (dataOfAddress: location | null) => {
        if (!canAnimate.current) return;
        if (!dataOfAddress) return;
        // TODO(@nikithshetty): replace with fitToCoordinates
        if (mapRef.current) {
            await mapRef.current.animateCamera({
                lat: dataOfAddress?.lat,
                lon: dataOfAddress?.lng,
                zoom: 18.0,
                duration: 2000,
            });
        }
        await delay(2000);
    };

    const zoomOut = async () => {
        if (!canAnimate.current) return;
        if (!routeInfo) return;
        if (mapRef.current) {
            mapRef.current.fitToCoordinates({ coordinates: routeInfo ?? [], duration: 2000 });
        }
        await delay(2000);
    };

    useEffect(() => {
        isCancelledRef.current = false;
        const executeAnimation = async () => {
            if (isCancelledRef.current) return;
            try {
                await delay(3000);
                await zoomIn(source);
                if (isCancelledRef.current) return;

                await delay(2000);
                await zoomOut();
                if (isCancelledRef.current) return;

                for (const stop of stops) {
                    await delay(2000);
                    await zoomIn(stop);
                    if (isCancelledRef.current) return;
                    await delay(2000);
                    await zoomOut();
                }
            } catch (err) {
                console.error('Error during zoom animation:', err);
            }
        };
        if (animate) {
            executeAnimation();
        }
        return () => {
            isCancelledRef.current = true;
        };
    }, [source, stops, animate]);
};
export default useZoomAnimations;
