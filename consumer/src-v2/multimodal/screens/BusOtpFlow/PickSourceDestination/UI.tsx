import { PickSourceDestinationContent } from './components/PickSourceDestinationContent';
import { GenericStopsPickerItem } from '@/src-v2/multimodal/screens/SingleModeTicketBooking/components/GenericStopsPicker';
import { PickSourceDestinationViewState } from './Types';
import { transportStation } from '../../../../../src/readOnly/api/types/PublicTransportData.gen';

// Helper function to convert transportStation to GenericStopsPickerItem
const convertToGenericStopsPickerItem = (station: transportStation): GenericStopsPickerItem => ({
    id: 0, // transportStation doesn't have sequenceNum, using 0 as default
    name: station.name ?? '',
    code: station.code ?? '',
});

export const PickSourceDestinationUI: React.FC<PickSourceDestinationViewState> = ({
    busNumber,
    stops,
    selectedSource,
    selectedDestination,
    sourceStopsList,
    destinationStopsList,
    frequentVisitDestinations,
    detectedRouteCode,
    mpDispatch,
    onGoBack,
    otp,
    correctedJourneyInfoData,
    currentJourney,
    currentLocation,
    publicTransportSearch,
    searchId,
    isSingleMode,
    isJourneyConfirmed,
    loadingDataForLeg,
    setLoadingDataForLeg,
    setIsJourneyConfirmed,
    navigation,
    onMoreOptions,
    fetchingLegsFare,
    isSwitchRouteEnabled,
    frfsRouteDataError,
    frfsRouteDataLoading,
    currentRouteCode: _currentRouteCode,
    hasReverseRoute: _hasReverseRoute,
    isSwitchingToReverse,
    serviceType,
    serviceTypeName,
}: PickSourceDestinationViewState) => {
    // Convert transportStation array to GenericStopsPickerItem array
    const convertedStops = stops.map(convertToGenericStopsPickerItem);
    const convertedSelectedSource = selectedSource ? convertToGenericStopsPickerItem(selectedSource) : null;

    const handleSourceSelect = (item: GenericStopsPickerItem) => {
        const originalStationIndex = stops.findIndex(station => station.code === item.code);
        const originalStation = stops[originalStationIndex];
        if (originalStation && originalStationIndex !== -1) {
            mpDispatch({
                type: 'SELECT_SOURCE',
                payload: { station: originalStation, selectedSourceIndex: originalStationIndex },
            });
        }
    };

    const handleDestinationSelect = (station: transportStation) => {
        if (station) {
            mpDispatch({
                type: 'SELECT_DESTINATION',
                payload: { station: station },
            });
        }
    };

    const handleProceed = () => {
        mpDispatch({
            type: 'PROCEED',
            payload: undefined,
        });
    };

    const handleSwitchRoute = () => {
        mpDispatch({
            type: 'SWITCH_ROUTE',
            payload: undefined,
        });
    };

    const handleEditClicked = () => {
        mpDispatch({
            type: 'EDIT_BUS',
            payload: undefined,
        });
    };

    return (
        <PickSourceDestinationContent
            busNumber={busNumber ?? 'Unknown'}
            busRouteProps={{
                busEndPoint: '',
                busServiceType: '',
                busStartPoint: '',
                handleConfirmRoute: handleProceed,
                isBusNumberValid: true,
                onBusNumberChange: () => {},
            }}
            stops={convertedStops}
            selectedSource={convertedSelectedSource}
            selectedDestination={selectedDestination ?? null}
            originalSelectedSource={selectedSource}
            onSourceSelect={handleSourceSelect}
            onDestinationSelect={handleDestinationSelect}
            busServiceType={serviceType}
            destinationStopsList={destinationStopsList}
            frequentVisitDestinations={frequentVisitDestinations}
            sourceStopsList={sourceStopsList.map(convertToGenericStopsPickerItem)}
            otp={otp}
            detectedRouteCode={detectedRouteCode}
            correctedJourneyInfoData={correctedJourneyInfoData}
            currentJourney={currentJourney}
            currentLocation={currentLocation}
            publicTransportSearch={publicTransportSearch}
            searchId={searchId}
            isSingleMode={isSingleMode}
            isJourneyConfirmed={isJourneyConfirmed ?? false}
            loadingDataForLeg={loadingDataForLeg}
            setLoadingDataForLeg={setLoadingDataForLeg}
            setIsJourneyConfirmed={setIsJourneyConfirmed ?? (() => {})}
            navigation={navigation}
            onMoreOptions={onMoreOptions}
            fetchingLegsFare={fetchingLegsFare ?? false}
            onGoBack={onGoBack}
            onSwitchRoute={handleSwitchRoute}
            isSwitchRouteEnabled={isSwitchRouteEnabled}
            frfsRouteDataLoading={frfsRouteDataLoading ?? isSwitchingToReverse}
            frfsRouteDataError={frfsRouteDataError}
            onEditClicked={handleEditClicked}
            serviceTypeName={serviceTypeName}
        />
    );
};
