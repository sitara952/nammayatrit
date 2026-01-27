import React, { useState } from 'react';
import { View, Alert, Keyboard } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Header } from '../../../../src-v2/primitives/Header';
import { SafetyStageId } from '../safety/Types';
import { useSafetyFlowEngine } from './rules/useSafetyFlowEngine';
import { renderRenderable } from './rules/registry';
import Button from '../../../../src-v2/primitives/Button';
import ContactModal from './components/ContactModal';
import ManualContactModal from './components/ManualContactModal';
import ContactPickerModal from './components/ContactPickerModal';
import LoadingOverlay from './components/LoadingOverlay';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { personDefaultEmergencyNumber } from '@/readOnly/api/types/PersonDefaultEmergencyNumber.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

export const StageFlow: React.FC<{ stageId: SafetyStageId; onBack: () => void }> = ({ stageId, onBack }) => {
    const { addContactManuallyRef, manageContactsRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const { stage, components, goNext, goPrev, canGoPrev, canGoNext, isInEditMode, safetyContext, setHasNavigated } =
        useSafetyFlowEngine(stageId, manageContactsRef);

    const [showContactPicker, setShowContactPicker] = useState(false);
    const [isUpdatingContacts, setIsUpdatingContacts] = useState(false);

    if (!stage) return null;

    const getTranslatedTitle = (titleKey: string) => {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const translation = userLanguageStrings[titleKey as keyof typeof userLanguageStrings];
        return typeof translation === 'string' ? translation : titleKey;
    };

    // Determine button text based on stage
    const getButtonText = () => {
        if (isInEditMode) return 'Done';
        if (stageId === 'trustedContacts') {
            // Check if we have contacts to determine button text
            const hasContacts =
                safetyContext?.emergencySettings?.defaultEmergencyNumbers &&
                safetyContext.emergencySettings.defaultEmergencyNumbers.length > 0;

            if (!hasContacts) {
                return 'Add Contact';
            }
        }
        if (stageId === 'safetyTips' || stageId === 'emergencyContacts') {
            return 'Done';
        }
        return canGoNext ? 'Next' : 'Complete';
    };

    // Handle button press based on stage
    const handleButtonPress = async () => {
        if (isInEditMode) {
            // For edit mode, save changes and go back
            await goNext();
            onBack();
            return;
        }

        if (stageId === 'trustedContacts') {
            // Check if we have contacts to determine what to do
            const hasContacts =
                safetyContext?.emergencySettings?.defaultEmergencyNumbers &&
                safetyContext.emergencySettings.defaultEmergencyNumbers.length > 0;

            if (!hasContacts) {
                // No contacts yet, show the modal to add contacts
                manageContactsRef.current?.present();
                return;
            } else {
                // Has contacts, check if we're on the last step
                if (canGoNext) {
                    // Go to next step
                    await goNext();
                } else {
                    // On last step, complete the stage and go back to overview
                    await goNext(); // This will complete the stage
                    onBack(); // Go back to overview
                }
                return;
            }
        }

        // Normal step-by-step flow
        await goNext();
        // If we're on the last step, go back to overview after completing
        if (!canGoNext) {
            onBack();
        }
    };

    // Handle contact modal actions
    const handleChooseFromContacts = () => {
        setShowContactPicker(true);
        manageContactsRef.current?.close();
    };

    const handleAddManually = () => {
        console.info('Add manually selected');
        manageContactsRef.current?.close();
        addContactManuallyRef.current?.present();
    };

    const handleContactAdded = async () => {
        console.info('Contact added successfully');
        try {
            setHasNavigated(true); // Set the flag BEFORE refetch to prevent premature edit mode
            // Refresh the emergency settings data to show the newly added contact
            await safetyContext.refetch();
            console.info('Emergency settings refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh emergency settings:', error);
        }
    };

    const closeManageContacts = () => {
        manageContactsRef.current?.dismiss();
    };

    const handleContactsAdded = async (newContacts: personDefaultEmergencyNumber[]) => {
        try {
            setIsUpdatingContacts(true);
            setHasNavigated(true); // Set the flag BEFORE API call to prevent premature edit mode

            // Add the new contacts to existing ones
            const currentContacts = safetyContext?.emergencySettings?.defaultEmergencyNumbers || [];
            const updatedContacts = [...currentContacts, ...newContacts];
            await safetyContext.updateEmergencyContacts(updatedContacts);

            Alert.alert('Success', 'Contacts added successfully!');
        } catch (error) {
            console.error('Error adding contacts:', error);
            Alert.alert('Error', 'Failed to add contacts. Please try again.');
        } finally {
            setIsUpdatingContacts(false);
        }
    };

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => (canGoPrev ? goPrev() : onBack())}>
            <View style={{ flex: 1, backgroundColor: '#f7f7f7', paddingBottom: bottom }}>
                <Header title={getTranslatedTitle(stage.title)} onBackPress={() => (canGoPrev ? goPrev() : onBack())} />
                <ScrollView>{components.map((component, index) => renderRenderable(component, index))}</ScrollView>

                <View style={{ paddingHorizontal: 16 }}>
                    <Button
                        testID="safety-stage-next"
                        onPress={handleButtonPress}
                        text={getButtonText()}
                        type="primary"
                    />
                </View>

                {/* Contact Selection Modal - only rendered for trusted contacts stage */}

                <PopUpModal
                    sheetRef={manageContactsRef}
                    isScrollable={false}
                    showBackdrop={true}
                    onHardwareBackPress={closeManageContacts}
                    onDismiss={closeManageContacts}
                    enableDynamicSizing={true}
                    borderRadius={24}>
                    <ContactModal
                        sheetRef={manageContactsRef}
                        onClose={closeManageContacts}
                        onChooseFromContacts={handleChooseFromContacts}
                        onAddManually={handleAddManually}
                    />
                </PopUpModal>

                {/* Manual Contact Entry Modal */}
                <PopUpModal
                    sheetRef={addContactManuallyRef}
                    isScrollable={false}
                    showBackdrop={true}
                    onHardwareBackPress={() => {
                        Keyboard.dismiss();
                        addContactManuallyRef.current?.dismiss();
                    }}
                    enableDynamicSizing={true}
                    keyboardBehavior="interactive">
                    <ManualContactModal
                        onContactAdded={handleContactAdded}
                        existingContacts={
                            stageId === 'trustedContacts'
                                ? safetyContext?.emergencySettings?.defaultEmergencyNumbers || []
                                : []
                        }
                    />
                </PopUpModal>

                {/* Contact Picker Modal */}
                <ContactPickerModal
                    visible={showContactPicker}
                    onClose={() => setShowContactPicker(false)}
                    onContactsAdded={handleContactsAdded}
                    existingContacts={
                        stageId === 'trustedContacts'
                            ? safetyContext?.emergencySettings?.defaultEmergencyNumbers || []
                            : []
                    }
                />

                {/* Loading Overlay for Contact Updates */}
                <LoadingOverlay visible={isUpdatingContacts} message="Updating emergency contacts..." />
            </View>
        </HardwareBackpressHandler>
    );
};
