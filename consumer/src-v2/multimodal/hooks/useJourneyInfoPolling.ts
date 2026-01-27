import { isNull, isUndefined } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePolling } from '@/typescript/hooks/usePolling.ts';
import { useMultimodalJourneyIdInitiatePostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdInitiatePost';
import { useMultimodalSearchPostMutation } from '@/api/integrations/rtk/MultimodalSearchPost';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { JourneyDetailsProps } from '../screens/JourneyInfoScreen';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setSearchedSource, updateSelectedSearchedStop } from '@/typescript/state/client/session';
import { UTSData, getUTSData } from '@/src-v2/helpers/uts';
import { UTSResponseStatus } from '@/src-v2/modules/UtsModule';
import { logger } from '@/src-v2/systems/logger';
import { setCrisSDKToken } from '@/typescript/state/client/session';
import { convertFrfsStationToLocation } from '@/typescript/utils/MultiModal';
import { busLocation } from '@/readOnly/api/types/BusLocation.gen';
import { dummyLocationAddress } from '@/typescript/utils/location';

type useJourneyInfoPollingProps = {
    source: location | null;
    destination: location | null;
    currentLocation: location | null;
    searchId: string | null;
    currentJourney: journeyData | null;
    setLoadingDataForLeg: (loadingDataForLeg: number | null) => void;
    publicTransportSearch: JourneyDetailsProps | undefined;
    isSingleMode: boolean;
    otp: string | undefined;
    onNoJourneysFound: (() => void) | undefined;
    suggestedBusData: busLocation[] | undefined;
};
export const useJourneyInfoPolling = (props: useJourneyInfoPollingProps) => {
    const { isSingleMode, otp, onNoJourneysFound, suggestedBusData } = props;
    const dispatch = useAppDispatch();
    const [journeyInitiateAPICall] = useMultimodalJourneyIdInitiatePostMutation();
    const [journeyInfoData, setJourneyInfoData] = useState<journeyInfoResp | null>(null);
    const [pollJourneyInfo, setPollJourneyInfo] = useState(false);
    const cachedDeviceId = useRef<string | null>(null);
    const [isMultimodalWarningVisible, setMultimodalWarningVisible] = useState(false);
    const [multimodalSearch, { data: multimodalSearchData, isSuccess: _searchSuccessful }] =
        useMultimodalSearchPostMutation();

    const initiateJourneySearch = useCallback(async () => {
        const [source, destination] = (() => {
            if ((props.publicTransportSearch?.originStop, props.publicTransportSearch?.destinationStop)) {
                const sourceLocation = convertFrfsStationToLocation(props.publicTransportSearch?.originStop);
                const destinationLocation = convertFrfsStationToLocation(props.publicTransportSearch?.destinationStop);
                if (sourceLocation) {
                    dispatch(setSearchedSource(sourceLocation));
                }
                if (destinationLocation) {
                    dispatch(updateSelectedSearchedStop(destinationLocation));
                }
                return [sourceLocation, destinationLocation];
            } else {
                return [props.source, props.destination];
            }
        })();

        logger.logInfo(
            `JourneyId: ${journeyInfoData?.journeyId || 'No Journey Id'} - Initiating journey search from ${source?.title} to ${destination?.title}`,
            'BookingFlow',
        );

        const ptSearchData =
            props.publicTransportSearch?.originStop &&
            props.publicTransportSearch?.destinationStop &&
            props.publicTransportSearch?.vehicleType
                ? {
                      destinationStopCode: props.publicTransportSearch?.destinationStop.code,
                      originStopCode: props.publicTransportSearch?.originStop.code,
                      recentLocationId: null,
                      vehicleNumber: otp,
                      routeCode: props.publicTransportSearch?.routeCode,
                      startTime: new Date().toISOString(),
                      vehicleCategory: props.publicTransportSearch.vehicleType,
                      currentLocation: {
                          lat: props.currentLocation?.lat,
                          lon: props.currentLocation?.lng,
                      },
                      routeCodeEditedManually: props.publicTransportSearch?.routeCodeEditedManually,
                      busLocationData: suggestedBusData,
                      firstMileRemoved: isSingleMode,
                  }
                : null;

        // For PT search, if currentLocation is used and doesn't have addressComponents,
        // create dummy addressComponents to satisfy the API requirement
        const getSourceForPT = (): location | null => {
            if (!ptSearchData) {
                return source ?? props.source ?? null;
            }
            if (props.currentLocation) {
                // If currentLocation doesn't have addressComponents, create dummy ones
                if (
                    !props.currentLocation.addressComponents &&
                    props.currentLocation.lat &&
                    props.currentLocation.lng
                ) {
                    return {
                        ...props.currentLocation,
                        addressComponents: dummyLocationAddress(props.currentLocation.title),
                    };
                }
                return props.currentLocation;
            }
            return source ?? props.source ?? null;
        };

        const reqBody = {
            source: getSourceForPT(),
            stops: [destination],
            pickupTime: null,
            dropTime: null,
            isIntercity: false,
            isFareProductOneway: true,
            rentalDuration: null,
            rentalDistance: null,
            ptSearchData,
            isAmbulance: false,
        };

        const performSearch = async (deviceId: string | null) => {
            await multimodalSearch({
                body: {
                    ...reqBody,
                    ...(deviceId && { deviceID: deviceId }),
                },
            });
        };

        if (!cachedDeviceId.current) {
            getUTSData()
                .then((utsData: UTSData) => {
                    if (utsData.utsResponse?.status === UTSResponseStatus.ERROR) {
                        performSearch(null);
                    } else {
                        cachedDeviceId.current = utsData.deviceID;
                        performSearch(utsData.deviceID);
                    }
                })
                .catch(() => {
                    performSearch(null);
                });
        } else {
            performSearch(cachedDeviceId.current);
        }
    }, [
        props.publicTransportSearch,
        props.source,
        props.destination,
        multimodalSearch,
        cachedDeviceId,
        suggestedBusData,
    ]);

    useEffect(() => {
        if (isNull(props.currentJourney) || isNull(props.searchId)) {
            initiateJourneySearch();
        }
    }, [props.publicTransportSearch?.destinationStop?.code, props.publicTransportSearch?.originStop?.code]);

    const setUpdatedJourneyInfo = useCallback(
        (journeyInfo: journeyInfoResp | undefined) => {
            if (!journeyInfo) {
                return;
            }

            // Set journey data directly - duration calculation will be done in Flow.tsx
            const continuePolling = journeyInfo.legs.some(leg => !leg.pricingId && leg.bookingAllowed);
            setPollJourneyInfo(continuePolling);
            if (isSingleMode && journeyInfo.legs.length > 1) {
                const updatedJourneyInfo = {
                    ...journeyInfo,
                    legs: journeyInfo.legs.filter(leg => !['Walk', 'Taxi'].includes(leg.travelMode)),
                };
                setJourneyInfoData(updatedJourneyInfo);
            } else {
                setJourneyInfoData(journeyInfo);
            }
        },
        [isSingleMode, setJourneyInfoData],
    );

    useEffect(() => {
        if (multimodalSearchData) {
            if (isUndefined(multimodalSearchData.firstJourney)) {
                onNoJourneysFound && onNoJourneysFound();
            } else {
                if (multimodalSearchData.showMultimodalWarning) {
                    setMultimodalWarningVisible(true);
                }
                dispatch(setCrisSDKToken(multimodalSearchData.crisSdkToken));
                setUpdatedJourneyInfo(multimodalSearchData.firstJourneyInfo);
            }
        }
    }, [multimodalSearchData, onNoJourneysFound]);

    const handleJourneyInfo = useCallback(
        async (response: journeyInfoResp) => {
            if (!props.currentJourney) {
                logger.logWarn(`Current Journey is undefined`, 'BookingFlow');
                return;
            }

            try {
                const sortedLegs = [...response.legs].sort((a, b) => a.order - b.order);

                const updatedResponse = {
                    ...response,
                    legs: sortedLegs,
                };
                setUpdatedJourneyInfo(updatedResponse);
                props.setLoadingDataForLeg(null);
            } catch (err) {
                logger.logError(`Failed to update journey info: ${err}`, 'BookingFlow');
                console.error(err);
            }
        },
        [props.currentJourney?.journeyId],
    );

    const handleJourneyInfoError = useCallback(async (error: Error) => {
        console.error('Error while fetching journey info', error);
    }, []);

    usePolling({
        callApiFn: journeyInitiateAPICall,
        params: { journeyId: props.currentJourney?.journeyId || '' },
        pollingInterval: 1000,
        conditionToCall: () => !isNull(props.currentJourney) && pollJourneyInfo,
        postApiCall: handleJourneyInfo,
        postApiCallError: handleJourneyInfoError,
        cause: 'Journey Info Polling',
        forceRefetchDeps: [journeyInitiateAPICall, pollJourneyInfo, props.currentJourney],
        enable: pollJourneyInfo && !isUndefined(props.currentJourney?.journeyId),
    });
    return {
        pollJourneyInfo,
        journeyInfoData,
        setJourneyInfoData: setUpdatedJourneyInfo,
        setPollJourneyInfo,
        showMultimodalWarning: multimodalSearchData?.showMultimodalWarning,
        multimodalWarning: multimodalSearchData?.multimodalWarning,
        initiateJourneySearch,
        isMultimodalWarningVisible,
        setMultimodalWarningVisible,
        isSingleMode: isSingleMode && journeyInfoData?.legs?.length === 1,
    };
};
