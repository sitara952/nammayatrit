import React from 'react';
import { View, Text } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { passAPIEntity as Pass } from '@/readOnly/api/types/PassAPIEntity.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BusPassSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onPassSelect: (passId: string) => void;
    passes: Pass[];
    selectedPassId?: string;
    onProceed: () => void;
}

export const BusPassSelectionModal: React.FC<BusPassSelectionModalProps> = ({
    visible,
    onClose,
    onPassSelect,
    passes,
    selectedPassId,
    onProceed,
}) => {
    const insets = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <AnimatedModal visible={visible} setVisible={onClose} animationDuration={300} allowCloseOnBackdropPress={true}>
            <View style={[tailwind.style('bg-white rounded-2xl'), { maxHeight: '80%' }]}>
                {/* Header */}
                <View style={tailwind.style('px-6 py-4 border-gray-200')}>
                    <Text style={tailwind.style('text-xl font-bold text-gray-800 text-center')}>
                        {userLanguageStrings.AvailableBusPass}
                    </Text>
                </View>

                {/* Content */}
                <View style={tailwind.style('px-6')}>
                    {passes.map(pass => {
                        const isSelected = selectedPassId === pass.id;
                        return (
                            <TouchableOpacity
                                key={pass.id}
                                testID={`pass-${pass.id}`}
                                onPress={() => onPassSelect(pass.id)}
                                style={[
                                    tailwind.style('bg-white p-4 rounded-lg mb-4 shadow-sm'),
                                    isSelected
                                        ? tailwind.style('border-2 border-blue-500')
                                        : tailwind.style('border border-gray-200'),
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={`Select ${pass.name}`}
                                accessibilityState={{ selected: isSelected }}>
                                <View style={tailwind.style('flex-row justify-between items-start mb-2')}>
                                    <Text style={tailwind.style('font-semibold text-lg flex-1 text-gray-800')}>
                                        {pass.name}
                                    </Text>
                                    <Text style={tailwind.style('font-bold text-green-600 text-lg')}>
                                        ₹{pass.amount}
                                    </Text>
                                </View>
                                <Text style={tailwind.style('text-gray-600 mb-2')}>{pass.benefitDescription}</Text>
                                {pass.documentsRequired.length > 0 && (
                                    <View style={tailwind.style('flex-row items-center mt-2')}>
                                        <Text
                                            style={tailwind.style(
                                                'text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded',
                                            )}>
                                            📄 {userLanguageStrings.DocumentsRequired}:{' '}
                                            {pass.documentsRequired.join(', ')}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Proceed button */}
                {/* Proceed button */}
                <View style={[tailwind.style('px-4 bg-white border-gray-200'), { paddingBottom: insets.bottom }]}>
                    <TouchableOpacity
                        testID="proceed-button"
                        onPress={onProceed}
                        disabled={!selectedPassId}
                        style={[
                            tailwind.style('py-4 rounded-2xl shadow-md'),
                            selectedPassId ? tailwind.style('bg-[#016ACD]') : tailwind.style('bg-gray-300'),
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Proceed with selected pass"
                        accessibilityState={{ disabled: !selectedPassId }}>
                        <Text
                            style={[
                                tailwind.style('text-center font-semibold text-lg'),
                                selectedPassId ? tailwind.style('text-white') : tailwind.style('text-gray-500'),
                            ]}>
                            {userLanguageStrings.Proceed}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AnimatedModal>
    );
};
