import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/typescript/state/hooks.ts';
import { useMultimodalJourneyIdSwitchPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdSwitchPost.ts';
import { useMultimodalJourneyIdOrderLegOrderSwitchTaxiPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSwitchTaxiPost.ts';
import { switchLegReq } from '@/readOnly/api/types/SwitchLegReq.gen.tsx';
import { multimodalJourneyIdOrderLegOrderSwitchTaxiPostWithParams } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSwitchTaxiPost.ts';
import { setJourneyUpdates } from '@/typescript/state/client/search.ts';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen.tsx';
import {
    MultimodalTravelMode_multimodalTravelMode,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen.tsx';
import { PopUpType } from '../Types.ts';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen.tsx';
import { useEstimateMapJourney, updateJourneyMapData } from '../useEstimateMapJourney.ts';
import { journeyLeg } from '@/readOnly/api/types/JourneyLeg.gen.tsx';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { AnimatedScreenKey } from '@/typescript/context/AnimatedValuesContext.tsx';
import { useMultimodalJourneyIdOrderLegOrderChangeStopsPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderChangeStopsPost.ts';
import { changeStopsReq } from '@/readOnly/api/types/ChangeStopsReq.gen.tsx';
import { trackingResp } from '@/readOnly/api/types/TrackingResp.gen.tsx';

interface UseSwitchLegsProps {
    currentJourney: journeyData | null;
    journeyInfoData: journeyInfoResp | null;
    searchId: string | null;
    loadingDataForLeg: number | null;
    setLoadingDataForLeg: (legOrder: number | null) => void;
    setJourneyInfoData: (data: journeyInfoResp) => void;
    setPollJourneyInfo: (poll: boolean) => void;
    pollJourneyInfo: boolean;
    screenName: AnimatedScreenKey | undefined;
    vehicleType: VehicleCategory_vehicleCategory | undefined;
    trackVehiclesData: trackingResp | undefined;
}

export const useSwitchLegs = ({
    currentJourney,
    journeyInfoData,
    searchId,
    loadingDataForLeg,
    setLoadingDataForLeg,
    setJourneyInfoData,
    setPollJourneyInfo,
    pollJourneyInfo,
    vehicleType,
    trackVehiclesData,
}: UseSwitchLegsProps) => {
    const dispatch = useAppDispatch();
    const [popUpType, setPopUpType] = useState<PopUpType | null>(null);
    const [skippedLegOrders, setSkippedLegOrders] = useState<Record<number, boolean>>({});
    const [legRideOptionsPopup, setLegRideOptionsPopup] = useState<number | null>(null);
    const { rideOptionModalRef, metroStationChangeModalRef } = useRefsContext();
    const bottomPad = 60;

    const { journeyMapData, setJourneyMapData, pickupRoutePost, isMapDataLoaded, recenterBusTracking } =
        useEstimateMapJourney(
            currentJourney,
            journeyInfoData,
            bottomPad,
            pollJourneyInfo,
            vehicleType,
            trackVehiclesData,
        );
    const [changeStopsApiCall, { isLoading: changeStopsLoading }] =
        useMultimodalJourneyIdOrderLegOrderChangeStopsPostMutation();

    const [switchModeApiCall] = useMultimodalJourneyIdSwitchPostMutation();
    const [switchVariantApiCall, { isLoading: switchModeLoading }] =
        useMultimodalJourneyIdOrderLegOrderSwitchTaxiPostMutation();

    const switchLegMode = useCallback(
        async (legOrder: number, newMode: MultimodalTravelMode_multimodalTravelMode) => {
            if (!currentJourney) return;

            logger.logInfo(
                `Initiating leg mode switch for journey ${currentJourney.journeyId}, leg ${legOrder} to ${newMode}`,
                'BookingFlow',
            );

            setPopUpType(null);
            setLoadingDataForLeg(legOrder);

            if (skippedLegOrders[legOrder]) {
                setSkippedLegOrders(prev => ({
                    ...prev,
                    [legOrder]: false,
                }));
                setLoadingDataForLeg(null);
                return;
            }

            const switchModeReqBody: switchLegReq = {
                legOrder,
                startLocation: undefined,
                originAddress: undefined,
                newMode,
            };

            try {
                const resp = await switchModeApiCall({
                    journeyId: currentJourney?.journeyId,
                    body: switchModeReqBody,
                });

                if (resp.error) {
                    console.error('Error while switching mode', resp.error);
                    return;
                }

                const updatedJourney = {
                    ...currentJourney,
                    modes: currentJourney.modes.map((item: MultimodalTravelMode_multimodalTravelMode, index: number) =>
                        index === legOrder ? newMode : item,
                    ),
                    journeyLegs: currentJourney.journeyLegs.map((item: journeyLeg, index: number) =>
                        index === legOrder ? { ...item, journeyMode: newMode } : item,
                    ),
                };

                await updateJourneyMapData(legOrder, newMode, currentJourney, setJourneyMapData, pickupRoutePost);
                dispatch(setJourneyUpdates({ id: searchId, payload: updatedJourney }));
                setPollJourneyInfo(true);
            } catch (error) {
                logger.logError(`Exception while switching leg mode: ${error}`, 'BookingFlow');
                console.error('Error while switching mode', error);
            }
        },
        [
            currentJourney,
            skippedLegOrders,
            switchModeApiCall,
            dispatch,
            searchId,
            setJourneyMapData,
            pickupRoutePost,
            setPollJourneyInfo,
            updateJourneyMapData,
        ],
    );

    const switchVehicle = useCallback(
        async (legOrder: number, newEstimateId: string | null) => {
            if (!newEstimateId || !currentJourney) return;
            const confirmReq: multimodalJourneyIdOrderLegOrderSwitchTaxiPostWithParams = {
                journeyId: currentJourney.journeyId,
                legOrder: legOrder,
                body: { estimateId: newEstimateId },
            };

            const resp = await switchVariantApiCall(confirmReq);

            if (resp.error) {
                logger.logWarn(`Failed to switch vehicle: ${resp.error}`, 'BookingFlow');
                return;
            }

            setJourneyInfoData(resp.data);
            setPopUpType(null);
        },
        [currentJourney, setJourneyInfoData, switchVariantApiCall],
    );

    const handleShowRideOptions = useCallback(
        (legOrder: number) => {
            logger.logInfo(
                `Showing ride options for journey ${currentJourney?.journeyId}, leg ${legOrder}`,
                'BookingFlow',
            );
            setLegRideOptionsPopup(legOrder);
            rideOptionModalRef.current?.present();
            setPopUpType(PopUpType.RideOptionsPopUp);
        },
        [rideOptionModalRef],
    );

    const handleChangeVehicle = useCallback((legOrder: number | null) => {
        if (legOrder === null) {
            logger.logWarn(
                `LegOrder is Null, Can't able to  Change vehicle for journey ${currentJourney?.journeyId}, leg = ${legOrder}`,
                'BookingFlow',
            );
            return;
        }

        rideOptionModalRef.current?.dismiss();
        setLegRideOptionsPopup(legOrder);
        setPopUpType(PopUpType.ChooseRidePopUp);
    }, []);

    const handleChangeStation = useCallback(
        async (legOrder: number | undefined, sourceCode: string | undefined, destinationCode: string | undefined) => {
            if (!currentJourney || !journeyInfoData?.journeyId || !sourceCode || !destinationCode) {
                metroStationChangeModalRef.current?.dismiss();
                return;
            }

            if (legOrder === undefined) {
                metroStationChangeModalRef.current?.dismiss();
                return;
            }

            const changeStopsBody: changeStopsReq = {
                journeyId: journeyInfoData.journeyId,
                legOrder,
                newSourceStation: { stopCode: sourceCode },
                newDestinationStation: { stopCode: destinationCode },
            };

            try {
                setLoadingDataForLeg(legOrder);
                const resp = await changeStopsApiCall({
                    journeyId: journeyInfoData.journeyId,
                    legOrder,
                    body: changeStopsBody,
                });

                if ('error' in resp) {
                    logger.logError(`Failed to change stations: ${JSON.stringify(resp.error)}`, 'BookingFlow');
                    return;
                }

                if (resp.data.stationsChanged) {
                    setPollJourneyInfo(true);
                }
            } catch (error) {
                logger.logError(`Exception while changing stations: ${error}`, 'BookingFlow');
            } finally {
                setLoadingDataForLeg(null);
                metroStationChangeModalRef.current?.dismiss();
            }
        },
        [
            currentJourney,
            journeyInfoData,
            changeStopsApiCall,
            setPollJourneyInfo,
            metroStationChangeModalRef,
            setLoadingDataForLeg,
        ],
    );

    const handleSkipRide = useCallback((legOrder: number | undefined) => {
        if (legOrder === undefined) {
            logger.logWarn(
                `LegOrder is Null, Can't able to Skip Ride for journey ${currentJourney?.journeyId}, legOrder = ${legOrder}`,
                'BookingFlow',
            );
            return;
        }

        setPopUpType(null);
        setSkippedLegOrders(prev => ({
            ...prev,
            [legOrder]: true,
        }));
        setLegRideOptionsPopup(null);
        rideOptionModalRef.current?.dismiss();
    }, []);
    return {
        loadingDataForLeg,
        legRideOptionsPopup,
        popUpType,
        skippedLegOrders,
        switchLegMode,
        bottomPad,
        journeyMapData,
        switchVehicle,
        handleShowRideOptions,
        handleChangeVehicle,
        handleSkipRide,
        setLoadingDataForLeg,
        setPopUpType,
        switchModeLoading,
        setJourneyMapData,
        isMapDataLoaded,
        handleChangeStation,
        changeStopsLoading,
        recenterBusTracking,
    };
};
