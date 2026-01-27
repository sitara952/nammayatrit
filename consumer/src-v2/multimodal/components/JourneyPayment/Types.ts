import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SubwayErrorPopUpType } from './hooks/useSubwayErrors';
import { TransitSummaryType } from '../../screens/JourneyInfoScreen/components/TransitSummary';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { journeyBookingPaymentStatus } from '@/readOnly/api/types/JourneyBookingPaymentStatus.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { TransitType } from '../PublicTransportCard/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { JourneyDetailsProps } from '../../screens/JourneyInfoScreen';
import { busLocation } from '@/readOnly/api/types/BusLocation.gen';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';
import { journeyConfirmReqElementWithTravelMode } from '../../screens/JourneyInfoScreen/Types';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import {
    FRFSQuoteCategoryType_fRFSQuoteCategoryType,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import { Gender_gender } from '@/readOnly/api/types/Enums.gen';
import { legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';

export type PaymentConfirmArgs = {
    skipPayment: boolean;
    viaOfferButton: boolean;
};

// Category-based types
import { CategorySelections } from './journeyPaymentUtils';

export type LegCategorySelection = {
    categories: categoryInfoResponse[];
    legOrder: number;
    travelMode: MultimodalTravelMode_multimodalTravelMode;
    fixedPrice: boolean;
    cashPayment: boolean;
    passApplicable: boolean;
    selections: CategorySelections;
};

export type LegCategorySelections = LegCategorySelection[];

export function calculateTotalTickets(legCategorySelections: LegCategorySelection[]): number {
    const categorySelections = legCategorySelections.filter(selection => !selection.cashPayment)?.at(0)?.selections;
    return categorySelections ? Array.from(categorySelections.values()).reduce((total, qty) => total + qty, 0) : 0;
}

export function calculateTotalTicketsFromExtraInfo(legExtra: legExtraInfo): number {
    const categories =
        (() => {
            switch (legExtra.TAG) {
                case 'Metro':
                    return legExtra._0.categories;
                case 'Bus':
                    return legExtra._0.categories;
                case 'Subway':
                    return legExtra._0.categories;
                default:
                    return [];
            }
        })() ?? [];
    return categories.reduce((total, category) => total + (category.categorySelectedQuantity ?? 0), 0);
}

export function calculateTotalPriceFromCategories(categories: categoryInfoResponse[]): number {
    return categories.reduce(
        (total, category) =>
            total + (category.categorySelectedQuantity ?? 0) * (category.categoryOfferedPrice?.amount ?? 0),
        0,
    );
}

export function getDefaultCategory(
    categories: categoryInfoResponse[],
    userGender: Gender_gender,
): categoryInfoResponse | undefined {
    const defaultAdultCategory = categories.find(category => category.categoryName === 'ADULT') ?? categories[0];
    const defaultCategory =
        userGender === 'FEMALE'
            ? (categories.find(category => category.categoryName === 'FEMALE') ?? defaultAdultCategory)
            : (categories.find(category => category.categoryName === 'MALE') ?? defaultAdultCategory);
    return defaultCategory;
}

export interface JourneyPaymentProps {
    legs: legInfo[];
    offer: cumulativeOfferResp | undefined;
    journeyId: string | undefined;
    handledQuoteExpiry: () => Promise<void>;
    setIsJourneyConfirmed: (isJourneyConfirmed: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    onMoreOptions: (() => void) | undefined;
    isSingleMode: boolean;
    fetchingLegsFare: boolean;
    isJourneyConfirmed: boolean;
    loadingDataForLeg: number | null;
}

export interface JourneyPaymentFlowProps {
    currentJourney: journeyData | null;
    setLoadingDataForLeg: (loading: number | null) => void;
    currentLocation: location | null;
    source: location | null;
    destination: location | null;
    publicTransportSearch: JourneyDetailsProps | undefined;
    searchId: string | null;
    isSingleMode: boolean;
    otp: string | undefined;
    isJourneyConfirmed: boolean;
    loadingDataForLeg: number | null;
    setIsJourneyConfirmed: (isJourneyConfirmed: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    onMoreOptions: (() => void) | undefined;
    loadingTrainViaPoints: boolean;
    isViaModalShown: boolean;
    legRideOptionsPopup: number | null;
    setIsTicketModalOpen: (isOpen: boolean) => void | undefined;
    utsError: SubwayErrorPopUpType | undefined;
    suggestedBusData: busLocation[] | undefined;
}

export interface JourneyPaymentUIProps {
    legs: legInfo[];
    offer: cumulativeOfferResp | undefined;
    loadingDataForLeg: number | null;
    setIsJourneyConfirmed: (isJourneyConfirmed: boolean) => void;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    isConfirmingJourney: boolean;
    paymentOrder: journeyBookingPaymentStatus | undefined;
    isPaymentOrder: boolean;
    hasBookableLeg: boolean;
    utsError: SubwayErrorPopUpType | undefined;
    paymentRetryCounter: number;
    getSourceAndDestination: () => {
        source: string;
        destination: string;
    };
    totalFare: number;
    totalPayableFare: number;
    legCategorySelections: LegCategorySelections;
    handleCategoryQuantityChange?: (
        legOrder: number,
        categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
        isIncr: boolean,
    ) => void;
    getCategoryDiscount?: (category: categoryInfoResponse) => number;
    onConfirm: (args: PaymentConfirmArgs) => void;
    hideLoader: boolean;
    journeySegments: TransitSummaryType[];
    appName: string;
    currentOrderId: string | undefined;
    fetchingLegsFare: boolean;
    hasSubwayLeg: boolean;
    loadingTrainViaPoints: boolean;
    isViaModalShown: boolean;
    legRideOptionsPopup: number | null;
    setIsTicketModalOpen: (isOpen: boolean) => void | undefined;
    isJourneyInfoModalVisible: boolean;
    setIsJourneyInfoModalVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    alwaysShowPaymentFooter: boolean;
    onGoBack: () => void;
    handleConfirmJourney: (journeyConfirmReqElements: journeyConfirmReqElementWithTravelMode[]) => Promise<void>;
}

export interface JourneyPaymentModalProps {
    ticketSelectorModalRef: React.RefObject<BottomSheetModal | null>;
    journeyModes: TransitType[];
    handleOnPress: () => void;
    isLoading: boolean;
    hasSubwayLeg: boolean;
    onModalDismiss: () => void | undefined;
    legCategorySelections: LegCategorySelections;
    handleCategoryQuantityChange?: (
        legOrder: number,
        categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
        isIncr: boolean,
    ) => void;
    getCategoryDiscount?: (category: categoryInfoResponse) => number;
}
