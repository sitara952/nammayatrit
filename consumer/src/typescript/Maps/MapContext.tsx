import { createContext, createRef } from 'react';
import { MapRef } from './MapComponent.tsx';

// Exception Type
export class GMapNoImplementation extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GMapNoImplementation';
    }
}

export interface mapRefType {
    mapRef: React.RefObject<MapRef | null>;
    onMarkerPress: () => void;
    shouldAllowMapPress: () => boolean;
}
export const initialGMapContext: mapRefType = {
    mapRef: createRef<MapRef>(),
    onMarkerPress: () => {},
    shouldAllowMapPress: () => true,
};

export const MapContext = createContext<mapRefType>(initialGMapContext);
