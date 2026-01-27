import React from 'react';
import { View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import DoubleArrows from '@/src-v2/assets/svg/DoubleArrow';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import Button from '@/src-v2/primitives/Button';
import { BusSelectorList } from '../../NewLiveJourney/components/BusSelectorList';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BusConfirmInfo, BusTrackingAction } from '../Types';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { strings } from 'config-types';
import { removeWordBuses } from '../../JourneyInfoScreen/DirectBooking/components/BusTransitCard';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

export interface BusConfirmModalProps {
    confirmModalRef: React.RefObject<BottomSheetModal | null>;
    showBusConfirmPopup: boolean;
    setShowBusConfirmPopup: (show: boolean) => void;
    busConfirmInfo: BusConfirmInfo | null;
    onDismiss: () => void;
    mpDispatch: (action: BusTrackingAction) => void;
    animatedIndex: SharedValue<number>;
    animatedPosition: SharedValue<number>;
    availableRoutes: availableRoute[] | undefined;
    mainSheetRef: React.RefObject<BottomSheet | null>;
    userLanguageStrings: strings;
}

const BusConfirmModal: React.FC<BusConfirmModalProps> = ({
    confirmModalRef,
    setShowBusConfirmPopup,
    busConfirmInfo,
    onDismiss,
    mpDispatch,
    animatedIndex,
    animatedPosition,
    availableRoutes,
    mainSheetRef,
    userLanguageStrings,
}) => {
    const { bottom } = useSafeAreaInsets();
    return (
        <PopUpModal
            sheetRef={confirmModalRef}
            isScrollable={false}
            showBackdrop={false}
            backdropComponent={() => null}
            borderRadius={36}
            snapPoints={['40%']}
            animatedIndex={animatedIndex}
            animatedPosition={animatedPosition}
            onDismiss={() => {
                setShowBusConfirmPopup(false);
                if (onDismiss) onDismiss();
            }}
            onHardwareBackPress={() => setShowBusConfirmPopup(false)}
            showHandle={true}
            handleStyle={{ backgroundColor: '#E0E0E0', width: 50, height: 5, borderRadius: 4 }}>
            {busConfirmInfo && (
                <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: bottom }}>
                    <Animated.Text
                        style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C] mb-2')}
                        numberOfLines={2}>
                        {userLanguageStrings.bus} {busConfirmInfo.busNumber}{' '}
                        {busConfirmInfo.stopsAway ? `${busConfirmInfo.stopsAway} ${userLanguageStrings.stopsaway}` : ''}
                    </Animated.Text>
                    <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#1A8F2F] mb-4')}>
                        {userLanguageStrings.BusWillReachInMins(`${busConfirmInfo.etaMins} mins`)}
                    </Animated.Text>
                    <Button
                        size="lg"
                        type="primary"
                        style={tailwind.style(
                            'mb-4 flex-row items-center w-full justify-center bg-[#047AEA] rounded-xl',
                        )}
                        onPress={() => {
                            confirmModalRef.current?.dismiss();
                            mainSheetRef.current?.expand();
                        }}
                        testID="confirm-bus-button">
                        <Animated.Text style={tailwind.style('text-[18px] font-areaNormal-bold text-white mr-2')}>
                            {userLanguageStrings.ConfirmThisBus}
                        </Animated.Text>
                        <DoubleArrows color="#fff" width={16} height={16} opacity={0.5} secondOpacity={1} />
                    </Button>
                    {/* Bus number selector using BusSelectorList */}
                    <View style={tailwind.style('mx-auto mt-2')}>
                        <BusSelectorList
                            busList={
                                availableRoutes && availableRoutes.length > 0
                                    ? availableRoutes.map((route, idx) => ({
                                          busNumber: route.routeShortName,
                                          serviceTierName: removeWordBuses(route?.serviceTierName),
                                          index: idx,
                                          onChangeBusPress: () => {
                                              mpDispatch({
                                                  type: 'SHOW_SWITCH_BUS_ROUTE_MODAL',
                                                  payload: { routeIndex: idx },
                                              });
                                          },
                                      }))
                                    : []
                            }
                            selectedIndex={busConfirmInfo?.selectedIndex ?? 0}
                            selectedBusNumber={null}
                        />
                    </View>
                </View>
            )}
        </PopUpModal>
    );
};

export { BusConfirmModal };
