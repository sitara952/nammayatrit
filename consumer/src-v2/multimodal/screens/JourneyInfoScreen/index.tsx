import React, { useRef, useState, useEffect } from 'react';
import JourneyDetail_ from './Flow.tsx';
import MapProvider from '@/typescript/Maps/MapProvider.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectCurrentLocation, selectAppConfig } from '@/typescript/state/client/session.ts';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen.tsx';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen.tsx';
import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Image } from 'react-native';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import MetroStationBufferImg from '@/src-v2/assets/mt_ic_metro_station.webp';
import { VideoRef } from 'react-native-video';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';

export type JourneyDetailsProps = {
    destinationStop: transportStation | undefined;
    originStop: transportStation | undefined;
    recentLocationId: string | undefined;
    routeCode: string | undefined;
    startTime: string | undefined;
    vehicleType: VehicleCategory_vehicleCategory | undefined;
    serviceableStartTime: string | undefined;
    otp: string | undefined;
    routeCodeEditedManually: boolean | undefined;
    isSingleModeMetro: boolean;
};

export const emptyJourneyDetailsProps: JourneyDetailsProps = {
    destinationStop: undefined,
    originStop: undefined,
    recentLocationId: undefined,
    routeCode: undefined,
    startTime: undefined,
    vehicleType: undefined,
    serviceableStartTime: undefined,
    otp: undefined,
    routeCodeEditedManually: undefined,
    isSingleModeMetro: false,
};

const MetroVideoBackground: React.FC = () => {
    const videoRef = useRef<VideoRef | null>(null);
    const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRenderVideo(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={tailwind.style('flex-1 bg-[#217639] relative')}>
            <Animated.View style={tailwind.style('absolute inset-0')}>
                {shouldRenderVideo ? (
                    <VideoPlayer
                        source={{
                            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vids/1754768764921.mp4',
                        }}
                        videoRef={videoRef}
                        shouldLoop={false}
                        onBuffer={() => {}}
                        onError={() => {}}
                        onVideoEnd={undefined}
                        resizeMode="cover"
                        style={tailwind.style('h-full w-full')}
                        containerStyle={undefined}
                        fallbackElement={
                            <Image
                                accessible={true}
                                accessibilityLabel="metro station buffer"
                                resizeMode="cover"
                                source={MetroStationBufferImg}
                                style={tailwind.style('w-full h-full')}
                            />
                        }
                        bufferingElement={
                            <Image
                                accessible={true}
                                accessibilityLabel="metro station buffer"
                                resizeMode="cover"
                                source={MetroStationBufferImg}
                                style={tailwind.style('w-full h-full')}
                            />
                        }
                        autoPlay={undefined}
                        bufferConfig={undefined}
                        pauseVideo={false}
                        videoControls={undefined}
                        onStateChange={undefined}
                        muted={undefined}
                        bufferingDelay={undefined}
                        enableNetworkOptimizations={true}
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
                ) : (
                    <Image
                        accessible={true}
                        accessibilityLabel="metro station buffer"
                        resizeMode="cover"
                        source={MetroStationBufferImg}
                        style={tailwind.style('w-full h-full')}
                    />
                )}
            </Animated.View>
        </View>
    );
};

const JourneyDetail: React.FC<JourneyDetailsProps> = navigationProps => {
    const currentLocation = useAppSelector(selectCurrentLocation);
    const appConfig = useAppSelector(selectAppConfig);
    const route = useRoute<RouteProp<{ params: JourneyDetailsProps }, 'params'>>();
    const props = route.params ? route.params : navigationProps;

    if (props?.isSingleModeMetro) {
        return (
            <View style={tailwind.style('flex-1')}>
                <MetroVideoBackground />
                <View style={tailwind.style('absolute inset-0')}>
                    <JourneyDetail_ {...props} />
                </View>
            </View>
        );
    }

    const appInitialCoordinate = appConfig.merchantData.initialCoordinate;

    return (
        <MapProvider
            initialCoordinate={{
                latitude: currentLocation?.lat ?? appInitialCoordinate.latitude,
                longitude: currentLocation?.lng ?? appInitialCoordinate.longitude,
            }}
            mapId="JourneyInfoMap"
            fitToMapElementFlag={false}>
            <JourneyDetail_ {...props} />
        </MapProvider>
    );
};

export default JourneyDetail;
