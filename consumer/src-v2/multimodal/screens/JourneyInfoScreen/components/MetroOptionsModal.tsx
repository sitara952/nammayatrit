import React from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../../../../primitives/Pressable';
import Animated from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon.tsx';
import ArrowRightV2 from '@/typescript/components/svg/ArrowRightV2';
import { MetroStationChangeModal } from './MetroStationChangeModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon';
import BridgeIcon from '@/src-v2/assets/svg/BridgeIcon.tsx';
import ShuffleIcon from '@/src-v2/assets/svg/ShuffleIcon.tsx';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type MetroOptionsModalProps = {
    source: string | undefined;
    destination: string | undefined;
    sourceStoplist: (string | undefined)[] | undefined;
    destinationStoplist: (string | undefined)[] | undefined;
    handleConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    allStops: fRFSStationAPI[] | undefined;
    legOrder: number | undefined;
};

const MetroOptionsModal: React.FC<MetroOptionsModalProps> = ({
    source,
    destination,
    sourceStoplist,
    destinationStoplist,
    allStops,
    handleConfirmRoute,
    legOrder,
}) => {
    const { bottom } = useSafeAreaInsets();
    const { metroStationChangeModalRef, metroOptionsModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Const flag to control additional options visibility - set to false to hide them
    const showAdditionalOptions = false;

    const onDismiss = () => {
        metroOptionsModalRef.current?.dismiss();
        return true;
    };
    const handleChangeStations = () => {
        metroOptionsModalRef.current?.dismiss();
        setTimeout(() => {
            metroStationChangeModalRef.current?.present();
        }, 300); // Small delay to ensure smooth transition
    };

    const onConfirmRouteChange = (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => {
        if (sourceCode && destinationCode) {
            handleConfirmRoute(legOrder, sourceCode, destinationCode);
        }
    };
    return (
        <>
            <PopUpModal
                sheetRef={metroOptionsModalRef}
                isScrollable={false}
                enableDynamicSizing={true}
                onHardwareBackPress={onDismiss}
                showBackdrop={true}
                bottomInset={bottom}>
                <Animated.View style={tailwind.style('px-4 py-6')}>
                    {/* Header */}
                    <Animated.Text
                        style={tailwind.style('text-[16px] text-[#9CA3AF] text-center mb-6 font-areaNormal-extrabold')}>
                        {userLanguageStrings.MetroOptions}
                    </Animated.Text>

                    {/* Route section */}
                    <Animated.View style={tailwind.style('flex-row items-center justify-between mb-4')}>
                        <Animated.Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={tailwind.style(
                                'text-[14px] text-[#7E7E7E] font-areaNormal-extrabold max-w-[200px]',
                            )}>
                            {source}
                        </Animated.Text>
                        <Icon icon={<ArrowRightV2 fillColor={'#838185'} />} size={14} />
                        <Animated.Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={tailwind.style(
                                'text-[14px] text-[#7E7E7E] font-areaNormal-extrabold max-w-[200px]',
                            )}>
                            {destination}
                        </Animated.Text>
                    </Animated.View>

                    {/* Change Stations option */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Change Stations button"
                        style={tailwind.style(
                            'bg-white border border-[#E5E7EB] rounded-[12px] p-4 mb-4 flex-row items-center',
                        )}
                        testID="change-stations"
                        onPress={handleChangeStations}>
                        <Animated.View style={tailwind.style('mr-3 flex-row items-center pt-2.5')}>
                            <Animated.View style={tailwind.style('pt-0.5')}>
                                <Icon icon={<BridgeIcon />} size={20} color={'#656565'} />
                            </Animated.View>
                            <Icon icon={<ShuffleIcon />} size={20} color={'#656565'} />
                        </Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[16px] text-[#3B3A3C] font-areaNormal-extrabold tracking-[0.2px]',
                            )}>
                            {userLanguageStrings.ChangeStations}
                        </Animated.Text>
                    </Pressable>

                    {/* Skip Using Metro Pass option - conditionally rendered */}
                    {showAdditionalOptions && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Skip Using Metro Pass button"
                            style={tailwind.style(
                                'bg-white border border-[#E5E7EB] rounded-[12px] p-4 mb-4 flex-row items-center',
                            )}
                            testID="skip-metro-pass"
                            onPress={() => {
                                /* Handle skip metro pass */
                            }}>
                            <Animated.View style={tailwind.style('mr-3 flex-row items-center pt-1')}>
                                <Icon icon={<TicketIcon fill={'#6B7280'} />} size={20} color={'#656565'} />
                                <Animated.Text style={tailwind.style('text-[#656565] text-[30px] font-medium pb-1')}>
                                    ×
                                </Animated.Text>
                            </Animated.View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] text-[#3B3A3C] font-areaNormal-extrabold tracking-[0.2px]',
                                )}>
                                {userLanguageStrings.SkipUsingMetroPass}
                            </Animated.Text>
                        </Pressable>
                    )}

                    {/* Avoid Switch option - conditionally rendered */}
                    {showAdditionalOptions && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Avoid Switch button"
                            style={tailwind.style(
                                'bg-white border border-[#E5E7EB] rounded-[12px] p-4 mb-6 flex-row items-center',
                            )}
                            testID="avoid-switch"
                            onPress={() => {
                                /* Handle avoid switch */
                            }}>
                            <Animated.View style={tailwind.style('mr-3 flex-row items-center pt-1')}>
                                <Animated.View style={tailwind.style('pt-2')}>
                                    <Icon icon={<ShuffleIcon />} size={20} color={'#656565'} />
                                </Animated.View>
                                <Animated.Text style={tailwind.style('text-[30px] font-medium pb-1')}>×</Animated.Text>
                            </Animated.View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] text-[#3B3A3C] font-areaNormal-extrabold tracking-[0.2px]',
                                )}>
                                {userLanguageStrings.AvoidSwitch}
                            </Animated.Text>
                        </Pressable>
                    )}

                    {/* Close button */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close button"
                        style={tailwind.style('bg-[#3B3A3C] rounded-[12px] py-4 items-center justify-center')}
                        onPress={() => metroOptionsModalRef.current?.dismiss()}
                        testID="close-modal-button">
                        <Animated.Text
                            style={tailwind.style('text-white text-[15px] font-areaNormal-extrabold tracking-[0.2px]')}>
                            {userLanguageStrings.Close}
                        </Animated.Text>
                    </Pressable>
                </Animated.View>
            </PopUpModal>

            <MetroStationChangeModal
                onConfirmRoute={onConfirmRouteChange}
                source={source}
                destination={destination}
                sourceStoplist={sourceStoplist}
                destinationStoplist={destinationStoplist}
                allStops={allStops}
                legOrder={legOrder}
            />
        </>
    );
};

export default MetroOptionsModal;
