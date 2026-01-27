import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import busTransit from '@/src-v2/assets/3D-assets/full-asset/bus_transit.webp';
import metroTransit from '@/src-v2/assets/3D-assets/full-asset/metro_transit.webp';
import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainServiceCard } from './Components/MainServiceCard';
import { NearbyBusStop } from './Components/NearbyBusStop';
import { PublicServiceCard } from './Components/PublicServiceCard';
import { ServicesTabScreenProps } from './Types';
import { PrivateServiceCard } from './Components/PrivateServiceCard';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { NammaTransitVideoBottomSheet } from '@/typescript/components/ny-service/NammaTransitVideoBottomSheet';
import { useRefsContext } from '@/typescript/context/RefsContext';

const BackgroundPlaceholder = () => {
    return (
        <Animated.View
            style={[tailwind.style('relative z-10'), { transform: [{ translateY: -300 }, { translateX: 100 }] }]}>
            <Animated.Image
                accessible={false}
                source={busTransit}
                style={[tailwind.style('absolute', `-left-[370px] -top-[10px]`, 'w-[743px] h-[733px]'), {}]}
                resizeMode="cover"
            />
            <Animated.Image
                accessible={false}
                source={metroTransit}
                style={[tailwind.style('absolute', '-top-[214px] -left-[120px]', 'w-[892px] h-[892px]'), {}]}
                resizeMode="cover"
            />
            {/* <Animated.Image
                source={autoTransit}
                style={[tailwind.style('absolute', 'top-[90px] -left-[50px]', 'w-[864px] h-[796px]'), {}]}
                resizeMode="cover"
            /> */}
        </Animated.View>
    );
};

const ServicesTabScreen: React.FC<ServicesTabScreenProps> = props => {
    const { nearestBusStop, busList } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { top } = useSafeAreaInsets();

    const busStopName = useMemo(() => {
        if (!nearestBusStop) return '';
        return nearestBusStop.name;
    }, [nearestBusStop]);
    const { nammaTransitVideoBottomSheetModalRef } = useRefsContext();

    return (
        <HardwareBackpressHandler>
            <>
                <Animated.View style={tailwind.style('flex-1 bg-[#F7F7F7]')}>
                    <BackgroundPlaceholder />
                    <Animated.ScrollView
                        style={tailwind.style('z-10')}
                        contentContainerStyle={tailwind.style('z-10', `pt-[${top + 10}px] pb-4`)}>
                        <Animated.View style={{ paddingTop: 125 }}>
                            {!props.mainServiceCardConfig && props.publicServices.length === 0 ? null : (
                                <>
                                    <Typography
                                        type={'callout-1'}
                                        style={{
                                            marginHorizontal: 16,
                                            marginBottom: props.mainServiceCardConfig ? 16 : 0,
                                            fontSize: 15,
                                        }}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Public}
                                    </Typography>
                                    <NearbyBusStop stopName={busStopName} busList={busList} />
                                    {props.mainServiceCardConfig && (
                                        <MainServiceCard
                                            quickStops={props.quickStops}
                                            {...props.mainServiceCardConfig}
                                        />
                                    )}
                                    {props.publicServices.length === 0 ? null : (
                                        <Animated.View
                                            style={tailwind.style(
                                                'flex-row flex-wrap pt-5 px-4 justify-between gap-6',
                                            )}>
                                            {props.publicServices.map(service => (
                                                <PublicServiceCard
                                                    key={service.serviceTag}
                                                    title={service.title}
                                                    subtitle={service.subtitle}
                                                    image={service.imgSrc}
                                                    serviceTag={service.serviceTag}
                                                    testID={`service_tab_service_${service.serviceTag}`}
                                                    onPress={service.onPress}
                                                />
                                            ))}
                                        </Animated.View>
                                    )}
                                </>
                            )}
                            {props.privateServices.length === 0 ? null : (
                                <>
                                    <Typography
                                        type={'callout-1'}
                                        style={{ marginHorizontal: 16, marginTop: 24, fontSize: 15 }}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Private}
                                    </Typography>
                                    <Animated.View style={tailwind.style('flex-wrap flex-row pt-5 px-4 gap-6')}>
                                        {props.privateServices.map(service => (
                                            <PrivateServiceCard
                                                key={service.serviceTag}
                                                testID={`service_tab_service_${service.serviceTag}`}
                                                serviceTag={service.serviceTag}
                                                title={service.label}
                                                subtitle=""
                                                imgSrc={service.imgSrc}
                                                onClick={service.onClick}
                                            />
                                        ))}
                                    </Animated.View>
                                </>
                            )}
                        </Animated.View>
                    </Animated.ScrollView>
                </Animated.View>
                <NammaTransitVideoBottomSheet sheetRef={nammaTransitVideoBottomSheetModalRef} />
            </>
        </HardwareBackpressHandler>
    );
};

export default ServicesTabScreen;
