import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PopUpModalConfig } from '../StatusPopUpModal/PopUpModalConfig';
import AutoAssigned from './AutoAssigned';
import SearchingForAuto from './SearchingForAuto';

interface BookAutoFlowProps {
    autoState: 'searching' | 'assigned' | 'driver-arriving';
    destination: string;
    otpValue: string;
    driverName: string;
    autoName: string;
    rating: string;
    passengerCount: string;
    vehicleNumber: string;
    onPrimaryButtonPress: () => void;
}

const BookAutoFlow: React.FC<BookAutoFlowProps> = ({
    autoState,
    destination,
    otpValue,
    driverName,
    autoName,
    rating,
    passengerCount,
    vehicleNumber,
    onPrimaryButtonPress,
}) => {
    const { livJourneyBookAutoModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    return (
        <PopUpModalConfig
            sheetRef={livJourneyBookAutoModalRef}
            handleComponent={() => (
                <Animated.View style={tailwind.style('items-center pt-[12px]')}>
                    <Animated.View style={tailwind.style('w-[48px] h-[4px] rounded-[16px] bg-[#E5E5E5]')} />
                </Animated.View>
            )}
            onClosePress={() => {}}
            style="bg-white"
            isScrollable={false}>
            <BottomSheetView style={tailwind.style(`pb-[${(bottom || 16) + 16}px]`)}>
                {autoState === 'searching' && (
                    <SearchingForAuto
                        destination={destination}
                        onBoostRidePress={onPrimaryButtonPress}
                        onOtherOptionsPress={() => {}}
                    />
                )}
                {(autoState === 'assigned' || autoState === 'driver-arriving') && (
                    <AutoAssigned
                        onNextActionPress={onPrimaryButtonPress}
                        onOtherOptionsPress={() => {}}
                        isDriverArrived={autoState === 'driver-arriving'}
                        otpValue={otpValue}
                        destination={destination}
                        driverName={driverName}
                        autoName={autoName}
                        rating={rating}
                        passengerCount={passengerCount}
                        vehicleNumber={vehicleNumber}
                    />
                )}
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

export default BookAutoFlow;
