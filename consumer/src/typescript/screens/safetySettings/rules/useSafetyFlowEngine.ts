import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safetyRules } from './stages';
import { Renderable, SafetyContext } from './schema';
import { useSafetyHook } from '../../safety/SafetyHook';
import { SafetyStageId } from '../../safety/Types';
import { updateEmergencySettingsReq } from '../../../../readOnly/api/types/UpdateEmergencySettingsReq.gen';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';

export const useSafetyFlowEngine = (
    stageId: SafetyStageId,
    manageContactsRef: React.RefObject<BottomSheetModal | null> | undefined,
) => {
    const { emergencySettings, isLoading, updateEmergencySettings, updateEmergencyContacts, refetch, stageStatus } =
        useSafetyHook();
    const configManager = useConfigContext();
    const appName = useAppSelector(selectAppReadableName);
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [draft, setDraft] = useState<SafetyContext['draft']>({
        selectedDefaultContactId: undefined,
        updatedEmergencyContacts: undefined,
        contactPreferences: undefined,
    });

    // Navigation state
    const [index, setIndex] = useState(0);
    const [isInEditMode, setIsInEditMode] = useState(false);
    const hasNavigatedRef = useRef(false); // Track if user has navigated through steps

    // Create stable safety context
    const safetyContext: SafetyContext = useMemo(
        () => ({
            emergencySettings,
            isLoading,
            updateEmergencySettings: (data: Partial<updateEmergencySettingsReq>) =>
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                updateEmergencySettings(data as updateEmergencySettingsReq),
            updateEmergencyContacts,
            refetch,
            draft,
            setDraft: updater => setDraft(prev => updater(prev)),
            manageContactsRef:
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                manageContactsRef || (React.createRef<BottomSheetModal>() as React.RefObject<BottomSheetModal | null>),
            isInEditMode,
            userLanguageStrings,
            appName,
        }),
        [
            emergencySettings,
            isLoading,
            updateEmergencySettings,
            updateEmergencyContacts,
            refetch,
            draft,
            manageContactsRef,
            isInEditMode,
            userLanguageStrings,
            appName,
        ],
    );

    // Get stage configuration and completion status
    const stage = useMemo(() => safetyRules.find(s => s.id === stageId), [stageId]);
    const visibleSteps = useMemo(() => stage?.steps ?? [], [stage]);

    const isStageCompleted = useMemo(() => {
        const statusMap = {
            trustedContacts: stageStatus.trustedContacts.isCompleted,
            safetyCheckIns: stageStatus.safetyCheckIns.isCompleted,
            emergencyActions: stageStatus.emergencyActions.isCompleted,
            // emergencyDrill: stageStatus.emergencyDrill.isCompleted,
            safetyTips: false, // These don't have completion tracking
            emergencyContacts: false, // These don't have completion tracking
        };
        return statusMap[stageId] ?? false;
    }, [stageId, stageStatus]);

    const currentStep = visibleSteps[index];

    // Auto-enter edit mode for completed stages (only on initial entry, not during navigation)
    useEffect(() => {
        if (isStageCompleted && index === 0 && !hasNavigatedRef.current) {
            console.info('cvc hasNavigatedRef.current', hasNavigatedRef.current);
            setIsInEditMode(true);
        }
    }, [isStageCompleted, index]);

    // Auto-exit edit mode when stage becomes incomplete
    useEffect(() => {
        if (!isStageCompleted && isInEditMode) {
            setIsInEditMode(false);
            setIndex(0);
            hasNavigatedRef.current = false; // Reset navigation tracking
        }
    }, [isStageCompleted, isInEditMode]);

    // Generate components based on current mode
    const components: Renderable[] = useMemo(() => {
        if (isInEditMode && isStageCompleted) {
            // Consolidated view: show all step components together
            return visibleSteps.flatMap(step => step.components(safetyContext));
        }
        // Step-by-step view: show current step only
        return currentStep ? currentStep.components(safetyContext) : [];
    }, [isInEditMode, isStageCompleted, visibleSteps, currentStep, safetyContext]);

    // Navigation helpers
    const canGoNext = !isInEditMode && index < visibleSteps.length - 1;
    const canGoPrev = !isInEditMode && index > 0;
    const goPrev = useCallback(() => {
        hasNavigatedRef.current = true; // Mark that user has navigated
        setIndex(i => Math.max(i - 1, 0));
    }, []);

    const goNext = useCallback(async () => {
        if (isInEditMode) {
            console.info('cvc draft', draft);
            // Edit mode: save draft changes and exit
            if (Object.keys(draft).length > 0) {
                try {
                    // Handle emergency contacts priority updates separately
                    if (draft.updatedEmergencyContacts) {
                        console.info('cvc updatedEmergencyContacts', draft.updatedEmergencyContacts);
                        await safetyContext.updateEmergencyContacts(draft.updatedEmergencyContacts);
                        console.info('Emergency contacts updated with new priorities');
                    }

                    // Handle contact preferences updates
                    if (draft.contactPreferences) {
                        console.info('cvc contactPreferences', draft.contactPreferences);
                        const currentContacts = safetyContext.emergencySettings?.defaultEmergencyNumbers ?? [];
                        const updatedContacts = currentContacts.map(contact => ({
                            ...contact,
                            shareTripWithEmergencyContactOption:
                                draft.contactPreferences?.[contact.mobileNumber] ||
                                contact.shareTripWithEmergencyContactOption,
                        }));
                        console.info('cvc updatedContacts', updatedContacts);
                        await safetyContext.updateEmergencyContacts(updatedContacts);
                        console.info('Contact preferences updated successfully');
                    }

                    // Handle other emergency settings updates
                    const {
                        updatedEmergencyContacts: _updatedEmergencyContacts,
                        selectedDefaultContactId: _selectedDefaultContactId,
                        contactPreferences: _contactPreferences,
                        ...otherSettings
                    } = draft;
                    if (Object.keys(otherSettings).length > 0) {
                        await safetyContext.updateEmergencySettings(otherSettings);
                        console.info('Other emergency settings updated');
                    }

                    // Refresh data to ensure changes persist
                    await safetyContext.refetch();

                    // Reset draft state
                    setDraft({
                        selectedDefaultContactId: undefined,
                        updatedEmergencyContacts: undefined,
                        contactPreferences: undefined,
                    });
                } catch (error) {
                    console.error('API call failed:', error);
                }
            }
            return;
        }

        // Step-by-step mode: execute current step and advance
        if (index < visibleSteps.length - 1) {
            hasNavigatedRef.current = true; // Mark that user has navigated
        }

        if (currentStep?.onNext) {
            await currentStep.onNext(safetyContext);
        }

        console.info('cvc can go next ', index, visibleSteps.length);
        if (index < visibleSteps.length - 1) {
            setIndex(i => i + 1);
        }
    }, [isInEditMode, draft, safetyContext, currentStep, index, visibleSteps.length]);

    return {
        // Stage configuration
        stage,
        steps: visibleSteps,

        // Navigation state
        index,
        setIndex,
        canGoNext,
        canGoPrev,
        goNext,
        goPrev,

        // UI state
        components,
        isStageCompleted,
        isInEditMode,

        // Navigation control
        setHasNavigated: (value: boolean) => {
            hasNavigatedRef.current = value;
        },

        // Context
        safetyContext,
    };
};
