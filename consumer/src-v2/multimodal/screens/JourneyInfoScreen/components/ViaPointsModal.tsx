import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { PopUpModal } from '../../../../../src/typescript/components/PopUpModal';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { RouteOptionCard, RouteOptionCardProps } from './RouteOptionCard';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'; // Keep this import for the ref type
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated from 'react-native-reanimated';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface ViaPointsModalProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    selectedLeg: legInfo | undefined;
    routeOptions: RouteOptionCardProps[] | undefined;
    onTrainClassChange: (quoteId: string | undefined) => void | undefined;
    isLoading?: boolean;
    selectedQuoteId?: string;
}

const ViaPointsShimmer = () => {
    return (
        <Animated.View style={tailwind.style('p-4')}>
            <Animated.View style={tailwind.style('h-6 w-48 bg-gray-200 rounded mb-4')} />
            {[1, 2, 3].map((_, index) => (
                <Animated.View key={index} style={tailwind.style('mb-4')}>
                    <Animated.View style={tailwind.style('h-20 bg-gray-200 rounded-lg')} />
                </Animated.View>
            ))}
        </Animated.View>
    );
};

export const ViaPointsModal: React.FC<ViaPointsModalProps> = ({
    bottomSheetModalRef,
    selectedLeg,
    routeOptions,
    onTrainClassChange,
    isLoading,
}) => {
    const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const sourceStation =
        selectedLeg?.legExtraInfo.TAG === 'Subway'
            ? [...selectedLeg.legExtraInfo._0.routeInfo].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0))[0]
                  ?.originStop.name
            : '';
    const destinationStation =
        selectedLeg?.legExtraInfo.TAG === 'Subway'
            ? [...selectedLeg.legExtraInfo._0.routeInfo].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0)).at(-1)
                  ?.destinationStop.name
            : '';

    return (
        <PopUpModal
            sheetRef={bottomSheetModalRef}
            snapPoints={snapPoints}
            isScrollable={true}
            onHardwareBackPress={undefined}
            showBackdrop={true}
            // The PopUpModal component already handles the background and indicator styles internally.
            // No need to pass backgroundStyle or handleIndicatorStyle here.
        >
            <BottomSheetScrollView
                contentContainerStyle={tailwind.style(`px-5 pt-[22px] pb-[${bottom ? bottom : 16}px]`)}>
                {isLoading ? (
                    <ViaPointsShimmer />
                ) : (
                    <View style={tailwind.style('flex-1 px-4')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] leading-[15px] font-areaNormal-extrabold text-[#969696] text-center mb-6',
                            )}
                            accessible
                            accessibilityLabel={'Available Routes'}>
                            {userLanguageStrings.AvailableRoutes}
                        </Animated.Text>

                        <View style={tailwind.style('flex-row justify-center items-center mb-4')}>
                            <Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                                {sourceStation}
                            </Text>
                            <Text style={tailwind.style('mx-2 text-[14px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                                →
                            </Text>
                            <Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                                {destinationStation}
                            </Text>
                        </View>
                        {routeOptions?.map((option, index) => (
                            <RouteOptionCard
                                {...option}
                                key={index}
                                onPress={() => onTrainClassChange(option.quoteId)}
                            />
                        ))}
                    </View>
                )}
            </BottomSheetScrollView>
        </PopUpModal>
    );
};
