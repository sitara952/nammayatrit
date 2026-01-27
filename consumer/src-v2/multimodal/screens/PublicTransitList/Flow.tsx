import {
    selectSelectedModesFilter,
    setSelectedJourney,
    setSelectedJourneyFilter,
    setSelectedModesFilter,
} from '@/typescript/state/client/search';
import { selectSearchId } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PublicTransitList } from './UI.tsx';
import { selectJourneys } from '@/typescript/state/client/search';
import {
    JourneyFilterOptions,
    JourneyOptionsScreenAction,
    JourneyOptionsScreenProps,
    PublicTransportList,
} from './Types.ts';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import {
    BottomSheetStage,
    selectDestination,
    selectSearchedSource,
    setBottomSheetStage,
} from '@/typescript/state/client/session.ts';
import { convertIsoToUtc, getWalkingDistanceText } from '@/typescript/utils/MultiModal.ts';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils.ts';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchResultsQuery } from '@/typescript/state/server/searchApi.ts';
import { isNull } from 'lodash';
import { getMinutesRemaining } from '@/src-v2/utils/common.ts';
import { calculateTotalJourneyDurationWithConsistentRounding } from '../JourneyInfoScreen/utils';

export const JourneyOptions = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const dispatch = useAppDispatch();
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const journeys = useAppSelector(state => selectJourneys(state, null));
    const pollingRef = useRef(true);
    const destination = useAppSelector(selectDestination);
    const source = useAppSelector(selectSearchedSource);
    const { data } = useSearchResultsQuery(
        { searchId },
        {
            skip: isNull(searchId),
            pollingInterval: pollingRef.current ? 1000 : 0,
        },
    );

    useEffect(() => {
        if (data?.data.allJourneysLoaded) {
            pollingRef.current = false;
        }
    }, [data?.data.allJourneysLoaded]);

    const { getRouteByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const handleGoToJourneyDetails = () => {
        navigation.goBack();
    };

    const publicTransportList: PublicTransportList[] = useMemo(() => {
        return journeys.map(journeyDetail => {
            return {
                startTime: journeyDetail.startTime ? getMinutesRemaining(journeyDetail.startTime) : undefined,
                endTime: convertIsoToUtc(journeyDetail.endTime),
                cost: journeyDetail.totalMinFare,
                subtitle: getWalkingDistanceText(journeyDetail.journeyLegs),
                totalTime: Math.floor(
                    calculateTotalJourneyDurationWithConsistentRounding(journeyDetail.journeyLegs, false) / 60,
                ),
                journeyData: journeyDetail.journeyLegs.map(journeyLegDetail => {
                    const routeCode = journeyLegDetail.routeDetails.at(0)?.routeCode;
                    const alternateRouteNames = journeyLegDetail.routeDetails.at(0)?.alternateShortNames;
                    const routeShortName = routeCode ? (getRouteByCode(routeCode)?.shortName ?? null) : '';
                    return {
                        type: journeyLegDetail.journeyMode,
                        routeShortName: ['Bus', 'Subway'].includes(journeyLegDetail.journeyMode)
                            ? routeShortName
                            : null,
                        alternateRouteNames: alternateRouteNames ?? null,
                        time: journeyLegDetail.duration ? Math.floor(journeyLegDetail.duration / 60) : null,
                        cost:
                            (journeyLegDetail.journeyMode === 'Taxi'
                                ? journeyLegDetail.estimatedMaxFare
                                : journeyLegDetail.estimatedMinFare) ?? null,
                        distance: journeyLegDetail.distance ?? null,
                    };
                }),
                totalJourneys: journeys.length,
                distance: journeyDetail.distance,
                journeyId: journeyDetail.journeyId,
                hasPreferredTransitModes: journeyDetail.hasPreferredTransitModes,
                hasPreferredServiceTier: journeyDetail.hasPreferredServiceTier,
            };
        });
    }, [journeys, getRouteByCode]);
    const transitTypesFromState = useAppSelector(state => selectSelectedModesFilter(state, null));

    const publicTransportListFiltered: PublicTransportList[] = useMemo(() => {
        return publicTransportList.filter(transportDetails => {
            const hasValidPublicTransitCosts = transportDetails.journeyData.every(leg => leg.cost !== null);
            return (
                hasValidPublicTransitCosts &&
                (transitTypesFromState.length === 0 ||
                    transportDetails.journeyData.every(journey => transitTypesFromState.includes(journey.type)))
                // && transportDetails.hasPreferredServiceTier --to be handled later when getting proper serviceTypes data for journeys
            );
        });
    }, [publicTransportList, transitTypesFromState]);

    const resolver: Resolver<JourneyOptionsScreenAction> = async action => {
        switch (action.type) {
            case 'FILTER_LEGS':
                dispatch(
                    setSelectedJourneyFilter({
                        id: searchId,
                        payload:
                            action.payload === undefined ? JourneyFilterOptions.Most_Relevant : action.payload.options,
                    }),
                );
                break;
            case 'FILTER_MODE':
                dispatch(
                    setSelectedModesFilter({
                        id: searchId,
                        payload: action.payload === undefined ? [] : action.payload.options,
                    }),
                );
                break;
            case 'GO_BACK':
                navigation.goBack();
                break;
            case 'JOURNEY_CLICK':
                if (action.payload?.JourneyId !== undefined) {
                    const selectedJourney = journeys.find(journey => journey.journeyId === action.payload?.JourneyId);
                    dispatch(setSelectedJourney({ id: searchId, payload: selectedJourney ?? null }));
                    handleGoToJourneyDetails();
                }
                break;
            case 'NAVIGATE_TO_SEARCH_MODAL':
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'journey_options' }));
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };
    const mpDispatch = createDispatcher(resolver);

    const viewState: JourneyOptionsScreenProps = {
        mpDispatch,
        isLoading: pollingRef.current,
        publicTransportList: publicTransportListFiltered,
        allJourneysList: publicTransportList,
        source,
        destination: destination,
        filtersApplied: transitTypesFromState.length > 0,
    };

    return <PublicTransitList {...viewState} />;
};
