import React from 'react';
import { View, Image } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ProfileAvatar from '@/typescript/assets/svg/symbols/ProfileAvatar';
import Verified from '@/typescript/assets/svg/symbols/Verified';
import { MyProfileViewProps } from '../Types';
import { formatSnakeCaseToString } from '@/src-v2/utils/common';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { createAction } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName } from '@/typescript/state/client/session';

const ProfileDetail: React.FC<{
    label: string;
    value: string | null;
    isEditable: boolean;
    onEditPress: (() => void) | undefined;
    isVerified: boolean | undefined;
    isLastItem: boolean | undefined;
}> = ({ label, value, isEditable, onEditPress, isVerified, isLastItem }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style(`${!isLastItem ? 'border-b border-gray-300 mb-4 ' : ''}`)}>
            <Typography
                type="subhead"
                style={tailwind.style('text-gray-500 text-s')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {label}
            </Typography>
            <View
                style={tailwind.style(
                    `flex flex-row gap-4 justify-y-center items-center ${!isLastItem ? 'py-3 ' : 'pt-3 pb-1'}`,
                )}>
                {isEditable ? (
                    <Pressable
                        accessibilityRole="button"
                        testID="profile_edit_now"
                        onPress={onEditPress}
                        accessibilityLabel="Add Now button">
                        <Typography
                            type="subhead"
                            style={tailwind.style('text-m text-blue-600 text-wrap')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.AddNow}
                        </Typography>
                    </Pressable>
                ) : (
                    <Typography
                        type="subhead"
                        style={tailwind.style('text-m text-black text-wrap')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={
                            label.toLowerCase().includes('mobile') && value ? value.split('').join(' ') : value || ''
                        }
                        accessibilityRole={undefined}>
                        {value || ''}
                    </Typography>
                )}
                {isVerified && (
                    <View style={tailwind.style('flex flex-row items-center')}>
                        <Verified />
                        <Typography
                            type="subhead"
                            style={tailwind.style('text-sm text-blue-600 ')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Verified}
                        </Typography>
                    </View>
                )}
            </View>
        </View>
    );
};
const MyProfileDetails: React.FC<MyProfileViewProps> = (props: MyProfileViewProps) => {
    const appDisplayName = useAppSelector(selectAppReadableName);
    return (
        <View>
            <View style={tailwind.style('items-center mt-6 mb-6')}>
                {props.userProfile?.profilePicture ? (
                    <Image
                        source={{ uri: props.userProfile.profilePicture }}
                        style={tailwind.style('w-[75px] h-[75px] rounded-full')}
                        resizeMode="cover"
                    />
                ) : (
                    <ProfileAvatar />
                )}
            </View>
            <ProfileDetail
                label={props.userLanguageStrings.Name}
                value={props.name || ''}
                isEditable={false}
                onEditPress={undefined}
                isVerified={undefined}
                isLastItem={undefined}
            />
            <ProfileDetail
                label={props.userLanguageStrings.MobileNumber}
                value={props.mobileNumber || ''}
                isEditable={false}
                isVerified={true}
                onEditPress={undefined}
                isLastItem={undefined}
            />
            <ProfileDetail
                label={props.userLanguageStrings.EmailId}
                value={props.userProfile?.email || ''}
                isEditable={props.userProfile?.email ? false : true}
                onEditPress={() => {
                    if (props.mpDispatch) {
                        props.mpDispatch(createAction('EDIT', { isDisability: false }));
                    }
                }}
                isVerified={undefined}
                isLastItem={undefined}
            />
            <ProfileDetail
                label={props.userLanguageStrings.Gender}
                value={formatSnakeCaseToString(props.userProfile?.gender)}
                isEditable={false}
                onEditPress={undefined}
                isVerified={undefined}
                isLastItem={undefined}
            />
            <ProfileDetail
                label={props.userLanguageStrings.AssistanceRequiredPwd}
                value={formatSnakeCaseToString(props.userProfile?.disability)}
                isEditable={props.userProfile?.disability ? false : true}
                onEditPress={() => {
                    if (props.mpDispatch) {
                        props.mpDispatch(createAction('EDIT', { isDisability: true }));
                    }
                }}
                isLastItem={true}
                isVerified={undefined}
            />
            {props.userProfile?.hasDisability && (
                <Pressable
                    accessibilityRole="button"
                    testID="profile_learn_disability"
                    accessibilityLabel="Learn how Namma Yatri caters to your needs button"
                    onPress={() => {
                        if (props.mpDispatch) {
                            props.mpDispatch(createAction('SHOW_DISABILITY_POPUP', undefined));
                        }
                    }}>
                    <Typography
                        type="subhead"
                        style={tailwind.style('text-sm text-blue-600 text-wrap')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.userLanguageStrings.LearnHowNammaYatriCatersToYourNeeds(appDisplayName)}
                    </Typography>
                </Pressable>
            )}
        </View>
    );
};

export default MyProfileDetails;
