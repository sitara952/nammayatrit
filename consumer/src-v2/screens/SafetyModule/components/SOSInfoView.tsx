import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import { PointersView } from './PointersView';
import Tag from '../../../../src/typescript/designSystem/components/primitives/Tag';
import colors from '../../../../src/typescript/designSystem/colorPalette';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../../src/typescript/state/hooks';

import { selectDefaultContact } from '../../../../src/typescript/state/client/sos';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const handleCall = (phoneNumber: string | undefined) => {
    if (phoneNumber === undefined) {
        console.error('Phone Number is empty');
    } else {
        Linking.openURL(`tel:${phoneNumber}`);
    }
};

const PointView = () => {
    return <Animated.View style={tailwind.style(`h-[3px] w-[3px] bg-[#5B6777] rounded-[1.5px]`)} />;
};

export const SOSInfoView = (props: {
    isEmergencyContactEditable: boolean;
    emergencyContacts: personDefaultEmergencyNumberAPIEntity[];
}) => {
    const defaultContact = useAppSelector(selectDefaultContact);
    const { emergencyContacts } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const getFormattedData = (textValue: string) => {
        return textValue.length > 20 ? `${textValue.slice(0, 20)}...` : textValue;
    };

    return (
        <Animated.View>
            {!props.isEmergencyContactEditable ? (
                <></>
            ) : (
                <Typography
                    type="body-1"
                    style={tailwind.style('pb-[12px] text-[#14171F]')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.OnSOS}
                </Typography>
            )}
            <PointersView
                pointerIcon={<PointView />}
                description={userLanguageStrings.ReceiveCallBack}
                pointerColor={undefined}
            />
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <PointersView
                    pointerIcon={<PointView />}
                    description={userLanguageStrings.NotifyAllEmergencyContacts}
                    pointerColor={undefined}
                />
                {props.isEmergencyContactEditable && emergencyContacts.length === 0 ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="safety_edit_contacts"
                        onPress={() =>
                            navigation.navigate(
                                'ProfileTab',
                                {
                                    screen: 'safetyScreen',
                                    params: {
                                        safetyStageId: 'trustedContacts',
                                    },
                                },
                                { pop: true },
                            )
                        }>
                        <Typography
                            type="body"
                            style={tailwind.style(['underline'], ['text-[#14171F]'])}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                ) : (
                    <></>
                )}
            </Animated.View>
            {emergencyContacts.length > 0 ? (
                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between gap-[2px]')}>
                        <PointersView pointerIcon={<PointView />} description="Call: " pointerColor={undefined} />
                        <Tag
                            testID="safety_module_call_default_contact"
                            size="md"
                            text={getFormattedData(defaultContact?.name ?? '')}
                            type="secondary"
                            fontType="body"
                            onPress={() => handleCall(defaultContact?.mobileNumber)}
                            //     icon={
                            //       <Animated.View
                            //         style={tailwind.style(
                            //           'h-[20px] w-[20px] rounded-[10px] bg-[white] justify-center items-center',
                            //         )}>
                            //           <Typography type="subhead-3" style={tailwind.style('text-[black]')} accessibilityRole={undefined}>
                            //         {getInitials(defaultContact?.name ?? "")}
                            // </Typography>
                            //         </Animated.View>
                            //     }
                            style={tailwind.style(
                                `bg-[${colors?.recovered?.orangelUltraLow}] py-[4px] px-[10px] h-[28px] flex`,
                            )}
                            textStyle="text-[#655C6F]"
                        />
                    </Animated.View>
                    {props.isEmergencyContactEditable ? (
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="safety_module_edit_contacts_with_contacts"
                            onPress={() =>
                                navigation.navigate(
                                    'ProfileTab',
                                    {
                                        screen: 'safetyScreen',
                                        params: {
                                            safetyStageId: 'trustedContacts',
                                        },
                                    },
                                    { pop: true },
                                )
                            }>
                            <Typography
                                type="body"
                                style={tailwind.style(['underline'], ['text-[#14171F]'])}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Edit}
                            </Typography>
                        </TouchableOpacity>
                    ) : (
                        <></>
                    )}
                </Animated.View>
            ) : (
                <></>
            )}
        </Animated.View>
    );
};
