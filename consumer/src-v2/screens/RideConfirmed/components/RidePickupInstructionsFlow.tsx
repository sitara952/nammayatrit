import React, { useState, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { selectClosestPickupInstruction } from '@/typescript/state/client/user';
import {
    selectPickupInstructionsEditCount,
    incrementPickupInstructionsEditCount,
} from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import {
    usePickupInstructionsClosestGetQuery,
    usePickupInstructionsPostMutation,
} from '@/typescript/state/server/pickupInstructionsApi';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { RidePickupInstructionsUI } from './RidePickupInstructionsUI';

// Type guard function to safely check if a string is a valid BookingId
const isValidBookingId = (id: string | null | undefined): id is BookingId => {
    return id !== null && id !== undefined && id.length > 0;
};

interface RidePickupInstructionsFlowProps {
    rideDetails: rideAPIEntity | null;
    currentLocation: location | null;
    bookingDetails: bookingAPIEntity | null;
}

export const RidePickupInstructionsFlow: React.FC<RidePickupInstructionsFlowProps> = ({
    rideDetails,
    currentLocation,
    bookingDetails,
}) => {
    const dispatch = useAppDispatch();
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const closestPickupInstructionFromRedux = useAppSelector(selectClosestPickupInstruction);
    const [postPickupInstructions] = usePickupInstructionsPostMutation();

    const currentEditCount = useAppSelector(state =>
        selectPickupInstructionsEditCount(state, isValidBookingId(bookingDetails?.id) ? bookingDetails.id : null),
    );

    const [showComponent, setShowComponent] = useState(false);
    const [isInlineEditing, setIsInlineEditing] = useState(false);
    const [editingText, setEditingText] = useState('');
    const [showInlineAudioRecording, setShowInlineAudioRecording] = useState(false);
    const [audioRecordingProps, setAudioRecordingProps] = useState<{
        existingAudioBase64: string | null | undefined;
        openedFromAudioPill: boolean | undefined;
    }>({
        existingAudioBase64: undefined,
        openedFromAudioPill: undefined,
    });

    // Ref to store current audio recorder state for Save button access
    const audioRecorderStateRef = React.useRef<{
        hasRecording: boolean;
        filePath: string | null;
    }>({
        hasRecording: false,
        filePath: null,
    });

    // Show component after 3 seconds delay
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowComponent(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Use FIXED pickup location from booking data (fromLocation or initialPickupLocation)
    // This prevents the component from changing when user moves around
    const pickupLocationParams = useMemo(() => {
        // Try to get pickup location from booking first
        const pickupLat = bookingDetails?.fromLocation?.lat || bookingDetails?.initialPickupLocation?.lat;
        const pickupLng = bookingDetails?.fromLocation?.lon || bookingDetails?.initialPickupLocation?.lon;

        if (pickupLat && pickupLng) {
            console.info('🚗 SAM_DEBUG: Using booking pickup location:', { lat: pickupLat, lon: pickupLng });
            return { lat: pickupLat, lon: pickupLng };
        }

        // Fallback to current location if booking data not available
        if (currentLocation?.lat && currentLocation?.lng) {
            console.info('🚗 SAM_DEBUG: Fallback to current location:', {
                lat: currentLocation.lat,
                lon: currentLocation.lng,
            });
            return { lat: currentLocation.lat, lon: currentLocation.lng };
        }

        return { lat: undefined, lon: undefined };
    }, [
        bookingDetails?.fromLocation?.lat,
        bookingDetails?.fromLocation?.lon,
        bookingDetails?.initialPickupLocation?.lat,
        bookingDetails?.initialPickupLocation?.lon,
        currentLocation?.lat,
        currentLocation?.lng,
    ]);

    // Debug: Track when location params change
    React.useEffect(() => {
        console.info('🚗 SAM_DEBUG: pickupLocationParams changed:', pickupLocationParams);
    }, [pickupLocationParams]);

    // Fetch closest pickup instruction from backend using FIXED pickup location
    const {
        data: closestInstructionData,
        error: _fetchError,
        isLoading,
        refetch,
    } = usePickupInstructionsClosestGetQuery(pickupLocationParams, {
        skip: !showComponent || !pickupLocationParams.lat || !pickupLocationParams.lon, // Only fetch if component should show and we have valid coordinates
    });

    // Use Redux data if available, otherwise use API data - memoize to prevent unnecessary re-renders
    const finalClosestInstructionData = useMemo(() => {
        return closestPickupInstructionFromRedux || closestInstructionData;
    }, [closestPickupInstructionFromRedux, closestInstructionData]);

    // Convert pickupLocationParams to currentLocation format for AudioRecordingModal
    const currentLocationForModal = useMemo(() => {
        if (pickupLocationParams.lat && pickupLocationParams.lon) {
            return {
                lat: pickupLocationParams.lat,
                lon: pickupLocationParams.lon,
            };
        }
        return null;
    }, [pickupLocationParams]);

    // Get location description for audio instruction text - same logic as ConfirmPickup
    const getLocationDescriptionForAudio = useMemo(() => {
        // Try to get location title from booking data
        const locationTitle = bookingDetails?.fromLocation?.title || bookingDetails?.initialPickupLocation?.title;

        if (locationTitle) {
            return locationTitle;
        }

        // Fallback to area/address if no title
        const locationArea = bookingDetails?.fromLocation?.area || bookingDetails?.initialPickupLocation?.area;
        if (locationArea) {
            return locationArea;
        }

        // Final fallback
        return 'Audio Note';
    }, [
        bookingDetails?.fromLocation?.title,
        bookingDetails?.fromLocation?.area,
        bookingDetails?.initialPickupLocation?.title,
        bookingDetails?.initialPickupLocation?.area,
    ]);

    // Check if we have saved instructions (text or audio) - memoize to prevent unnecessary re-renders
    const hasSavedInstructions = useMemo(() => {
        return finalClosestInstructionData?.instruction || finalClosestInstructionData?.audioBase64;
    }, [finalClosestInstructionData?.instruction, finalClosestInstructionData?.audioBase64]);

    const hasAudio = useMemo(() => {
        return finalClosestInstructionData?.audioBase64;
    }, [finalClosestInstructionData?.audioBase64]);

    const isSaveButtonEnabled = useMemo((): boolean => {
        if (showInlineAudioRecording) {
            return Boolean(audioRecorderStateRef.current.hasRecording && audioRecorderStateRef.current.filePath);
        } else {
            return editingText.trim().length > 0;
        }
    }, [
        showInlineAudioRecording,
        editingText,
        audioRecorderStateRef.current.hasRecording,
        audioRecorderStateRef.current.filePath,
    ]);

    const canEditPickupInstructions = useMemo((): boolean => {
        const maxEditCount = newFeatureFlags.pickupInstructionsMaxEditCount || 2;
        const canEdit = currentEditCount < maxEditCount;
        return canEdit;
    }, [currentEditCount, newFeatureFlags.pickupInstructionsMaxEditCount]);

    const showNewBadge = useMemo(() => {
        return newFeatureFlags.enablePickupInstructionsNewPill && !hasSavedInstructions;
    }, [newFeatureFlags.enablePickupInstructionsNewPill, hasSavedInstructions]);

    const handleEditPickupInstructions = useCallback(() => {
        if (!canEditPickupInstructions) {
            return;
        }

        console.info('🚗 SAM_DEBUG: Edit pickup instructions button clicked - showing inline editing');
        setEditingText(finalClosestInstructionData?.instruction || '');
        setIsInlineEditing(true);
    }, [finalClosestInstructionData?.instruction, canEditPickupInstructions]);

    const handleSaveInlineContent = useCallback(async () => {
        if (!pickupLocationParams.lat || !pickupLocationParams.lon) {
            return;
        }

        console.info('🚗 SAM_DEBUG: RideConfirmed - Save button pressed, analyzing content:', {
            showInlineAudioRecording,
            editingText: editingText.trim(),
            hasExistingAudio: !!audioRecordingProps.existingAudioBase64,
            audioRecorderState: audioRecorderStateRef.current,
        });

        // Check if we have audio recording first
        if (showInlineAudioRecording) {
            // Check if we have a recorded file
            if (audioRecorderStateRef.current.hasRecording && audioRecorderStateRef.current.filePath) {
                console.info(
                    '🚗 SAM_DEBUG: RideConfirmed - Found recorded audio file, saving to backend:',
                    audioRecorderStateRef.current.filePath,
                );

                try {
                    await postPickupInstructions({
                        lat: pickupLocationParams.lat,
                        lon: pickupLocationParams.lon,
                        instruction: getLocationDescriptionForAudio.trim(),
                        file: audioRecorderStateRef.current.filePath,
                    }).unwrap();

                    console.info('🚗 SAM_DEBUG: RideConfirmed - Audio instruction saved successfully');

                    // Increment edit count after successful save
                    if (isValidBookingId(bookingDetails?.id)) {
                        dispatch(
                            incrementPickupInstructionsEditCount({
                                id: bookingDetails.id,
                                payload: undefined,
                            }),
                        );
                    }

                    // Close audio recording interface
                    setShowInlineAudioRecording(false);
                    setIsInlineEditing(false);

                    // Force refetch to get fresh data
                    console.info('🚗 SAM_DEBUG: RideConfirmed - Forcing refetch after audio save');
                    await refetch();

                    console.info('🚗 SAM_DEBUG: RideConfirmed - Refetch completed, fresh data should be available');
                    return;
                } catch (error) {
                    console.error('🚗 SAM_DEBUG: RideConfirmed - Failed to save audio instruction:', error);
                    return;
                }
            } else {
                console.warn('🚗 SAM_DEBUG: RideConfirmed - In audio recording mode but no recorded file found');
                // Still close the recording interface
                setShowInlineAudioRecording(false);
                return;
            }
        }

        // Handle text case
        if (!editingText.trim()) {
            console.info('🚗 SAM_DEBUG: RideConfirmed - No text to save');
            return;
        }

        console.info('🚗 SAM_DEBUG: RideConfirmed - Saving inline text:', editingText.trim());

        try {
            await postPickupInstructions({
                lat: pickupLocationParams.lat,
                lon: pickupLocationParams.lon,
                instruction: editingText.trim(),
                file: undefined,
            }).unwrap();

            console.info('🚗 SAM_DEBUG: RideConfirmed - Text instruction saved successfully');

            // Increment edit count after successful save
            if (isValidBookingId(bookingDetails?.id)) {
                dispatch(
                    incrementPickupInstructionsEditCount({
                        id: bookingDetails.id,
                        payload: undefined,
                    }),
                );
            }

            // Close editing mode
            setIsInlineEditing(false);
            setEditingText('');

            // Force refetch to get fresh data
            console.info('🚗 SAM_DEBUG: RideConfirmed - Forcing refetch after text save');
            await refetch();
        } catch (error) {
            console.error('🚗 SAM_DEBUG: RideConfirmed - Failed to save text instruction:', error);
        }
    }, [
        editingText,
        pickupLocationParams,
        postPickupInstructions,
        showInlineAudioRecording,
        audioRecordingProps.existingAudioBase64,
        refetch,
    ]);

    const handleMicrophonePress = useCallback(() => {
        console.info('🚗 SAM_DEBUG: Microphone button pressed - showing inline audio recording');
        setAudioRecordingProps({
            existingAudioBase64: null,
            openedFromAudioPill: false,
        });
        setShowInlineAudioRecording(true);
    }, []);

    const handleAudioRecordingClose = useCallback(() => {
        console.info('🚗 SAM_DEBUG: Inline audio recording closed');
        setShowInlineAudioRecording(false);
        setAudioRecordingProps({
            existingAudioBase64: undefined,
            openedFromAudioPill: undefined,
        });
    }, []);

    const handleAudioRecordingComplete = useCallback(
        async (filePath: string) => {
            console.info('🚗 SAM_DEBUG: RideConfirmed - Audio recording completed:', filePath);

            if (!pickupLocationParams.lat || !pickupLocationParams.lon) {
                return;
            }

            try {
                await postPickupInstructions({
                    lat: pickupLocationParams.lat,
                    lon: pickupLocationParams.lon,
                    instruction: getLocationDescriptionForAudio.trim(),
                    file: filePath,
                }).unwrap();

                console.info('🚗 SAM_DEBUG: RideConfirmed - Audio instruction saved successfully');

                // Increment edit count after successful save
                if (isValidBookingId(bookingDetails?.id)) {
                    dispatch(
                        incrementPickupInstructionsEditCount({
                            id: bookingDetails.id,
                            payload: undefined,
                        }),
                    );
                }

                // Close audio recording interface
                setShowInlineAudioRecording(false);
                setIsInlineEditing(false);

                // Force refetch to get fresh data including the new audio
                console.info('🚗 SAM_DEBUG: RideConfirmed - Forcing refetch after audio upload');
                await refetch();

                console.info('🚗 SAM_DEBUG: RideConfirmed - Refetch completed, fresh data should be available');
            } catch (error) {
                console.error('🚗 SAM_DEBUG: RideConfirmed - Failed to save audio instruction:', error);
                // Still close the recording interface even if save fails
                setShowInlineAudioRecording(false);
                setIsInlineEditing(false);
            }
        },
        [pickupLocationParams, postPickupInstructions, refetch, getLocationDescriptionForAudio],
    );

    const handlePillPress = useCallback(
        (pill: { text: string; hasAudio: boolean | undefined; audioBase64: string | undefined }) => {
            console.info('🚗 SAM_DEBUG: Pill pressed:', pill);

            if (pill.hasAudio && pill.audioBase64) {
                // Audio pill: Show same AudioRecordingModal as microphone click but with preloaded audio
                console.info('🚗 SAM_DEBUG: Audio pill clicked, opening AudioRecordingModal with preloaded audio');
                setAudioRecordingProps({
                    existingAudioBase64: pill.audioBase64,
                    openedFromAudioPill: true,
                });
                setShowInlineAudioRecording(true);
            } else {
                // Text pill: Fill the text input
                setEditingText(prevText => {
                    const newText = prevText ? `${prevText} ${pill.text}` : pill.text;
                    return newText;
                });
            }
        },
        [],
    );

    const setEditingTextExternal = useCallback((text: string) => {
        setEditingText(text);
    }, []);

    // Early returns for conditions when component should not render
    if (!newFeatureFlags.enablePickupInstructions) {
        return null;
    }

    if (rideDetails?.status !== 'NEW') {
        return null;
    }

    if (!showComponent) {
        return null;
    }

    if (isLoading) {
        return null;
    }

    return (
        <RidePickupInstructionsUI
            finalClosestInstructionData={finalClosestInstructionData}
            hasSavedInstructions={!!hasSavedInstructions}
            hasAudio={!!hasAudio}
            showNewBadge={showNewBadge}
            isInlineEditing={isInlineEditing}
            editingText={editingText}
            showInlineAudioRecording={showInlineAudioRecording}
            audioRecordingProps={audioRecordingProps}
            newFeatureFlags={newFeatureFlags}
            currentLocationForModal={currentLocationForModal}
            isSaveButtonEnabled={isSaveButtonEnabled}
            canEditPickupInstructions={canEditPickupInstructions}
            currentEditCount={currentEditCount}
            onEditPickupInstructions={handleEditPickupInstructions}
            onSaveInlineContent={handleSaveInlineContent}
            onMicrophonePress={handleMicrophonePress}
            onAudioRecordingClose={handleAudioRecordingClose}
            onAudioRecordingComplete={handleAudioRecordingComplete}
            onPillPress={handlePillPress}
            onEditingTextChange={setEditingTextExternal}
            onRecorderStateChange={state => {
                audioRecorderStateRef.current = state;
            }}
        />
    );
};
