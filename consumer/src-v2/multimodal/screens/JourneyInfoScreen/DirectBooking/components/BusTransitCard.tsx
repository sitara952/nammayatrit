import React from 'react';
import Animated, { FadeIn, LinearTransition, SlideInRight } from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { ChevronRight } from '../../../../components/svg/ChevronRight';
import { getIconFromType } from '../../components/TransitIconWrapper';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';
import { SourceType_sourceType } from '@/readOnly/api/types/Enums.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import mtIcAcService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { MemoizedNewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import SingleModeBusSourceChangePopUp from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/SingleModeBusSourceChangePopUp';
import { DisclaimerBox } from '../../components/DisclaimerBox';

export const removeWordBuses = (serviceTierName: string | undefined): string => {
    if (!serviceTierName) return '';

    // First trim the string to remove any leading/trailing whitespace
    const trimmedName = serviceTierName?.trim();

    // Case insensitive replacement of 'buses' with any amount of whitespace
    // Will match: 'BUSES', 'buses', 'Buses', 'BuSeS'
    return trimmedName
        .replace(/\s+buses\s*/gi, ' ') // Replace 'buses' in the middle with a single space
        .replace(/\s+buses$/gi, '') // Remove 'buses' at the end
        .trim(); // Final trim to clean up any remaining whitespace
};

type BusTransitCardProps = {
    number: string | undefined;
    description: string;
    onChangeBusType: () => void;
    selectedServiceTier: legServiceTier | undefined;
    onTrackBusOrTimeTable: () => void;
    sourceType: SourceType_sourceType | undefined;
    nextArrivalTimeInSeconds: number[] | undefined;
    sourceStopName: string | undefined;
    appName: string;
    timeTableProps: NewTimeTableUIProps | undefined;
    handleOnConfirm: () => void | undefined;
    isSingleMode: boolean | undefined;
    showSourceChangePopup: boolean;
    setShowSourceChangePopup: React.Dispatch<React.SetStateAction<boolean>>;
};

export const BusTransitCard: React.FC<BusTransitCardProps> = ({
    number,
    description,
    onChangeBusType,
    selectedServiceTier,
    onTrackBusOrTimeTable,
    sourceType,
    nextArrivalTimeInSeconds,
    sourceStopName,
    appName,
    timeTableProps,
    handleOnConfirm,
    isSingleMode,
    showSourceChangePopup = false,
    setShowSourceChangePopup,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const busImage = (() => {
        switch (selectedServiceTier?.serviceTierType) {
            case 'AC':
                return mtIcAcService;
            case 'EXECUTIVE':
            case 'SPECIAL':
                return mtIcDeluxeService;
            case 'EXPRESS':
                return mtIcExpressService;
            case 'ORDINARY':
                return mtIcOrdinaryBusService;
            default:
                return mtIcOrdinaryBusService;
        }
    })();
    const nextArrivalTimes =
        nextArrivalTimeInSeconds && nextArrivalTimeInSeconds.length > 0
            ? nextArrivalTimeInSeconds
                  .filter(seconds => seconds > 0)
                  .map((seconds, idx) => {
                      const minutes = Math.round(seconds / 60);
                      const hours = Math.floor(minutes / 60);
                      const extraMinutes = minutes - hours * 60;
                      const isGreen = minutes < 30;
                      const timeString =
                          hours <= 0 ? `${minutes}min` : hours < 11 ? `${hours}hr ${extraMinutes}min` : '';
                      return {
                          timeString,
                          isGreen,
                          key: idx,
                      };
                  })
                  .filter(
                      (value, index, self) =>
                          self.findIndex(item => item.timeString === value.timeString) === index &&
                          value.timeString !== '',
                  )
                  .slice(0, 4)
            : [];

    return (
        <>
            <Animated.View
                style={tailwind.style(
                    'bg-white rounded-[20px] border border-[#F1F2F2] flex-row items-center justify-between mt-4 ',
                )}>
                <Animated.View style={tailwind.style('flex-1 p-4')} layout={LinearTransition}>
                    <Animated.View style={tailwind.style('flex-row items-center')} layout={LinearTransition}>
                        {getIconFromType('Bus', 16, '#3B3A3C')}
                        {number && (
                            <Animated.Text
                                layout={LinearTransition}
                                style={tailwind.style('text-[24px] font-bold text-[#333333] pl-[10px]')}>
                                {number}
                            </Animated.Text>
                        )}

                        {selectedServiceTier?.serviceTierType && (
                            <>
                                <Animated.View style={tailwind.style('w-[2px] h-[20px] bg-[#7E7E7E] mx-[8px]')} />
                                <Animated.Text
                                    numberOfLines={1}
                                    style={tailwind.style(
                                        'text-[18px] font-departureMono-regular text-[#7E7E7E] max-w-[70%]',
                                    )}>
                                    {removeWordBuses(selectedServiceTier?.serviceTierName)?.replace(/_/g, ' ')}
                                </Animated.Text>
                            </>
                        )}
                    </Animated.View>
                    {appName !== 'odishaYatri' && description && (
                        <Animated.Text
                            style={tailwind.style(
                                'text-[12px] text-[#969696] font-areaNormal-extrabold pt-[14px] max-w-[170px] leading-[20px]',
                            )}>
                            {description}
                        </Animated.Text>
                    )}
                    {
                        <>
                            <Pressable
                                testID="6c599b05-a746-47b5-8ec8-cb1d24d85401"
                                style={tailwind.style(
                                    'bg-[#F4F4F4] rounded-[10px] p-[11px] mt-[13px] flex-row items-center justify-between max-w-[110px]',
                                )}
                                onPress={onChangeBusType}
                                accessibilityRole="button"
                                accessibilityLabel="Change Bus button">
                                <Animated.Text
                                    layout={LinearTransition}
                                    style={tailwind.style('text-[#5A5A5A] text-[12px] font-areaNormal-extrabold pr-1')}>
                                    {userLanguageStrings.ChangeBus}
                                </Animated.Text>
                                <Icon icon={<ChevronRight />} size={8} color="#5A5A5A" />
                            </Pressable>
                            <Animated.View
                                layout={LinearTransition.springify().damping(24).stiffness(240)}
                                entering={FadeIn}
                                style={tailwind.style('pt-[7px]')}>
                                {nextArrivalTimes && nextArrivalTimes.length > 0 && (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[13px] font-areaNormal-extrabold text-[#656565] capitalize mb-2',
                                        )}>
                                        {userLanguageStrings.ArrivesAtStop(sourceStopName ?? '')}
                                    </Animated.Text>
                                )}
                                <Animated.View
                                    style={tailwind.style('flex-wrap min-w-[250px] flex-row gap-2 items-center')}>
                                    {nextArrivalTimes.map(({ timeString, isGreen, key }) => (
                                        <Animated.View
                                            key={key}
                                            style={tailwind.style('py-[5px] px-[6px] rounded-[6px] bg-[#F4F4F4]')}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    `text-white font-extrabold text-[12px] ${
                                                        isGreen ? 'text-[#097B42]' : 'text-[#FF7301]'
                                                    }`,
                                                )}>
                                                {timeString}
                                            </Animated.Text>
                                        </Animated.View>
                                    ))}
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={onTrackBusOrTimeTable}
                                        testID={'track-bus-button'}
                                        accessibilityLabel={
                                            sourceType === 'GTFS' ? 'Time Table button' : 'Track Bus button'
                                        }
                                        style={tailwind.style('ml-1')}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Animated.Text
                                            style={tailwind.style('text-[14px] font-bold underline text-[#016ACD]')}>
                                            {sourceType === 'GTFS'
                                                ? userLanguageStrings.TimeTable
                                                : userLanguageStrings.TrackBus}
                                        </Animated.Text>
                                    </Pressable>
                                </Animated.View>
                            </Animated.View>
                        </>
                    }
                </Animated.View>
                <Animated.View>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="bus image"
                        key={selectedServiceTier?.serviceTierType}
                        layout={LinearTransition}
                        entering={SlideInRight.delay(500)}
                        style={tailwind.style('w-[130px] h-[140px]', {
                            transform: [{ scaleX: -1 }],
                        })}
                        source={busImage}
                    />
                </Animated.View>
            </Animated.View>
            {appName == 'anna' && selectedServiceTier?.serviceTierType && (
                <DisclaimerBox legmode="Bus" serviceTiers={[selectedServiceTier.serviceTierType]} />
            )}

            {sourceStopName && number && handleOnConfirm && isSingleMode && (
                <SingleModeBusSourceChangePopUp
                    visible={showSourceChangePopup}
                    setVisible={setShowSourceChangePopup}
                    routeNumber={number}
                    sourceStopName={sourceStopName}
                    handleOnConfirm={handleOnConfirm}
                />
            )}
            {timeTableProps && (
                <MemoizedNewTimeTableUI
                    times={timeTableProps.times}
                    source={timeTableProps.source}
                    sheetRef={timeTableProps.sheetRef}
                    mode={timeTableProps.mode}
                    towardsStation={timeTableProps.towardsStation}
                    onDismiss={undefined}
                    allTowardsStation={timeTableProps.allTowardsStation}
                />
            )}
        </>
    );
};
