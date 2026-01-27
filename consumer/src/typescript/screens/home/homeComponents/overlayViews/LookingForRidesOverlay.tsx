import Button from '@/src-v2/primitives/Button';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

const LookingForRidesOverlay = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { tripDetailsBottomSheetModalRef } = useRefsContext();
    const { top } = useSafeAreaInsets();

    return (
        <>
            <View style={tailwind.style(`absolute top-[${top}px] right-4`)}>
                <Button
                    testID="home_looking_for_rides_overlay"
                    size="md"
                    type="secondary"
                    text={userLanguageStrings.TripDetails}
                    onPress={() => {
                        tripDetailsBottomSheetModalRef.current?.present();
                    }}
                    style={styles.buttonShadow}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    buttonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1,
    },
});

export default LookingForRidesOverlay;
