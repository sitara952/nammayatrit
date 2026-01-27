import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { Action } from '@/typescript/utils/common';
import { ProcessedLegInfo } from '../../types/journeyTracking';
import { SearchResultItem } from '../Search/components/SearchSectionListItem/types';
import { SearchTarget } from '../../utils/PublicTransportUtils';

export interface BusOtpFlowProps {
    mpDispatch: (action: BusOtpAction) => void;
    isPublicTransportDataLoading: boolean | undefined;
    isWrongOtp: boolean | undefined;
    setIsWrongOtp: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    isPublicTransportDataSuccess: boolean;
    autoFillOtp: string | undefined;
    scanOtpRef: React.MutableRefObject<boolean>;
    displaySearchBar: boolean;
    recentSearches: SearchResultItem[] | undefined;
    suggestions: SearchResultItem[];
    loadingSuggestions: boolean;
    searchPublicTransport: (searchString: string, searchType: SearchTarget) => void;
    onRecentSearchPress: (item: SearchResultItem, otp: string) => void;
    currentOtp: string;
    isTouristBus: boolean;
    clearTouristBusPassData: () => void;
    onBuyTouristBusTicket: () => void;
    onSearchTouristBusDestination: () => void;
    availablePasses: passAPIEntity[];
    isProcessingPayment?: boolean;
}
export interface BusOtpActivateFlowProps {
    legInfo: legInfo | undefined | ProcessedLegInfo;
    journeyId: string;
    legOrder: number;
    subLegOrder: number;
    autoFillOtp: string | undefined;
    type: 'Activate' | 'Pass';
}

// Action definitions for the BusOtpFlow
export type BusOtpAction = Action<'PROCEED', { otp: string }>;
