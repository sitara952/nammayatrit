import React, { useCallback, useState } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { Icon } from '@/typescript/components/Icon';
import CloseCross from '@/typescript/components/svg/CloseCross';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { TextInput } from 'react-native-gesture-handler';
import colors from '@/typescript/designSystem/colorPalette';
import { colors as coreColors } from 'config-types/src/domain/default/themes/colors';
import { Dot } from '@/typescript/components/svg/Dot';
import { UnFilled } from '@/typescript/components/svg/UnfilledDot';
import ExclamationCircle from '@/typescript/components/svg/exclamationcircle';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type DeleteAccountReasonProps = {
    onSubmit: (reason: string) => void;
    onGoBack: () => void;
};

const DeleteAccountReason: React.FC<DeleteAccountReasonProps> = ({ onSubmit, onGoBack }) => {
    const { bottom } = useSafeAreaInsets();
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [otherReason, setOtherReason] = useState('');
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const reasonList = [
        {
            code: 'MOVING_OUT_OF_TOWN',
            text: userLanguageStrings.MovingOutOfTown,
        },
        {
            code: 'APP_EXPERIENCE_ISSUES',
            text: userLanguageStrings.AppExperienceIssues,
        },
        {
            code: 'CHANGE_OF_PHONE_NUMBER',
            text: userLanguageStrings.ChangeOfPhoneNumber,
        },
        {
            code: 'NOT_GETTING_RIDES',
            text: userLanguageStrings.NotGettingRides,
        },
        {
            code: 'NOT_REQUIRED_AS_OF_NOW',
            text: userLanguageStrings.NotRequiredAsOfNow,
        },
        {
            code: 'OTHER',
            text: userLanguageStrings.Other,
        },
    ];

    const buttonDisabled = !selectedCode || (selectedCode === 'OTHER' && !otherReason.trim());

    const handleSubmit = useCallback(() => {
        if (selectedCode) {
            if (selectedCode === 'OTHER') {
                onSubmit(otherReason);
            } else {
                const selectedReasonText = reasonList.find(reason => reason.code === selectedCode)?.text || '';
                onSubmit(selectedReasonText);
            }
        }
    }, [onSubmit, otherReason, reasonList, selectedCode]);

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${coreColors.white100}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`flex flex-row pb-${token?.spacing?.[20]}`)}>
                <Animated.View style={tailwind.style('flex-col items-start w-10/12 pb-2 justify-between')}>
                    <Typography
                        style={tailwind.style(' font-extrabold leading-6 text-[16px] mb-2')}
                        type="subhead-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={'Delete Account'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.DeleteAccount}
                    </Typography>
                    <Typography
                        style={tailwind.style(`font-[300] leading-6 text-[14px] text-[${coreColors.neutral700}]`)}
                        type="callout"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={'Please Tell Us Why You Are Deleting Your Account'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.PleaseTellUsWhyYouAreDeletingYourAccount}
                    </Typography>
                </Animated.View>
                <Animated.View style={tailwind.style('items-center px-4 mb-2 justify-center')}>
                    <Pressable
                        accessibilityRole="button"
                        testID="delete_reason_close"
                        accessibilityLabel={'Close button'}
                        onPress={onGoBack}>
                        <Icon icon={<CloseCross />} size={34} />
                    </Pressable>
                </Animated.View>
            </Animated.View>

            {selectedCode === 'OTHER' ? (
                <Animated.View>
                    <Typography
                        style={tailwind.style('font-extrabold leading-6 mb-2')}
                        type="subhead-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={'Please Elaborate On Your Reason'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.PleaseElaborateOnYourReason}
                    </Typography>
                    <TextInput
                        value={otherReason}
                        placeholder={userLanguageStrings.TypeYourReasonHere}
                        style={tailwind.style('px-2 bg-white h-[54px] border border-[#E0E3E8] rounded-lg')}
                        autoFocus={true}
                        onChangeText={text => setOtherReason(text)}
                        maxLength={500}
                        accessibilityLabel={'Please Elaborate On Your Reason'}
                    />
                </Animated.View>
            ) : (
                reasonList.map(val => (
                    <Animated.View
                        key={val.code}
                        style={[
                            tailwind.style(
                                val.code === selectedCode ? 'bg-black' : 'bg-white',
                                'rounded-3xl flex flex-row border border-[#E0E3E8] my-1',
                            ),
                            { alignSelf: 'flex-start', flexShrink: 1 },
                        ]}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID={`delete_reason_${val.code}`}
                            style={[
                                tailwind.style('px-2 flex-row pb-2 items-center'),
                                { alignSelf: 'flex-start', flexShrink: 1 },
                            ]}
                            onPress={() => setSelectedCode(val.code)}>
                            <Animated.View style={tailwind.style('px-2 h-[40px] items-center justify-center shrink')}>
                                <Icon
                                    icon={
                                        val.code === selectedCode ? (
                                            <Dot color="#ffffff" />
                                        ) : (
                                            <UnFilled color={coreColors.neutral500} />
                                        )
                                    }
                                    size={12}
                                />
                            </Animated.View>
                            <Typography
                                style={[
                                    tailwind.style(
                                        'text-sm px-2 items-center pt-2 justify-center',
                                        val.code === selectedCode ? 'text-white' : 'text-black',
                                    ),
                                    { alignSelf: 'center', flexShrink: 1 },
                                ]}
                                type="subhead-1"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={val.text}
                                accessibilityRole={undefined}>
                                {val.text}
                            </Typography>
                        </TouchableOpacity>
                    </Animated.View>
                ))
            )}
            <Animated.View style={tailwind.style('flex-row items-start mt-2')}>
                <Animated.View style={tailwind.style('pr-1 pt-1')}>
                    <Icon icon={<ExclamationCircle color={coreColors.red800} size={16} />} size={16} />
                </Animated.View>
                <Typography
                    style={tailwind.style(`font-[300] text-[10px] pr-3 text-[${coreColors.neutral700}]`)}
                    type="callout"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={'Delete account warning'}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.DeleteAccountWarning}
                </Typography>
            </Animated.View>
            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                <Button
                    testID="delete_reason_submit"
                    type="secondary"
                    style={tailwind.style(
                        ` justify-center bg-[${buttonDisabled ? coreColors.neutral300 : coreColors.red800}] text-[${coreColors.neutral100}]`,
                    )}
                    textStyle={tailwind.style(
                        `text-[${buttonDisabled ? coreColors.neutral500 : coreColors.neutral100}]`,
                    )}
                    text={userLanguageStrings.DeleteAccount}
                    disabled={buttonDisabled}
                    onPress={handleSubmit}
                />
                <Animated.View style={tailwind.style(`pt-2`)}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Go Back button'}
                        testID="delete_reason_go_back"
                        onPress={onGoBack}>
                        <Animated.View
                            style={tailwind.style(
                                `w-full items-center justify-center bg-[${colors.primitive.gray[16]}] rounded-xl mt-2 py-3`,
                            )}>
                            <Typography
                                style={tailwind.style(`text-[${coreColors.neutral700}] text-center`)}
                                type="subhead-1"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={'Go Back'}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.GoBack}
                            </Typography>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default DeleteAccountReason;
