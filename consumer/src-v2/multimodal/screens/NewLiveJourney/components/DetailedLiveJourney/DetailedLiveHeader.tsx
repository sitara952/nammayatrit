import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { getIconBGFromType, getIconFromType, getIconSecondaryBGFromType } from '../../utils/getTransitIconUtils';
import { TransitArrived } from './TransitArrived';
const ExitStationIcon = () => {
    return (
        <Svg width="58" height="50" viewBox="0 0 58 50" fill="none">
            <Path
                d="M29.0035 0.671875C15.4569 0.671875 4.47656 11.6522 4.47656 25.1988C4.47656 38.7454 15.4569 49.7257 29.0035 49.7257C42.5501 49.7257 53.5304 38.7454 53.5304 25.1988C53.5304 11.6522 42.5484 0.671875 29.0035 0.671875ZM29.0035 39.5824C21.0598 39.5824 14.6199 33.1425 14.6199 25.1988C14.6199 17.2551 21.0598 10.8152 29.0035 10.8152C36.9472 10.8152 43.3871 17.2551 43.3871 25.1988C43.3871 33.1425 36.9472 39.5824 29.0035 39.5824Z"
                fill="#0D43A9"
            />
            <Path
                d="M53.2 18H4.8C3.11984 18 2.27976 18 1.63803 18.327C1.07354 18.6146 0.614601 19.0735 0.32698 19.638C0 20.2798 0 21.1198 0 22.8V27.2C0 28.8802 0 29.7202 0.32698 30.362C0.614601 30.9265 1.07354 31.3854 1.63803 31.673C2.27976 32 3.11984 32 4.8 32H53.2C54.8802 32 55.7202 32 56.362 31.673C56.9265 31.3854 57.3854 30.9265 57.673 30.362C58 29.7202 58 28.8802 58 27.2V22.8C58 21.1198 58 20.2798 57.673 19.638C57.3854 19.0735 56.9265 18.6146 56.362 18.327C55.7202 18 54.8802 18 53.2 18Z"
                fill="#EB342E"
            />
        </Svg>
    );
};

type BaseDetailedLiveHeaderProps = {
    title: string;
    icon: MultimodalTravelMode_multimodalTravelMode;
    isInTransitHeader: boolean;
    info: string;
    isLoading: boolean;
};

type DetailedLiveHeaderWithStatusProps = BaseDetailedLiveHeaderProps & {
    noOfStops: 0;
    status: 'closeToDestination' | 'exitStation';
};

type DetailedLiveHeaderWithoutStatusProps = BaseDetailedLiveHeaderProps & {
    noOfStops: number;
};

export type DetailedLiveHeaderProps = DetailedLiveHeaderWithStatusProps | DetailedLiveHeaderWithoutStatusProps;

const hasStatus = (props: DetailedLiveHeaderProps): props is DetailedLiveHeaderWithStatusProps => {
    return props.noOfStops === 0 && 'status' in props;
};

export const DetailedLiveHeader = (props: DetailedLiveHeaderProps) => {
    const { title, icon, isInTransitHeader, info, noOfStops, isLoading } = props;
    const configManager = useConfigContext();
    const userLangaugeStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(100)}
            layout={LinearTransition.springify().damping(38).stiffness(280)}
            style={tailwind.style('mx-6 flex-row justify-between items-start pb-4')}>
            <Animated.View layout={LinearTransition.springify().damping(38).stiffness(280)}>
                {isLoading ? (
                    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(100)}>
                        <Shimmer
                            borderRadius={8}
                            width={
                                SCREEN_WIDTH - (isInTransitHeader ? 80 : 48) - 8 - 48 + (noOfStops === -1 ? 48 : 0) - 24
                            }
                            height={27}
                        />
                    </Animated.View>
                ) : null}
                {!isLoading ? (
                    <Animated.Text
                        layout={LinearTransition.springify().damping(38).stiffness(280)}
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        style={tailwind.style(
                            'text-[16px] font-areaNormal-extrabold leading-[27px] tracking-[0.14px] text-[#313131]',
                            icon === 'Bus' ? 'text-[19px]' : 'text-[16px]',
                            `max-w-[${SCREEN_WIDTH - (isInTransitHeader ? 80 : 48) - 8 - 48 + (noOfStops === -1 ? 48 : 0)}px]`,
                        )}>
                        {title}
                    </Animated.Text>
                ) : null}
                {isLoading && info ? (
                    <Animated.View
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(100)}
                        style={tailwind.style(isInTransitHeader ? 'pt-1.5' : 'pt-2.5')}>
                        <Shimmer
                            borderRadius={8}
                            width={
                                SCREEN_WIDTH -
                                (isInTransitHeader ? 80 : 48) -
                                8 -
                                48 +
                                (noOfStops === -1 ? 48 : 0) -
                                48 * 2
                            }
                            height={22}
                        />
                    </Animated.View>
                ) : null}
                {!isLoading && info ? (
                    <Animated.Text
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(100)}
                        layout={LinearTransition.springify().damping(38).stiffness(280)}
                        numberOfLines={2}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[22px] tracking-[0.2px] pr-4',
                            `max-w-[${SCREEN_WIDTH - (isInTransitHeader ? 80 : 48) - 16 - 48 + (noOfStops === -1 ? 48 : 0)}px]`,
                            noOfStops !== 0 ? 'text-[#09941E]' : 'text-[#7E7E7E]',
                            isInTransitHeader ? 'pt-1.5' : 'pt-2.5',
                        )}>
                        {info}
                    </Animated.Text>
                ) : null}
            </Animated.View>
            {isLoading ? (
                <Animated.View
                    style={tailwind.style(!isInTransitHeader ? 'mt-[3px]' : '')}
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(100)}>
                    <Shimmer
                        borderRadius={18}
                        width={isInTransitHeader ? 80 : 48}
                        height={isInTransitHeader ? 80 : 48}
                    />
                </Animated.View>
            ) : null}
            {noOfStops !== -1 && !isLoading ? (
                <Animated.View
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(100)}
                    layout={LinearTransition.springify().damping(38).stiffness(280)}
                    style={tailwind.style(
                        'justify-center items-center',
                        isInTransitHeader
                            ? 'h-20 w-20 rounded-[22px] bg-[#FFE590]'
                            : `h-12 w-12 rounded-[18px] mt-[3px] bg-[${getIconBGFromType(icon)}]`,
                        // noOfStops === 0 && isInTransitHeader ? 'bg-[#F4F4F4]' : '',
                        isInTransitHeader && noOfStops === 0 ? 'bg-[#09941E]' : '',
                        isInTransitHeader &&
                            noOfStops === 0 &&
                            icon === 'Subway' &&
                            hasStatus(props) &&
                            props.status === 'exitStation'
                            ? 'bg-[#F7F7F7]'
                            : '',
                    )}>
                    {isInTransitHeader && noOfStops > 0 ? (
                        <Animated.View
                            entering={FadeIn.duration(250)}
                            exiting={FadeOut.duration(100)}
                            style={tailwind.style('items-center')}>
                            <Animated.Text
                                accessible={true}
                                accessibilityLabel={`${noOfStops} stops text`}
                                style={tailwind.style(
                                    'text-[32px] leading-[34px] text-[#313131] font-areaNormal-extrabold',
                                )}>
                                {noOfStops < 10 ? `0${noOfStops}` : noOfStops}
                            </Animated.Text>
                            <Animated.Text
                                accessible={false}
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal-extrabold leading-[14px] tracking-[0.22px] text-[#313131]',
                                )}>
                                {userLangaugeStrings.STOPS}
                            </Animated.Text>
                        </Animated.View>
                    ) : null}
                    {isInTransitHeader &&
                    noOfStops === 0 &&
                    hasStatus(props) &&
                    props.status === 'closeToDestination' ? (
                        <Animated.View
                            entering={FadeIn.duration(250)}
                            exiting={FadeOut.duration(100)}
                            style={tailwind.style('items-center justify-center  rounded-[22px] overflow-hidden')}>
                            <Video
                                repeat
                                source={require('../../../../../assets/mt_ic_transit_complete_animation.mp4')}
                                style={tailwind.style('w-[80px] h-[80px]')}
                                disableFocus={true}
                                ignoreSilentSwitch={'obey'}
                                preventsDisplaySleepDuringVideoPlayback={false}
                            />
                        </Animated.View>
                    ) : null}
                    {isInTransitHeader && noOfStops === 0 && hasStatus(props) && props.status === 'exitStation' ? (
                        icon === 'Metro' ? (
                            <Animated.View
                                entering={FadeIn.duration(250)}
                                exiting={FadeOut.duration(100)}
                                style={tailwind.style('items-center justify-center  rounded-[22px] overflow-hidden')}>
                                <Video
                                    repeat
                                    source={require('../../../../../assets/mt_ic_transit_scan.mp4')}
                                    style={tailwind.style('w-[80px] h-[80px]')}
                                    disableFocus={true}
                                    ignoreSilentSwitch={'obey'}
                                    preventsDisplaySleepDuringVideoPlayback={false}
                                />
                            </Animated.View>
                        ) : icon === 'Subway' ? (
                            <Animated.View
                                entering={FadeIn.duration(250)}
                                exiting={FadeOut.duration(100)}
                                style={tailwind.style('items-center justify-center  rounded-[22px] overflow-hidden')}>
                                <ExitStationIcon />
                            </Animated.View>
                        ) : icon === 'Bus' ? (
                            <Animated.View
                                entering={FadeIn.duration(250)}
                                exiting={FadeOut.duration(100)}
                                style={tailwind.style('items-center justify-center  rounded-[22px] overflow-hidden')}>
                                {getIconFromType('Tick', 27, getIconSecondaryBGFromType(icon), false)}
                            </Animated.View>
                        ) : null
                    ) : null}

                    {isInTransitHeader ? (
                        icon === 'Bus' && noOfStops === 0 ? (
                            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(100)}>
                                <TransitArrived mode={icon} />
                            </Animated.View>
                        ) : null
                    ) : (
                        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(100)}>
                            {getIconFromType(icon, 27, getIconSecondaryBGFromType(icon), true)}
                        </Animated.View>
                    )}
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};
