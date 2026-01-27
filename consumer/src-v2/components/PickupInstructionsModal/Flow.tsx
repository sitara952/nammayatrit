import React, { useMemo } from 'react';
import { PickupInstructionsModal } from './UI';
import { PickupInstructionsModalProps, PickupInstructionsPillOption } from './Types';
import { useConfigContext } from '../../../src/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { useAppSelector } from '../../../src/typescript/state/hooks';
import { selectNewFeatureFlags } from '../../../src/typescript/state/client/session';
import { selectClosestPickupInstruction } from '../../../src/typescript/state/client/user';
import {
    usePickupInstructionsPostMutation,
    usePickupInstructionsDeleteMutation,
} from '../../../src/typescript/state/server/pickupInstructionsApi';
import { getLocationInstructionText } from '../../helpers/location/utils/locationDescription';

export const createPillOptions = (userLanguageStrings: strings): PickupInstructionsPillOption[] => [
    { id: '1', text: userLanguageStrings.BacksideOf, isFromBackend: false },
    { id: '2', text: userLanguageStrings.ComeTo, isFromBackend: false },
    { id: '3', text: userLanguageStrings.InfrontOf, isFromBackend: false },
    { id: '4', text: userLanguageStrings.IAmAt, isFromBackend: false },
];

export const PickupInstructionsModalFlow: React.FC<PickupInstructionsModalProps> = React.memo(
    ({
        isVisible,
        onClose,
        onAddNote,
        headerText,
        placeholder,
        buttonText,
        maxLength,
        inline = false,
        savedInstructions = null,
        onRemoveNote,
        showNewBadge = false,
        backendInstructions = [],
        onSaveToBackend,
        canEdit = true,
        onAudioRecordingComplete,
        closestInstructionData = null,
        currentLocation = null,
        currentLocationObject = undefined,
        fromConfirmPickup = false,
    }) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
        const [postPickupInstructions] = usePickupInstructionsPostMutation();
        const [deletePickupInstructions] = usePickupInstructionsDeleteMutation();

        // Get closest pickup instruction from Redux store (auto-populated by API)
        const closestPickupInstructionFromRedux = useAppSelector(selectClosestPickupInstruction);

        // Use Redux data if available, otherwise fall back to prop
        // Memoize the final instruction data to prevent unnecessary re-calculations
        const finalClosestInstructionData = React.useMemo(() => {
            return closestInstructionData || closestPickupInstructionFromRedux;
        }, [closestInstructionData, closestPickupInstructionFromRedux]);

        // Only log when props actually change (reduce console spam)
        React.useEffect(() => {
            console.info('SAM_DEBUG: PickupInstructionsModalFlow rendered with canEdit =', canEdit);
        }, [canEdit, isVisible]);
        // console.info('SAM_DEBUG: PickupInstructionsModalFlow closestInstruction sources:', {
        //     fromProp: closestInstructionData,
        //     fromRedux: closestPickupInstructionFromRedux,
        //     final: finalClosestInstructionData,
        // });

        // Memoize default values to prevent re-calculations
        const finalHeaderText = React.useMemo(() => {
            return headerText || userLanguageStrings.AddANoteForSmoothPickup;
        }, [headerText, userLanguageStrings.AddANoteForSmoothPickup]);

        const finalPlaceholder = React.useMemo(() => {
            return placeholder || userLanguageStrings.AddYourNote;
        }, [placeholder, userLanguageStrings.AddYourNote]);

        const finalButtonText = React.useMemo(() => {
            return buttonText || userLanguageStrings.AddNote;
        }, [buttonText, userLanguageStrings.AddNote]);

        const finalMaxLength = React.useMemo(() => {
            return maxLength ?? newFeatureFlags.pickupInstructionsCharLimit ?? 60;
        }, [maxLength, newFeatureFlags.pickupInstructionsCharLimit]);

        const pillOptions: PickupInstructionsPillOption[] = useMemo(() => {
            // console.info('SAM_DEBUG: PickupInstructionsModalFlow - Creating pills with:', {
            //     backendInstructions,
            //     finalClosestInstructionData,
            // });

            // Create pills from backend instructions first
            const backendPills: PickupInstructionsPillOption[] = (backendInstructions || []).map(
                (instruction, index) => {
                    // Check if this backend instruction matches the closest instruction with audio
                    const hasAudio =
                        finalClosestInstructionData &&
                        finalClosestInstructionData.instruction === instruction &&
                        finalClosestInstructionData.audioBase64;

                    return {
                        id: `backend_${index}`,
                        text: instruction,
                        isFromBackend: true,
                        audioBase64: hasAudio ? finalClosestInstructionData.audioBase64 : undefined,
                    };
                },
            );

            // Add pill from closest instruction data if it has audio but is NOT already in backend instructions
            const closestPills: PickupInstructionsPillOption[] =
                finalClosestInstructionData &&
                finalClosestInstructionData.instruction &&
                finalClosestInstructionData.audioBase64
                    ? (() => {
                          const alreadyInBackend = (backendInstructions || []).includes(
                              finalClosestInstructionData.instruction,
                          );
                          return !alreadyInBackend
                              ? [
                                    {
                                        id: 'closest_audio',
                                        text: finalClosestInstructionData.instruction,
                                        isFromBackend: true,
                                        audioBase64: finalClosestInstructionData.audioBase64,
                                    },
                                ]
                              : [];
                      })()
                    : [];

            // Create default pills
            const defaultPills: PickupInstructionsPillOption[] = [
                { id: '1', text: userLanguageStrings.BacksideOf, isFromBackend: false },
                { id: '2', text: userLanguageStrings.ComeTo, isFromBackend: false },
                { id: '3', text: userLanguageStrings.InfrontOf, isFromBackend: false },
                { id: '4', text: userLanguageStrings.IAmAt, isFromBackend: false },
            ];

            // Combine all pills: closest audio pill + backend pills + default pills to make exactly 4 pills
            const allSpecialPills = [...closestPills, ...backendPills];
            const remainingSlots = 4 - allSpecialPills.length;

            // console.info('SAM_DEBUG: PickupInstructionsModalFlow - Final pills:', {
            //     closestPills,
            //     backendPills,
            //     allSpecialPills,
            //     remainingSlots,
            // });

            if (remainingSlots > 0) {
                return [...allSpecialPills, ...defaultPills.slice(0, remainingSlots)];
            }

            return allSpecialPills;
        }, [backendInstructions, userLanguageStrings, finalClosestInstructionData]);

        const handleAddNote = React.useCallback(
            (note: string) => {
                // Only call onAddNote if there's actually a note to add
                if (note.trim()) {
                    console.info('SAM_DEBUG: PickupInstructionsModalFlow - Adding note:', {
                        note: note.trim(),
                        canEdit,
                        isFromBackend: (backendInstructions || []).includes(note.trim()),
                    });

                    onAddNote(note);

                    // Save to backend if this is a user-edited instruction and callback is provided
                    if (onSaveToBackend && note.trim()) {
                        // Check if this note matches any of the default pills
                        const defaultTexts = [
                            userLanguageStrings.BacksideOf,
                            userLanguageStrings.ComeTo,
                            userLanguageStrings.InfrontOf,
                            userLanguageStrings.IAmAt,
                        ];

                        // Only save to backend if it's NOT a pure default pill (user modified it or it's from backend)
                        const isDefaultPill = defaultTexts.includes(note.trim());
                        const isFromBackend = (backendInstructions || []).includes(note.trim());

                        // Save if: 1) Not a default pill, 2) Is from backend (user selected existing), 3) User modified text
                        if (!isDefaultPill || isFromBackend) {
                            console.info('SAM_DEBUG: PickupInstructionsModalFlow - Saving to backend:', {
                                note: note.trim(),
                                isDefaultPill,
                                isFromBackend,
                                shouldSave: !isDefaultPill || isFromBackend,
                            });
                            onSaveToBackend(note.trim());
                        } else {
                            console.info(
                                'SAM_DEBUG: PickupInstructionsModalFlow - Skipping save (pure default pill):',
                                {
                                    note: note.trim(),
                                    isDefaultPill,
                                    isFromBackend,
                                },
                            );
                        }
                    }
                } else {
                    console.info('SAM_DEBUG: PickupInstructionsModalFlow - No note to add, skipping');
                }
            },
            [onAddNote, canEdit, backendInstructions, onSaveToBackend, userLanguageStrings],
        );

        const handleAudioRecordingComplete = React.useCallback(
            async (filePath: string) => {
                try {
                    console.info('🚗 SAM_DEBUG: PickupInstructionsModalFlow - Audio recording completed:', filePath);
                    onClose();

                    // Use actual current location from props, fallback to defaults if not available
                    const lat = currentLocation?.lat || 12.942188;
                    const lon = currentLocation?.lon || 77.622048;

                    // Get location-specific instruction text
                    const instructionText = getLocationInstructionText(currentLocationObject);

                    await postPickupInstructions({
                        lat,
                        lon,
                        instruction: instructionText.trim(),
                        file: filePath,
                    }).unwrap();

                    console.info(
                        '🚗 SAM_DEBUG: PickupInstructionsModalFlow - Audio pickup instruction saved successfully with location:',
                        { lat, lon },
                    );

                    // Call the original callback if provided
                    if (onAudioRecordingComplete) {
                        onAudioRecordingComplete(filePath);
                    }
                } catch (error) {
                    console.error(
                        '🚗 SAM_DEBUG: PickupInstructionsModalFlow - Failed to save audio pickup instruction:',
                        error,
                    );
                }
            },
            [postPickupInstructions, onAudioRecordingComplete, onClose, currentLocation, currentLocationObject],
        );

        const handleDeleteInstruction = React.useCallback(async () => {
            try {
                if (!currentLocation) {
                    console.error('🚗 No current location available for delete');
                    return;
                }

                console.info('🚗 Deleting entire pickup instruction:', {
                    lat: currentLocation.lat,
                    lon: currentLocation.lon,
                    target: 'Instruction',
                });

                await deletePickupInstructions({
                    lat: currentLocation.lat,
                    lon: currentLocation.lon,
                    target: 'Instruction',
                }).unwrap();

                console.info('🚗 Successfully deleted pickup instruction');

                // Call onRemoveNote if available to update parent state
                if (onRemoveNote) {
                    onRemoveNote();
                }
            } catch (error) {
                console.error('🚗 Error deleting pickup instruction:', error);
            }
        }, [deletePickupInstructions, currentLocation, onRemoveNote]);

        // Memoize saved instructions to prevent unnecessary re-calculations
        const finalSavedInstructions = React.useMemo(() => {
            return savedInstructions || finalClosestInstructionData?.instruction || null;
        }, [savedInstructions, finalClosestInstructionData?.instruction]);

        // Return null if pickup instructions feature is disabled
        if (!newFeatureFlags.enablePickupInstructions) {
            return null;
        }

        console.info('🚗 SAM_DEBUG: PickupInstructionsModalFlow - Rendering UI with currentLocation:', currentLocation);

        return (
            <PickupInstructionsModal
                isVisible={isVisible}
                onClose={onClose}
                onAddNote={handleAddNote}
                headerText={finalHeaderText}
                placeholder={finalPlaceholder}
                buttonText={finalButtonText}
                maxLength={finalMaxLength}
                inline={inline}
                savedInstructions={finalSavedInstructions}
                onRemoveNote={onRemoveNote}
                pillOptions={pillOptions}
                showNewBadge={showNewBadge}
                backendInstructions={backendInstructions}
                onSaveToBackend={onSaveToBackend}
                canEdit={canEdit}
                onAudioRecordingComplete={handleAudioRecordingComplete}
                closestInstructionData={finalClosestInstructionData}
                fromConfirmPickup={fromConfirmPickup}
                currentLocation={currentLocation}
                onDeleteInstruction={handleDeleteInstruction}
            />
        );
    },
);
