import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useNavigation } from '@react-navigation/native';
import { getInitials } from '@/typescript/utils/common';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectFollowers, setCurrentFollower } from '@/typescript/state/client/user';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { selectToken } from '@/typescript/state/client/auth';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import colors from '@/typescript/designSystem/colorPalette';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const SelectFollower = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const style = styles(bottom);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { followRideModalRef } = useRefsContext();
    const followers = useAppSelector(selectFollowers) ?? [];

    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();

    const followersList = followers.map((item: followers, index: number) => {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                testID={`follow_ride_select_follower_${item.personId}`}
                activeOpacity={0.5}
                onPress={() => {
                    dispatch(
                        setCurrentFollower({
                            id: userToken,
                            payload: followers[index] ?? null,
                        }),
                    );
                    navigation.navigate('followRide', {
                        defaultFollower: followers[0] ?? null,
                        shouldOpenChat: undefined,
                    });
                    followRideModalRef.current?.close();
                }}>
                <Animated.View
                    key={index}
                    style={{
                        width: '100%',
                        backgroundColor: colors.primitive.white[10],
                        padding: 12,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: colors.recovered.yellowHigh,
                            borderRadius: 20,
                            height: 36,
                            width: 42,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16,
                        }}>
                        <Typography
                            type="subhead-1"
                            style={{
                                color: colors.primitive.white[10],
                                alignContent: 'center',
                            }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {getInitials(item.name)}
                        </Typography>
                    </View>
                    <Typography
                        type="body"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {item.name || userLanguageStrings.User}
                    </Typography>
                </Animated.View>
            </TouchableOpacity>
        );
    });
    return (
        <Animated.View style={[style.parent]}>
            <Animated.View style={style.header}>
                <Typography
                    type="subhead"
                    style={style.headerTitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.FollowSharedRide}
                </Typography>
                <Button
                    testID="follow_ride_select_follower_close"
                    size="md"
                    type={'secondary'}
                    style={style.close}
                    prefix={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                    onPress={() => followRideModalRef.current?.close()}
                />
            </Animated.View>
            <Animated.View>
                <Typography
                    type="body"
                    style={style.headerTitle}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Youhave_ridessharedwithyouTaptofollowthemlive(followers.length)}
                </Typography>
            </Animated.View>
            {followersList}
        </Animated.View>
    );
};

export default SelectFollower;

const styles = (bottom: number) => {
    return StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        parent: {
            backgroundColor: colors.primitive.gray[11],
            padding: 16,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            paddingBottom: bottom,
            gap: 20,
        },
        close: {
            borderRadius: 20,
            width: 48,
            height: 40,
            justifyContent: 'center',
        },
        headerTitle: { flex: 1.0 },
    });
};
