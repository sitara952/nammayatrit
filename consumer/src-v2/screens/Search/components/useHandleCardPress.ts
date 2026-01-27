import {
    BottomSheetStage,
    SearchInput,
    selectActiveInput,
    selectSearchedSource,
    selectSearchedStops,
    selectSelectedStopIndex,
    selectSourceSetUsingPin,
    setActiveInput,
    setBottomSheetStage,
    setIsPickup,
    setIsServiceable,
    setSearchedSource,
    updateSelectedSearchedStop,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useContext } from 'react';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { MapContext } from '@/typescript/Maps/MapContext';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { getPlaceNameAPIBody } from '@/typescript/utils/location';
import { LocationObjectCaching } from '@/helpers/utils/Location/LocationCaching.bs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectToken } from '@/typescript/state/client/auth';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';

export const useHandleCardPress = () => {
    const source = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const selectedStopIndex = useAppSelector(selectSelectedStopIndex);
    const activeInput = useAppSelector(selectActiveInput);
    const sourceSetUsingPin = useAppSelector(selectSourceSetUsingPin);
    const { stopLocationsTextInputRef, startLocationTextInputRef } = useRefsContext();
    const dispatch = useAppDispatch();
    const appConfig = useAppSelector(selectAppConfig);
    const isMultimodal = appConfig.appType === 'multimodal';
    const { mapRef } = useContext(MapContext);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const userToken = useAppSelector(selectToken);
    const { isInterCity } = useCheckForInterCity(source, stops);
    const handleCardPress = async (item: location) => {
        hapticEffect(undefined, undefined);
        if (activeInput === SearchInput.Destination) {
            const result = !item.placeId
                ? undefined
                : await GetLocationAndServiceability.getLocationObjectAndServiceability(
                      getPlaceNameAPIBody(item),
                      item?.title,
                      item?.subtitle,
                      item?.locationType,
                      'destination',
                  );
            const parsedData = result ? result.location : item;

            dispatch(setIsServiceable(parsedData.serviceable ?? false));

            if (parsedData) {
                const revisedLocation: location = {
                    ...parsedData,
                    addressComponents: item.addressComponents,
                    tag: 'RECENTS',
                };
                dispatch(updateSelectedSearchedStop(revisedLocation));
                if (parsedData.serviceable) {
                    LocationObjectCaching.setRecentSearches(revisedLocation);
                }
            }
            setTimeout(() => {
                stopLocationsTextInputRef?.current?.[stops.length - 1]?.setSelection(
                    0,

                    (parsedData?.title?.length || 0) + (parsedData?.subtitle?.length || 0) + 1,
                );
            }, 10);
            if (source) {
                const stopsServiceable =
                    parsedData.serviceable &&
                    stops.every((stop, index) => stop?.serviceable || selectedStopIndex === index);
                const nullIndex = stops.indexOf(null);
                if (nullIndex !== -1 && nullIndex !== selectedStopIndex) {
                    stopLocationsTextInputRef.current?.[nullIndex]?.focus();
                } else if (!sourceSetUsingPin && source.serviceable && stopsServiceable && !isMultimodal) {
                    const areDropSpecial = parsedData.specialLocation?.gatesInfo.every(
                        gate => gate.gateType === 'Drop',
                    );
                    dispatch(setIsPickup(!areDropSpecial));
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'hcp' }));
                } else if (source.serviceable && stopsServiceable) {
                    if (isInterCity) {
                        // dispatch(setBottomSheetStage(BottomSheetStage.ChooseRide));
                        dispatch(
                            setBottomSheetStage({ stage: BottomSheetStage.IntercitySearchDetails, src: 'hcp_in' }),
                        );
                    } else {
                        if (isMultimodal) {
                            goToJourneyDetails({
                                userToken,
                                dispatch,
                                navigation,
                                destinationStop: undefined,
                                originStop: undefined,
                                recentLocationId: undefined,
                                routeCode: undefined,
                                startTime: undefined,
                                vehicleType: undefined,
                                serviceableStartTime: undefined,
                                otp: undefined,
                                isSingleModeMetro: false,
                            });
                            mapRef.current?.addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 0 });
                        } else {
                            dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'hcp_c_r' }));
                        }
                    }
                } else if (!source.serviceable && stopLocationsTextInputRef) {
                    dispatch(setActiveInput(SearchInput.Source));
                    startLocationTextInputRef?.current?.focus();
                }
            } else {
                startLocationTextInputRef?.current?.focus();
            }
        } else {
            const result = !item.placeId
                ? undefined
                : await GetLocationAndServiceability.getLocationObjectAndServiceability(
                      getPlaceNameAPIBody(item),
                      item?.title,
                      item?.subtitle,
                      item?.locationType,
                      activeInput === SearchInput.Source ? 'source' : 'destination',
                  );
            const parsedData = result ? result.location : item;

            setIsServiceable(parsedData.serviceable ?? false);

            if (parsedData) {
                const revisedLocation: location = {
                    ...parsedData,
                    addressComponents: item.addressComponents,
                    tag: 'AUTOCOMPLETE',
                };
                dispatch(setSearchedSource(revisedLocation));
                setTimeout(() => {
                    startLocationTextInputRef?.current?.setSelection(
                        0,

                        (parsedData?.title?.length || 0) + (parsedData?.subtitle?.length || 0) + 1,
                    );
                }, 10);
                if (parsedData.serviceable) {
                    LocationObjectCaching.setRecentSearches({
                        ...parsedData,
                        tag: 'RECENTS',
                    });
                    if (stops.every(stop => stop !== null)) {
                        if (stops.every(stop => stop.serviceable)) {
                            const areDropSpecial =
                                !isMultimodal &&
                                parsedData.specialLocation?.gatesInfo.every(gate => gate.gateType === 'Drop');
                            if (isMultimodal) {
                                goToJourneyDetails({
                                    userToken,
                                    dispatch,
                                    navigation,
                                    destinationStop: undefined,
                                    originStop: undefined,
                                    recentLocationId: undefined,
                                    routeCode: undefined,
                                    startTime: undefined,
                                    vehicleType: undefined,
                                    serviceableStartTime: undefined,
                                    otp: undefined,
                                    isSingleModeMetro: false,
                                });
                                mapRef.current?.addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 0 });
                            } else {
                                // Batch dispatch operations
                                dispatch(setIsPickup(!areDropSpecial));
                                dispatch(
                                    setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'hcp_c_p' }),
                                );
                            }
                        } else {
                            const unserviceableIndex = stops.findIndex(stop => !stop.serviceable);
                            stopLocationsTextInputRef?.current?.[unserviceableIndex]?.focus();
                        }
                    } else {
                        const nullIndex = stops.indexOf(null) !== -1 ? stops.indexOf(null) : stops.length - 1;
                        stopLocationsTextInputRef?.current?.[nullIndex]?.focus();
                    }
                }
            }
        }
    };

    return handleCardPress;
};
