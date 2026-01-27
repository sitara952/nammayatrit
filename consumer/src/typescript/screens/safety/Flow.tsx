import React, { useCallback, useState } from 'react';
import { SafetyUI } from './UI';
import { useSafetyHook } from './SafetyHook';
import { SafetyFlowProps, SafetyStageId, MoreSafetyMeasureId } from './Types';
import { StageFlow } from '../safetySettings/StageFlow';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ProfileTabParamList } from '@/typescript/navigation/globalParamList';

export const SafetyFlow: React.FC<SafetyFlowProps> = ({ onBack }) => {
    const { stageStatus, safetyStages, isLoading, error, carouselData, moreSafetyMeasures, userLanguageStrings } =
        useSafetyHook();

    const route = useRoute<RouteProp<ProfileTabParamList, 'safetyScreen'>>();
    const [selectedStageId, setSelectedStageId] = useState<SafetyStageId | null>(route.params?.safetyStageId || null);
    const [selectedMoreSafetyMeasureId, setSelectedMoreSafetyMeasureId] = useState<MoreSafetyMeasureId | null>(null);

    // Transform stageStatus to match SafetyUI interface (boolean values)
    const transformedStageStatus = {
        trustedContacts: stageStatus.trustedContacts.isCompleted,
        safetyCheckIns: stageStatus.safetyCheckIns.isCompleted,
        emergencyActions: stageStatus.emergencyActions.isCompleted,
        // emergencyDrill: stageStatus.emergencyDrill.isCompleted,
    };

    // Extract stage names from stageStatus
    const stageNames = {
        trustedContacts: stageStatus.trustedContacts.name,
        safetyCheckIns: stageStatus.safetyCheckIns.name,
        emergencyActions: stageStatus.emergencyActions.name,
        // emergencyDrill: stageStatus.emergencyDrill.name,
    };

    // Calculate completed stages count and total stages
    const completedStagesCount = Object.values(stageStatus).filter(stage => stage.isCompleted).length;
    const totalStages = Object.keys(stageStatus).length;

    const handleNavigateToStage = useCallback((stage: SafetyStageId) => {
        setSelectedStageId(stage);
    }, []);

    const handleNavigateToMoreSafetyMeasure = useCallback((measureId: MoreSafetyMeasureId) => {
        setSelectedMoreSafetyMeasureId(measureId);
    }, []);

    if (selectedStageId) {
        return <StageFlow stageId={selectedStageId} onBack={() => setSelectedStageId(null)} />;
    }

    if (selectedMoreSafetyMeasureId) {
        return <StageFlow stageId={selectedMoreSafetyMeasureId} onBack={() => setSelectedMoreSafetyMeasureId(null)} />;
    }

    // Main safety overview screen
    return (
        <SafetyUI
            onNavigateToStage={handleNavigateToStage}
            onBack={onBack}
            stageStatus={transformedStageStatus}
            stageNames={stageNames}
            safetyStages={safetyStages}
            completedStagesCount={completedStagesCount}
            totalStages={totalStages}
            isLoading={isLoading}
            error={error}
            carouselData={carouselData}
            moreSafetyMeasures={moreSafetyMeasures.map(measure => ({
                ...measure,
                onPress: () => handleNavigateToMoreSafetyMeasure(measure.id),
            }))}
            userLanguageStrings={userLanguageStrings}
        />
    );
};
