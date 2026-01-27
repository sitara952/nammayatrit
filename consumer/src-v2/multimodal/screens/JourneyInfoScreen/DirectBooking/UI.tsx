import React from 'react';
import { View, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { LinearTransition, FadeInDown, FadeOut } from 'react-native-reanimated';

import { tailwind } from '../../../../tailwind-theme/tailwind';
import { TransitType } from '../../../components/PublicTransportCard/types';
import EditTransit from '../../Search/components/EditTransit';
import { transitValues } from '../../Search/constants';
import { TransitSummaryType } from '../components/TransitSummary';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';
import { RouteDetailsData } from '@/typescript/state/client/journey';
import { SourceDestinationCard } from './components/SourceDestinationCard';
import { BusTransitCard } from './components/BusTransitCard';
import { SubwayTransitCard } from './components/SubwayTransitCard';
import {
    MultimodalTravelMode_multimodalTravelMode,
    SourceType_sourceType,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen';
import { strings } from 'config-types';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import EditLocation from '../components/EditLocation';
import { LocateOnMapButton } from '@/src-v2/multimodal/components/common/LocateOnMapButton';
import RouteDetails from '@/src-v2/multimodal/components/RouteAndPaymentDetailsCard/RouteDetails';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { NewTimeTableUIProps } from '../../NewTimeTable/types';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import { MetroTransitCell } from '../components/MetroTransitCell';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import {} from './Flow';
import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen.tsx';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';
import { RouteOptionCardProps } from '../components/RouteOptionCard.tsx';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen.tsx';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType.tsx';
import { ExploreOtherServicesPopUp } from '../../MetroSubwayBooking/components/ExploreOtherServicesPopUp.tsx';
import { JourneyDetailScreenAction } from '../Types.ts';
import { Resolver } from '@/typescript/utils/common.ts';
import { availableRoutesInfo } from '@/readOnly/api/types/AvailableRoutesInfo.gen';
import { useMetroSubwayServiceability } from '@/src-v2/multimodal/hooks/useMetroSubwayServiceability';
import { getLastStopForMetroLeg } from '../utils.ts';

export type DirectBookingUIProps = {
    vehicleTierOptionsResp: legServiceTierOptionsResp | undefined;
    source: string;
    destination: string;
    fare: number | undefined;
    duration: string | undefined;
    routeShortName: string | undefined;
    transitMode: TransitType;
    moreOptionsPress: () => void;
    time: string | undefined;
    onChangeBusType: () => void;
    selectedServiceTier: legServiceTier | undefined;
    journeyTypes: TransitSummaryType[] | undefined;
    description: string;
    onTrackBusOrTimeTable: () => void;
    singleTransitLegSpecificProps: {
        trainData:
            | {
                  typeText: string;
                  codeText: string;
                  arrivalText: string;
                  departureText: string;
                  classTypeText: string;
                  onClassTypePress: (legTier: availableRoutesByTier) => void;
                  routeShortName: string;
                  sourceStation: string;
                  selectedServiceTier: legServiceTier | undefined;
                  transformViaPointName: (via: string | undefined) => string | undefined;
                  onViaChangePress: () => void;
                  routeDetails: legRouteInfo[] | undefined;
              }
            | undefined;
        metroData:
            | {
                  lineType: string;
                  time: string;
                  stationName: string;
                  lineColor: string | undefined;
              }
            | undefined;
    };
    userLanguageStrings: strings;
    transitModalRef: React.RefObject<BottomSheetModal | null>;
    selectedBusRoutes: string[];
    onBusRoutePress: (value: string[]) => void;
    onEditTransitConfirmPress: () => void;
    sourceType: SourceType_sourceType | undefined;
    nextArrivalTimeInSeconds: number[] | undefined;
    sourceStopName: string | undefined;
    additionalBusOptions: availableRoutesInfo[] | undefined;
    estimatedMinFare: number | undefined;
    routeDetails: RouteDetailsData | null;
    appName: string;
    journeyId: string | undefined;
    onViewTimetable: (mode: VehicleCategory_vehicleCategory | undefined) => void;
    nextTwoArrivalTimes: number[] | undefined;
    firstArrivalTime: string | undefined;
    busTimeTableData: NewTimeTableUIProps | undefined;
    timeTableData: NewTimeTableUIProps | undefined;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
    legInfo: legInfo | undefined;
    isSingleMode: boolean;
    onTrainClassChange: (legOrder: number, legTier: availableRoutesByTier) => void;
    isLoadingData: boolean;
    transformedRouteOptions: RouteOptionCardProps[] | undefined;
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>;
    onConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    mpDispatch: Resolver<JourneyDetailScreenAction>;
    serviceableStartTime: string | undefined;
    isConfirmingJourney: boolean;
    handleOnConfirm: () => void | undefined;
    showSourceChangePopup: boolean;
    setShowSourceChangePopup: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    handleEditPress: () => void;
};

const DirectBookingUI: React.FC<DirectBookingUIProps> = props => {
    const editModalRef = React.useRef<BottomSheetModal>(null);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    const vehicleType = props.transitMode === 'metro' ? 'METRO' : props.transitMode === 'train' ? 'SUBWAY' : undefined;
    const { isServiceable } = useMetroSubwayServiceability(vehicleType);

    return (
        <>
            <Animated.View style={{ flex: 1 }}>
                <BottomSheetScrollView
                    style={tailwind.style('bg-[#F7F7F7] px-5')}
                    contentContainerStyle={tailwind.style('pb-62')}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    <Animated.View layout={LinearTransition} entering={FadeInDown} exiting={FadeOut}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[15px] font-areaNormal-bold text-[#969696] text-center pb-[12px]',
                            )}>
                            {props.userLanguageStrings.TicketConfirmation}
                        </Animated.Text>

                        {/* Source Destination Card */}
                        {props.transitMode !== 'metro' && (
                            <SourceDestinationCard
                                isMultiModal={false}
                                source={props.source}
                                destination={props.destination}
                                fare={props.fare}
                                time={props.time}
                                journeyTypes={props.journeyTypes}
                                onPress={() => {}}
                                showFare={true}
                                fetchingLegsFare={undefined}
                            />
                        )}

                        {props.transitMode === 'metro' && (
                            <>
                                {props.legInfo && (
                                    <MetroTransitCell
                                        key={props.legInfo.order}
                                        legInfo={props.legInfo}
                                        finalFare={props.fare}
                                        isLastCell={true}
                                        ticketState={'review'}
                                        appName={props.appName}
                                        onBookButtonClick={() => {}}
                                        lastStopName={getLastStopForMetroLeg(props.journeyMapData, props.legInfo.order)}
                                        nextTwoArrivalTimes={props.nextTwoArrivalTimes}
                                        firstArrivalTime={props.firstArrivalTime}
                                        onViewTimetable={() => props.onViewTimetable('METRO')}
                                        timeTableData={props.timeTableData}
                                        isSingleMode={props.isSingleMode}
                                        transitTime={undefined}
                                        journeyMapData={props.journeyMapData}
                                        showMetroOptions={false}
                                        onConfirmRoute={props.onConfirmRoute}
                                        isDataLoading={props.isLoadingData}
                                        entryStationName={undefined}
                                        handleEditPress={props.handleEditPress}
                                    />
                                )}
                            </>
                        )}
                        {/* Render appropriate transit card based on transit mode */}
                        {props.transitMode === 'bus' && (
                            <BusTransitCard
                                number={props.routeShortName}
                                description={props.description}
                                onChangeBusType={props.onChangeBusType}
                                selectedServiceTier={props.selectedServiceTier}
                                onTrackBusOrTimeTable={props.onTrackBusOrTimeTable}
                                sourceType={props.sourceType}
                                nextArrivalTimeInSeconds={props.nextArrivalTimeInSeconds}
                                sourceStopName={props.sourceStopName}
                                appName={props.appName}
                                timeTableProps={props.busTimeTableData}
                                handleOnConfirm={props.handleOnConfirm}
                                isSingleMode={props.isSingleMode}
                                showSourceChangePopup={props.showSourceChangePopup}
                                setShowSourceChangePopup={props.setShowSourceChangePopup}
                            />
                        )}

                        {props.transitMode === 'bus' && props.appName === 'odishaYatri' && props.routeDetails && (
                            <RouteDetails type="bus" journeyId={props.journeyId} />
                        )}

                        {props.transitMode === 'train' && props.singleTransitLegSpecificProps.trainData && (
                            <SubwayTransitCard
                                trainData={props.singleTransitLegSpecificProps.trainData}
                                onViewTimetable={() => props.onViewTimetable('SUBWAY')}
                                nextTwoArrivalTimes={props.nextTwoArrivalTimes?.filter(n => n !== undefined)}
                                firstArrivalTime={props.firstArrivalTime}
                                vehicleTierOptionsResp={props.vehicleTierOptionsResp}
                                onTrainClassChange={() => {}}
                                isLoadingData={props.isLoadingData}
                                routeInfo={props.singleTransitLegSpecificProps.trainData?.routeDetails}
                                transformedRouteOptions={props.transformedRouteOptions}
                                isConfirmingJourney={props.isConfirmingJourney}
                                isLoading={props.isLoading}
                            />
                        )}

                        {/* {props.additionalBusOptions &&
                        props.additionalBusOptions.length > 0 &&
                        props.transitMode === 'bus' &&
                        props.appName !== 'odishaYatri' ? (
                            <Animated.View style={tailwind.style(' pt-[13px] flex-col items-center')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-center text-[#969696] text-[14px] leading-[20px] font-areaNormal-extrabold  px-4',
                                    )}>
                                    {props.userLanguageStrings.Thisticketisalsovalidin}{' '}
                                </Animated.Text>
                                <BusList
                                    busList={props.additionalBusOptions.map(busOption => ({
                                        routeCode: busOption.routeCode,
                                        routeNumber: busOption.shortName,
                                        handleOnPress: () => {},
                                    }))}
                                    isLoading={false}
                                    showIcon={false}
                                />
                            </Animated.View>
                        ) : null} */}
                    </Animated.View>
                </BottomSheetScrollView>
                {!isServiceable && vehicleType && (
                    <View style={tailwind.style('text-[15px] font-areaNormal-bold text-[#969696] text-center my-3 ')}>
                        <ExploreOtherServicesPopUp
                            vehicleType={vehicleType}
                            userLanguageStrings={props.userLanguageStrings}
                            serviceableStartTime={props.serviceableStartTime}
                            serviceUnavailableModalRef={undefined}
                            mpDispatch={props.mpDispatch}
                            withExploreRouteButton={false}
                            onExploreOtherService={() => {}}
                            styles={{
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 8,
                                backgroundColor: '#FFFFFF',
                            }}
                        />
                    </View>
                )}
            </Animated.View>

            <BottomSheetModal
                ref={props.transitModalRef}
                style={tailwind.style('bg-[#F7F7F7]')}
                enableDynamicSizing={false}
                snapPoints={['40%']}
                handleComponent={() => (
                    <View
                        style={tailwind.style(
                            `h-[3px] bg-[${colors.CrossButton_bg}] w-6 rounded-3xl mt-4 mb-2 mx-auto`,
                        )}
                    />
                )}>
                <BottomSheetView>
                    <EditTransit
                        showCombinationalRoute={false}
                        showToggle={false}
                        showBusRoutes
                        showMetroRoutes={false}
                        showTrainRoutes={false}
                        editTransitValues={[
                            { transit: transitValues.bus, value: true, selectedBusRoutes: props.selectedBusRoutes },
                            { transit: transitValues.train, value: true, selectedBusRoutes: undefined },
                            { transit: transitValues.metro, value: true, selectedBusRoutes: undefined },
                        ]}
                        onTransitSwitchChange={() => {}}
                        onClose={() => props.transitModalRef.current?.dismiss()}
                        onBusRoutePress={props.onBusRoutePress}
                        onEditTransitConfirmPress={props.onEditTransitConfirmPress}
                    />
                </BottomSheetView>
            </BottomSheetModal>

            {/* Edit Modal */}
            <PopUpModal
                sheetRef={editModalRef}
                isScrollable={false}
                showBackdrop={undefined}
                onHardwareBackPress={() => {
                    editModalRef.current?.dismiss();
                    return true;
                }}
                backgroundStyle={tailwind.style('rounded-t-[32px] bg-[#F4F4F4]')}
                snapPoints={['90%']}
                enableDynamicSizing={false}>
                <BottomSheetView style={tailwind.style('h-full')}>
                    <EditLocation
                        onSearchResultPress={() => {}}
                        pickupLocation={props.source}
                        dropoffLocation={props.destination}
                        onPickupLocationChange={() => {}}
                        onDropoffLocationChange={() => {}}
                        onClose={() => {
                            Keyboard.dismiss();
                            editModalRef.current?.dismiss();
                        }}
                        isPickupEditable={true} // update this based on if the user pressed the source or destination
                        isDropoffEditable={true} // update this based on if the user pressed the source or destination
                    />
                    <LocateOnMapButton onPress={() => {}} />
                </BottomSheetView>
            </PopUpModal>
            {props.timeTableData && (
                <NewTimeTableUI
                    source={props.timeTableData.source}
                    times={props.timeTableData.times}
                    sheetRef={props.timeTableData.sheetRef}
                    mode={props.mode}
                    towardsStation={props.timeTableData.towardsStation}
                    onDismiss={undefined}
                    allTowardsStation={props.timeTableData.allTowardsStation}
                />
            )}
        </>
    );
};

export default DirectBookingUI;
