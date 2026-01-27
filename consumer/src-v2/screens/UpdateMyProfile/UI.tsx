import { View, TextInput, Text, Platform, Keyboard } from 'react-native';
import React, { Fragment } from 'react';
import { Header } from '../../primitives/Header';
import Button from '../../primitives/Button';
import Animated from 'react-native-reanimated';
import Dropdown from '@/src-v2/primitives/Dropdown.tsx';
import { SelectionList } from '@/typescript/components/SelectionList';
import DisabilityScreen from '@/typescript/components/DisabilityScreen';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { createAction } from '@reduxjs/toolkit';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { toScreamingSnakeCase } from '@/src-v2/utils/common';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { UpdateMyProfileScreenProps } from './Types';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { StyleSheet } from 'react-native';
import { capitalize } from 'lodash';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';
import sharedStyles from '@/typescript/constants/style.tsx';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// import { validateInput } from '@/typescript/utils/common.ts';

const UpdateMyProfile: React.FC<UpdateMyProfileScreenProps> = (props: UpdateMyProfileScreenProps) => {
    const safeArea = useSafeAreaInsets();
    const ititialGender = toScreamingSnakeCase(props.userProfile?.gender || '');
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const renderInputField = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        editable = true,
        placeholder = '',
        error: string,
    ) => (
        <Fragment>
            <Text
                style={tailwind.style('text-m text-black mb-2 pt-3')}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={label === props.userLanguageStrings.EmailId ? `${label} optional` : `${label}`}>
                {label}
            </Text>
            <TextInput
                accessibilityLabel="Text input field"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                selectTextOnFocus={true}
                editable={editable}
                style={[
                    {
                        borderWidth: 1,
                        borderColor: colors.recovered.handle,
                        marginBottom: 4,
                        backgroundColor: colors.primitive.white[10],
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderRadius: 8,
                    },
                    tailwind.style(`text-base ${editable ? 'text-black' : 'text-gray-400'}`),
                ]}
            />
            {error ? (
                <Typography
                    style={tailwind.style(`text-[${sharedStyles.errorColor.color}] mb-1`)}
                    type="body-subtext"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {error}
                </Typography>
            ) : undefined}
        </Fragment>
    );

    return (
        <HardwareBackpressHandler>
            <View
                style={styles.container}
                accessibilityElementsHidden={props.hideAssesibility}
                importantForAccessibility={props.hideAssesibility ? 'no-hide-descendants' : 'yes'}>
                <TouchableWithoutFeedback
                    testID="update_profile_backdrop"
                    onPress={Keyboard.dismiss}
                    accessibilityRole="button"
                    accessible={false}>
                    <KeyboardAvoidingView
                        behavior={'padding'}
                        keyboardVerticalOffset={Platform.OS === 'android' ? -(safeArea.bottom - 18) : -10}
                        style={styles.container}>
                        {/* Header component replaces the old header code */}
                        <Header
                            accessibilityElementsHidden={props.hideAssesibility}
                            importantForAccessibility={props.hideAssesibility ? 'no-hide-descendants' : 'yes'}
                            title={props.userLanguageStrings.UpdateProfile}
                            onBackPress={() => props.upDispatch(createAction('GO_BACK')(undefined))}
                        />
                        <Animated.View style={{ flex: 1, marginHorizontal: 22 }}>
                            <ScrollView
                                accessibilityElementsHidden={props.hideAssesibility}
                                importantForAccessibility={props.hideAssesibility ? 'no-hide-descendants' : 'yes'}
                                contentContainerStyle={styles.scrollViewContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}>
                                <View style={{ flex: 1 }}>
                                    {renderInputField(
                                        props.userLanguageStrings.FullName + '*',
                                        props.name,
                                        props.setName,
                                        true,
                                        props.userLanguageStrings.EnterYourFullName,
                                        '',
                                    )}
                                    {renderInputField(
                                        props.userLanguageStrings.MobileNumber,
                                        props.mobileNumber || '',
                                        () => {},
                                        false,
                                        '',
                                        '',
                                    )}
                                    {renderInputField(
                                        props.userLanguageStrings.EmailId,
                                        props.email,
                                        props.setEmail,
                                        !props.userProfile?.email,
                                        !props.userProfile?.email
                                            ? props.userLanguageStrings.EnterYourEmail
                                            : props.userProfile?.email,
                                        props.emailError,
                                    )}
                                    <Dropdown
                                        preSelectedValue={{
                                            text:
                                                props.userProfile?.gender || props.userLanguageStrings.SelectYourGender,
                                            icon: undefined,
                                        }}
                                        label={props.userLanguageStrings.Gender + '*'}
                                        placeHolder={
                                            props.userProfile?.gender
                                                ? capitalize(props.userProfile?.gender)
                                                : props.userLanguageStrings.SelectYourGender
                                        }
                                        dropDownItems={[
                                            { text: props.userLanguageStrings.Male, icon: undefined },
                                            { text: props.userLanguageStrings.Female, icon: undefined },
                                            { text: props.userLanguageStrings.Other, icon: undefined },
                                            { text: props.userLanguageStrings.PreferNotToSay, icon: undefined },
                                        ]}
                                        onSelect={props.setGender}
                                        style={styles.dropdown}
                                        errorText={undefined}
                                        maxTextLen={undefined}
                                        showSelectedItem={undefined}
                                        touchableContainerStyle={undefined}
                                        dropdownContainerStyle={undefined}
                                        itemTextStyle={undefined}
                                        onPress={undefined}
                                        labelTextStyle={{ fontFamily: 'AreaNormal', color: 'black' }}
                                    />
                                    <SelectionList
                                        label={props.userLanguageStrings.AreYouPwd}
                                        optionArray={[props.userLanguageStrings.No, props.userLanguageStrings.Yes]}
                                        onSelect={props.setSelectedDisability}
                                        isSelected={true}
                                        selectedIndex={props.userProfile?.hasDisability ? 1 : 0}
                                        style={{ paddingTop: 24, borderColor: themeColors.Border_primraryHigh }}
                                        labelStyle={{ fontFamily: 'AreaNormal', fontSize: 14 }}
                                        disabled={props?.rideStatus === 'INPROGRESS'}
                                    />
                                </View>
                            </ScrollView>
                            <View style={{ marginBottom: safeArea.bottom }}>
                                <Button
                                    testID="update_profile_continue"
                                    type="primary"
                                    text={props.userLanguageStrings.Continue}
                                    onPress={() => {
                                        if (ititialGender != props.gender) {
                                            logEvent(EventName.PROFILE_GENDER_SELECTED);
                                        }
                                        props.upDispatch({ type: 'CONTINUE_CLICKED', payload: undefined });
                                    }}
                                />
                            </View>

                            <PopUpModal
                                onDismiss={() => props.setHideAssesibility(false)}
                                sheetRef={props.disabilityScreenBottomSheetModalRef}
                                enableDynamicSizing={true}
                                showBackdrop={undefined}
                                onHardwareBackPress={undefined}
                                isScrollable={true}>
                                <DisabilityScreen
                                    selectedDisabilityStr={props.selectedDisabilityStr}
                                    disabilityData={props.disabilityData}
                                    onSubmitFromProps={() =>
                                        props.upDispatch({ type: 'CONTINUE_CLICKED', payload: undefined })
                                    }
                                    editSubmit={true}
                                    stage={undefined}
                                />
                            </PopUpModal>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </View>
        </HardwareBackpressHandler>
    );
};

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backButton: { marginRight: 10 },
    title: { fontSize: 18, fontWeight: '600', color: '#000' },
    formContainer: { paddingHorizontal: 16 },
    scrollViewContent: { flexGrow: 1 },
    dropdown: { paddingTop: 10 },
    selectionList: { paddingTop: 16 },
    footer: { paddingVertical: 16, alignItems: 'center' },
    buttonTextStyle: { fontSize: 16, lineHeight: 15 },
});

export default UpdateMyProfile;
