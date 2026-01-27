import React from 'react';
import Animated from 'react-native-reanimated';
import { PopUpModalConfig } from './PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseButton } from './CloseButton';
import { SourceDestinationCard } from '../../../JourneyInfoScreen/DirectBooking/components/SourceDestinationCard';
import { JourneyFilterOption } from '@/src-v2/multimodal/components/common/JourneyFilterOption';
import { JourneyFilterOptions, JourneyOptionsScreenAction } from '../../../PublicTransitList/Types';
import { PublicTransitItem } from '../../../PublicTransitList/components/PublicTransitItem';
import { TransitSummaryType } from '../../../JourneyInfoScreen/components/TransitSummary';
import { Resolver } from '@/typescript/utils/common';

export interface OptionsModalProps {
    title?: string;
    sourceDestinationCardProps: {
        isMultiModal: boolean;
        source: string;
        destination: string;
        fare: number | undefined;
        time: string | undefined;
        journeyTypes: TransitSummaryType[] | undefined;
        onPress: () => void;
        showFare: boolean;
    };
    journeyFilterOptionProps: {
        options: JourneyFilterOptions[];
        selectJourneyFilter: (option: JourneyFilterOptions) => void;
        dispatch: Resolver<JourneyOptionsScreenAction> | undefined;
    };
    publicTransitItems: Array<{
        wrapperStyle: string | undefined;
        onPress: () => void;
        distance: string;
        cost: string;
        tag: 'EARLIEST' | 'AFFORDABLE' | 'HYBRID' | null;
        journey: TransitSummaryType[];
        startTime: number | null;
        endTime: string | null;
    }>;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
    title = 'Other Options',
    sourceDestinationCardProps,
    journeyFilterOptionProps,
    publicTransitItems,
}) => {
    const { liveJourneyOptionsModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    return (
        <PopUpModalConfig
            handleComponent={() => (
                <Animated.View style={tailwind.style('items-center pt-[12px]')}>
                    <Animated.View style={tailwind.style('w-[48px] h-[4px] rounded-[16px] bg-[#E5E5E5]')} />
                </Animated.View>
            )}
            onClosePress={() => {}}
            sheetRef={liveJourneyOptionsModalRef}
            style="bg-white"
            isScrollable={false}>
            <Animated.View style={tailwind.style(`pt-[4px] pb-[${bottom || 16}px]`)}>
                <Animated.View style={tailwind.style('flex-row items-center justify-between px-[20px]')}>
                    <CloseButton
                        style="mt-0"
                        closeButtonStyle="bg-[#E5E5E5]"
                        onPress={() => liveJourneyOptionsModalRef.current?.close()}
                    />
                    <Animated.Text style={tailwind.style('text-[13px] text-[#656565] font-areaNormal-extrabold')}>
                        {title}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('w-[40px] h-[40px]')} />
                </Animated.View>

                <Animated.View style={tailwind.style('px-4 pt-4')}>
                    <SourceDestinationCard {...sourceDestinationCardProps} />
                </Animated.View>

                <Animated.View style={tailwind.style('pt-[18px]')}>
                    <JourneyFilterOption {...journeyFilterOptionProps} />
                </Animated.View>

                <Animated.ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tailwind.style('')}>
                    <Animated.View style={tailwind.style('flex-1')}>
                        {publicTransitItems.map((item, idx) => (
                            <PublicTransitItem index={idx} key={idx} {...item} />
                        ))}
                    </Animated.View>
                </Animated.ScrollView>
            </Animated.View>
        </PopUpModalConfig>
    );
};

export default OptionsModal;
