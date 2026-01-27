import BottomSheet, {
    BottomSheetView,
    BottomSheetScrollView,
    SCREEN_HEIGHT,
    BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, { ReactNode } from 'react';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { BottomSheetBackdrop } from '@/typescript/components/common/BottomSheetBackdrop.tsx';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetHandle/types';
import { SharedValue } from 'react-native-reanimated';
import { createAction, Resolver } from '@/typescript/utils/common.ts';
import { RideConfirmedScreenAction } from '../Types.tsx';
import { homeSheetBg } from '../../HomeScreen/HomeScreenFragment.tsx';
import { BottomSheetTopBannerType } from '@/typescript/designSystem/components/BottomSheetTopBanner';
import { Platform } from 'react-native';

interface RideConfirmedBottomSheetProps {
    children: ReactNode;
    rideConfirmedBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    sheetAnimatedPosition: SharedValue<number>;
    animatedIndex: SharedValue<number>;
    postRideStartFragment: boolean;
    isChatOpen: boolean;
    screenReaderEnabled: boolean;
    chatSheetHeight: SharedValue<number>;
    renderCustomHandle: (props: BottomSheetHandleProps) => React.ReactElement;
    onSheetChange: (index: number, position: number) => void;
    rcsDispatch: Resolver<RideConfirmedScreenAction>;
    snapPoints: (string | number)[];
    themeColors: Record<string, string>;
    initialIndex: number;
    bannerType?: BottomSheetTopBannerType;
}

const RideConfirmedBottomSheet: React.FC<RideConfirmedBottomSheetProps> = ({
    children,
    rideConfirmedBottomsheetModalRef,
    sheetAnimatedPosition,
    animatedIndex,
    postRideStartFragment,
    isChatOpen,
    screenReaderEnabled,
    chatSheetHeight,
    renderCustomHandle,
    onSheetChange,
    rcsDispatch,
    snapPoints,
    themeColors,
    initialIndex,
    bannerType,
}) => {
    // Calculate border radius based on banner type
    const bottomSheetBorderRadius =
        bannerType === BottomSheetTopBannerType.PetRide || bannerType === BottomSheetTopBannerType.RideConfirmedPetRide
            ? 34
            : 15;

    return (
        <BottomSheet
            backgroundStyle={[
                tailwind.style(`bg-[${homeSheetBg}]`),
                {
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 15,
                    elevation: Platform.OS === 'android' && Platform.Version >= 29 ? 50 : undefined,
                    borderTopLeftRadius: bottomSheetBorderRadius,
                    borderTopRightRadius: bottomSheetBorderRadius,
                },
            ]}
            accessible={false}
            topInset={0}
            enableOverDrag={false}
            backdropComponent={
                postRideStartFragment
                    ? props => (
                          <BottomSheetBackdrop
                              {...props}
                              sheetRef={rideConfirmedBottomsheetModalRef}
                              showBackdrop={undefined}
                              onHardwareBackPress={() =>
                                  rcsDispatch(createAction('BTMSHEET_BACKDROP_CLICKED', undefined))
                              }
                          />
                      )
                    : undefined
            }
            animatedPosition={sheetAnimatedPosition}
            animatedIndex={animatedIndex}
            keyboardBlurBehavior="restore"
            handleComponent={renderCustomHandle}
            ref={rideConfirmedBottomsheetModalRef}
            handleIndicatorStyle={tailwind.style(`bg-[${themeColors['neutralMidLow']}] h-[3px] rounded-[4px]`)}
            handleStyle={tailwind.style(
                `h-[26px] bg-[${themeColors['Fill_neutralUltraLow']}] rounded-t-[${bottomSheetBorderRadius}px]`,
            )}
            keyboardBehavior="extend"
            snapPoints={snapPoints}
            enableDynamicSizing={postRideStartFragment}
            enablePanDownToClose={postRideStartFragment ? true : false}
            index={initialIndex}
            enableContentPanningGesture={true}
            onChange={(index, position) => onSheetChange(index, position)}
            activeOffsetX={undefined}
            activeOffsetY={undefined}
            failOffsetY={undefined}
            failOffsetX={undefined}
            simultaneousHandlers={undefined}
            waitFor={undefined}>
            <BottomSheetView
                style={[
                    tailwind.style(`h-full bg-[${themeColors['white100']}] flex-grow`),
                    screenReaderEnabled ? { height: SCREEN_HEIGHT } : {},
                ]}
                onLayout={event => {
                    chatSheetHeight.value = event.nativeEvent.layout.height;
                }}
                accessible={false}>
                <BottomSheetScrollView
                    accessible={false}
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled={true}
                    scrollEnabled={!isChatOpen}
                    contentContainerStyle={tailwind.style(`pb-8`)}
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    style={[tailwind.style(`bg-[${themeColors['Fill_neutralUltraLow']}] `)]}>
                    {children}
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default RideConfirmedBottomSheet;
