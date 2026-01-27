import { useRef, useEffect } from 'react';
import { DetailedLiveHeader, DetailedLiveHeaderProps } from '../components/DetailedLiveJourney/DetailedLiveHeader';
import { MiniBusTracking, MiniBusTrackingProps } from '../components/DetailedLiveJourney/MiniBusTracking';
import { RateTransit, RateTransitProps } from '../components/DetailedLiveJourney/RateTransit';
import { StyleSheet, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Icon } from '@/typescript/components/Icon';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { BottomSheetModal, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import BookAutoToast, {
    BookAutoToastProps,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/BookAuto/BookAutoToast';
import { GateInfo } from '@/src-v2/multimodal/screens/NewLiveJourney/components/GateInfo/GateInfo';
import { ExitStation } from '../components/ExitStation';
import {
    NextWalkLegInfo,
    NextWalkLegInfoProps,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/NextWalkLegInfo/NextWalkLegInfo';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { MultimodalConfirmationModal } from '../components/Iternary/MultimodalConfirmationModal';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import Svg, { Path } from 'react-native-svg';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';
import { NextPubicLegInfoProps, NextPubicLegInfo } from '../components/NextPubicLegInfo/NextPubicLegInfo';
import { isUndefined } from 'lodash';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';

/**
 * Animated button component that shows a sliding background effect and triggers navigation
 * after animation completes.
 * @param onPress - Callback function to handle navigation to next transit
 */
const GoToNextTransitButton = ({ onPress }: { onPress: () => void }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const translatingX = useSharedValue(SCREEN_WIDTH - 48);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useEffect(() => {
        // Animate background from right to left once, then trigger navigation
        translatingX.value = withRepeat(withTiming(0, { duration: 5000 }), 1, false, finished => {
            if (finished) {
                runOnJS(onPress)();
            }
        });
    }, []);

    const animatedTranslateStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -translatingX.value }],
    }));

    return (
        <Pressable
            testID="go-to-next-transit-button"
            accessibilityLabel="Go to next transit button"
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }: { pressed: boolean }) =>
                tailwind.style('mt-4 rounded-[18px] overflow-hidden', pressed ? 'bg-[#F7F7F7]' : 'bg-[#F4F4F4]')
            }
            {...handlers}>
            <Animated.View
                style={[StyleSheet.absoluteFillObject, tailwind.style('bg-[#E5E5E5]'), animatedTranslateStyle]}
            />
            <Animated.View
                style={[tailwind.style('h-[60px] flex-row items-center justify-center rounded-[18px]'), animatedStyle]}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[#016ACD] text-center',
                    )}>
                    {userLanguageStrings.GoToNextTransit}
                </Animated.Text>
                <Icon style={tailwind.style('ml-2.5')} icon={<DoubleArrowsWhite fill="#016ACD" />} color="#016ACD" />
            </Animated.View>
        </Pressable>
    );
};

type NextLegProps =
    | ({ mode: 'Taxi' } & BookAutoToastProps)
    | ({ mode: 'Walk' } & NextWalkLegInfoProps)
    | ({ mode: 'Metro' } & NextPubicLegInfoProps)
    | ({ mode: 'Subway' } & NextPubicLegInfoProps)
    | ({ mode: 'Bus' } & NextPubicLegInfoProps)
    | undefined;

/**
 * Base props shared between all transit states
 */
type BaseInTransitStateProps = {
    /** Props for the DetailedLiveHeader component shown at the top */
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    nextLegProps: NextLegProps;
};

/**
 * Props specific to the 'inTransit' state
 */
type InTransitProps = BaseInTransitStateProps & {
    status: 'inTransit';
    /** Props for the MiniBusTracking component showing current transit progress */
    miniBusTrackingProps: MiniBusTrackingProps;
    /** Callback for showing the ticket */
    onShowTicketPress: (() => void) | undefined;
    onPressExitStation: (() => void) | undefined;
    hasApplicablePasses: boolean | undefined;
    onVerifyPass: (() => void) | undefined;
    journeyId: JourneyId;
};

type ExitStationProps = BaseInTransitStateProps & {
    status: 'exitStation';
    exitGateNo: string | undefined;
    exitGateSide: string | undefined;
    onShowTicketPress: (() => void) | undefined;
    onCompleteJourney: () => Promise<void>;
    onMarkLegComplete: () => Promise<void>;
    journeyId: JourneyId;
    hasNextLeg: boolean;
};

type CloseToDestinationProps = BaseInTransitStateProps & {
    status: 'closeToDestination';
    onShowTicketPress: (() => void) | undefined;
    onPressExitStation: () => void;
    journeyId: JourneyId;
};

/**
 * Props specific to the 'destinationReached' state
 * Uses a discriminated union to enforce required props based on isSingleMode
 */
type DestinationReachedProps = BaseInTransitStateProps & {
    status: 'destinationReached';
    /** Determines if this is the last transit in the journey */
    isSingleMode: boolean;
} & (
        | {
              isSingleMode: true;
              /** Props for the RateTransit component, required only in single mode */
              rateTransitProps: RateTransitProps;
          }
        | {
              isSingleMode: false;
              /** Information about the next transit to display */
              nextTransitInfo: string;
              /** Callback function to handle navigation to next transit */
              handleOnPressGoToNextTransit: () => void;
          }
    );

/** Combined props type for the InTransitState component */
type InTransitStateProps = InTransitProps | ExitStationProps | CloseToDestinationProps | DestinationReachedProps;

/**
 * Component that handles different states of a transit journey:
 * - "inTransit": Shows current transit progress
 * - "destinationReached": Shows either rating UI (single mode) or next transit info
 */
const ArrowIcon = () => {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 14 14" fill="none">
            <Path
                d="M12.0703 7.34668L12.7578 7.99902L12.0703 8.65137L7.18262 13.2949L6.5625 12.6416L5.94336 11.9893L9.19727 8.89844H2.16406V7.09863H9.19629L5.94336 4.00781L6.5625 3.35547L7.18262 2.70312L12.0703 7.34668Z"
                fill="#016ACD"
            />
        </Svg>
    );
};

export const ExitMetro = ({
    onPressExitStation,
    mode,
}: {
    onPressExitStation: () => void;
    mode: MultimodalTravelMode_multimodalTravelMode;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const exitMetroConfirmation = useRef<BottomSheetModal>(null);
    const exitText =
        mode === 'Subway'
            ? userLanguageStrings.ExitStation
            : mode === 'Bus'
              ? userLanguageStrings.ExitBus
              : userLanguageStrings.ExitMetro;
    const headingText = mode === 'Subway' ? userLanguageStrings.ExitStation : userLanguageStrings.ExitMetro;
    return (
        <>
            <View style={tailwind.style(` flex-row items-center justify-center mb-6 ${mode == 'Bus' ? '' : 'mt-4'}`)}>
                <Typography
                    type="body-1"
                    style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[24px]')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.IfYouHaveAlreadyArrivedComma}
                </Typography>
                <Pressable
                    accessibilityLabel={exitText}
                    accessibilityRole="button"
                    testID="exit-metro-button"
                    onPress={() => {
                        exitMetroConfirmation.current?.present();
                    }}>
                    <Typography
                        type="body-1"
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#016ACD] leading-[24px]')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {exitText}
                    </Typography>
                </Pressable>
            </View>
            <MultimodalConfirmationModal
                ref={exitMetroConfirmation}
                onConfirm={() => {
                    onPressExitStation();
                    exitMetroConfirmation.current?.dismiss();
                }}
                onCancel={() => {
                    exitMetroConfirmation.current?.dismiss();
                }}
                heading={headingText}
                description={userLanguageStrings.YourCurrentModeWillBeSkippedAreYouSure}
                primaryButtonText={userLanguageStrings.Exit}
                secondaryButtonText={userLanguageStrings.Cancel}
                accessibilityRef={undefined}
                onModalContentReady={undefined}
            />
        </>
    );
};

export const MarkCompleteContext = ({
    hasNextLeg,
    onCompleteJourney,
    onExitStation,
}: {
    hasNextLeg: boolean;
    onCompleteJourney: () => Promise<void>;
    onExitStation: () => Promise<void>;
}) => {
    const ref = useRef<BottomSheetModal>(null);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('pb-3 items-center')}>
            <Animated.Text
                style={tailwind.style(
                    'text-[13px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-[#7E7E7E] text-center',
                )}>
                {hasNextLeg
                    ? userLanguageStrings.OutsideTheStationQuestion
                    : userLanguageStrings.IfYouHaveReachedTheDestinationThen}
            </Animated.Text>
            {hasNextLeg ? (
                <Pressable
                    onPress={onExitStation}
                    testID="complete-metro-leg-pressable"
                    accessibilityRole="button"
                    accessibilityLabel="Go to Next Transit button">
                    <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-[#016ACD] text-center',
                            )}>
                            {userLanguageStrings.GoToNextTransit}
                        </Animated.Text>
                        <Icon style={tailwind.style('ml-1')} icon={<ArrowIcon />} size={14} color="#016ACD" />
                    </Animated.View>
                </Pressable>
            ) : (
                <Pressable
                    accessibilityLabel="Mark Complete button"
                    onPress={() => {
                        ref.current?.present();
                    }}
                    accessibilityRole="button"
                    testID="complete-journey-pressable">
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] leading-[18px] tracking-[0.2px] font-areaNormal-extrabold text-[#016ACD] text-center',
                        )}>
                        {userLanguageStrings.MarkComplete}
                    </Animated.Text>
                </Pressable>
            )}
            <MultimodalConfirmationModal
                ref={ref}
                onConfirm={onCompleteJourney}
                onCancel={() => {
                    ref.current?.dismiss();
                }}
                heading={userLanguageStrings.CompleteJourney}
                description={userLanguageStrings.YourTicketWillGetExpiredIfYouCompleteTheJourneyAreYouSure}
                primaryButtonText={userLanguageStrings.Complete}
                secondaryButtonText={userLanguageStrings.Cancel}
                accessibilityRef={undefined}
                onModalContentReady={undefined}
            />
        </Animated.View>
    );
};

const NextLegInfoToast = ({ nextLegProps }: { nextLegProps: NextLegProps }) => {
    if (!nextLegProps) {
        return <View style={tailwind.style('h-[20px]')} />;
    }

    switch (nextLegProps.mode) {
        case 'Taxi':
            return <BookAutoToast {...nextLegProps} />;
        case 'Walk':
            return <NextWalkLegInfo {...nextLegProps} />;
        case 'Metro':
            return <NextPubicLegInfo {...nextLegProps} />;
        case 'Subway':
            return <NextPubicLegInfo {...nextLegProps} />;
        case 'Bus':
            return <NextPubicLegInfo {...nextLegProps} />;
        default:
            return <View style={tailwind.style('h-[20px]')} />;
    }
};

export const InTransitState = (props: InTransitStateProps) => {
    const { detailedLiveHeaderProps, status, nextLegProps } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;
    const renderContent = () => {
        switch (status) {
            case 'inTransit': {
                const showNextLegInfo = (() => {
                    switch (detailedLiveHeaderProps.icon) {
                        case 'Bus':
                            return true; // always show in case of bus
                        case 'Metro':
                            return ['Bus', 'Subway'].includes(nextLegProps?.mode ?? ''); // only if next is bus or subway
                        case 'Subway':
                            return ['Bus', 'Metro'].includes(nextLegProps?.mode ?? ''); // only if next is bus or metro
                        default:
                            return false;
                    }
                })();
                return (
                    <>
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={
                                (props.hasApplicablePasses && isPassEnabled
                                    ? props.onVerifyPass
                                    : props.onShowTicketPress) ?? (() => {})
                            }
                            wrapperStyle={'mx-0 mt-2 mb-0'}
                            ticketText={
                                props.hasApplicablePasses && isPassEnabled
                                    ? userLanguageStrings.ActivatePass
                                    : userLanguageStrings.ShowTicket
                            }
                        />
                        <MiniBusTracking {...props.miniBusTrackingProps} addTopPadding={true} />
                        <View style={tailwind.style('h-[1px] bg-[#F4F4F4] mx-6 my-2')} />
                        {showNextLegInfo ? <NextLegInfoToast nextLegProps={nextLegProps} /> : null}
                        {props.onPressExitStation ? (
                            <ExitMetro
                                onPressExitStation={props.onPressExitStation}
                                mode={detailedLiveHeaderProps.icon}
                            />
                        ) : null}
                    </>
                );
            }
            case 'exitStation': {
                return (
                    <>
                        <View style={tailwind.style('my-4')}>
                            <GateInfo
                                gateNo={props.exitGateNo || ''}
                                gateSide={props.exitGateSide || 'Take Available Exit Gate'}
                                floating={false}
                            />
                        </View>
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={props.onShowTicketPress ?? (() => {})}
                            wrapperStyle={'mx-0 mt-2 mb-0'}
                            ticketText={userLanguageStrings.ShowTicket}
                        />
                        <NextLegInfoToast nextLegProps={nextLegProps} />
                        <MarkCompleteContext
                            hasNextLeg={!isUndefined(nextLegProps)}
                            onCompleteJourney={props.onCompleteJourney}
                            onExitStation={props.onMarkLegComplete}
                        />
                    </>
                );
            }
            case 'closeToDestination': {
                return (
                    <>
                        <ExitStation
                            onPress={props.onPressExitStation}
                            isNextLegTransit={nextLegProps?.mode === detailedLiveHeaderProps.icon} // if current mode and next mode are same
                            mode={detailedLiveHeaderProps.icon}
                        />
                        <SmartTicketButton
                            journeyId={props.journeyId}
                            onPressViewTicket={props.onShowTicketPress ?? (() => {})}
                            wrapperStyle={'mx-0 mt-2 mb-0'}
                            ticketText={userLanguageStrings.ShowTicket}
                        />
                        <NextLegInfoToast nextLegProps={nextLegProps} />
                    </>
                );
            }
            case 'destinationReached':
                switch (props.isSingleMode) {
                    case true:
                        return <RateTransit {...props.rateTransitProps} />;
                    case false:
                        return (
                            <Animated.View style={tailwind.style('mx-6 pt-3 border-t border-[#F4F4F4] pb-6')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[24px]',
                                    )}>
                                    {props.nextTransitInfo}
                                </Animated.Text>
                                <GoToNextTransitButton onPress={props.handleOnPressGoToNextTransit} />
                            </Animated.View>
                        );
                }
        }
    };

    return (
        <>
            <DetailedLiveHeader {...detailedLiveHeaderProps} />
            {renderContent()}
        </>
    );
};
