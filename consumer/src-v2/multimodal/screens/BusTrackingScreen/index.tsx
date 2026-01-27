import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import MapProvider from '@/typescript/Maps/MapProvider';
import { BusTrackingFlow } from './Flow';
import HardwareBackPressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';

const BusTrackingScreen = () => {
    const appConfig = useAppSelector(selectAppConfig);
    const appInitialCoordinate = appConfig.merchantData.initialCoordinate;

    return (
        <HardwareBackPressHandler>
            <MapProvider initialCoordinate={appInitialCoordinate} mapId="BusTrackingMap" fitToMapElementFlag={false}>
                <BusTrackingFlow />
            </MapProvider>
        </HardwareBackPressHandler>
    );
};

export default BusTrackingScreen;
