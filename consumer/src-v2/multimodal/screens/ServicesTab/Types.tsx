import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { ImageSourcePropType } from 'react-native';
import { TransportationTypes } from '../SingleModeSearch/Types';
import { Action } from '@/typescript/utils/common';
import { ServiceTag } from '@/src-v2/systems/configs/types';
import { ServiceOption } from '@/typescript/components/ny-service/ServiceOptionList';

// Types for the service tiles
export interface ServiceTile {
    id: string;
    title: string;
    imageSource: ImageSourcePropType;
    onPress: () => void;
}

export interface quickStop {
    name: string;
    distance: number;
    onPress: () => Promise<void>;
}

// Props for the ServicesTabScreen component
export interface ServicesTabScreenProps {
    title?: string;
    quickStops: quickStop[];
    isLoading: boolean;
    nearestBusStop: (transportStation & { distance: number }) | null;
    busList: BusList[] | undefined;
    mainServiceCardConfig: ServiceCardProps | undefined;
    privateServices: ServiceOption[];
    publicServices: ServiceCardProps[];
}

export type BusStopWithRoutes = {
    stop: transportStation & { distance: number };
    routes: string[];
};

export type BusList = {
    busNo: string | undefined;
    destination: string;
    onPress: () => Promise<void>;
};

// Component props
export interface ServiceGridProps {
    services: ServiceTile[];
}

export interface ServiceTileProps {
    service: ServiceTile;
}

export interface ServiceCardProps {
    title: string;
    imgSrc: ImageSourcePropType;
    subtitle: string | undefined;
    serviceTag: ServiceTag;
    onPress: () => void;
    buttonText: string;
}

export type ServicesTabAction =
    | Action<'GO_BACK'>
    | Action<'SINGLE_MODE_BOOKING', { bookingType: TransportationTypes }>
    | Action<
          'SEARCH_FOR_STOP',
          { bookingType: ServiceTag; sourceStop: (transportStation & { distance: number }) | undefined }
      >
    | Action<'BOOK_FOR_BUS_ROUTE', { routeCode: string }>;
