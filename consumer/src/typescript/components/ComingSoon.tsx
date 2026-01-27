import waitingMascot from '../assets/waiting-mascot.webp';
import React, { useState } from 'react';
import { Modal, View, Image, Text, StyleSheet, Alert } from 'react-native';
import Header from './Header';
import CustomButton from './common/CustomButton';
import { WHITE_COLOR } from '../constants/common';
import sharedStyles from '../constants/style';
import ExploreBridge from './common/ExploreBridge';
import colors from '../designSystem/colorPalette';
import { tailwind } from '../tailwindTheme/tailwind';

import { deleteItem, MMKVKey } from '../utils/MMKV';
import { useConfigContext } from '../context/ConfigContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingNavigationParamList } from '../navigation/globalParamList';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import useDebounceBackPress from '../hooks/useDebounceBackPress';
import { minimizeApp } from '../utils/common';

type ComingSoonProps = {
    navigation: NativeStackNavigationProp<OnboardingNavigationParamList>;
};

function ComingSoon({ navigation }: ComingSoonProps): React.JSX.Element {
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteRequest, setDeleteRequest] = useState<{
        requestedOn: number;
    } | null>(null);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(() => {
        minimizeApp();
        return true;
    });

    const logoutAndDeleteAccount = () => {
        if (!deleteRequest) {
            setDeleteRequest({ requestedOn: Date.now() });
            deleteItem(MMKVKey.SESSION_KEY);
            navigation.navigate('EnterMobileNumber');
        } else {
            setDeleteRequest(null);
        }
        setModalVisible(false);
    };
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <View style={[tailwind.style('flex-1'), { backgroundColor: sharedStyles.appBackground.color }]}>
            <View style={tailwind.style('flex')}>
                <Header
                    backEnabled={false}
                    title={userLanguageStrings.Thanksforshowinginterest}
                    navigation={navigation}
                    isLoggedIn={true}
                    onLogout={logoutAndDeleteAccount}
                    testID="coming_soon_header"
                />
            </View>
            <View style={[tailwind.style('justify-center flex-1'), { alignItems: 'center' }]}>
                <Image source={waitingMascot} accessible={false} style={tailwind.style('rounded-2xl h-80 w-80')} />
                <Text
                    style={{
                        fontSize: 17,
                        width: '80%',
                        textAlign: 'center',
                        marginTop: 20,
                    }}>
                    {userLanguageStrings.Wewillnotifyyouonceweareliveinyourcity}
                </Text>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert(userLanguageStrings.Modalhasbeenclosed);
                    setModalVisible(!modalVisible);
                }}>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="coming_soon_modal_backdrop"
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="coming_soon_modal_close"
                            style={{ alignSelf: 'flex-end' }}
                            onPress={() => setModalVisible(false)}>
                            <Text style={tailwind.style('text-xl')}>X</Text>
                        </TouchableOpacity>

                        <Text style={tailwind.style('text-center font-medium text-xl')}>
                            {userLanguageStrings.Areyousure_QuestionMark}
                        </Text>

                        <View style={tailwind.style('flex mt-10 flex-row')}>
                            <View style={tailwind.style('flex-auto justify-center flex-row')}>
                                <CustomButton
                                    bgColor={`${colors?.recovered?.neutralMin}`}
                                    borderWidth={1}
                                    borderColor={sharedStyles.buttonPrimaryColor.color}
                                    textColor={sharedStyles.buttonPrimaryColor.color}
                                    buttonText={userLanguageStrings.Yes}
                                    onClick={logoutAndDeleteAccount}
                                    leftIcon={undefined}
                                    testID="coming_soon_log_out"
                                />
                            </View>
                            <View style={tailwind.style('flex-auto justify-center flex-row')}>
                                <CustomButton
                                    bgColor={sharedStyles.buttonPrimaryColor.color}
                                    borderColor={sharedStyles.buttonPrimaryColor.color}
                                    borderWidth={1}
                                    textColor={WHITE_COLOR}
                                    buttonText={userLanguageStrings.No}
                                    onClick={() => {
                                        setModalVisible(false);
                                    }}
                                    leftIcon={undefined}
                                    testID="coming_soon_cancel"
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <ExploreBridge style={{ marginBottom: 24 }} />
            <View style={[tailwind.style('flex'), { alignItems: 'center', marginVertical: 16 }]}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={'Delete account button'}
                    testID="coming_soon_delete_account"
                    onPress={() => setModalVisible(true)}>
                    <Text style={tailwind.style('w-max underline pb-1')}>{userLanguageStrings.DeleteAccount}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default ComingSoon;
