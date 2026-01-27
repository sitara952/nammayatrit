import React, { useState, useMemo } from 'react';
import { Pressable } from '../../../../primitives/Pressable';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/typescript/components/Icon.tsx';
import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight.tsx';
import ArrowLeft from '@/typescript/assets/svg/symbols/ArrowLeft';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { getCurrNearbyStops } from '@/typescript/utils/MultiModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type MetroRouteOptionsModalProps = {
    onConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    source: string | undefined;
    destination: string | undefined;
    sourceStoplist: (string | undefined)[] | undefined;
    destinationStoplist: (string | undefined)[] | undefined;
    allStops: fRFSStationAPI[] | undefined;
    legOrder: number | undefined;
};

export const MetroStationChangeModal: React.FC<MetroRouteOptionsModalProps> = ({
    onConfirmRoute,
    source: initialSource,
    destination: initialDestination,
    sourceStoplist,
    destinationStoplist,
    allStops,
    legOrder,
}) => {
    const { bottom } = useSafeAreaInsets();
    const { metroStationChangeModalRef, metroOptionsModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [source, setSource] = useState(initialSource);
    const [destination, setDestination] = useState(initialDestination);
    const [hasRouteChange, sethasRouteChange] = useState(false);
    const filteredSourceStoplist = useMemo(() => getCurrNearbyStops(sourceStoplist, source), [sourceStoplist, source]);
    const filteredDestinationStoplist = useMemo(
        () => getCurrNearbyStops(destinationStoplist, destination),
        [destinationStoplist, destination],
    );
    const isFirstSourceStop = source === filteredSourceStoplist[0];
    const isLastSourceStop = source === filteredSourceStoplist[filteredSourceStoplist.length - 1];
    const isFirstDestinationStop = destination === filteredDestinationStoplist[0];
    const isLastDestinationStop = destination === filteredDestinationStoplist[filteredDestinationStoplist.length - 1];

    const hasChanges = source !== initialSource || destination !== initialDestination;

    const handleStopChange = (type: 'source' | 'destination', direction: 'prev' | 'next') => {
        const list = type === 'source' ? filteredSourceStoplist : filteredDestinationStoplist;
        const currentValue = type === 'source' ? source : destination;

        if (!Array.isArray(list) || list.length === 0) return;

        const currentIndex = list.findIndex(stop => stop?.toLowerCase().trim() === currentValue?.toLowerCase().trim());

        const newIndex =
            direction === 'prev' ? Math.max(0, currentIndex - 1) : Math.min(list.length - 1, currentIndex + 1);

        const newValue = list[newIndex] || '';

        if (type === 'source') {
            setSource(newValue);
        } else {
            setDestination(newValue);
        }
    };

    const handleDismiss = () => {
        if (hasRouteChange) {
            setSource(source);
            setDestination(destination);
        } else {
            setSource(initialSource);
            setDestination(initialDestination);
        }
        sethasRouteChange(false);
    };

    const sourceCode = allStops?.find(stop => stop.name === source)?.code ?? null;
    const destinationCode = allStops?.find(stop => stop.name === destination)?.code ?? null;
    const handleConfirm = () => {
        if (hasChanges && sourceCode && destinationCode) {
            sethasRouteChange(true);
            onConfirmRoute(legOrder, sourceCode, destinationCode);
        }
        metroStationChangeModalRef.current?.dismiss();
    };

    const handleHardwareBackPress = () => {
        handleDismiss();
        metroOptionsModalRef.current?.dismiss();
        metroStationChangeModalRef.current?.dismiss();
        return true;
    };

    return (
        <PopUpModal
            sheetRef={metroStationChangeModalRef}
            isScrollable={false}
            enableDynamicSizing={true}
            onHardwareBackPress={handleHardwareBackPress}
            showBackdrop={true}
            bottomInset={bottom}
            onDismiss={handleDismiss}>
            <Animated.View style={tailwind.style('px-6 py-8')}>
                {/* Header */}
                <Animated.Text
                    style={tailwind.style(
                        'text-[16px] text-[#6B7280] text-center pb-[29px] font-areaNormal-extrabold',
                    )}>
                    {userLanguageStrings.MetroOptions}
                </Animated.Text>
                {/* Source Section */}
                <Animated.View style={tailwind.style('mb-4')}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                        {!isFirstSourceStop && (
                            <Pressable
                                accessibilityLabel={`Previous Station button`}
                                accessibilityRole="button"
                                onPress={() => handleStopChange('source', 'prev')}
                                testID="prev-source"
                                style={tailwind.style(
                                    'w-[44px] h-[40px] p-2 bg-white rounded-[24px] mr-[17px] shadow-sm border-[1px] border-[#F1F2F2]',
                                )}>
                                <Icon icon={<ArrowLeft />} size={16} color="#374151" />
                            </Pressable>
                        )}
                        {isFirstSourceStop && <Animated.View style={tailwind.style('w-10 mr-4')} />}
                        <Animated.View
                            style={tailwind.style('flex-1 bg-white border border-[#E5E7EB] px-4 rounded-[29px]')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] text-[#9CA3AF] text-center pt-[15px] font-areaNormal-extrabold',
                                )}>
                                {userLanguageStrings.Source}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] pt-[10px] pb-[21px] text-[#374151] font-areaNormal-extrabold text-center',
                                )}>
                                {source}
                            </Animated.Text>
                        </Animated.View>
                        {!isLastSourceStop && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Next Station button`}
                                onPress={() => handleStopChange('source', 'next')}
                                testID="next-source"
                                style={tailwind.style(
                                    'w-[44px] h-[40px] pt-1 pl-1 bg-white rounded-[24px] ml-[17px] shadow-sm border-[1px] border-[#F1F2F2] flex items-center justify-center',
                                )}>
                                <Icon icon={<ArrowRight bold={false} fill={'#374151'} />} size={19} color="#374151" />
                            </Pressable>
                        )}
                        {isLastSourceStop && <Animated.View style={tailwind.style('w-10 ml-4')} />}
                    </Animated.View>
                </Animated.View>

                {/* Dotted separator */}
                <Animated.View style={tailwind.style('items-center mb-3')}>
                    <Icon icon={<ChevronDown />} size={20} color={'#969696'} />
                    <Icon icon={<ChevronDown />} size={20} color={'#ACACAC'} />
                    <Icon icon={<ChevronDown />} size={20} color={'#DCDCDC'} />
                </Animated.View>

                {/* Destination Section */}
                <Animated.View>
                    <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                        {!isFirstDestinationStop && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Previous Station button`}
                                onPress={() => handleStopChange('destination', 'prev')}
                                testID="prev-destination"
                                style={tailwind.style(
                                    'w-[44px] h-[40px] p-2 bg-white rounded-[24px] mr-[17px] shadow-sm border-[1px] border-[#F1F2F2]',
                                )}>
                                <Icon icon={<ArrowLeft />} size={16} color="#374151" />
                            </Pressable>
                        )}
                        {isFirstDestinationStop && <Animated.View style={tailwind.style('w-10 mr-4')} />}
                        <Animated.View
                            style={tailwind.style('flex-1 bg-white border border-[#E5E7EB] px-4 rounded-[29px]')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] text-[#9CA3AF] text-center pt-[15px] font-areaNormal-extrabold',
                                )}>
                                {userLanguageStrings.Destination}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] text-[#374151] pt-[10px] pb-[21px] font-areaNormal-extrabold text-center',
                                )}>
                                {destination}
                            </Animated.Text>
                        </Animated.View>
                        {!isLastDestinationStop && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Next Station button`}
                                onPress={() => handleStopChange('destination', 'next')}
                                testID="next-destination"
                                style={tailwind.style(
                                    'w-[44px] h-[40px] pt-1 pl-1 bg-white rounded-[24px] ml-[17px] shadow-sm border-[1px] border-[#F1F2F2] flex items-center justify-center',
                                )}>
                                <Icon icon={<ArrowRight bold={false} fill={'#374151'} />} size={19} color="#374151" />
                            </Pressable>
                        )}
                        {isLastDestinationStop && <Animated.View style={tailwind.style('w-10 ml-4')} />}
                    </Animated.View>
                </Animated.View>

                {/* Confirm Route Button */}
                <Animated.View style={tailwind.style('pt-[29px]')}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Confirm Route button`}
                        onPress={handleConfirm}
                        disabled={!hasChanges}
                        style={({ pressed }) => [
                            tailwind.style(
                                !hasChanges ? 'bg-[#9CA3AF] rounded-[16px] py-4' : 'bg-[#007AFF] rounded-[16px] py-4',
                            ),
                            { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
                            pressed && { opacity: 0.9 },
                        ]}
                        testID="confirm-route">
                        <Animated.Text
                            style={tailwind.style(
                                !hasChanges
                                    ? 'text-[#6B7280] text-[16px] font-areaNormal-extrabold text-center'
                                    : 'text-white text-[16px] font-areaNormal-extrabold text-center',
                            )}>
                            {userLanguageStrings.ConfirmRoute}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </PopUpModal>
    );
};
