import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import mtIcBusTracking from '../../../../../assets/mt_ic_bus_top_view_tracking.webp';
import mtIcMetroTracking from '../../../../../assets/mt_ic_metro_top_view_tracking.webp';
import mtIcTrainTracking from '../../../../../assets/mt_ic_train_top_view_tracking.webp';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { IconSwitch } from '@/src-v2/multimodal/components/SwitchPublicLegToast';
import { isUndefined } from 'lodash';
import { strings } from 'config-types';

const CollapsedStopsIcon = () => {
    return (
        <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <Path
                d="M14.7871 15.75H3.21484V13.8213H14.7871V15.75ZM14.7871 9.96387H3.21484V8.03613H14.7871V9.96387ZM14.7871 4.17871H3.21484V2.25H14.7871V4.17871Z"
                fill="#D9D9D9"
            />
        </Svg>
    );
};

export interface MiniBusTrackingProps {
    currentStop: string;
    destination: string;
    destinationTime: string | undefined;
    noOfStops: number;
    handleOnPressViewDetails: () => void;
    mode: 'Bus' | 'Train' | 'Metro';
    // This title can be either 'Boarding Point' or 'Destination'
    // Based on the destinationTitle, the destination text prompt will be different, when reaching 1 stop away
    destinationTitle: string;
    currentStopTitle: string;
    isLoading: boolean;
    addTopPadding?: boolean;
    nextLegMetroLineColor: string | undefined;
}
export const getDestinationLabel = (
    destinationTitle: string,
    nextLegMetroLineColor: string | undefined,
    userLanguageStrings: strings,
) => {
    if (!isUndefined(nextLegMetroLineColor)) {
        return (
            <>
                <IconSwitch color={nextLegMetroLineColor} /> {userLanguageStrings.SwitchStation}
            </>
        );
    }
    return destinationTitle;
};

export const MiniBusTracking = (props: MiniBusTrackingProps) => {
    const {
        currentStop,
        destination,
        destinationTime,
        noOfStops,
        handleOnPressViewDetails,
        mode,
        destinationTitle = 'Destination',
        currentStopTitle = 'Current Stop',
        isLoading = false,
        nextLegMetroLineColor,
        addTopPadding = true, // hacky solution, fix it properly
    } = props;
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            layout={LinearTransition.springify().damping(34).stiffness(300)}
            style={tailwind.style(`relative ${addTopPadding ? 'mt-2 pt-[18px]' : ''} pb-[7px]`)}>
            <LinearGradient
                style={tailwind.style('absolute left-6 top-0 bottom-0 w-7 rounded-[34px] overflow-hidden')}
                colors={['#FFFFFF', colors.CrossButton_bg]}
                locations={[0.0676, 0.8238]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}>
                {mode === 'Bus' ? (
                    <Animated.Image
                        accessible={false}
                        source={mtIcBusTracking}
                        style={tailwind.style('absolute top-3 h-[80px] w-[28px] z-10')}
                    />
                ) : null}
                {mode === 'Train' ? (
                    <Animated.Image
                        accessible={false}
                        source={mtIcTrainTracking}
                        style={tailwind.style('absolute -top-1.5 h-[100px] w-[28px] z-10')}
                    />
                ) : null}
                {mode === 'Metro' ? (
                    <Animated.Image
                        accessible={false}
                        source={mtIcMetroTracking}
                        style={tailwind.style('absolute -top-3.5 h-[110px] w-[28px] z-10')}
                    />
                ) : null}
            </LinearGradient>

            <Animated.View layout={LinearTransition.springify().damping(34).stiffness(300)} style={tailwind.style('')}>
                <Animated.View style={tailwind.style('pl-18', noOfStops === 1 ? 'pb-1' : 'pb-[14px]')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#969696]',
                        )}>
                        {currentStopTitle}
                    </Animated.Text>
                    {isLoading ? (
                        <Animated.View style={tailwind.style('pt-[7px]')}>
                            <Shimmer width={180} height={17} borderRadius={4} />
                        </Animated.View>
                    ) : null}
                    {!isLoading ? (
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#3B3A3C] pt-[7px]',
                            )}>
                            {currentStop}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
                {noOfStops > 1 ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut.duration(200)}>
                        <Pressable
                            accessibilityLabel="View details button"
                            accessibilityRole="button"
                            testID="more-stops-button"
                            onPress={handleOnPressViewDetails}>
                            <Animated.View
                                style={tailwind.style(
                                    'ml-18 flex-row items-center justify-between border-b-[1px] border-t-[1px] border-[#F4F4F4] py-[14px] mr-6',
                                )}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <CollapsedStopsIcon />
                                    {isLoading ? (
                                        <Animated.View style={tailwind.style('pl-1.5')}>
                                            <Shimmer width={100} height={17} borderRadius={4} />
                                        </Animated.View>
                                    ) : null}
                                    {!isLoading ? (
                                        <Animated.Text
                                            accessible={true}
                                            accessibilityLabel={`${noOfStops} More ${mode === 'Bus' ? 'Stops' : 'stations'}`}
                                            style={tailwind.style(
                                                'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#7E7E7E] pl-1.5',
                                            )}>
                                            {noOfStops} {userLanguageStrings.More}{' '}
                                            {mode === 'Bus' ? userLanguageStrings.Stops : userLanguageStrings.stations}
                                        </Animated.Text>
                                    ) : null}
                                </Animated.View>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#016ACD]',
                                    )}>
                                    {userLanguageStrings.ViewDetails} +
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                ) : null}
                {noOfStops === 1 ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.duration(200)}
                        style={tailwind.style(
                            'ml-18 flex-row items-center justify-between border-b-[1px] border-[#F4F4F4] pb-[14px] mr-6',
                        )}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#E97F06]',
                            )}>
                            {destinationTitle === userLanguageStrings.BoardingPoint
                                ? userLanguageStrings.BusIsArrivingToYourStopGetReadyToBoardStatic
                                : userLanguageStrings.YouNeedToGetDownAtNextStation}
                        </Animated.Text>
                    </Animated.View>
                ) : null}
                <Animated.View
                    layout={LinearTransition.springify().damping(34).stiffness(300)}
                    style={tailwind.style('pt-[14px] flex-row items-center pl-8.5')}>
                    <Animated.View style={tailwind.style('h-2 w-2 bg-[#C9C9C9] rounded-full')}></Animated.View>
                    <Animated.View style={tailwind.style('pl-[30px] flex-1')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] font-areaNormal-extrabold leading-[18px] tracking-[0.2px] text-[#969696]',
                            )}>
                            {getDestinationLabel(destinationTitle, nextLegMetroLineColor, userLanguageStrings)}
                        </Animated.Text>
                        {isLoading ? (
                            <Animated.View
                                style={tailwind.style('flex-row items-center pr-6  justify-between pt-[7px]')}>
                                <Shimmer width={180} height={17} borderRadius={4} />
                                <Shimmer width={60} height={17} borderRadius={4} />
                            </Animated.View>
                        ) : null}
                        {!isLoading ? (
                            <Animated.View
                                style={tailwind.style('flex-row items-center pr-6 justify-between pt-[7px]')}>
                                <Animated.Text
                                    numberOfLines={1}
                                    style={tailwind.style(
                                        'text-[13px] font-areaNormal-extrabold leading-[18px] tracking-[0.2px] text-[#3B3A3C]',
                                        `max-w-[${SCREEN_WIDTH - 150 - 24}px]`,
                                    )}>
                                    {destination}
                                </Animated.Text>
                                {destinationTime && (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[14px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#7E7E7E]',
                                        )}>
                                        {destinationTime}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
