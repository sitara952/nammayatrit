// components/SafetySetUpModal.tsx

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Typography from '../designSystem/components/primitives/Typography';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import CrossButton from '@/typescript/designSystem/components/CrossButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AddManually from '@/typescript/assets/ny-service/mt_ic_add_manually.webp';
import AddUser from '@/typescript/assets/ny-service/mt_ic_add_user.webp';

type SafetySetUpModalProps = {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    primaryText: string | undefined;
    secondaryText: string | undefined;
};

const SafetySetUpModal: React.FC<SafetySetUpModalProps> = ({ sheetRef, primaryText, secondaryText }) => {
    return (
        <>
            <View style={styles.headerContainer}>
                <Typography
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.headerText}
                    type="subhead-700"
                    accessibilityRole={undefined}>
                    {primaryText}
                </Typography>
                <CrossButton
                    onClick={() => {
                        sheetRef.current?.dismiss();
                    }}
                    style={styles.crossButton}
                    size={14}
                />
            </View>

            <View>
                <Typography
                    type="body-1"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.descriptionText}
                    accessibilityRole={undefined}>
                    {primaryText}
                </Typography>
            </View>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="dffd"
                    style={styles.optionButton}
                    onPress={() => {
                        sheetRef.current?.dismiss();
                    }}>
                    <Image
                        style={styles.optionIconSmall}
                        source={AddUser}
                        accessible={true}
                        accessibilityLabel="add user image"
                    />
                    <Typography
                        type="subhead-3"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.optionText}
                        accessibilityRole={undefined}>
                        {secondaryText}
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    accessibilityRole="button"
                    testID="abcd"
                    style={styles.optionButtonLast}
                    onPress={() => {
                        sheetRef.current?.dismiss();
                    }}>
                    <Image style={styles.optionIconLarge} source={AddManually} accessible={false} />
                    <Typography
                        type="subhead-3"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.optionText}
                        accessibilityRole={undefined}>
                        {secondaryText}
                    </Typography>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
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
    descriptionText: {
        marginHorizontal: 16,
        marginVertical: 4,
        fontSize: 16,
    },
    optionsContainer: {
        flexDirection: 'column',
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    optionButton: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 16,
        borderRadius: 12,
    },
    optionButtonLast: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        marginBottom: 32,
        borderRadius: 12,
    },
    optionIconSmall: {
        height: 20,
        width: 20,
    },
    optionIconLarge: {
        height: 32,
        width: 32,
        marginLeft: 8,
    },
    optionText: {
        fontSize: 16,
    },
});

export default SafetySetUpModal;
