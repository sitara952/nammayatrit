import React, { FC } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { tw } from '../../../src/helpers/externalModules/components/tailwind/Tailwind.bs';
import { HeaderCardProps, SideBarCellProps, SideBarListProps } from './Types';
import { Icon } from '../../../src/typescript/components/Icon';
import UserIcon from '../../../src/typescript/assets/svg/symbols/UserIcon';

import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import LeftArrow from '../../../src/typescript/assets/svg/direction/LeftArrow';
import { HeaderFlow, SideDrawerFlow } from './Flow';

import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import CrossButton from '../../../src/typescript/designSystem/components/CrossButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BottomSheetStage, selectBottomSheetStage } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { DotWithBorder } from '@/typescript/components/svg/DotWithBorder';
import { BookingId, selectReferralAmountToCollect } from '@/typescript/state/client/user';

const screenWidth = Dimensions.get('screen').width;
const segmentWidth = screenWidth * 0.85 - 60;
const enableBackToHome = false;

const SideDrawer = ({ bookingId }: { bookingId: BookingId | null }) => {
    const { sideDrawerPrimaryOptions, sideDrawerSecondaryOptions } = SideDrawerFlow();

    return (
        <Animated.View style={styles.drawerContainer}>
            <Header bookingId={bookingId} />
            <Animated.View style={[styles.listContainer, { height: Platform.OS === 'ios' ? '64%' : '70%' }]}>
                <ScrollView>
                    <SideBarList list={sideDrawerPrimaryOptions} />

                    <View style={styles.lineContainer}>
                        <View style={styles.line} />
                    </View>

                    <SideBarList list={sideDrawerSecondaryOptions} />
                </ScrollView>
                {enableBackToHome ? <BackToHomeView /> : null}
            </Animated.View>
        </Animated.View>
    );
};

const BackToHomeView = () => {
    const { onBackToHomePress } = SideDrawerFlow();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const route = useRoute();
    if (route.name === 'mainTabNavigation' && bottomSheetStage === BottomSheetStage.Home) return undefined;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            testID="305757a7-3a0c-4205-9317-1499e9adc241"
            onPress={onBackToHomePress}
            style={{
                padding: 14,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <View style={[tw('flex flex-row')]}>
                <View>
                    <Icon size={20} icon={<LeftArrow />} />
                </View>
                <View style={[tw('flex flex-col')]}>
                    <Typography
                        type="subhead-700"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {' '}
                        {userLanguageStrings.BackToHome}{' '}
                    </Typography>
                    <View
                        style={{
                            backgroundColor: '#14171F',
                            width: '100%',
                            height: 2,
                        }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const HeaderCard: FC<HeaderCardProps> = props => {
    const referralAmountToCollect = useAppSelector(selectReferralAmountToCollect);
    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={props.text + ' button'}
                testID="4fe7bc7e-9e09-4460-8103-786e59379080"
                onPress={props.onPress}
                style={[
                    tw('flex items-center justify-center bg-fillNeutralWhite'),
                    tw(`w-[${segmentWidth / 3.0}px] h-[72px] rounded-[14px]`),
                ]}>
                {props.icon}

                <Typography
                    style={tw('pt-[6px] text-[14px] font-bold text-textBlack text-center mb-1 ')}
                    type="sub-body-700"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {props.text}
                </Typography>
            </Pressable>
            {referralAmountToCollect > 0 && (
                <Animated.View style={tw('absolute right-1 -top-1`')}>
                    <DotWithBorder />
                </Animated.View>
            )}
        </>
    );
};

const SideBarCell: FC<SideBarCellProps> = props => {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.text + ' button'}
            testID="eee020ef-d985-4b29-94a7-e6ff7f1cb5ab"
            onPress={props.onPress}
            style={tw('px-2.5')}>
            <Animated.View style={[tw('flex flex-row items-center py-[14px] px-2.5 rounded-[14px]')]}>
                <Icon size={16} icon={props.icon} />
                <Animated.Text style={tw('text-base font-semibold pl-2')}>
                    <Typography
                        type={undefined}
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {props.text}
                    </Typography>
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

const SideBarList: FC<SideBarListProps> = props => {
    return (
        <Animated.View style={tw('py-2.5')}>
            {props.list.map((listItem, index) => (
                <SideBarCell key={index} {...listItem} />
            ))}
        </Animated.View>
    );
};

const Header = ({ bookingId }: { bookingId: BookingId | null }) => {
    const {
        onThemeChangePress,
        onProfilePress,
        fullName,
        mobileNumber,
        headerCards,
        onCrossClick,
        screenReaderEnabled,
    } = HeaderFlow(bookingId);
    const { top } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const bg_color = themeColors.SideDrawer_bg_color;

    return (
        <View
            style={{
                backgroundColor: bg_color,
                paddingTop: top,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Pressable
                    accessibilityLabel="Theme Change button"
                    testID="3dabdb21-88f8-4e29-8052-51210a5d3378"
                    accessibilityRole="button"
                    onPress={onThemeChangePress}
                    accessible={false}>
                    <Animated.View style={[tw('px-5 pt-3 pb-5')]}>
                        <Pressable
                            testID="45f5573e-d5c2-471d-8285-491f2096d5a7"
                            onPress={onProfilePress}
                            accessible
                            accessibilityLabel="Profile button"
                            accessibilityHint="Click to see and change the profile details"
                            accessibilityRole="imagebutton">
                            {_interactionState => (
                                <Animated.View
                                    style={tw(
                                        `h-11 w-[52px] rounded-[22px] bg-[#f1f1f1] justify-center  items-center`,
                                    )}>
                                    <Icon icon={<UserIcon fill="white" />} size={16} />
                                </Animated.View>
                            )}
                        </Pressable>
                        <Animated.Text
                            style={tw(`text-[22px] font-bold pt-[11px] text-[${themeColors.SideDrawerNameColor}]`)}>
                            {fullName}
                        </Animated.Text>
                        <Animated.Text
                            style={tw(
                                `before:text-[13px] font-semibold text-[${themeColors.SideDrawerNameColor}] pt-[5px]`,
                            )}>
                            {mobileNumber}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>

                {screenReaderEnabled && (
                    <CrossButton
                        accessibilityLabel={'Close Drawer button'}
                        onClick={onCrossClick}
                        style={{
                            padding: 16,
                            borderRadius: 16,
                            backgroundColor: 'white',
                            height: 8,
                            width: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    />
                )}
            </View>

            <Animated.View style={tw('flex flex-row justify-between items-center mx-5 pb-5')}>
                {headerCards.map(item => (
                    <HeaderCard key={item.text} {...item} />
                ))}
            </Animated.View>
        </View>
    );
};

export default SideDrawer;

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
    },
    listContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
    },
    lineContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    line: {
        width: '90%',
        height: 1,
        backgroundColor: '#E0E3E8',
    },
});
