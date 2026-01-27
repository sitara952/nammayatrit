import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { View, AccessibilityInfo, Keyboard } from 'react-native';
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
import ThumbDown from './svg/ThumbDown';

import CloseCross from '../components/svg/CloseCross';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import Toast from 'react-native-root-toast';
import { setFocus } from '../utils/Accessibility.ts';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { disability } from '@/readOnly/api/types/Disability.gen.tsx';
import { disabilityArray } from '@/readOnly/api/types/DisabilityArray.gen.tsx';

type DisabilityBox = {
    text: string;
    icon: React.ElementType;
    selected: boolean;
    code: string;
};

type CancelRideProps = {
    stage: 'looking-for-rides' | undefined;
    selectedDisabilityStr: MutableRefObject<disability>;
    disabilityData: disabilityArray;
    onSubmitFromProps: (() => void) | undefined; // Allows you to send a custom onSubmit function when editSubmit is true
    editSubmit: boolean; // false means old flow, true allows you to pass and use a custom onSubmit function
};

const DisabilityScreen: React.FC<CancelRideProps> = ({
    selectedDisabilityStr,
    disabilityData,
    onSubmitFromProps,
    editSubmit,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { disabilityScreenBottomSheetModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const onSubmit = () => {
        //function for submitting, closes the bottom sheet if selection is valid (Old Flow)
        if (selectedReasonCode == null || selectedReasonCode === '') {
            Toast.show(userLanguageStrings.PleaseSelectAValue);
        } else {
            disabilityScreenBottomSheetModalRef?.current?.close();
        }
    };

    const reasonList: DisabilityBox[] = disabilityData.map(item => {
        return {
            text: item.tag === 'OTHER' ? userLanguageStrings.MyDisabilityIsNotListedHere : (item.description ?? ''),
            icon: iconMapping[item.tag ?? 'OTHER'] || ThumbDown,
            selected: false,
            code: item.id,
        };
    });

    const [reasonListVal, setReasonList] = useState<DisabilityBox[]>(reasonList);
    const [otherReason, setOtherReason] = useState<string>('');
    const [selectedReasonCode, setSelectedReasonCode] = useState<string>('');
    const [selectedReasonText, setSelectedReasonText] = useState<string>('');
    const [selectedVal, setSelectedVal] = useState<DisabilityBox | undefined>(undefined);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const getSelectedTag = (text: string): string => {
        switch (text) {
            case 'Blind/Low Vision':
                return 'BLIND_LOW_VISION';
            case 'Locomotor Disability':
                return 'LOCOMOTOR_DISABILITY';
            case 'Hearing Impairment (Deaf/Mute)':
                return 'HEAR_IMPAIRMENT';
            case 'Other':
                return 'OTHER';
            default:
                return 'OTHER';
        }
    };

    useEffect(() => {
        const selectedValue = selectedReasonText === 'Other' ? otherReason : selectedReasonText;
        if (selectedDisabilityStr) {
            selectedDisabilityStr.current = {
                description: selectedValue,
                id: selectedReasonCode,
                tag: getSelectedTag(selectedReasonText),
            };
        }
    }, [selectedReasonText, selectedReasonCode]);

    const updateReasonList = (index: number) => {
        const updatedReasonList = reasonListVal.map((reason, i) => ({
            ...reason,
            selected: i === index,
        }));
        setReasonList(updatedReasonList);
        if (updatedReasonList[index]) {
            setSelectedReasonText(updatedReasonList[index]?.text);
            setSelectedReasonCode(updatedReasonList[index]?.code);
        }
    };

    useEffect(() => {
        const selectedValue = reasonListVal.find(val => val.selected);
        setSelectedVal(selectedValue);
    }, [reasonListVal]);

    const ref = useRef(null);
    useEffect(() => {
        setFocus(ref);
        AccessibilityInfo.announceForAccessibilityWithOptions('Select Disability list popup opened', { queue: true });
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (keyboardVisible && editSubmit && onSubmitFromProps) {
                onSubmitFromProps();
            }
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [keyboardVisible, editSubmit, onSubmitFromProps]);

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`flex flex-row pb-${token?.spacing?.[20]}`)}>
                <Animated.View style={tailwind.style('flex-col w-10/12 pb-2 justify-between')} ref={ref} accessible>
                    <Typography
                        style={tailwind.style('text-lg font-extrabold leading-6 text-[18rpx]')}
                        type="subhead-1"
                        accessible
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.SpecialAssistance}
                    </Typography>
                    <Typography
                        style={tailwind.style('leading-4 pt-3 text-[14px] font-extralight')}
                        type="micro"
                        accessible
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Selecttheconditionapplicabletoyou}
                    </Typography>
                </Animated.View>
                <Pressable
                    testID="disability_modal_close"
                    accessibilityRole="button"
                    onPress={() => disabilityScreenBottomSheetModalRef?.current?.close()}
                    accessibilityLabel="Close Disability list popup">
                    <Animated.View style={tailwind.style('items-start px-4 justify-start')}>
                        <Icon icon={<CloseCross />} size={34} />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {selectedVal?.text === 'My disability is not listed here' ? (
                <Animated.View>
                    <Typography
                        style={tailwind.style('font-semibold leading-6 text-[12px]')}
                        type="body-subtext"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.YourDisability}
                    </Typography>
                    <BottomSheetTextInput
                        placeholder={userLanguageStrings.MuscularDystrophy}
                        style={tailwind.style('px-2 bg-white h-[54px] border border-[#E0E3E8] rounded-lg')}
                        autoFocus={true}
                        onChangeText={setOtherReason}
                        accessibilityRole="text"
                        accessibilityLabel={'Enter you disability here, Example'}
                    />
                </Animated.View>
            ) : (
                reasonListVal.map((val, index) => (
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
                            testID={`disability_option_${val.code}`}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: val.selected }}
                            style={[
                                tailwind.style('px-2 flex-row pb-2 items-center'),
                                { alignSelf: 'flex-start', flexShrink: 1 },
                            ]}
                            onPress={() => updateReasonList(index)}>
                            <Animated.View style={tailwind.style('px-2 h-[40px] items-center justify-center shrink')}>
                                <Icon icon={<val.icon color={val.selected ? '#ffffff' : '#14171F'} />} size={12} />
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
            )}

            <View style={tailwind.style('bg-[#FFECC6] mt-5 p-3 rounded-xl')} accessible>
                <Typography
                    type="body-subtext"
                    accessible
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Bycontinuingyouaredeclaringyourstatus}
                </Typography>
            </View>

            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                <Button
                    testID="disability_modal_submit"
                    type="primary"
                    text={userLanguageStrings.Submit}
                    disabled={selectedReasonCode == null || selectedReasonCode === ''}
                    accessibilityLabel="Submit special assistance preference"
                    onPress={() => {
                        Keyboard.dismiss();
                        if (editSubmit && onSubmitFromProps) {
                            onSubmitFromProps();
                        } else {
                            onSubmit();
                        }
                    }}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default DisabilityScreen;

const iconMapping: Record<string, React.ElementType> = {
    BLIND_LOW_VISION: BlindEye,
    LOCOMOTOR_DISABILITY: WheelChairTwo,
    HEAR_IMPAIRMENT: HearingAid,
    OTHER: ThumbDown,
};
