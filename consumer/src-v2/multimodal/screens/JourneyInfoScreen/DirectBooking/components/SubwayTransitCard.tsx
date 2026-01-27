import trainImage from '@/src-v2/assets/mt_ic_multimodal_train_alternate.webp';
import { UpArrowDown, UpArrowVersionTwo } from '@/src-v2/multimodal/components/svg/Arrows';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import { isUndefined } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInRight } from 'react-native-reanimated';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
// import { ChevronRight } from '../../../../components/svg/ChevronRight';
// import { DirectBusBookingProps } from '../Flow';
import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen';
import { FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import Svg, { Path } from 'react-native-svg';
import { getIconFromType } from '../../../JourneyInfoScreen/components/TransitIconWrapper';
import { formatArrivalTime } from '../../utils';
import { ShimmerEffect } from './SourceDestinationCard';
import { ActivityIndicator, ViewStyle } from 'react-native';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { RouteOptionCardProps } from '../../components/RouteOptionCard';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { DisclaimerBox } from '../../components/DisclaimerBox';

type SubwayTransitCardProps = {
    trainData: {
        typeText: string;
        codeText: string;
        arrivalText: string;
        departureText: string;
        classTypeText: string;
        onClassTypePress: (legTier: availableRoutesByTier) => void;
        routeShortName: string;
        sourceStation: string;
        selectedServiceTier: legServiceTier | undefined;
        transformViaPointName: (via: string | undefined) => string | undefined;
        onViaChangePress: () => void;
    };
    onViewTimetable: () => void;
    vehicleTierOptionsResp: legServiceTierOptionsResp | undefined;
    onTrainClassChange: (newClass: FRFSServiceTierType_fRFSServiceTierType) => void;
    nextTwoArrivalTimes: number[] | undefined;
    firstArrivalTime: string | undefined;
    isLoadingData: boolean;
    routeInfo: legRouteInfo[] | undefined;
    transformedRouteOptions: RouteOptionCardProps[] | undefined;
    isConfirmingJourney: boolean;
    isLoading: boolean;
};

export const SubwayTransitCard: React.FC<SubwayTransitCardProps> = ({
    trainData,
    onViewTimetable = () => {},
    vehicleTierOptionsResp,
    routeInfo,
    nextTwoArrivalTimes = [],
    isLoadingData,
    transformedRouteOptions,
    isConfirmingJourney,
    isLoading,
}) => {
    const [trainClass, setTrainClass] = useState<FRFSServiceTierType_fRFSServiceTierType | undefined>(
        trainData?.selectedServiceTier?.serviceTierType,
    );
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useEffect(() => {
        setTrainClass(trainData?.selectedServiceTier?.serviceTierType);
    }, [trainData?.selectedServiceTier?.serviceTierType]);

    const handleClassToggle = () => {
        const newClass = trainClass === 'FIRST_CLASS' ? 'SECOND_CLASS' : 'FIRST_CLASS';

        const legTier = vehicleTierOptionsResp?.options?.find(
            option => option.serviceTier === newClass && option.via === trainData?.selectedServiceTier?.via,
        );

        if (legTier) {
            setTrainClass(newClass);
            trainData?.onClassTypePress?.(legTier);
        }
    };

    const otherClassOptionAvailable = useMemo(() => {
        const unselectedClass = trainClass === 'FIRST_CLASS' ? 'SECOND_CLASS' : 'FIRST_CLASS';
        return !isUndefined(
            vehicleTierOptionsResp?.options.find(
                viaOption =>
                    viaOption.serviceTier === unselectedClass && viaOption.via === trainData?.selectedServiceTier?.via,
            ),
        );
    }, [vehicleTierOptionsResp?.options, trainClass, trainData.selectedServiceTier?.via]);

    const routeInfoLength = routeInfo?.length ?? 0;
    const transformedRouteOptionsLength = transformedRouteOptions?.length ?? 0;

    return (
        <>
            <Animated.View style={tailwind.style('bg-white rounded-[20px] border border-[#F1F2F2]  mt-4')}>
                <Animated.View style={tailwind.style('flex-1 flex-row justify-between')}>
                    <Animated.View style={tailwind.style('flex-1 p-[20px]')} layout={LinearTransition}>
                        <Animated.View style={tailwind.style('flex-row items-center')} layout={LinearTransition}>
                            <Animated.Text
                                layout={LinearTransition}
                                style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                {userLanguageStrings.TrainType(trainData?.typeText || '')}
                            </Animated.Text>
                        </Animated.View>

                        <>
                            <Pressable
                                testID="6c599b05-a746-47b5-8ec8-cb1d24d85401"
                                style={tailwind.style(
                                    'bg-[#F4F4F4] rounded-[10px] p-[11px] mt-[20px] flex-row items-center justify-between',
                                )}
                                onPress={handleClassToggle}
                                accessibilityRole="button"
                                disabled={
                                    isLoading ||
                                    isLoadingData ||
                                    !vehicleTierOptionsResp?.options ||
                                    vehicleTierOptionsResp.options.length <= 1
                                }
                                accessibilityLabel={`Change train class button`}>
                                {trainClass === 'FIRST_CLASS' ? (
                                    <Animated.Text
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={tailwind.style(
                                            'text-[#5A5A5A] text-[12px] font-areaNormal-extrabold pr-1',
                                        )}>
                                        {userLanguageStrings.FirstClass + ' (l)'}
                                    </Animated.Text>
                                ) : null}
                                {trainClass === 'SECOND_CLASS' ? (
                                    <Animated.Text
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={tailwind.style(
                                            'text-[#5A5A5A] text-[12px] font-areaNormal-extrabold pr-1',
                                        )}>
                                        {userLanguageStrings.SecondClass + ' (ll)'}
                                    </Animated.Text>
                                ) : null}
                                {isUndefined(trainData?.selectedServiceTier) ||
                                    (isUndefined(trainClass) && (
                                        <ShimmerEffect
                                            style={tailwind.style('w-[5x] h-[12px]')}
                                            height={12}
                                            width={5}
                                        />
                                    ))}
                                <Animated.View>
                                    <Icon
                                        icon={<UpArrowVersionTwo fill={undefined} />}
                                        size={8}
                                        color="#3B3A3C"
                                        style={{
                                            opacity: !otherClassOptionAvailable
                                                ? 0.5
                                                : trainClass === 'FIRST_CLASS'
                                                  ? 0.5
                                                  : 1,
                                        }}
                                    />
                                    <Icon
                                        icon={<UpArrowDown fill={undefined} />}
                                        size={8}
                                        color="#3B3A3C"
                                        style={{
                                            opacity: !otherClassOptionAvailable
                                                ? 0.5
                                                : trainClass === 'FIRST_CLASS'
                                                  ? 1
                                                  : 0.5,
                                        }}
                                    />
                                </Animated.View>
                            </Pressable>
                            <Animated.View
                                layout={LinearTransition.springify().damping(24).stiffness(240)}
                                entering={FadeIn}
                                style={tailwind.style('pt-[20px]')}>
                                <Animated.Text
                                    numberOfLines={2}
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold text-[#656565] capitalize mb-[12px]',
                                    )}>
                                    {userLanguageStrings.ArrivesAtStation(trainData?.sourceStation || '')}
                                </Animated.Text>
                                <Animated.View
                                    style={tailwind.style('flex-wrap min-w-[300px] flex-row gap-2 items-center')}>
                                    {nextTwoArrivalTimes?.map((timeInMinutes, index) => (
                                        <Animated.View
                                            key={index}
                                            style={tailwind.style('py-[5px] px-[6px] rounded-[6px] bg-[#F4F4F4]')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    `text-white font-extrabold text-[12px] ${
                                                        timeInMinutes < 30 ? 'text-[#097B42]' : 'text-[#FF7301]'
                                                    }`,
                                                )}>
                                                {formatArrivalTime(timeInMinutes, userLanguageStrings)}
                                            </Animated.Text>
                                        </Animated.View>
                                    ))}
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={onViewTimetable}
                                        accessibilityLabel={`Time Table button`}
                                        testID={'track-bus-button'}
                                        style={tailwind.style('ml-1')}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Animated.Text
                                            style={tailwind.style('text-[14px] font-bold underline text-[#016ACD]')}>
                                            {userLanguageStrings.TimeTable}
                                        </Animated.Text>
                                    </Pressable>
                                </Animated.View>
                            </Animated.View>
                        </>
                    </Animated.View>
                    <Animated.View>
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="train image"
                            layout={LinearTransition}
                            entering={SlideInRight.delay(500)}
                            style={tailwind.style('w-[136px] h-[151px]')}
                            source={trainImage}
                        />
                    </Animated.View>
                </Animated.View>
                {(routeInfoLength > 1 || transformedRouteOptionsLength > 1) && (
                    <Divider
                        direction="horizontal"
                        type={undefined}
                        style={tailwind.style('mx-4')}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                )}
                {/* {viaStations && viaStations.length > 0 && (
                    <Animated.View
                        layout={LinearTransition.springify().damping(24).stiffness(240)}
                        entering={FadeIn}
                        style={tailwind.style('p-[20px] flex-row items-center justify-between')}>
                        <Animated.View style={tailwind.style('flex-row items-center flex-1')}>
                            {viaStations.length === 0 ||
                            isUndefined(trainData?.selectedServiceTier?.via) ||
                            trainData?.selectedServiceTier?.via.trim() === '' ? (
                                <>
                                    <Icon icon={<TrainIcon fill={'#09941E'} />} size={16} color="#09941E" />
                                    <Animated.Text
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold text-[#656565] pl-[8px] flex-1',
                                        )}>
                                        Direct Train
                                    </Animated.Text>
                                </>
                            ) : (
                                <>
                                    <ViaPointIcon />
                                    <Animated.Text
                                        numberOfLines={2}
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold text-[#656565] pl-[8px] flex-1',
                                        )}>
                                        Via: {viaStations.join(' → ')}
                                    </Animated.Text>
                                </>
                            )}
                        </Animated.View>
                        {!isUndefined(transformedRouteOptions) ? (
                            transformedRouteOptions?.length && transformedRouteOptions.length > 1 ? (
                                <Pressable
                                    accessibilityRole="button"
                                    testID="change-via-button"
                                    onPress={trainData?.onViaChangePress}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-bold underline text-[#016ACD]')}>
                                        Change
                                    </Animated.Text>
                                </Pressable>
                            ) : null
                        ) : (
                            <ActivityIndicator size="small" color="#016ACD" />
                        )}
                    </Animated.View>
                )} */}
                {(routeInfoLength > 1 || transformedRouteOptionsLength > 1) && (
                    <ExtendedInfo
                        routes={routeInfo || []}
                        onViaChangePress={trainData?.onViaChangePress}
                        viewStyle={{}}
                        isConfirmingJourney={isConfirmingJourney}
                        canChange={transformedRouteOptionsLength > 1}
                    />
                )}
            </Animated.View>
            <DisclaimerBox legmode="Subway" serviceTiers={undefined} />
            {/* <Pressable
                testID="change-train-type-button"
                onPress={() => {
                    trainData?.onClassTypePress?.();
                }}
               >
                <Animated.View style={tailwind.style('flex-row items-center justify-center gap-[6px] pt-[19px]')}>
                    <Animated.Text
                        style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]  text-center')}>
                        Change Train Type
                    </Animated.Text>
                    <Icon icon={<ChevronRight />} size={8} color="#3B3A3C" />
                </Animated.View>
            </Pressable> */}
        </>
    );
};

interface ViaInfoProps {
    current: string | undefined;
    next: string | undefined;
    switchStation: boolean;
}

type ExtendedInfoProps = {
    routes: legRouteInfo[];
    onViaChangePress: () => void;
    viewStyle: ViewStyle;
    canChange: boolean | undefined;
    isConfirmingJourney: boolean;
};
export const ExtendedInfo = ({
    routes,
    onViaChangePress,
    viewStyle,
    canChange,
    isConfirmingJourney,
}: ExtendedInfoProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const viaStations = useMemo(
        () =>
            routes.reduce((acc: string[], routeDetails, index) => {
                const fromStopName = routeDetails.originStop.name;
                const toStationName = routeDetails.destinationStop.name;
                const nextStopFrom = routes.at(index + 1)?.originStop.code;
                if (fromStopName && index !== 0) {
                    acc = [...acc, fromStopName];
                }
                if (
                    toStationName &&
                    routeDetails.destinationStop.code !== nextStopFrom &&
                    index !== (routes.length ?? 0) - 1
                ) {
                    acc = [...acc, toStationName];
                }
                return acc;
            }, []),
        [routes],
    );

    const processedRoutes: ViaInfoProps[] = useMemo(
        () =>
            routes
                .map((route, index) => {
                    const nextRoute = routes.at(index + 1);
                    const current = nextRoute ? nextRoute.originStop.name : route.originStop.name;
                    const next = nextRoute ? nextRoute.destinationStop.name : route.destinationStop.name;
                    const switchStation = nextRoute ? route.destinationStop.code !== nextRoute.originStop.code : false;
                    return {
                        current,
                        next,
                        switchStation,
                    };
                })
                .filter((route, index, self) => {
                    const duplicateIndex = self.findIndex(r => r.current === route.current && r.next === route.next);
                    return duplicateIndex === index && route.switchStation;
                }),
        [routes],
    );

    const getSwitchHeader = (isSwitchStation: boolean | undefined) => {
        if (isSwitchStation) return userLanguageStrings.WalkTo;
        else return userLanguageStrings.SwitchAt;
    };

    const getSwitchDescription = (station: ViaInfoProps | undefined) => {
        if (station?.switchStation)
            return userLanguageStrings.StationAndTakeTrainTo(station?.current || '', station?.next || '');
        else return userLanguageStrings.StationIfDirectTrainNotAvailable(station?.current || '', station?.next || '');
    };

    return (
        <Animated.View style={[tailwind.style('py-[20px]'), viewStyle]}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between px-[20px]')}>
                <Animated.View style={tailwind.style('flex-1 mr-1')}>
                    {(canChange || viaStations.length > 0) && (
                        <Animated.View style={tailwind.style('flex-row flex-wrap items-center')}>
                            <Animated.Text
                                accessible={true}
                                accessibilityLabel="Via stations"
                                accessibilityRole="text"
                                style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#656565]')}>
                                {`${viaStations.length > 0 ? userLanguageStrings.Via : userLanguageStrings.DirectTrain}`}
                            </Animated.Text>
                            {viaStations.map((station, index) => (
                                <Animated.View key={index} style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        accessible={true}
                                        accessibilityLabel={`Via station: ${station}`}
                                        accessibilityRole="text"
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold text-[#656565] capitalize',
                                        )}>
                                        {station}
                                    </Animated.Text>
                                    {index < viaStations.length - 1 && (
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] font-inter-extrabold text-[#656565] mx-1',
                                            )}>
                                            →
                                        </Animated.Text>
                                    )}
                                </Animated.View>
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>
                {isConfirmingJourney ? (
                    <ActivityIndicator size="small" color="#016ACD" />
                ) : canChange ? (
                    <Pressable
                        testID="change-via-button1"
                        onPress={onViaChangePress}
                        accessible={true}
                        accessibilityLabel="Change via stations"
                        accessibilityRole="button"
                        accessibilityHint="Double tap to change the via stations for this route"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Animated.Text style={tailwind.style('text-[14px] font-bold underline text-[#3B3A3C]')}>
                            {userLanguageStrings.Change}
                        </Animated.Text>
                    </Pressable>
                ) : null}
            </Animated.View>
            {processedRoutes.length === 1 ? (
                <Animated.View style={tailwind.style('pt-5 px-[20px]')}>
                    <Animated.View
                        accessible={true}
                        accessibilityLabel="Route visualization: Subway, Walk, Subway"
                        accessibilityRole="text"
                        style={tailwind.style('flex-row items-center gap-2')}>
                        {getIconFromType('Subway', 16, '#09941E')}
                        <Animated.View style={tailwind.style('h-[18px] bg-[#EFEFEF] flex-1 rounded-md')} />
                        {getIconFromType('Walk', 16, '#3B3A3C')}
                        <Animated.View style={tailwind.style('h-[18px] bg-[#EFEFEF] flex-1 rounded-md')} />
                        {getIconFromType('Subway', 16, '#09941E')}
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-row justify-between items-center pt-4')}>
                        <Animated.Text
                            accessible={true}
                            accessibilityLabel={`${getSwitchHeader(processedRoutes.at(0)?.switchStation)} ${processedRoutes.at(0)?.current} station`}
                            accessibilityRole="text"
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px] leading-[14px] flex-1 text-center',
                            )}>
                            {`${getSwitchHeader(processedRoutes.at(0)?.switchStation)} `}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-row justify-center items-center pt-1.5 w-1/2 mx-auto')}>
                        <Animated.Text
                            accessible={true}
                            accessibilityLabel={`${processedRoutes.at(0)?.current} station and take train to ${processedRoutes.at(0)?.next}`}
                            accessibilityRole="text"
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#3B3A3C] tracking-[0.2px] leading-[14px] flex-1 text-center',
                            )}>
                            {getSwitchDescription(processedRoutes.at(0))}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            ) : null}
            {processedRoutes.length > 1 ? (
                <Animated.ScrollView
                    contentContainerStyle={tailwind.style('px-[20px] pt-5')}
                    horizontal
                    showsHorizontalScrollIndicator={false}>
                    {processedRoutes.map((station, index) => (
                        <Animated.View style={tailwind.style('')}>
                            <Animated.View style={tailwind.style('')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    {getIconFromType('Subway', 18, '#09941E')}
                                    <Animated.View
                                        style={tailwind.style('h-[18px] bg-[#EFEFEF] flex-1 rounded-md mx-2')}
                                    />
                                    {getIconFromType('Walk', 18, '#3B3A3C')}
                                    <Animated.View
                                        style={tailwind.style('h-[18px] bg-[#EFEFEF] flex-1 rounded-md mx-2')}
                                    />
                                    {index === processedRoutes.length - 1 && (
                                        <Icon icon={<FinalLocation />} size={18} color="#7E7E7E" />
                                    )}
                                </Animated.View>
                            </Animated.View>
                            <Animated.View
                                style={tailwind.style(
                                    ' pt-4 justify-center items-center',
                                    index !== processedRoutes.length - 1 ? 'ml-[28px]' : 'ml-[28px] mr-[18px]',
                                )}>
                                <Animated.View
                                    style={tailwind.style('flex-row justify-center items-center pt-1.5 mx-auto')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold text-[#3B3A3C] tracking-[0.2px] max-w-1/2 leading-[14px] flex-1 text-center',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] font-areaNormal-extrabold text-[#969696] tracking-[0.2px] leading-[14px] flex-1 text-center',
                                            )}>
                                            {`${getSwitchHeader(station.switchStation)} \n`}
                                        </Animated.Text>
                                        {getSwitchDescription(station)}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    ))}
                </Animated.ScrollView>
            ) : null}
        </Animated.View>
    );
};

const FinalLocation = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <Path
                d="M17.6468 5.33441C14.5264 2.22186 9.45905 2.22186 6.33867 5.33441C3.2183 8.44695 3.2183 13.4887 6.35157 16.6013L10.7614 21H13.2499L17.6597 16.6013C20.7801 13.4887 20.7801 8.43408 17.6597 5.32154L17.6468 5.33441ZM13.0436 13.8746H11.0966L8.11806 10.1576L9.62668 8.94855L12.025 11.9325H12.141L14.6941 8.92283L16.164 10.1704L13.0307 13.8617L13.0436 13.8746Z"
                fill="#7E7E7E"
            />
        </Svg>
    );
};
