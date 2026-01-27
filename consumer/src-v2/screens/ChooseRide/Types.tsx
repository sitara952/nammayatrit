import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { JourneyFilterOptions } from '@/src-v2/multimodal/screens/PublicTransitList/Types';
import { AppConfigType } from '@/src-v2/systems/configs/types';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { PricingItemType } from '@/typescript/state/client/search';
import { BookingId } from '@/typescript/state/client/user';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DerivedValue } from 'react-native-reanimated';

export interface SelectedMultimodalLeg {
    pricingId: string | undefined;
    distance: number | undefined;
    duration: number | undefined;
}

export interface ChooseRideProps {
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    showErrorStatesModal: (bookingId: BookingId | null) => void;
    hideAccessibility: boolean;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>>;
    setIsScrolled: React.Dispatch<React.SetStateAction<boolean>>;
    searchId: string | null;
    bookAnyVisible: boolean;
    selectedMultimodalLeg: SelectedMultimodalLeg | null;
}

export type ChooseRideCardType =
    | { type: 'MULTIMODAL'; data: journeyData[]; title: string }
    | { type: 'NORMAL'; data: (PricingItemType | undefined)[]; title: string };
export type LoadingCardType =
    | { type: 'MULTIMODAL'; data: undefined[]; title: string }
    | { type: 'NORMAL'; data: undefined[]; title: string };

export type ChooseRideCardData = Array<ChooseRideCardType> | null;

export type LoadingCardData = Array<LoadingCardType>;

export type RenderItems = (params: { item: unknown; index: number }) => React.JSX.Element;

export type ChooseRideViewProps = {
    derivedAddTipState: DerivedValue<0 | 1>;
    hideAccessibility: boolean;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>>;
    pricingItemsData: ChooseRideCardData;
    loadingData: LoadingCardData;
    screenReaderEnabled: boolean;
    selectedCard: PricingItemType | null;
    renderPriceItem: RenderItems;
    duration: number | undefined;
    distance: number | undefined;
    journeys: journeyData[];
    selectedJourney: journeyData | null;
    bookAnyVisible: boolean;
    selectJourneyFilter: (option: JourneyFilterOptions) => void;
    goToJourneyOption: () => void;
    selectPublicTransportItem: (index: number, item: journeyData) => void;
    hasMultiModalView: boolean;
    appConfig: AppConfigType;
    enableMultimodal: boolean;
    showPublicTransportAboveEstimates: boolean;
    stopPolling: boolean;
    fareProductType: string | undefined;
    publicTransportData: ChooseRideCardData | null;
    renderPublicTransportOptions: RenderItems;
    sectionData: (LoadingCardType | ChooseRideCardType)[];
    isAddStop: boolean;
    showRateCardModal: boolean;
    setShowRateCardModal: React.Dispatch<React.SetStateAction<boolean>>;
};
