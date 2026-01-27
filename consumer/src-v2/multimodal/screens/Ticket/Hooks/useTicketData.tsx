import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { JourneyId } from '@/typescript/state/client/user';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { useMemo } from 'react';
import { LegTickets } from '@/typescript/state/client/journey';
import { PaymentDetailsData } from '@/src-v2/multimodal/components/RouteAndPaymentDetails/PaymentDetails';
import { appName } from 'config-types';
export interface MultimodeTicketUIProps {
    renderQR: string | undefined;
    legTickets: LegTickets;
    transitTypes: Array<{
        title: MultimodalTravelMode_multimodalTravelMode;
        legInfo: legInfo;
        AltText: string | undefined;
    }>;
    comboTicketText?: string;
    journeyId: JourneyId | null;
    bottomInset?: number;
    onDismiss?: () => void;
    onClose: () => void;
    onStartJourney?: () => void;
    onQuestionPress?: () => void;
    onShare?: () => void;
    fromLiveJourney: boolean;
    showStartJourneyButton: boolean;
    isPopUp: boolean;
    appName: appName;
    onPress: () => void;
    onPressBookAuto: () => void;
    paymentDetailsData: PaymentDetailsData;
}

export type TimerData = {
    startTime: number;
    durationSecs: number;
};

export interface TicketData {
    effectiveTicketLiveHours: string | undefined;
    metroTicketId: string | undefined;
}

export interface QRCarouselProps {
    qrString: string;
    legTickets?: string[];
    otp: string | undefined;
    size?: number;
    preview?: number;
    onQrPress?: () => void;
    onOtpPress?: () => void;
    showOtp: boolean;
    otpColor?: string;
    appName: appName;
}

export const expiryDateAndTime = (duration: string): { expiryDate: Date; remainingTime: number } => {
    const expiryDate = new Date(duration);
    const currentDate = new Date();
    const remainingTime = Math.max(0, Math.floor((expiryDate.getTime() - currentDate.getTime()) / 1000));
    return { expiryDate, remainingTime };
};

type TicketValidity = { expiryDate: Date | null; remainingTime: number; original: string };

export const useTicketData = (
    transitTypes: Array<{
        title: MultimodalTravelMode_multimodalTravelMode;
        legInfo: legInfo;
        AltText: string | undefined;
    }>,
    renderQR: string | undefined,
): TicketData => {
    const jsonString = renderQR ? renderQR : undefined;
    const effectiveTicketLiveHours = useMemo(() => {
        const allTicketValidities: string[] = transitTypes.flatMap(transit => {
            const legExtraInfo = transit.legInfo.legExtraInfo;
            if (
                'TAG' in legExtraInfo &&
                ['Metro', 'Bus', 'Subway'].includes(legExtraInfo.TAG) &&
                'ticketValidity' in legExtraInfo._0 &&
                legExtraInfo._0.ticketValidity
            ) {
                return legExtraInfo._0.ticketValidity;
            }
            return [];
        });

        const parseTicketValidity = (
            duration: string,
        ): { expiryDate: Date; remainingTime: number; original: string } => {
            try {
                const { expiryDate, remainingTime } = expiryDateAndTime(duration);
                return { expiryDate, remainingTime, original: duration };
            } catch {
                return { expiryDate: new Date(0), remainingTime: 0, original: duration };
            }
        };

        const minTicketValidity: TicketValidity = allTicketValidities.reduce(
            (min: TicketValidity, validity): TicketValidity => {
                const parsed = parseTicketValidity(validity);
                if (parsed.expiryDate.getTime() === 0) return min; // Skip invalid dates
                return !min.expiryDate || parsed.expiryDate < min.expiryDate ? parsed : min;
            },
            { expiryDate: null, remainingTime: 0, original: '' },
        );

        if (minTicketValidity.expiryDate) {
            return minTicketValidity.original;
        }
        return undefined;
    }, [transitTypes]);
    if (!jsonString) {
        return {
            effectiveTicketLiveHours: effectiveTicketLiveHours,
            metroTicketId: undefined,
        };
    } else {
        // eslint-disable-next-line myCustomPlugin/no-direct-json-parse
        const parsedData = JSON.parse(jsonString);
        const cmrlTicketData = parsedData.cmrl?.[0]?.ticketData;
        const cmrlTicketDataString: string[] = Array.isArray(cmrlTicketData)
            ? cmrlTicketData.map(String).join(', ').split(',')
            : [];
        const ticketId = cmrlTicketDataString[0]?.split('<FSP>')?.[1];

        return {
            effectiveTicketLiveHours,
            metroTicketId: ticketId,
        };
    }
};
