import React, { memo, useCallback, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind'; // Corrected tailwind import
import { IternaryCard } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/UI';
import {
    TransitType,
    type ItineraryCardProps,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types'; // Corrected ItineraryCardProps import
import MapProvider from '@/typescript/Maps/MapProvider'; // Corrected MapProvider import
import { initialCoordinate as DEFAULT_INITIAL_COORDINATE } from '@/storage/Constants.bs'; // Path from systemPatterns.md
import { type latLong } from '@/src-v2/multimodal/hooks/useJourneyTrackingData'; // Re-using type from hook
import { BookingId, type JourneyId } from '@/typescript/state/client/user';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { formatPhone } from '@/src-v2/utils/Booking';
import CallDriver from '@/typescript/screens/CallDriver';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LiveJourneyPopupManager } from '../LiveJourneyDetail/LiveJourneyPopupManager';
import { PopupRuleOutput } from '../../rules/JourneyRulesTypes';
import {
    TransitCheckIn,
    TransitCheckInProps,
} from '../NewLiveJourney/components/StatusPopUpModal/TransitCheckIn/TransitCheckIn';
import TicketUI from '../Ticket/UI';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { minimizeApp } from '@/typescript/utils/common';
import { TicketUIProps } from '../Ticket/SingleTicket/types';
import JourneyListBottomSheet, {
    LegUpdateType,
} from '../NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { useRefsContext } from '@/typescript/context/RefsContext';

import { Stop, ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { useLocationStatusContext } from '@/typescript/context/LocationStatusContext';

export type CallDriverProps = {
    driverNumber: string;
    exoNumber: string;
    bookingId: BookingId;
};

export interface LiveJourneyOverviewUIProps {
    isLoading: boolean;
    error: string | null;
    itineraryCardProps: ItineraryCardProps;
    callDriverProps: CallDriverProps | null;
    transitCheckInProps: TransitCheckInProps | null;
    popupProps: PopupRuleOutput | undefined;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    journeyId: JourneyId | null;
    riderLocation: latLong | null;
    ticketUIProps: TicketUIProps | undefined;
    trackLostJourneyProps: TransitType[];
    lastUpdatedAt: number;
    timeTableData: NewTimeTableUIProps | undefined;
    onLegUpdate: (legUpdate: LegUpdateType) => void;
    metroConfirmProps: {
        allLegs: ProcessedLegInfo[];
        onMetroStationConfirm: (legOrder: string, station: Stop) => void;
    } | null;
    predictedLeg: ProcessedLegInfo | undefined;
    shouldAutoOpenUpdateTransit: boolean;
    setShouldAutoOpenUpdateTransit: (next: boolean) => void;
    busFleetNumber: string | undefined;
    busLegData: ProcessedLegInfo | undefined;
}

// Memoized call driver modal
const MemoizedCallDriverModal = memo(
    ({
        callDriverProps,
        callDriverBottomsheetModalRef,
    }: {
        callDriverProps: CallDriverProps;
        callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    }) => (
        <PopUpModal
            sheetRef={callDriverBottomsheetModalRef}
            onAnimate={() => Keyboard.dismiss()}
            onDismiss={() => {}}
            showBackdrop={undefined}
            stackBehavior="replace"
            onHardwareBackPress={undefined}
            isScrollable={false}>
            <CallDriver
                driverNumber={formatPhone(callDriverProps.driverNumber)}
                exoNumber={callDriverProps.exoNumber}
                onClose={undefined}
                bookingId={callDriverProps.bookingId}
                rideId={null}
            />
        </PopUpModal>
    ),
);

// Memoized main content component
const MemoizedMainContent = memo(
    ({
        displayCoordinate,
        mapId,
        itineraryCardProps,
        callDriverProps,
        callDriverBottomsheetModalRef,
        popupProps,
        transitCheckInProps,
        journeyId,
        ticketUIProps,
        trackLostJourneyProps,
        lastUpdatedAt: _lastUpdatedAt,
        timeTableData,
        onLegUpdate,
        metroConfirmProps,
        predictedLeg,
        shouldAutoOpenUpdateTransit,
        setShouldAutoOpenUpdateTransit,
        busFleetNumber,
        busLegData,
    }: {
        displayCoordinate: { latitude: number; longitude: number };
        mapId: string;
        itineraryCardProps: ItineraryCardProps;
        callDriverProps: CallDriverProps | null;
        callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
        popupProps: PopupRuleOutput | undefined;
        transitCheckInProps: TransitCheckInProps | null;
        journeyId: JourneyId | null;
        ticketUIProps: TicketUIProps | undefined;
        trackLostJourneyProps: TransitType[];
        lastUpdatedAt: number;
        timeTableData: NewTimeTableUIProps | undefined;
        onLegUpdate: (legUpdate: LegUpdateType) => void;
        metroConfirmProps: {
            allLegs: ProcessedLegInfo[];
            onMetroStationConfirm: (legOrder: string, station: Stop) => void;
        } | null;
        predictedLeg: ProcessedLegInfo | undefined;
        shouldAutoOpenUpdateTransit: boolean;
        setShouldAutoOpenUpdateTransit: (next: boolean) => void;
        busFleetNumber: string | undefined;
        busLegData: ProcessedLegInfo | undefined;
    }) => {
        const { locationStatus } = useLocationStatusContext();
        const mainContentRef = useRef<View>(null);
        const timeTableRef = useRef<View>(null);
        const popupManagerRef = useRef<View>(null);
        const ticketRef = useRef<View>(null);

        useDebounceBackPress(() => {
            minimizeApp();
            return true;
        });
        const { liveJourneyListBottomSheetRef } = useRefsContext();
        return (
            <View ref={mainContentRef} style={tailwind`flex-1 bg-gray-100`}>
                <MapProvider initialCoordinate={displayCoordinate} mapId={mapId} fitToMapElementFlag={false}>
                    <IternaryCard
                        {...itineraryCardProps}
                        locationStatus={locationStatus}
                        journeyId={journeyId || undefined}
                        busFleetNumber={busFleetNumber}
                        busLegData={busLegData}
                    />
                </MapProvider>
                {callDriverProps ? (
                    <MemoizedCallDriverModal
                        callDriverProps={callDriverProps}
                        callDriverBottomsheetModalRef={callDriverBottomsheetModalRef}
                    />
                ) : null}
                {ticketUIProps ? (
                    <View ref={ticketRef} accessible accessibilityLabel="Ticket Information">
                        <TicketUI {...ticketUIProps} />
                    </View>
                ) : null}
                {timeTableData && (
                    <View ref={timeTableRef} accessible accessibilityLabel="Time Table">
                        <NewTimeTableUI
                            times={timeTableData?.times}
                            source={timeTableData?.source}
                            sheetRef={timeTableData?.sheetRef}
                            mode={timeTableData?.mode}
                            towardsStation={timeTableData?.towardsStation}
                            onDismiss={undefined}
                            allTowardsStation={timeTableData?.allTowardsStation}
                        />
                    </View>
                )}
                <View ref={popupManagerRef} accessible accessibilityLabel="Live Journey Popup Manager">
                    <LiveJourneyPopupManager popupInfo={popupProps} />
                </View>
                {transitCheckInProps ? <TransitCheckIn {...transitCheckInProps} /> : null}
                <JourneyListBottomSheet
                    sheetRef={liveJourneyListBottomSheetRef}
                    onClosePress={() => {
                        liveJourneyListBottomSheetRef.current?.dismiss();
                    }}
                    onLegUpdate={onLegUpdate}
                    journeySteps={trackLostJourneyProps}
                    allLegs={metroConfirmProps?.allLegs ?? []}
                    onMetroStationConfirm={metroConfirmProps?.onMetroStationConfirm ?? (() => {})}
                    predictedLeg={predictedLeg}
                    shouldAutoOpenUpdateTransit={shouldAutoOpenUpdateTransit}
                    setShouldAutoOpenUpdateTransit={setShouldAutoOpenUpdateTransit}
                />
            </View>
        );
    },
);

export const LiveJourneyOverviewUI: React.FC<LiveJourneyOverviewUIProps> = ({
    itineraryCardProps,
    journeyId,
    callDriverProps,
    transitCheckInProps,
    callDriverBottomsheetModalRef,
    riderLocation,
    popupProps,
    ticketUIProps,
    trackLostJourneyProps,
    lastUpdatedAt,
    timeTableData,
    onLegUpdate,
    metroConfirmProps,
    predictedLeg,
    shouldAutoOpenUpdateTransit,
    setShouldAutoOpenUpdateTransit,
    busFleetNumber,
    busLegData,
}) => {
    const mapId = `live-journey-overview-${journeyId || 'default'}`;
    const getMapProviderCoordinate = useCallback(() => {
        const sourceCoord = riderLocation || DEFAULT_INITIAL_COORDINATE;
        // DEFAULT_INITIAL_COORDINATE is already { latitude, longitude }
        // riderLocation is { lat, lon }
        if (sourceCoord && 'lat' in sourceCoord && 'lon' in sourceCoord) {
            return { latitude: sourceCoord.lat, longitude: sourceCoord.lon };
        }
        return sourceCoord; // Should be DEFAULT_INITIAL_COORDINATE or already in correct format
    }, []);

    const displayCoordinate = getMapProviderCoordinate();

    return (
        <HardwareBackpressHandler>
            <MemoizedMainContent
                displayCoordinate={displayCoordinate}
                mapId={mapId}
                itineraryCardProps={itineraryCardProps}
                callDriverProps={callDriverProps}
                callDriverBottomsheetModalRef={callDriverBottomsheetModalRef}
                popupProps={popupProps}
                transitCheckInProps={transitCheckInProps}
                journeyId={journeyId}
                ticketUIProps={ticketUIProps}
                trackLostJourneyProps={trackLostJourneyProps}
                lastUpdatedAt={lastUpdatedAt}
                timeTableData={timeTableData}
                onLegUpdate={onLegUpdate}
                metroConfirmProps={metroConfirmProps}
                predictedLeg={predictedLeg}
                shouldAutoOpenUpdateTransit={shouldAutoOpenUpdateTransit}
                setShouldAutoOpenUpdateTransit={setShouldAutoOpenUpdateTransit}
                busFleetNumber={busFleetNumber}
                busLegData={busLegData}
            />
        </HardwareBackpressHandler>
    );
};
