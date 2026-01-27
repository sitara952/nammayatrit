import React, { useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import PassesUI from './UI';
import { BusPassSelectionModal } from './components/BusPassSelectionModal';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { useMultimodalPassAvailablePassesGetQuery } from '@/api/integrations/rtk/MultimodalPassAvailablePassesGet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserLanguage } from '@/typescript/state/client/session';
import { languageToCode } from '@/src-v2/utils/common';

export const PassesFlow: React.FC = () => {
    // const navigation = useNavigation<StackNavigationProp<MainNavigationParamList>>();
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [selectedPassId, setSelectedPassId] = useState<string | undefined>();

    // Fetch available passes from the API
    const language = useAppSelector(selectUserLanguage);
    const { data: apiData = [] } = useMultimodalPassAvailablePassesGetQuery({ language: languageToCode(language) });

    // Flatten the nested passes data
    const passes: passAPIEntity[] = apiData.flatMap(item => item.passes);

    const handlePurchasePress = () => {
        setShowSelectionModal(true);
    };

    const handleCloseSelectionModal = () => {
        setShowSelectionModal(false);
    };

    const handlePassSelect = (passId: string) => {
        setSelectedPassId(passId);
    };

    const handleProceed = () => {
        if (selectedPassId) {
            // const selectedPass = passes.find(pass => pass.id === selectedPassId);
            setShowSelectionModal(false);
            // navigation.navigate('uploadPhoto', {
            //     selectedPass: selectedPass,
            //     autoCapture: true,
            // });
        }
    };

    return (
        <>
            <PassesUI onPurchasePress={handlePurchasePress} />
            <BusPassSelectionModal
                visible={showSelectionModal}
                onClose={handleCloseSelectionModal}
                onPassSelect={handlePassSelect}
                passes={passes}
                selectedPassId={selectedPassId}
                onProceed={handleProceed}
            />
        </>
    );
};
