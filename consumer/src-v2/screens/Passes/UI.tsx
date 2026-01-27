import React from 'react';
import { View, Text } from 'react-native';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { PassesUIProps } from './Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const PassesUI: React.FC<PassesUIProps> = ({ onPurchasePress }) => {
    const { top } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={[tailwind.style('flex-1 bg-white'), { paddingTop: top }]}>
            <View style={tailwind.style('flex-1 justify-center items-center px-4')}>
                <Text style={tailwind.style('text-2xl font-bold text-gray-800 mb-4')}>
                    {userLanguageStrings.Passes}
                </Text>
                <Text style={tailwind.style('text-base text-gray-600 text-center mb-8')}>
                    {userLanguageStrings.YourPassesWillAppearHere}
                </Text>

                <TouchableOpacity
                    testID="purchase-bus-pass-button"
                    onPress={onPurchasePress}
                    style={tailwind.style('bg-blue-500 px-6 py-4 rounded-lg shadow-md')}
                    accessibilityRole="button"
                    accessibilityLabel="Purchase Bus Pass">
                    <Text style={tailwind.style('text-white text-lg font-semibold')}>
                        {userLanguageStrings.PurchaseBusPass}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PassesUI;
