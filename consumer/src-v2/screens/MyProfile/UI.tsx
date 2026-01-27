import React from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import { tailwind } from '../../../src/typescript/tailwindTheme/tailwind';
import MyProfileDetails from './components/MyProfileDetails';
import { Header } from '../../primitives/Header';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import { MyProfileViewProps } from './Types';
import DisabilityPopUp from './components/DisabilityPopUp.tsx';
import { ScrollView } from 'react-native-gesture-handler';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import EditIcon from '@/typescript/assets/svg/symbols/EditIcon.tsx';
import { createAction } from '@/typescript/utils/common.ts';

const MyProfileScreen: React.FC<MyProfileViewProps> = (props: MyProfileViewProps) => {
    return (
        <HardwareBackpressHandler>
            <View style={[ViewStyleSheet._style0]}>
                <TouchableWithoutFeedback
                    testID="profile_backdrop"
                    accessible={false}
                    onPress={Keyboard.dismiss}
                    accessibilityRole="button">
                    <View style={[ViewStyleSheet._style1]}>
                        <Header
                            title={props.userLanguageStrings.MyProfile}
                            onBackPress={props.onBackPress}
                            nextViewOnPress={() => {
                                if (props.mpDispatch) {
                                    props.mpDispatch(createAction('EDIT', { isDisability: false }));
                                }
                            }}
                            showNextView={true}
                            nextViewIcon={<EditIcon />}
                            nextViewText={props.userLanguageStrings.Edit}
                        />
                        <View style={[ViewStyleSheet._style2]}>
                            <ScrollView contentContainerStyle={tailwind.style('flex-grow bg-gray-100  pb-8')}>
                                <MyProfileDetails
                                    mpDispatch={props.mpDispatch}
                                    email={props.email}
                                    userProfile={props.userProfile}
                                    top={props.top}
                                    disabilityPopUp={props.disabilityPopUp}
                                    name={props.name}
                                    onBackPress={props.onBackPress}
                                    userLanguageStrings={props.userLanguageStrings}
                                    refetch={undefined}
                                    setName={undefined}
                                    showPopup={undefined}
                                    mobileNumber={props.mobileNumber}
                                    rideStatus={props.rideStatus}
                                />
                            </ScrollView>
                            {props.userProfile?.hasDisability && (
                                <PopUpModal
                                    sheetRef={props.disabilityPopUp}
                                    enableDynamicSizing={true}
                                    showBackdrop={undefined}
                                    onHardwareBackPress={undefined}
                                    isScrollable={false}>
                                    <DisabilityPopUp
                                        onClick={async () => {
                                            props.mpDispatch(createAction('CLOSE_POPUP', undefined));
                                        }}
                                    />
                                </PopUpModal>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </HardwareBackpressHandler>
    );
};

export default MyProfileScreen;

const ViewStyleSheet = StyleSheet.create({
    _style0: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
        backgroundColor: '#f3f4f6',
    },
    _style1: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
        backgroundColor: '#f3f4f6',
    },
    _style2: {
        paddingLeft: 20,
        paddingRight: 20,
    },
});
