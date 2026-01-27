import React, { useEffect, useMemo, useState } from 'react';
import { View, Switch, Text, ToastAndroid, AccessibilityInfo } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useRefsContext } from '../context/RefsContext';

import Button from '@/src-v2/primitives/Button';
import Typography from '../designSystem/components/primitives/Typography';
import token from '../designSystem/tokens';
import { Icon } from '../components/Icon';
import BlindEye from './svg/BlindEye';
import HearingAid from './svg/HearingAid';
import WheelChairTwo from './svg/WheelChairTwo';
import { selectSpecialAssistance, selectUserProfile, setSpecialAssistance } from '../state/client/user.ts';
import CloseCross from '../components/svg/CloseCross';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';

import { getDashLenCount } from '../utils/common.ts';
import { disability } from '@/readOnly/api/types/Disability.gen.tsx';
import { useDisabilityListGetQuery } from '@/api/integrations/rtk/DisabilityListGet.ts';
import { selectToken } from '../state/client/auth.ts';
import TurnOffSpecialAssistance from '../designSystem/components/TurnOffSpecialAssistance.tsx';
import { PopUpModal } from './PopUpModal.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

type DisabilityBox = {
    text: string;
    icon: React.ElementType;
    selected: boolean;
    code: string;
};

type DisabilityScreenProps = {};

const SpecialAssistance: React.FC<DisabilityScreenProps> = () => {
    const enableAssistanceChange = false; //for enabling changing of special assistance type in estimates
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { bottom } = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { specialAssistanceBottomSheetModalRef, turnOffSpecialAssistanceBottomSheetModalRef } = useRefsContext();
    const specialAssistance = useAppSelector(selectSpecialAssistance);
    const disabilityListResp = useDisabilityListGetQuery({});
    const [reasonListVal, setReasonList] = useState<DisabilityBox[]>([]);
    const [enableSpecialAssistance, setEnableSpecialAssistance] = useState<boolean>(!!specialAssistance);
    const enableButton = !!specialAssistance;
    const profile = useAppSelector(selectUserProfile);
    const userToken = useAppSelector(selectToken);

    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Special assistance popup', { queue: true });
    }, []);

    useEffect(() => {
        if (disabilityListResp.data) {
            const reasonList: DisabilityBox[] = disabilityListResp.data
                .map(item => {
                    switch (item.description) {
                        case 'Blind/Low Vision':
                            return {
                                icon: BlindEye,
                                code: item.id,
                                text: item.description,
                                selected: false,
                            };
                        case 'Hearing Impairment (Deaf/Mute)':
                            return {
                                icon: HearingAid,
                                code: item.id,
                                text: item.description,
                                selected: false,
                            };
                        case 'Locomotor Disability':
                            return {
                                icon: WheelChairTwo,
                                code: item.id,
                                text: item.description,
                                selected: false,
                            };
                        default:
                            return null;
                    }
                })
                .filter(item => item !== null)
                .map(item => {
                    return {
                        ...item,
                        selected: item.text === specialAssistance?.description,
                    };
                });
            setReasonList(reasonList);
        } else if (disabilityListResp.error) {
            ToastAndroid.show('Error fetching disability data', ToastAndroid.SHORT);
        }
    }, [disabilityListResp.data, disabilityListResp.error]);

    const updateReasonList = (index: number) => {
        const updatedReasonList = reasonListVal.map((reason, i) => ({
            ...reason,
            selected: i === index,
        }));
        setReasonList(updatedReasonList);
    };

    const onToggleSpecialAssistanceSwitch = (value: boolean) => {
        setEnableSpecialAssistance(value);
    };

    const checkShouldEnableApplyBtn = () => {
        const tempSelectedDisability = reasonListVal.find(item => item.selected);

        if (!enableAssistanceChange) {
            return enableSpecialAssistance === enableButton;
        }
        return (
            enableSpecialAssistance !== (specialAssistance !== undefined) ||
            tempSelectedDisability?.text !== specialAssistance?.description
        );
    };

    const onApplyBtn = () => {
        if (enableAssistanceChange || enableSpecialAssistance === false) {
            turnOffSpecialAssistanceBottomSheetModalRef?.current?.present();
        } else {
            const disabilityObj = disabilityListResp.data?.find(
                item => item.description === transformDisabilityTypeToDescription(profile?.disability),
            );
            dispatch(setSpecialAssistance({ id: userToken, payload: disabilityObj }));
            specialAssistanceBottomSheetModalRef?.current?.close();
        }
    };

    const transformDisabilityTypeToTag = (description: string | undefined): string => {
        switch (description) {
            case 'Hearing Impairment (Deaf/Mute)':
                return 'HEAR_IMPAIRMENT';
            case 'Blind/Low Vision':
                return 'BLIND_LOW_VISION';
            case 'Locomotor Disability':
                return 'LOCOMOTOR_DISABILITY';
            default:
                return 'OTHER';
        }
    };

    const getDisabiltiy = useMemo((): disability | undefined => {
        if (enableSpecialAssistance === false) {
            return undefined;
        }
        const selectedVal = reasonListVal.find(val => val.selected);
        const disabilityObj: disability = {
            description: selectedVal?.text,
            id: selectedVal?.code ?? '',
            tag: transformDisabilityTypeToTag(selectedVal?.text),
        };
        const profileDisabilityObj = disabilityListResp.data?.find(
            item => item.description === transformDisabilityTypeToDescription(profile?.disability),
        );
        if (!enableAssistanceChange) {
            return profileDisabilityObj;
        }
        return disabilityObj;
    }, [enableSpecialAssistance, enableAssistanceChange, profile?.disability]);

    return (
        <>
            <Animated.View
                style={tailwind.style(
                    `bg-[${themeColors.Fill_neutralUltraLow}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
                )}>
                <View style={tailwind.style(`flex flex-row pb-${token?.spacing?.[20]}`)}>
                    <View style={{ flexDirection: 'column', width: '100%' }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                            }}>
                            <Typography
                                style={tailwind.style('text-lg font-extrabold leading-6 text-[18rpx]')}
                                type="subhead-1"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.SpecialAssistance}
                            </Typography>

                            <Animated.View style={tailwind.style('px-4')}>
                                <Pressable
                                    testID="special_assistance_close"
                                    accessibilityRole="button"
                                    accessible={true}
                                    accessibilityLabel="Close Button"
                                    onPress={() => specialAssistanceBottomSheetModalRef?.current?.close()}>
                                    <Icon icon={<CloseCross />} size={34} />
                                </Pressable>
                            </Animated.View>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                paddingVertical: 16,
                            }}>
                            <View style={{ flex: 6 }}>
                                <Text style={{ color: '#7B8997' }}>{userLanguageStrings.AdditionalAssistanceDesc}</Text>
                            </View>

                            <View style={{ flex: 1, marginHorizontal: 8 }}>
                                <Switch
                                    accessibilityLabel="toggle special assistance"
                                    trackColor={{ true: '#14A255', false: '#787880' }}
                                    thumbColor={'#FFFFFF'}
                                    value={enableSpecialAssistance}
                                    onValueChange={onToggleSpecialAssistanceSwitch}
                                />
                            </View>
                        </View>
                        {enableSpecialAssistance && enableAssistanceChange ? (
                            <>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        marginRight: 16,
                                        marginVertical: 20,
                                    }}>
                                    {[...Array(getDashLenCount(12))].map((_, index) => {
                                        return (
                                            <View
                                                style={{
                                                    width: 6,
                                                    height: 1,
                                                    backgroundColor: `${themeColors.Fill_neutralMid}`,
                                                    marginRight: 8,
                                                    flexDirection: 'row',
                                                }}
                                                key={index}
                                            />
                                        );
                                    })}
                                </View>
                                <Typography
                                    style={tailwind.style('leading-4 pt-3 text-[14px] font-extralight')}
                                    type="micro"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Selecttheconditionapplicabletoyou}
                                </Typography>
                            </>
                        ) : null}
                    </View>
                </View>

                {enableSpecialAssistance && enableAssistanceChange
                    ? reasonListVal.map((val, index) => (
                          <Animated.View
                              key={index}
                              style={[
                                  tailwind.style(
                                      val.selected ? 'bg-black' : 'bg-white',
                                      'rounded-3xl flex flex-row border border-[#E0E3E8] my-1',
                                  ),
                                  { alignSelf: 'flex-start', flexShrink: 1 },
                              ]}>
                              <TouchableOpacity
                                  accessibilityRole="button"
                                  testID={`special_assistance_option_${index}`}
                                  style={[
                                      tailwind.style('px-2 flex-row pb-2 items-center'),
                                      { alignSelf: 'flex-start', flexShrink: 1 },
                                  ]}
                                  onPress={() => updateReasonList(index)}
                                  accessibilityState={{ selected: val.selected }}>
                                  <Animated.View
                                      style={tailwind.style('px-2 h-[40px] items-center justify-center shrink')}>
                                      <Icon
                                          icon={<val.icon color={val.selected ? '#ffffff' : '#14171F'} />}
                                          size={12}
                                      />
                                  </Animated.View>
                                  <Typography
                                      style={[
                                          tailwind.style(
                                              'text-sm px-2 items-center pt-2 justify-center',
                                              val.selected ? 'text-white' : 'text-black',
                                          ),
                                          { alignSelf: 'center', flexShrink: 1 },
                                      ]}
                                      type="subhead-1"
                                      numberOfLines={undefined}
                                      isAnimate={undefined}
                                      accessible={undefined}
                                      accessibilityLabel={undefined}
                                      accessibilityRole={undefined}>
                                      {val.text}
                                  </Typography>
                              </TouchableOpacity>
                          </Animated.View>
                      ))
                    : null}

                <View style={tailwind.style('bg-[#FFECC6] mt-5 p-3 rounded-xl')}>
                    <Typography
                        type="body-subtext"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Bycontinuingyouaredeclaringyourstatus}
                    </Typography>
                </View>

                <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                    <Button
                        testID="special_assistance_apply"
                        type="primary"
                        text={userLanguageStrings.Apply}
                        disabled={checkShouldEnableApplyBtn()}
                        onPress={onApplyBtn}
                    />
                </Animated.View>
            </Animated.View>
            <PopUpModal
                sheetRef={turnOffSpecialAssistanceBottomSheetModalRef}
                handleComponent={null}
                showBackdrop={undefined}
                stackBehavior="push"
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <TurnOffSpecialAssistance currentAssistance={getDisabiltiy} hasDisability={enableSpecialAssistance} />
            </PopUpModal>
        </>
    );
};

export const transformDisabilityTypeToDescription = (disabilityType: string | undefined) => {
    switch (disabilityType) {
        case 'HEAR_IMPAIRMENT':
            return 'Hearing Impairment (Deaf/Mute)';
        case 'BLIND_LOW_VISION':
            return 'Blind/Low Vision';
        case 'LOCOMOTOR_DISABILITY':
            return 'Locomotor Disability';
        case 'OTHER':
            return 'Other';
        default:
            return undefined;
    }
};

export default SpecialAssistance;
