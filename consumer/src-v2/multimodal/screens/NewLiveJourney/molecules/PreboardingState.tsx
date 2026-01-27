import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { CurrentLegSplitUp, CurrentLegSplitUpProps } from '../components/DetailedLiveJourney/CurrentLegSplitUp';
import { DetailedLiveHeader, DetailedLiveHeaderProps } from '../components/DetailedLiveJourney/DetailedLiveHeader';
import { MiniBusTracking, MiniBusTrackingProps } from '../components/DetailedLiveJourney/MiniBusTracking';
import { ExpandCollapseTrackingButton } from '../screens/TransitTracking/components/ExpandCollapseTrackingButton';
import {
    AdditionalBusInfo,
    AdditionalBusInfoProps,
    TransitActionButton,
} from '../screens/TransitTracking/components/MiniTransitInfo';
import { RideDetailButton } from '../components/RideDetailButton';
import { useCallback } from 'react';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';
import { strings } from 'config-types/dist/domain/default/languages/types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
/**
 * Base props shared across all preboarding states
 */
type BasePreboardingProps = {
    /** Props for the DetailedLiveHeader component */
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    isLastLeg: boolean;
    /** The type of transit mode - metro, bus, or train */
    mode: 'metro' | 'bus' | 'train';
    /** Indicates if live tracking is not available */
    isLiveTrackingNotAvailable: boolean;
    /** Callback when track mode button is pressed */
    onPressTrackMode: (() => void) | undefined;
    isLoading: boolean;
    isBusTicketNotActivated: boolean;
    onPressVerifyPass: () => void;
    hasApplicablePasses: boolean | undefined;
    onPressBusOtpScreen: () => void;
};

/**
 * Props for the initial starting state of preboarding
 */
type RideSkippedStateProps = BasePreboardingProps & {
    /** Indicates the starting status of the journey */
    status: 'rideSkipped';
    /** Callback when track mode button is pressed */
    onPressRebookSkippedLeg: () => void;
    isButtonLoading: boolean;
};

/**
 * Props for the initial starting state of preboarding
 */
type StartingStateProps = BasePreboardingProps & {
    /** Indicates the starting status of the journey */
    status: 'starting';
    /** Props for displaying the current leg's split-up information */
    currentLegSplitUpProps: CurrentLegSplitUpProps;
    /** Callback when book ride button is pressed */
    handleOnPressViewTicketButton: () => void;
    onPressBookRide: () => void;
};

/**
 * Props for the initial taxi starting state of preboarding
 */
type TaxiStartingStateProps = BasePreboardingProps & {
    /** Indicates the starting status of the journey */
    status: 'taxiStarting';
    /** Props for displaying the current leg's split-up information */
    currentLegSplitUpProps: CurrentLegSplitUpProps;
    /** Callback when book ride button is pressed */
    onPressRideDetails: () => void;
};

/**
 * Props for the waiting state when user is waiting for transit
 * Different props are required based on the transit mode
 */
type WaitingStateProps = {
    /** Indicates the waiting status */
    status: 'waiting';
    /** Handler for when the view ticket button is pressed */
    handleOnPressViewTicketButton: () => void;
} & (
    | (BasePreboardingProps & { mode: 'bus'; miniBusTrackingProps: MiniBusTrackingProps })
    | (BasePreboardingProps & { mode: 'metro' | 'train'; currentLegSplitUpProps: CurrentLegSplitUpProps })
);

/**
 * Props for when transit is one stop away from user's location
 */
type TransitOneStopAwayStateProps = BasePreboardingProps & {
    /** Indicates transit is one stop away */
    status: 'transitIsOneStopAway';
    /** Props for displaying additional bus information */
    additionalBusInfoProps: AdditionalBusInfoProps;
    /** Handler for when the view ticket button is pressed */
    handleOnPressViewTicketButton: () => void;
};

/**
 * Props for when transit has arrived at user's location
 */
type TransitArrivedStateProps = BasePreboardingProps & {
    /** Indicates transit has arrived */
    status: 'transitArrived';
    /** Props for displaying additional bus information */
    additionalBusInfoProps: AdditionalBusInfoProps;
    /** Handler for when the view ticket button is pressed */
    handleOnPressViewTicketButton: () => void;
};

type WalkingStateProps = BasePreboardingProps & {
    status: 'walking';
    onPressBookRide: () => void;
    onPressSwitchToAuto: () => void;
    isButtonLoading: boolean;
    onPressViewTicketButton: () => void;
    isInsideSpecialZone: boolean;
};

/**
 * Union type of all possible preboarding states
 */
type PreboardingStateProps =
    | RideSkippedStateProps
    | StartingStateProps
    | TaxiStartingStateProps
    | WaitingStateProps
    | TransitOneStopAwayStateProps
    | TransitArrivedStateProps
    | WalkingStateProps;

export const PreboardingState = (props: PreboardingStateProps & { journeyId: JourneyId }) => {
    const { status, detailedLiveHeaderProps, isLoading, mode, isLiveTrackingNotAvailable, isBusTicketNotActivated } =
        props;
    const { timeTableBottomSheetModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleOnPressTimetable = useCallback(() => {
        timeTableBottomSheetModalRef.current?.present();
    }, [timeTableBottomSheetModalRef.current]);

    const appConfig = useAppSelector(selectAppConfig);

    const getTicketButtonProps = useCallback(
        (params: {
            mode: string;
            hasApplicablePasses: boolean | undefined;
            isBusTicketNotActivated: boolean;
            onPressVerifyPass: () => void;
            onPressBusOtpScreen: () => void;
            handleOnPressViewTicketButton: () => void;
            userLanguageStrings: strings;
        }) => {
            const {
                mode,
                hasApplicablePasses,
                isBusTicketNotActivated,
                onPressVerifyPass,
                onPressBusOtpScreen,
                handleOnPressViewTicketButton,
                userLanguageStrings,
            } = params;
            const onPress = hasApplicablePasses
                ? onPressVerifyPass
                : isBusTicketNotActivated
                  ? onPressBusOtpScreen
                  : handleOnPressViewTicketButton;
            const ticketText =
                mode === 'bus'
                    ? hasApplicablePasses
                        ? userLanguageStrings.ActivatePass
                        : isBusTicketNotActivated && !appConfig.flowConfig?.enableTicketActivationFlowPartially
                          ? userLanguageStrings.ActivateBusTicket
                          : userLanguageStrings.Ticket
                    : userLanguageStrings.ShowTicket;
            return { onPress, ticketText };
        },
        [userLanguageStrings],
    );

    const renderContent = () => {
        const ticketButtonProps = (() => {
            if (status === 'waiting' || status === 'transitIsOneStopAway' || status === 'transitArrived') {
                return getTicketButtonProps({
                    mode,
                    hasApplicablePasses: props.hasApplicablePasses,
                    isBusTicketNotActivated,
                    onPressVerifyPass: props.onPressVerifyPass,
                    onPressBusOtpScreen: props.onPressBusOtpScreen,
                    handleOnPressViewTicketButton: props.handleOnPressViewTicketButton,
                    userLanguageStrings,
                });
            }
            return { onPress: () => {}, ticketText: '' };
        })();
        switch (status) {
            case 'walking': {
                const { onPressSwitchToAuto, isButtonLoading, onPressViewTicketButton, isInsideSpecialZone } = props;
                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <Animated.View
                            style={tailwind.style('mx-6 h-[1px] w-full bg-[#F4F4F4]', `w-[${SCREEN_WIDTH - 48}px]`)}
                        />
                        {!isInsideSpecialZone ? (
                            <TransitActionButton
                                onPress={onPressSwitchToAuto}
                                label={userLanguageStrings.SwitchToAuto}
                                icon="auto"
                                isLoading={isButtonLoading}
                            />
                        ) : null}
                        {isInsideSpecialZone ? (
                            <SmartTicketButton
                                journeyId={props.journeyId}
                                onPressViewTicket={onPressViewTicketButton}
                                ticketText={userLanguageStrings.ViewTicket}
                                componentType="transitActionButton"
                            />
                        ) : null}
                        <Animated.View style={tailwind.style(`pb-4`)} />
                    </>
                );
            }
            case 'rideSkipped': {
                const { onPressRebookSkippedLeg, isButtonLoading } = props;
                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <Animated.View
                            style={tailwind.style('mx-6 h-[1px] w-full bg-[#F4F4F4]', `w-[${SCREEN_WIDTH - 48}px]`)}
                        />
                        <TransitActionButton
                            onPress={onPressRebookSkippedLeg}
                            label={userLanguageStrings.BookARide}
                            icon="auto"
                            isLoading={isButtonLoading}
                        />
                        {!isLiveTrackingNotAvailable && (
                            <ExpandCollapseTrackingButton
                                isExpanded={true}
                                buttonText={userLanguageStrings.TrackMode(
                                    getUserLanguageStringsForMode(mode, userLanguageStrings),
                                )}
                                onPress={() => props.onPressTrackMode && props.onPressTrackMode()}
                            />
                        )}
                    </>
                );
            }
            case 'starting': {
                const { currentLegSplitUpProps, handleOnPressViewTicketButton, journeyId } = props;
                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <CurrentLegSplitUp {...currentLegSplitUpProps} />
                        {!isLoading && (
                            <SmartTicketButton
                                journeyId={journeyId}
                                onPressViewTicket={handleOnPressViewTicketButton}
                                wrapperStyle={'mx-0 mt-2 mb-0'}
                                ticketText={userLanguageStrings.ViewTicket}
                            />
                        )}
                        {!isLiveTrackingNotAvailable && !isLoading && (
                            <ExpandCollapseTrackingButton
                                isExpanded={true}
                                buttonText={userLanguageStrings.TrackMode(
                                    getUserLanguageStringsForMode(mode, userLanguageStrings),
                                )}
                                onPress={() => props.onPressTrackMode && props.onPressTrackMode()}
                            />
                        )}
                    </>
                );
            }
            case 'taxiStarting': {
                const { currentLegSplitUpProps, onPressRideDetails } = props;
                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <CurrentLegSplitUp {...currentLegSplitUpProps} />
                        <RideDetailButton onPress={onPressRideDetails} />
                        {!isLiveTrackingNotAvailable && !isLoading && (
                            <ExpandCollapseTrackingButton
                                isExpanded={true}
                                buttonText={userLanguageStrings.TrackMode(
                                    getUserLanguageStringsForMode(mode, userLanguageStrings),
                                )}
                                onPress={() => props.onPressTrackMode && props.onPressTrackMode()}
                            />
                        )}
                    </>
                );
            }
            case 'waiting': {
                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={ticketButtonProps.onPress}
                            wrapperStyle={'mx-0 mt-2 mb-0'}
                            ticketText={ticketButtonProps.ticketText}
                        />
                        {mode === 'bus' ? (
                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            <MiniBusTracking {...(props as WaitingStateProps & { mode: 'bus' }).miniBusTrackingProps} />
                        ) : null}
                        {mode === 'metro' || mode === 'train' ? (
                            <>
                                <Animated.View
                                    layout={LinearTransition.springify().damping(28).stiffness(300)}
                                    style={tailwind.style('mt-2 mx-[9px]')}>
                                    <CurrentLegSplitUp
                                        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                                        {...(props as WaitingStateProps & { mode: 'metro' | 'train' })
                                            .currentLegSplitUpProps}
                                        orientation="vertical"
                                    />
                                </Animated.View>
                                {!isLiveTrackingNotAvailable && (
                                    <ExpandCollapseTrackingButton
                                        isExpanded={true}
                                        buttonText={userLanguageStrings.TrackMode(
                                            getUserLanguageStringsForMode(mode, userLanguageStrings),
                                        )}
                                        onPress={() => props.onPressTrackMode && props.onPressTrackMode()}
                                    />
                                )}
                            </>
                        ) : null}
                    </>
                );
            }
            case 'transitIsOneStopAway': {
                const { additionalBusInfoProps } = props;

                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={ticketButtonProps.onPress}
                            wrapperStyle={'mx-0 mt-2 mb-0'}
                            ticketText={ticketButtonProps.ticketText}
                        />
                        <AdditionalBusInfo {...additionalBusInfoProps} />
                    </>
                );
            }
            case 'transitArrived': {
                const { additionalBusInfoProps } = props;

                return (
                    <>
                        <DetailedLiveHeader {...detailedLiveHeaderProps} />
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={ticketButtonProps.onPress}
                            wrapperStyle={'mx-0 mt-2 mb-0 pb-4'}
                            ticketText={ticketButtonProps.ticketText}
                        />
                        <Animated.View
                            style={tailwind.style('mx-6 h-[1px] w-full bg-[#F4F4F4]', `w-[${SCREEN_WIDTH - 48}px]`)}
                        />
                        <AdditionalBusInfo {...additionalBusInfoProps} />
                    </>
                );
            }
        }
    };

    if (isLiveTrackingNotAvailable) {
        return (
            <>
                {renderContent()}
                {!props.isLastLeg ? (
                    <ExpandCollapseTrackingButton
                        isExpanded={true}
                        buttonText={userLanguageStrings.Timetable}
                        onPress={handleOnPressTimetable}
                    />
                ) : null}
            </>
        );
    }

    return renderContent();
};
