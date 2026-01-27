import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import metroTransit from '../../../../../assets/3D-assets/full-asset/metro_transit.webp';
import suburbanTransit from '../../../../../assets/3D-assets/full-asset/suburban_transit.webp';
import mtIcMetroSideView from '../../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcStationZone from '../../../../../assets/3D-assets/mt_ic_station_zone.webp';
import mtIcTrainSideView from '../../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import { ExpandCollapseTrackingButtonNew } from '../../screens/TransitTracking/components/ExpandCollapseTrackingButtonNew';
import { RateTransit, RateTransitProps } from '../DetailedLiveJourney/RateTransit';
import { SmartTicketButton } from '../../../../components/SmartTicketButton';
import { JourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const TrainMetroReachingStation = ({ mode }: { mode: 'metro' | 'train' }) => {
    return (
        <>
            <Animated.View
                layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                style={tailwind.style('flex-1 justify-center')}>
                <Animated.View
                    layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                    style={tailwind.style('relative')}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="metro station zone image"
                        layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                        entering={FadeIn.duration(300)}
                        source={mtIcStationZone}
                        resizeMode={'contain'}
                        style={[tailwind.style('h-[222px] w-[514px] left-10')]}
                    />
                    <Animated.View style={[tailwind.style('absolute bottom-0 left-0 w-full h-[2px] bg-[#DA8E14]')]} />
                    {mode === 'metro' ? (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="metro side view image"
                            entering={SlideInLeft.delay(100).duration(1000)}
                            resizeMode={'contain'}
                            source={mtIcMetroSideView}
                            style={tailwind.style(
                                'absolute h-[100px] w-full bottom-0',
                                `-left-[${SCREEN_WIDTH / 1.6}px]`,
                            )}
                        />
                    ) : null}
                    {mode === 'train' ? (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="train side view image"
                            entering={SlideInLeft.delay(100).duration(1000)}
                            resizeMode={'contain'}
                            source={mtIcTrainSideView}
                            style={tailwind.style(
                                'absolute h-[100px] w-full bottom-0',
                                `-left-[${SCREEN_WIDTH / 1.6}px]`,
                            )}
                        />
                    ) : null}
                </Animated.View>
            </Animated.View>
        </>
    );
};

const TrainMetroDestinationReached = ({ mode }: { mode: 'metro' | 'train' }) => {
    return (
        <Animated.View
            layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
            style={tailwind.style('flex-1 justify-center')}>
            {mode === 'train' ? (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="suburban transit image"
                    entering={FadeIn.delay(300).springify().damping(34).stiffness(240)}
                    exiting={FadeOut.duration(250)}
                    source={suburbanTransit}
                    resizeMode={'cover'}
                    style={[
                        tailwind.style('h-full w-full'),
                        {
                            aspectRatio: 1,
                            transform: [{ scale: 3 }, { translateY: -15 }],
                        },
                    ]}
                />
            ) : null}
            {mode === 'metro' ? (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="metro transit image"
                    entering={FadeIn.delay(300).springify().damping(34).stiffness(240)}
                    exiting={FadeOut.duration(250)}
                    source={metroTransit}
                    resizeMode={'cover'}
                    style={[
                        tailwind.style('h-full w-full'),
                        {
                            aspectRatio: 1,
                            transform: [{ scale: 3 }],
                        },
                    ]}
                />
            ) : null}
        </Animated.View>
    );
};

/**
 * Base props that are common to both single and multi mode components
 */
type BaseProps = {
    /** Type of transit - either metro or train */
    mode: 'metro' | 'train';
    /** Current status of the journey */
    status: 'tracking' | 'oneStopAwayFromDestinaion' | 'destinationReached';
    /** Name of the destination stop */
    destinationStop: string;
    /** Name of the previous station */
    previousStationName: string;
    /** Additional information to show when destination is reached */
    additionInfoOnDestinationReached: string;
    /** Whether the component is in single mode or not */
    isSingleMode: boolean | undefined;
    /** Callback function when show ticket button is pressed */
    handleOnPressShowTicket: () => void;
    /** Callback when track mode button is pressed */
    onPressTrackMode: (() => void) | undefined;
    /** Journey ID */
    journeyId: JourneyId;
};

/**
 * Props for single mode component
 * Extends BaseProps and includes rating functionality
 */
type SingleModeProps = BaseProps & {
    /** Must be true for single mode */
    isSingleMode: true;
} & Pick<RateTransitProps, 'handleOnPressThumbsDown' | 'handleOnPressThumbsUp'>;

/**
 * Props for multi mode component
 * Extends BaseProps and includes expand/collapse functionality
 */
type MultiModeProps = BaseProps & {
    /** Must be false or undefined for multi mode */
    isSingleMode: false | undefined;
    /** Callback function when expand/collapse tracking button is pressed */
    onPressExpandCollapseTrackingButton: () => void;
    // onPressTrackMode is already part of BaseProps, so it's inherited here
};

/**
 * Combined props type that can be either SingleModeProps or MultiModeProps
 */
export type InMetroSuburbanTransitProps = SingleModeProps | MultiModeProps;

export const InMetroSuburbanTransit = (props: InMetroSuburbanTransitProps) => {
    const {
        status,
        mode,
        destinationStop,
        previousStationName,
        additionInfoOnDestinationReached,
        isSingleMode = false,
        journeyId,
    } = props;
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleExpandCollapsePress = () => {
        // Prefer onPressTrackMode if available, otherwise fall back to existing expand/collapse
        if (props.onPressTrackMode) {
            props.onPressTrackMode();
        } else if (!isSingleMode && 'onPressExpandCollapseTrackingButton' in props) {
            props.onPressExpandCollapseTrackingButton();
        }
    };

    return (
        <Animated.View
            style={tailwind.style('flex-1 bg-[#FFE688]', `pt-[${(top ? top : 12) + 40 + 20}px] pb-[${bottom}px]`)}>
            {status === 'oneStopAwayFromDestinaion' ? <TrainMetroReachingStation mode={mode} /> : null}
            {status === 'oneStopAwayFromDestinaion' ? (
                <Animated.View
                    layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                    style={tailwind.style('flex-1 justify-end')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[20px] leading-[32px] font-areaNormal-extrabold text-[#313131] text-center tracking-[0.14px] px-11',
                        )}>
                        {userLanguageStrings.IfYouCrossedStationBeReadyToGetDownAtMetro(
                            previousStationName,
                            destinationStop,
                        )}
                    </Animated.Text>
                    <SmartTicketButton journeyId={journeyId} onPressViewTicket={props.handleOnPressShowTicket} />
                    <Animated.View style={tailwind.style('h-[1px] bg-[#D8C479] opacity-40 mx-6 mt-6 mb-[14px]')} />
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] leading-[24px] font-areaNormal-extrabold text-[#3B3A3C] text-center tracking-[0.14px] px-6 border-[#3B3A3C] pb-4',
                        )}>
                        {userLanguageStrings.YouAreRightOnTimeGetDownAndFollowDirections}
                    </Animated.Text>
                    <ExpandCollapseTrackingButtonNew
                        buttonText={userLanguageStrings.TrackMetroOrTrain(
                            mode === 'metro' ? userLanguageStrings.Metro : userLanguageStrings.Train,
                        )}
                        onPress={handleExpandCollapsePress}
                        isExpanded={false}
                    />
                </Animated.View>
            ) : null}
            {status === 'destinationReached' ? <TrainMetroDestinationReached mode={mode} /> : null}
            {status === 'destinationReached' ? (
                <Animated.View
                    layout={LinearTransition.springify().damping(34).stiffness(300).mass(1)}
                    style={tailwind.style('flex-1 justify-end')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[20px] leading-[32px] font-areaNormal-extrabold text-[#313131] text-center tracking-[0.14px] px-11',
                        )}>
                        {userLanguageStrings.YouHaveReachedGetDownNow(destinationStop)}
                    </Animated.Text>
                    <SmartTicketButton journeyId={journeyId} onPressViewTicket={props.handleOnPressShowTicket} />
                    <Animated.View style={tailwind.style('h-[1px] bg-[#D8C479] opacity-20 mx-6 mt-6 mb-[14px]')} />
                    {!isSingleMode ? (
                        <>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] leading-[24px] font-areaNormal-extrabold text-[#3B3A3C] text-center tracking-[0.14px] px-6 border-t-[1px] border-[#3B3A3C] pb-4',
                                )}>
                                {additionInfoOnDestinationReached}
                            </Animated.Text>
                            <ExpandCollapseTrackingButtonNew
                                buttonText={userLanguageStrings.ViewNextSteps}
                                onPress={handleExpandCollapsePress}
                                isExpanded={false}
                            />
                        </>
                    ) : null}
                </Animated.View>
            ) : null}
            {status === 'destinationReached' && isSingleMode ? (
                <RateTransit
                    variant="filled"
                    handleOnPressThumbsUp={() => {}}
                    handleOnPressThumbsDown={() => {}}
                    transitMode={mode === 'metro' ? 'Metro' : 'Train'}
                    destination={destinationStop}
                />
            ) : null}
        </Animated.View>
    );
};
