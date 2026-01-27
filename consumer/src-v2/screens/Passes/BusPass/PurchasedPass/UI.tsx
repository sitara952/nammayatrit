import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import type { BusPassProps } from '../components/passes/BusPass';
import { PassList } from '../components/PassList';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ClockSvg } from '@/src-v2/assets/svg/Clock';
import CallSupport from '@/typescript/components/svg/CallSupport';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { HelpAndSupportModal } from '../components/HelpAndSupportModal';
import { Icon } from '@/typescript/components/Icon';
import { BusPassActivationModal } from '../components/BusPassActivationModal';
import { candidateEndDate } from '../utils/passUtils';

interface PurchasedPassProps {
    purchasedPasses: BusPassProps[];
    isLoading: boolean;
    onHistoryPress: () => void;
    onNavigateToSupport: () => void;
    activationPassNo: string | null;
    onConfirmActivation: () => void;
    onCancelActivation: () => void;
}

export const PurchasedPass: React.FC<PurchasedPassProps> = ({
    purchasedPasses,
    isLoading,
    onHistoryPress,
    onNavigateToSupport,
    onConfirmActivation,
    onCancelActivation,
}) => {
    const { top } = useSafeAreaInsets();

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { helpAndSupportModalRef } = useRefsContext();

    const handleHelpPress = () => {
        helpAndSupportModalRef.current?.present();
    };

    const handleCloseHelpModal = () => {
        helpAndSupportModalRef.current?.dismiss();
    };

    const activationEndDate = candidateEndDate(new Date());
    const activationEndDateFormatted = `${String(activationEndDate.getDate()).padStart(2, '0')}/${String(activationEndDate.getMonth() + 1).padStart(2, '0')}/${activationEndDate.getFullYear()}`;

    return (
        <HardwareBackpressHandler>
            <>
                <Animated.View
                    style={tailwind.style(
                        'flex-1',
                        `pt-[${top ? top + 12 : 16}px]`,
                        purchasedPasses ? 'bg-[#060606]' : 'bg-white',
                    )}>
                    {/* Header with History Button */}
                    {!isLoading && purchasedPasses && purchasedPasses.length > 0 && (
                        <View style={tailwind.style('flex-row justify-between items-center px-5 pb-3')}>
                            <Text style={tailwind.style('text-white text-[18px] font-areaNormal-extrabold')}>
                                {userLanguageStrings.Passes}
                            </Text>
                            <View style={tailwind.style('flex-row gap-2')}>
                                <Pressable
                                    testID="pass-help-and-support"
                                    onPress={handleHelpPress}
                                    accessibilityRole="button"
                                    accessibilityLabel="Help and support button"
                                    style={tailwind.style(
                                        'flex-row items-center justify-center gap-2 bg-[#3C3C43] px-4 py-2 rounded-full',
                                    )}>
                                    <Icon
                                        icon={<CallSupport fill="white" width={20} height={20} />}
                                        color="white"
                                        size={20}
                                        style={tailwind.style('items-center justify-center pt-1')}
                                    />
                                    <Text style={tailwind.style('text-white text-[13px] font-areaNormal-bold')}>
                                        {userLanguageStrings.Help}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    testID="pass-history-button"
                                    onPress={onHistoryPress}
                                    accessibilityRole="button"
                                    accessibilityLabel="View pass history button"
                                    style={tailwind.style(
                                        'flex-row items-center gap-2 bg-[#3C3C43] px-4 py-2 rounded-full',
                                    )}>
                                    <ClockSvg />
                                    <Text style={tailwind.style('text-white text-[13px] font-areaNormal-bold')}>
                                        {userLanguageStrings.History}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {isLoading ? (
                        <Text style={tailwind.style('text-gray-500 text-lg')}>{userLanguageStrings.LoadingPasses}</Text>
                    ) : !purchasedPasses || purchasedPasses.length === 0 ? (
                        <Text style={tailwind.style('text-gray-500 text-lg text-center')}>
                            {userLanguageStrings.NoPurchasedPassesAvailable}
                        </Text>
                    ) : (
                        <PassList busPasses={purchasedPasses} />
                    )}
                </Animated.View>

                {/* Help and Support Modal */}
                <PopUpModal
                    sheetRef={helpAndSupportModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={handleCloseHelpModal}
                    showBackdrop={undefined}
                    isScrollable={false}
                    borderRadius={36}>
                    <HelpAndSupportModal onClose={handleCloseHelpModal} onNavigateToSupport={onNavigateToSupport} />
                </PopUpModal>

                <BusPassActivationModal
                    validTillFormatted={activationEndDateFormatted}
                    onActivate={onConfirmActivation || (() => {})}
                    onCancel={onCancelActivation || (() => {})}
                />
            </>
        </HardwareBackpressHandler>
    );
};
