import React, { FC, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ProfileHeaderProps, ProfileOptionProps, ProfileTabProps } from './Types';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import { Icon } from '../../../src/typescript/components/Icon';
import { ChevronRight } from '../../multimodal/components/svg/ChevronRight';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserIcon from '../../../src/typescript/assets/svg/symbols/UserIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import LogoutModal from '@/typescript/components/LogOut';
import CreateBusinessProfileModal from '@/typescript/components/CreateBusinessProfileModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { logEvent, EventName } from '@/typescript/utils/logger';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

const ProfileHeader: FC<ProfileHeaderProps> = ({ fullName, email, profilePicture, onViewProfilePress }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const initials = fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();

    const stackNavigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (count > 2) {
            handleiconclick();
            setCount(0);
        }
    }, [count]);

    const handleiconclick = () => {
        logEvent(EventName.NY_USER_MOCK_JOURNEY);
        stackNavigation.navigate('ProfileTab', { screen: 'mockJourneyScreen' });
    };

    const handleOnNamePress = () => {
        setCount(prev => prev + 1);
    };

    return (
        <View style={styles.headerContainer}>
            <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={styles.profileImageContainer}>
                {profilePicture ? (
                    <Image
                        source={{ uri: profilePicture }}
                        style={tailwind.style('w-[72px] h-[72px] rounded-full')}
                        resizeMode="cover"
                    />
                ) : (
                    <Typography
                        type="title"
                        style={styles.initialsText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {initials}
                    </Typography>
                )}
            </View>
            <View style={styles.headerTextContainer}>
                <Pressable
                    accessibilityRole="button"
                    testID={'mock-journey-profile-name'}
                    onPress={handleOnNamePress}
                    accessibilityLabel={`${fullName} button`}>
                    <Typography
                        type="title"
                        style={styles.nameText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {fullName}
                    </Typography>
                </Pressable>
                <Typography
                    type="subhead"
                    style={styles.emailText}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {email}
                </Typography>
                <Pressable
                    accessibilityRole="button"
                    testID="eca2f652-25b8-4905-ac03-cdfec8df5ca7"
                    onPress={onViewProfilePress}
                    accessibilityLabel={`View profile button`}>
                    <Typography
                        type="subhead"
                        style={styles.viewProfileText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ViewProfile}
                    </Typography>
                </Pressable>
            </View>
        </View>
    );
};

const ProfileOption: FC<ProfileOptionProps> = ({
    icon,
    text,
    onPress,
    isLastItem,
    tagText,
    showTag,
    verificationIcon,
}) => {
    const iconElement = React.isValidElement(icon) ? icon : <UserIcon fill="#333333" />;
    return (
        <>
            <Pressable
                testID="949e1c96-e931-471a-a21f-db9a2a2ffaf5"
                onPress={onPress}
                style={styles.optionContainer}
                accessibilityLabel={text}
                accessibilityRole="button">
                <View style={styles.optionLeftContent} accessible={false}>
                    <View style={styles.optionIconContainer}>
                        <Icon icon={iconElement} size={16} color="#3B3A3C" />
                    </View>
                    <View style={styles.textAndIconContainer}>
                        <Typography
                            type="subhead"
                            style={styles.optionText}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {text}
                        </Typography>
                        {verificationIcon && <View style={styles.verificationIconContainer}>{verificationIcon}</View>}
                    </View>
                </View>
                <View style={styles.optionRightContent}>
                    {showTag && tagText && (
                        <View style={styles.newTagContainer}>
                            <Typography
                                type="subhead"
                                style={styles.newTagText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {tagText}
                            </Typography>
                        </View>
                    )}
                    <Icon icon={<ChevronRight />} size={12} color="#7E7E7E" />
                </View>
            </Pressable>
            {!isLastItem && <View style={styles.optionDivider} />}
        </>
    );
};

const ProfileTab: FC<ProfileTabProps> = ({
    primaryOptions,
    secondaryOptions,
    tertiaryOptions,
    fullName,
    email,
    profilePicture,
    onViewProfilePress,
    isBusinessProfileModalVisible,
    setIsBusinessProfileModalVisible,
}) => {
    const { top } = useSafeAreaInsets();
    const { logoutModalRef } = useRefsContext();
    const businessProfileModalRef = useRef<BottomSheetModal | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    useEffect(() => {
        if (isBusinessProfileModalVisible) {
            businessProfileModalRef.current?.present();
        } else {
            businessProfileModalRef.current?.dismiss();
        }
    }, [isBusinessProfileModalVisible]);
    return (
        <HardwareBackpressHandler>
            <>
                <View style={[styles.container]}>
                    <ScrollView
                        contentContainerStyle={[tailwind.style(`pt-[${top}px] pb-[${16}px]`)]}
                        showsVerticalScrollIndicator={false}>
                        <ProfileHeader
                            fullName={fullName}
                            email={email}
                            profilePicture={profilePicture}
                            onViewProfilePress={onViewProfilePress}
                        />

                        <View style={styles.sectionContainer}>
                            <View style={[styles.section, styles.firstSection]}>
                                <View style={styles.sectionContent}>
                                    {primaryOptions.map((option, index) => (
                                        <ProfileOption
                                            key={option.text}
                                            {...option}
                                            isLastItem={index === primaryOptions.length - 1}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionContent}>
                                    {secondaryOptions.map((option, index) => (
                                        <ProfileOption
                                            key={option.text}
                                            {...option}
                                            isLastItem={index === secondaryOptions.length - 1}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionContent}>
                                    {tertiaryOptions.map((option, index) => (
                                        <ProfileOption
                                            key={option.text}
                                            {...option}
                                            isLastItem={index === tertiaryOptions.length - 1}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <PopUpModal
                    sheetRef={logoutModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={false}>
                    <LogoutModal buttonColor={undefined} navigateBack={undefined} closeModal={undefined} />
                </PopUpModal>
                <PopUpModal
                    sheetRef={businessProfileModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={true}
                    onDismiss={() => setIsBusinessProfileModalVisible(false)}>
                    <CreateBusinessProfileModal
                        closeModal={() => {
                            businessProfileModalRef.current?.dismiss();
                        }}
                        onGetStarted={() => {
                            businessProfileModalRef.current?.dismiss();
                            navigation.navigate('ProfileTab', {
                                screen: 'businessProfileScreen',
                                params: { isBusinessProfileVerified: false },
                            });
                        }}
                        shouldNavigate={false}
                    />
                </PopUpModal>
            </>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    headerContainer: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FC443A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '600',
    },
    headerTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    nameText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#14171F',
    },
    emailText: {
        color: '#666666',
        marginTop: 4,
    },
    viewProfileText: {
        color: '#0066FF',
        marginTop: 4,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        gap: 16,
        width: '100%',
    },
    section: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F1F4',
        paddingHorizontal: 16,
    },
    firstSection: {
        marginTop: 4,
    },
    sectionContent: {
        width: '100%',
        flexDirection: 'column',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    optionLeftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        flexShrink: 1,
        marginRight: 8,
    },
    optionIconContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textAndIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        flexShrink: 1,
    },
    optionText: {
        fontSize: 13,
        color: '#3B3A3C',
        flexShrink: 1,
    },
    verificationIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    newTagText: {
        fontSize: 10,
        color: '#1D74F6',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    newTagContainer: {
        backgroundColor: '#E8F1FF',
        borderRadius: 12,
    },
    optionRightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
    },
    optionDivider: {
        height: 1,
        backgroundColor: '#F4F4F4',
        width: '100%',
    },
});

export default ProfileTab;
