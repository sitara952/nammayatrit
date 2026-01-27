import nyIcPetAuto from '@/typescript/assets/ny-service/ny_ic_pet_auto.webp';
import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import CrossButton from '@/typescript/designSystem/components/CrossButton';
import { colors } from 'config-types/src/domain/default/themes/colors';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

type PetRideConfirmationModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const PetRideConfirmationModal: React.FC<PetRideConfirmationModalProps> = ({ visible, onClose, onConfirm }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const modalRef = useRef<BottomSheetModal | null>(null);
    const { bottom } = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            modalRef.current?.present();
        } else {
            modalRef.current?.dismiss();
        }
    }, [visible]);

    const handleClose = () => {
        modalRef.current?.dismiss();
    };

    return (
        <PopUpModal
            sheetRef={modalRef}
            enableDynamicSizing={true}
            showBackdrop={undefined}
            onDismiss={onClose}
            onHardwareBackPress={undefined}
            isScrollable={true}
            activeOffsetX={undefined}
            activeOffsetY={undefined}
            failOffsetY={undefined}
            failOffsetX={undefined}
            simultaneousHandlers={undefined}
            waitFor={undefined}>
            <View style={[styles.container, { paddingBottom: bottom }]}>
                <View style={styles.header}>
                    <Typography
                        type="callout"
                        style={styles.heading}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Fewthingbeforeyoutravelwithpet}
                    </Typography>

                    <CrossButton onClick={handleClose} style={styles.crossButton} size={14} />
                </View>

                <Image
                    source={nyIcPetAuto}
                    style={styles.image}
                    resizeMode="contain"
                    accessible={true}
                    accessibilityLabel="pet image"
                />

                <Typography
                    type="callout"
                    style={styles.sectionHeading}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.BeforeYouRide}
                </Typography>

                <Typography
                    type="callout"
                    style={styles.description}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.MakeSureYourPetIsVaccinated}
                </Typography>

                <Typography
                    type="callout"
                    style={styles.sectionHeading}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.DuringTheRide}
                </Typography>

                <Typography
                    type="callout"
                    style={styles.description}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.AvoidFeedingYourPetDuringTheRide}
                </Typography>

                <Typography
                    type="callout"
                    style={[styles.description, styles.descriptionWithMargin]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.LetMakeTheRideSafeAndPleasantForYouYourPetAndTheDriver}
                </Typography>
                <Divider
                    type="dashed"
                    direction={undefined}
                    style={undefined}
                    labelPosition={undefined}
                    offset={undefined}
                    offsetBackground={undefined}
                    dividerColor={'#E0E3E8'}
                    strokeDashArray="8 6"
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ marginBottom: 6 }}>
                        <InfoIcon />
                    </View>
                    <Typography
                        type="callout"
                        style={[styles.description, { marginTop: 8, fontSize: 13 }]}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ByproceedingyouaccepttheaboveTerms}
                    </Typography>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        text={userLanguageStrings.BookRide}
                        style={styles.button}
                        textStyle={styles.buttonText}
                        type="primary"
                        onPress={onConfirm}
                        isLoading={false}
                        disabled={false}
                        testID="pet-ride-confirm-button"
                    />
                </View>
            </View>
        </PopUpModal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    crossButton: {
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#E0E3E8',
        borderWidth: 1,
    },
    heading: {
        flex: 1,
        fontSize: 16,
        color: colors.neutral900,
        lineHeight: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        paddingRight: 8,
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 8,
    },
    sectionHeading: {
        fontSize: 15,
        color: colors.neutral900,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.neutral700,
        marginBottom: 16,
        textAlign: 'left',
        lineHeight: 20,
    },
    descriptionWithMargin: {
        marginVertical: 12,
    },
    buttonContainer: {
        marginBottom: 12,
    },
    button: {
        marginTop: 8,
        borderRadius: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1,
        height: 50,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default PetRideConfirmationModal;
