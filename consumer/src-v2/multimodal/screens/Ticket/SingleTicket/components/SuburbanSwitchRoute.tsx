import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { TrainIcon, WalkIcon } from '@/src-v2/multimodal/components/svg/transport';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { memo, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type JourneyRouteTypes = {
    type: 'SWITCH_STATION_START_JOURNEY' | 'NON_SWITCH_STATION_START_JOURNEY' | 'WALK' | 'DESTINATION_JOURNEY';
    sourceStation: string | undefined;
    sourceStationRegional: string | undefined;
    destinationStation: string | undefined;
    destinationStationRegional: string | undefined;
    platformNumber: string | undefined;
    isChangeStation: boolean | undefined;
    lineColor: (string | undefined)[] | undefined;
    lastStop: string | undefined;
    towardsStation: string | undefined;
    allLastStops: string[] | undefined;
    allTowardsStations: string[] | undefined;
};

export type SuburbanSwitchRouteProps = {
    journeyRoutes: Array<JourneyRouteTypes>;
};

const JourneyRouteItem = memo(({ journeyRoute, index }: { journeyRoute: JourneyRouteTypes; index: number }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const iconLogic = useCallback((type: JourneyRouteTypes['type']) => {
        switch (type) {
            case 'SWITCH_STATION_START_JOURNEY':
            case 'NON_SWITCH_STATION_START_JOURNEY':
                return <TransitArrowRight />;
            case 'WALK':
                return <WalkIcon />;
            case 'DESTINATION_JOURNEY':
                return <TrainIcon />;
        }
    }, []);

    const renderSource = useCallback((journeyRoute: JourneyRouteTypes) => {
        switch (journeyRoute?.type) {
            case 'SWITCH_STATION_START_JOURNEY':
            case 'NON_SWITCH_STATION_START_JOURNEY':
                return (
                    <Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] leading-[13px]',
                            )}>
                            {userLanguageStrings.Source}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[14px] pt-[12px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C]',
                            )}>
                            {journeyRoute?.sourceStation}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] pt-[9px] font-areaNormal-extrabold text-[#595959] leading-[13px]',
                            )}>
                            {journeyRoute?.sourceStationRegional}
                        </Animated.Text>
                    </Animated.View>
                );
            case 'WALK':
                return (
                    <Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] leading-[13px]',
                            )}>
                            {journeyRoute?.isChangeStation
                                ? userLanguageStrings.WalkTo
                                : userLanguageStrings.SwitchIfDirectTrainNotAvailable}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[14px] pt-[12px] leading-[15px] font-areaNormal-extrabold text-[#656565]',
                            )}>
                            {journeyRoute?.sourceStation}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] pt-[9px] font-areaNormal-extrabold text-[#656565] leading-[13px]',
                            )}>
                            {journeyRoute?.sourceStationRegional}
                        </Animated.Text>
                    </Animated.View>
                );

            case 'DESTINATION_JOURNEY':
                return (
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] leading-[13px] pb-[109px]',
                        )}>
                        {userLanguageStrings.TakeTrainFrom(journeyRoute?.sourceStation || '')}
                    </Animated.Text>
                );

            default:
                return null;
        }
    }, []);

    return (
        <Animated.View key={index} style={tailwind.style('pt-[18px] flex-row gap-[13px]')}>
            <Animated.View
                style={tailwind.style(
                    'w-[16px] h-full rounded-[6px] flex-row justify-center',
                    journeyRoute?.type === 'SWITCH_STATION_START_JOURNEY' ? 'bg-[#FFE688] items-end ' : '',
                    journeyRoute?.type === 'NON_SWITCH_STATION_START_JOURNEY' ? 'bg-[#C6E4B7] items-end ' : '',
                    journeyRoute?.type === 'WALK' ? 'bg-[#EFEFEF] items-center ' : '',
                    journeyRoute?.type === 'DESTINATION_JOURNEY' ? 'bg-[#C6E4B7] items-start ' : '',
                )}>
                <Icon
                    icon={iconLogic(journeyRoute?.type)}
                    size={10}
                    color="#969696"
                    style={tailwind.style('mb-1.5 mt-1.5')}
                />
            </Animated.View>
            <Animated.View
                style={tailwind.style('py-[4px]', {
                    'py-[25px]': journeyRoute?.type === 'WALK',
                })}>
                {renderSource(journeyRoute)}
                {journeyRoute?.type !== 'DESTINATION_JOURNEY' && <Animated.View style={tailwind.style('mt-4')} />}
                {journeyRoute?.platformNumber && (
                    <Animated.View
                        style={tailwind.style('pb-[63px]', {
                            'pb-[0px]': journeyRoute?.type === 'WALK',
                        })}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] pt-[12px] font-departureMono-regular text-[#7E7E7E] leading-[13px]',
                            )}>
                            {userLanguageStrings.Platform}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[14px] pt-[4px] leading-[15px] font-areaNormal-extrabold text-[#3B3A3C]',
                            )}>
                            {journeyRoute?.platformNumber}
                        </Animated.Text>
                    </Animated.View>
                )}
                {journeyRoute?.destinationStation && (
                    <Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center gap-[4px]')}>
                            {journeyRoute?.type === 'DESTINATION_JOURNEY' ? (
                                <Icon icon={<TransitArrowRight />} size={12} color="#838185" />
                            ) : null}
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] leading-[13px]',
                                )}>
                                {journeyRoute?.type === 'DESTINATION_JOURNEY'
                                    ? userLanguageStrings.Destination
                                    : userLanguageStrings.GoTo}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[14px] pt-[12px] leading-[15px] font-areaNormal-extrabold ',
                                journeyRoute?.type === 'DESTINATION_JOURNEY' ? 'text-[#3B3A3C]' : 'text-[#656565]',
                            )}>
                            {journeyRoute?.destinationStation}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] pt-[9px] font-areaNormal-extrabold leading-[13px]',
                                journeyRoute?.type === 'DESTINATION_JOURNEY' ? 'text-[#3B3A3C]' : 'text-[#656565]',
                            )}>
                            {journeyRoute?.destinationStationRegional}
                        </Animated.Text>
                    </Animated.View>
                )}
            </Animated.View>
        </Animated.View>
    );
});

function SuburbanSwitchRoute({ journeyRoutes = [] }: SuburbanSwitchRouteProps) {
    return journeyRoutes.map((journeyRoute, index) => (
        <JourneyRouteItem key={`${journeyRoute?.type}-${index}`} journeyRoute={journeyRoute} index={index} />
    ));
}

export default memo(SuburbanSwitchRoute);
