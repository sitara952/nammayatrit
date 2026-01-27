import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useJourneyTrackingData } from '@/src-v2/multimodal/hooks/useJourneyTrackingData';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { JourneyPlanScreenUI } from './UI';
import { createJourneyId, JourneyId } from '@/typescript/state/client/user';
import { JourneyPlanScreenAction } from './Types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { switchLegReq } from '@/readOnly/api/types/SwitchLegReq.gen';
import { useMultimodalJourneyIdSwitchPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdSwitchPost';
import { selectJourneyLegs, setJourneyRefreshFlag } from '@/typescript/state/client/journey';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useJourneyPayment } from '../../components/JourneyPayment/hooks/useJourneyPayment';
import { RootState } from '@/typescript/state/store';
import { combineSplitLegs } from '../../utils/journeyTrackingUtils';
import { isEqual } from 'lodash';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mapJourneyLegsToJourneyModes } from '@/typescript/utils/MultiModal';
import { JourneyPaymentModal } from '../../components/JourneyPayment/UI';

type JourneyPlanScreenParams = {
    journeyId: JourneyId;
};

type JourneyPlanScreenRouteProp = RouteProp<{ params: JourneyPlanScreenParams }, 'params'>;

export const JourneyPlanScreenFlow = () => {
    const route = useRoute<JourneyPlanScreenRouteProp>();
    const { journeyId } = route.params;
    const isFocused = useIsFocused();
    const { data: trackedData } = useJourneyTrackingData(journeyId, { isFocused, onLegStatusChange: undefined });
    const [legs, setLegs] = useState<TrackedLegInfoStaticInfo[]>([]);
    const [switchModeApiCall] = useMultimodalJourneyIdSwitchPostMutation();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingLegOrder, setLoadingLegOrder] = useState<number>(-1);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const { timeTableBottomSheetModalRef, ticketSelectorModalRef } = useRefsContext();
    useEffect(() => {
        if (trackedData) {
            const allLegsStaticInfo = trackedData.map(leg => ({
                ...leg.staticInfo,
                vehicleIconUrl: leg.vehicleIconUrl,
            }));
            setLegs(allLegsStaticInfo);
            if (isLoading) {
                setIsLoading(false);
                setLoadingLegOrder(-1);
            }
        }
    }, [trackedData]);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const onViewTimetable = useCallback(() => {
        timeTableBottomSheetModalRef.current?.present();
    }, []);

    const journeyLegs = useAppSelector(
        (state: RootState) => selectJourneyLegs(state, journeyId ? createJourneyId(journeyId) : null),
        isEqual,
    );
    const paymentProps = {
        legs: combineSplitLegs(journeyLegs) ?? [],
        journeyId: journeyId ? createJourneyId(journeyId) : undefined,
        offer: undefined,
        handledQuoteExpiry: async () => {},
        setIsJourneyConfirmed: () => {},
        navigation: navigation,
        onMoreOptions: () => {},
        isSingleMode: false,
        fetchingLegsFare: false,
        isJourneyConfirmed: false,
        loadingDataForLeg: null,
    };
    const paymentState = useJourneyPayment(paymentProps);
    const journeyModes = mapJourneyLegsToJourneyModes(journeyLegs);
    const handleSwitchMode = (legOrder: number, newMode: MultimodalTravelMode_multimodalTravelMode) => {
        setIsLoading(true);
        setLoadingLegOrder(legOrder);
        const switchModeReqBody: switchLegReq = {
            legOrder,
            startLocation: undefined,
            originAddress: undefined,
            newMode,
        };
        switchModeApiCall({
            journeyId,
            body: switchModeReqBody,
        })
            .then(() => {
                dispatch(setJourneyRefreshFlag({ id: journeyId, payload: true }));
            })
            .catch(() => {
                setIsLoading(false);
                setLoadingLegOrder(-1);
            });
    };

    const resolver: Resolver<JourneyPlanScreenAction> = useCallback(
        async (action: JourneyPlanScreenAction): Promise<void> => {
            switch (action.type) {
                case 'SWITCH_MODE':
                    if (action.payload) {
                        handleSwitchMode(action.payload.legOrder, action.payload.newMode);
                    }
                    break;
                default:
                    break;
            }
        },
        [],
    );

    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <>
            <JourneyPlanScreenUI
                legs={legs}
                mpDispatch={mpDispatch}
                isLoading={isLoading}
                loadingLegOrder={loadingLegOrder}
                legCategorySelections={paymentState.legCategorySelections}
                onBookButtonClick={() => ticketSelectorModalRef?.current?.present()}
                onViewTimetable={onViewTimetable}
            />
            <JourneyPaymentModal
                ticketSelectorModalRef={ticketSelectorModalRef}
                journeyModes={journeyModes}
                handleOnPress={() => paymentState.onConfirm({ skipPayment: false, viaOfferButton: false })}
                isLoading={false}
                hasSubwayLeg={paymentState.hasSubwayLeg}
                onModalDismiss={() => {}}
                legCategorySelections={paymentState.legCategorySelections}
                handleCategoryQuantityChange={paymentState.handleCategoryQuantityChange}
                getCategoryDiscount={paymentState.getCategoryDiscount}
            />
        </>
    );
};
