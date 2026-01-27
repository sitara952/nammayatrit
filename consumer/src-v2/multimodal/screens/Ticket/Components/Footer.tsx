import React from 'react';
import { View } from 'react-native';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import Button from '../../../../primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const Footer: React.FC<{ onStartJourney: () => void }> = ({ onStartJourney }) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind`bottom-0 w-full px-4 pb-4`}>
            <Button
                type="primary"
                onPress={onStartJourney}
                bgColor={colors.Button_for_modes_bg}
                text={userLanguageStrings.StartBusJourneyNow}
                testID="start-journey-button"
            />
        </View>
    );
};

export default Footer;
