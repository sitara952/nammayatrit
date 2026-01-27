import React from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { BottomSheetModal, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { DetailedTransitTrackingUI } from '../../NewLiveJourney/screens/TransitTracking/DetailedTransitTrackingUI';
import { DetailedLiveHeaderProps } from '../../NewLiveJourney/components/DetailedLiveJourney/DetailedLiveHeader';
import { TransitTrackingProps } from '../../NewLiveJourney/screens/TransitTracking/TransitTracking';
import { MiniTransitInfoProps } from '../../NewLiveJourney/screens/TransitTracking/components/MiniTransitInfo';
import { BusTrackingAction } from '../Types';

export interface DetailedTransitTrackingModalProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    mpDispatch: (action: BusTrackingAction) => void;
    mode: 'Train' | 'Metro' | 'Bus' | null;
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    transitTrackingProps: TransitTrackingProps;
    miniTransitInfoProps: MiniTransitInfoProps;
    hasLiveTracking: boolean;
    animatedIndex: SharedValue<number>;
    animatedPosition: SharedValue<number>;
}

const DetailedTransitTrackingModal: React.FC<DetailedTransitTrackingModalProps> = ({
    modalRef,
    mpDispatch,
    mode,
    detailedLiveHeaderProps,
    transitTrackingProps,
    miniTransitInfoProps,
    hasLiveTracking,
    animatedIndex,
    animatedPosition,
}) => {
    return (
        <PopUpModal
            sheetRef={modalRef}
            isScrollable={true}
            showBackdrop={true}
            backdropComponent={() => null}
            borderRadius={36}
            snapPoints={['70%']}
            maxDynamicContentSize={WINDOW_HEIGHT * 0.9}
            animatedIndex={animatedIndex}
            animatedPosition={animatedPosition}
            onDismiss={() => mpDispatch({ type: 'VIEW_DETAILS', payload: { show: false } })}
            onHardwareBackPress={() => mpDispatch({ type: 'VIEW_DETAILS', payload: { show: false } })}
            showHandle={true}
            handleStyle={{ backgroundColor: '#E0E0E0', width: 50, height: 5, borderRadius: 4 }}
            backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 36 }}>
            <View style={tailwind.style('mb-1')}>
                <DetailedTransitTrackingUI
                    mode={mode}
                    detailedLiveHeaderProps={detailedLiveHeaderProps}
                    transitTrackingProps={transitTrackingProps}
                    miniTransitInfoProps={miniTransitInfoProps}
                    hasLiveTracking={hasLiveTracking}
                    customTopPadding={0}
                    onHideDetails={() => mpDispatch({ type: 'VIEW_DETAILS', payload: { show: false } })}
                />
            </View>
        </PopUpModal>
    );
};

export { DetailedTransitTrackingModal };
