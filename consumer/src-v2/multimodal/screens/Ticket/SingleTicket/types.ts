import { JourneyId } from '@/typescript/state/client/user';
import { QrCodeViewProps } from '../../PaymentStatus/QrCodeView';
import { BusItem } from '../../SingleModeSearch/Components/BusList';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { JourneyStatus_journeyStatus } from '@/readOnly/api/types/Enums.gen';
import { MultiTransitTicketUIProps } from '../MultiModeTicket/UI';
import { SuburbanInfoCardProps } from './components/SuburbanInfoCard';
import { BusOtpActivateFlowProps } from '../../BusOtpFlow/Types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export interface MultiQrCodeViewProps extends Omit<QrCodeViewProps, 'jsonString'> {
    qrCodes: string[];
}

export type BusTransitMetaInfo =
    | 'ORDINARY'
    | 'AC'
    | 'NON_AC'
    | 'EXPRESS'
    | 'SPECIAL'
    | 'EXECUTIVE'
    | 'FIRST_CLASS'
    | 'SECOND_CLASS'
    | 'THIRD_CLASS';

// Base interface without status-specific fields
interface BaseTransitInfoCommon {
    source: string;
    destination: string;
    regionalSourceTitle: string;
    regionalDestinationTitle: string;
    nextArrivalTime: string;
    transitMessage: string;
    validTill: string;
    transitCost: number;
    refundAmount?: number;
}

// Active ticket specific fields
interface ActiveTransitInfo extends BaseTransitInfoCommon {
    status: 'ACTIVE';
}

// Unsuccessful ticket specific fields
interface UnsuccessfulTransitInfo extends BaseTransitInfoCommon {
    status: 'UNSUCCESSFUL';
    retryBooking: () => void;
    isRetrying: boolean;
}

// Failed processing refund specific fields
interface FailedProcessingRefundTransitInfo extends BaseTransitInfoCommon {
    status: 'FAILED_PROCESSING_REFUND';
}

// Failed processed refund specific fields
interface FailedProcessedRefundTransitInfo extends BaseTransitInfoCommon {
    status: 'FAILED_PROCESSED_REFUND';
}

interface CancelledProcessingRefundTransitInfo extends BaseTransitInfoCommon {
    status: 'CANCELLED_PROCESSING_REFUND';
}

interface CancelledProcessedRefundTransitInfo extends BaseTransitInfoCommon {
    status: 'CANCELLED_PROCESSED_REFUND';
}

interface CancelledRefundFailedTransitInfo extends BaseTransitInfoCommon {
    status: 'CANCELLED_REFUND_FAILED';
}

// Union type of all possible transit info states
export type BaseTransitInfo =
    | ActiveTransitInfo
    | UnsuccessfulTransitInfo
    | FailedProcessingRefundTransitInfo
    | FailedProcessedRefundTransitInfo
    | CancelledProcessingRefundTransitInfo
    | CancelledProcessedRefundTransitInfo
    | CancelledRefundFailedTransitInfo;

export interface MetroTransitHeaderInfo {
    mode: 'METRO';
    transitMetaInfo: string;
}

export interface BusTransitHeaderInfo {
    mode: 'BUS';
    transitMetaInfo: BusTransitMetaInfo;
    busNo: string;
    // handleActivateBusTicket: () => void;
    fleetNo: string | undefined;
    // handleActivateBusTicket: () => void;
    activationProps: BusOtpActivateFlowProps;
}

export interface SubwayTransitHeaderInfo {
    mode: 'SUBWAY';
    transitMetaInfo: string;
}

export type TransitInfoCardHeaderProps = (MetroTransitHeaderInfo | BusTransitHeaderInfo | SubwayTransitHeaderInfo) & {
    transitCost: number;
    transitMetaInfoDisplayName: string;
};

// Metro transit type with status
export type BaseMetroTransitInfo =
    | (ActiveTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (UnsuccessfulTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (FailedProcessingRefundTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (FailedProcessedRefundTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (CancelledProcessingRefundTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (CancelledProcessedRefundTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      })
    | (CancelledRefundFailedTransitInfo & {
          mode: 'METRO';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
          legInfo: legInfo | undefined;
      });

// Bus transit type with status
export type BaseBusTransitInfo =
    | (ActiveTransitInfo & { mode: 'BUS'; transitMetaInfo: BusTransitMetaInfo; transitMetaInfoDisplayName: string })
    | (UnsuccessfulTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      })
    | (FailedProcessingRefundTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      })
    | (FailedProcessedRefundTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      })
    | (CancelledProcessingRefundTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      })
    | (CancelledProcessedRefundTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      })
    | (CancelledRefundFailedTransitInfo & {
          mode: 'BUS';
          transitMetaInfo: BusTransitMetaInfo;
          transitMetaInfoDisplayName: string;
      });

// Subway transit type with status
export type BaseSubwayTransitInfo =
    | (ActiveTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (UnsuccessfulTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (FailedProcessingRefundTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (FailedProcessedRefundTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (CancelledProcessingRefundTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (CancelledProcessedRefundTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      })
    | (CancelledRefundFailedTransitInfo & {
          mode: 'SUBWAY';
          transitMetaInfo: string;
          transitMetaInfoDisplayName: string;
          ticketNumber: string | undefined;
      });

// Direct Metro Transit Info with status
export type DirectMetroTransitInfo = BaseMetroTransitInfo & {
    metroTransitType: 'DIRECT';
    gateNo: number | undefined;
    platformNo: number | undefined;
};

// Switch Metro Transit Info with status
export type SwitchMetroTransitInfo = BaseMetroTransitInfo & {
    metroTransitType: 'SWITCH';
    gateNo: number | undefined;
    platformNo: number | undefined;
    sourceMessage: string;
    switchStation: string;
    switchStationRegionalTitle: string;
    sourceLine: string;
    sourceLineColorCode: string;
    switchPlatformNo: number | undefined;
    destinationMessage: string;
    destinationLine: string;
    destinationLineColorCode: string;
};

export type MetroTransitInfo = DirectMetroTransitInfo | SwitchMetroTransitInfo;

// Direct Subway Transit Info with status
export type DirectSubwayTransitInfo = BaseSubwayTransitInfo & {
    subwayTransitType: 'DIRECT';
    gateNo: number | undefined;
    platformNo: number | undefined;
};

// Switch Subway Transit Info with status
export type SwitchSubwayTransitInfo = BaseSubwayTransitInfo & {
    subwayTransitType: 'SWITCH';
    gateNo: number | undefined;
    platformNo: number | undefined;
    sourceMessage: string;
    switchStation: string;
    switchStationRegionalTitle: string;
    sourceLine: string;
    sourceLineColorCode: string;
    switchPlatformNo: number | undefined;
    destinationMessage: string;
    destinationLine: string;
    destinationLineColorCode: string;
};

export type SubwayTransitInfo = DirectSubwayTransitInfo | SwitchSubwayTransitInfo;

// Bus Transit Info with status
export type BusTransitInfo = BaseBusTransitInfo & {
    busNo: string;
    availableBuses: BusItem[];
    // handleActivateBusTicket: () => void;
    fleetNo: string | undefined;
    // handleActivateBusTicket: () => void;
    activationProps: BusOtpActivateFlowProps;
    setTicketUIModalClosed: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    navigation: NativeStackNavigationProp<MainNavigationParamList> | undefined;
};

export type TransitInfoCardProps = MetroTransitInfo | BusTransitInfo | SubwayTransitInfo;
export type transitModes = 'BUS' | 'METRO' | 'TRAIN' | undefined;
// 1. TicketHeaderProps
export interface TicketHeaderProps {
    title: string;
    regionalTitle: string | undefined;
    date: string;
    id: string | undefined;
    ticketCount: number;
    leg: transitModes;
}
export type RenderType = 'bottomSheetModal' | 'bottomSheet' | 'normal';

// Combined output props for NewTicketUI
export interface NewTicketUIProps {
    ticketHeaderProps: TicketHeaderProps;
    transitInfoCardProps: TransitInfoCardProps | undefined;
    categories: categoryInfoResponse[][];
    onClose?: () => void;
    onPressCheckIn?: () => void;
    onPressSupport?: () => void;
    qrCodeViewProps: MultiQrCodeViewProps;
    // Timer Component Props
    duration: string | undefined;
    journeyId: JourneyId | null;
    renderType: RenderType;
    ticketType: 'METRO' | 'BUS' | 'COMBO' | 'TRAIN';
    singleLeg: legInfo | undefined;
    // Add the new journeyStatus prop
    journeyStatus?: JourneyStatus_journeyStatus | null;
    subUrbanData: SuburbanInfoCardProps | undefined;
    ticketCreatedAt: string | undefined;
}

// Overall return type of useTicketUIProps hook
export type TicketUIProps =
    | { tag: 'SINGLEMODE'; data: NewTicketUIProps }
    | { tag: 'MULTIMODAL'; data: MultiTransitTicketUIProps }
    | undefined;
