import mtIcMetroSideView from '../../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import metro_gate from '@/typescript/assets/metro_security_gate.webp';
import { Image, Platform } from 'react-native';
import Animated, { SlideInLeft, SlideInUp, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { LiveJourneyHeader } from '../../../LiveJourneyDetail/UI';
import { PreboardingMetro, PreboardingMetroProps } from '../../molecules/PreboardingMetro';
import { GateInfo, SuburbanExitInfo } from '../GateInfo/GateInfo';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import { useState, useEffect } from 'react';
import BusStopBufferingImg from '@/src-v2/assets/mt_ic_bus_stop.webp';
import { JourneyId } from '@/typescript/state/client/user';

type GateInfoPropsForArrived = {
    gateNo: string;
    gateSide: string;
};

type InDestinationStationZoneProps =
    | {
          mode: 'metro' | 'train';
          status: 'transitIsOneStopAway';
          onPressExit: () => void;
          onPressStatusBadge: () => void;
      }
    | {
          mode: 'metro' | 'train';
          status: 'transitArrived';
          gateInfo: GateInfoPropsForArrived;
          onPressExit: () => void;
          onPressStatusBadge: () => void;
      };

export const InDestinationStationZone = (props: InDestinationStationZoneProps) => {
    const { top } = useSafeAreaInsets();
    const { status, mode } = props;

    const SlideFadeExit = (values: { currentOriginX: number; currentWidth: number }) => {
        'worklet';
        const animations = {
            originX: withTiming(values.currentOriginX + values.currentWidth + 50, { duration: 500 }),
            opacity: withTiming(0, { duration: 500 }),
        };
        const initialValues = {
            originX: values.currentOriginX,
            opacity: 1,
        };
        return { initialValues, animations };
    };

    return (
        <Animated.View style={tailwind.style('flex-1 bg-white', `pt-[${top ? top : 16}px]`)}>
            <LiveJourneyHeader onPressExit={props.onPressExit} onPressStatusBadge={props.onPressStatusBadge} />
            <Animated.View style={tailwind.style('relative', `-left-[490px]`)}>
                {status === 'transitIsOneStopAway' ? (
                    <Animated.Image
                        accessible={false}
                        entering={SlideInLeft.springify().damping(24).stiffness(300)}
                        exiting={SlideFadeExit}
                        resizeMode={'contain'}
                        source={mtIcMetroSideView}
                        style={[tailwind.style('w-[820px] h-[240px]'), { top: 107 - top + 16 }]}
                    />
                ) : null}
                {/* Should add image of the scanner */}
            </Animated.View>
            {status === 'transitArrived' ? (
                <>
                    <Image accessible={false} source={metro_gate} style={{ position: 'absolute', top: 230 }} />
                    <Image
                        accessible={false}
                        source={metro_gate}
                        style={{ position: 'absolute', top: 230, right: -40, transform: [{ rotateY: '180deg' }] }}
                    />
                    <Animated.View
                        entering={SlideInUp.delay(350).springify().damping(28).stiffness(650)}
                        style={[tailwind.style(''), { top: Platform.OS === 'ios' ? 107 - top + 16 : top + 40 }]}>
                        {mode === 'metro' ? (
                            <GateInfo floating={true} {...props.gateInfo} />
                        ) : (
                            <SuburbanExitInfo exitSide={props.gateInfo.gateSide} />
                        )}
                    </Animated.View>
                </>
            ) : null}
        </Animated.View>
    );
};

export const InStationBackground = (props: {
    onPressExit: () => void;
    metroPreboardingProps: PreboardingMetroProps;
    onPressStatusBadge: () => void;
    journeyId: JourneyId;
}) => {
    const { top } = useSafeAreaInsets();
    return (
        <Animated.View style={tailwind.style('flex-1 bg-white', `pt-[${top ? top : 16}px]`)}>
            <LiveJourneyHeader onPressExit={props.onPressExit} onPressStatusBadge={props.onPressStatusBadge} />
            <PreboardingMetro {...props.metroPreboardingProps} journeyId={props.journeyId} />
            {/* <Animated.View style={tailwind.style('relative', ``)}>
                <Animated.Image
                    resizeMode={'contain'}
                    source={require('../../../../../assets/3D-assets/mt_ic_station_zone.webp')}
                    style={[tailwind.style('w-[820px] h-[240px]'), { top: 107 - top + 16, left: -110 }]}
                />
            </Animated.View> */}
        </Animated.View>
    );
};

export const InBusBackground = () => {
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVideoReady(true);
        }, 500); // 0.5 seconds delay

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={tailwind.style('flex-1')}>
            <VideoPlayer
                source={{
                    uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vids/1754768710362.mp4',
                }}
                videoRef={undefined}
                shouldLoop={false}
                onBuffer={() => {}}
                onError={() => {}}
                resizeMode="cover"
                style={tailwind.style('h-full w-full')}
                containerStyle={undefined}
                fallbackElement={
                    <Image
                        accessible={false}
                        source={BusStopBufferingImg}
                        resizeMode="cover"
                        style={tailwind.style('w-full h-full')}
                    />
                }
                bufferingElement={
                    <Image
                        accessible={false}
                        source={BusStopBufferingImg}
                        resizeMode="cover"
                        style={tailwind.style('w-full h-full')}
                    />
                }
                onVideoEnd={undefined}
                autoPlay={undefined}
                bufferConfig={undefined}
                pauseVideo={!isVideoReady}
                videoControls={undefined}
                onStateChange={undefined}
                muted={undefined}
                bufferingDelay={undefined}
                enableNetworkOptimizations={undefined}
                networkOptimizationConfig={undefined}
                bufferingElementStyle={undefined}
                enablePauseOnGesture={undefined}
                showMuteControl={undefined}
                muteControlStyle={undefined}
                onGesturePress={undefined}
                handleMuteToggle={undefined}
                disableFocus={true}
                ignoreSilentSwitch={'obey'}
                preventsDisplaySleepDuringVideoPlayback={false}
            />
        </Animated.View>
    );
};
