import React from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../../../../primitives/Pressable';
import Animated from 'react-native-reanimated';
import { Icon } from '@/typescript/components/Icon.tsx';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import StationSwitchPlan from './StationSwitchPlan';
import { JourneyRouteTypes } from '../../Ticket/SingleTicket/components/SuburbanSwitchRoute';
import { ScrollView } from 'react-native-gesture-handler';
import CrossIcon from '@/typescript/assets/svg/symbols/Cross';

type SuburbanSwitchRouteModalProps = {
    journeyRoutes: Array<JourneyRouteTypes>;
};

const MetroSwitchRouteModal: React.FC<SuburbanSwitchRouteModalProps> = ({ journeyRoutes }) => {
    const { bottom } = useSafeAreaInsets();
    const { metroSwitchRouteModalRef } = useRefsContext();

    const onDismiss = () => {
        metroSwitchRouteModalRef.current?.dismiss();
        return true;
    };

    return (
        <PopUpModal
            sheetRef={metroSwitchRouteModalRef}
            enableDynamicSizing={false}
            onHardwareBackPress={onDismiss}
            showBackdrop={undefined}
            snapPoints={['70%']}
            isScrollable={true}>
            <Animated.View style={tailwind.style(`py-6 pb-[${bottom || 16}px]`)}>
                <Animated.View style={tailwind.style('flex-row items-center justify-end px-6')}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onDismiss}
                        accessibilityLabel="Close button"
                        style={tailwind.style('p-2')}
                        testID="close-suburban-modal-button">
                        <Icon icon={<Icon icon={<CrossIcon fill="#656565" />} size={15} color="#656565" />} size={10} />
                    </Pressable>
                </Animated.View>

                {/* Content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tailwind.style('')}>
                    <StationSwitchPlan journeyRoutes={journeyRoutes} />
                </ScrollView>
            </Animated.View>
        </PopUpModal>
    );
};

export default MetroSwitchRouteModal;
