import { useRefsContext } from '@/typescript/context/RefsContext';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import token from '@/typescript/designSystem/tokens';
import { selectFollowers, setCurrentFollower } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { selectToken } from '@/typescript/state/client/auth';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type FollowRideButtonProps = {
    enableShadow: boolean;
};
export const FollowRideButton: React.FC<FollowRideButtonProps> = props => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const followers = useAppSelector(selectFollowers) ?? [];
    const { followRideModalRef } = useRefsContext();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const followInitials = followers.map((item, index) => {
        if (followers.length != 1 && index == 0) {
            return (
                <View
                    style={tailwind.style(
                        `w-22px h-22px bg-[#FFD506] rounded-[${token?.corner?.lg}] items-center justify-center`,
                    )}>
                    <Typography
                        style={tailwind.style('text-black')}
                        type="subhead-3"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {'' + item.name?.charAt(0).toUpperCase()}
                    </Typography>
                </View>
            );
        } else if (index == 1) {
            return (
                <View
                    style={tailwind.style(
                        `w-22px h-22px bg-[#FFD506] rounded-[${token?.corner?.lg}] items-center justify-center`,
                    )}>
                    <Typography
                        style={tailwind.style('text-black')}
                        type="subhead-3"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {'' + item.name?.charAt(0).toUpperCase()}
                    </Typography>
                </View>
            );
        } else if (index == 2) {
            return (
                <View
                    style={tailwind.style(
                        `w-22px h-22px bg-[#306AFE] rounded-[${token?.corner?.lg}] items-center justify-center`,
                    )}>
                    <Typography
                        style={tailwind.style('text-white')}
                        type="subhead-3"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {'+' + (followers.length - 2).toString()}
                    </Typography>
                </View>
            );
        } else {
            return null;
        }
    });
    return (
        <HardwareBackpressHandler>
            <Animated.View>
                <Button
                    testID="follow_ride_show_button"
                    size="md"
                    type="secondary"
                    onPress={() => {
                        if (followers.length == 1) {
                            dispatch(
                                setCurrentFollower({
                                    id: userToken,
                                    payload: followers.at(0) ?? null,
                                }),
                            );
                            navigation.navigate('followRide', {
                                defaultFollower: followers[0] ?? null,
                                shouldOpenChat: undefined,
                            });
                        } else {
                            followRideModalRef.current?.present();
                        }
                    }}
                    style={[
                        tailwind.style(
                            `bg-[${themeColors.Fill_neutralMin}] h-40px py-2 px-3 rounded-[${token?.corner?.lg}]`,
                        ),
                        props.enableShadow ? styles.followButtonShadow : null,
                    ]}>
                    <Text>
                        {!followers.at(0)?.name
                            ? userLanguageStrings.FollowSharedRide
                            : userLanguageStrings.Follow +
                              ' ' +
                              followers.at(0)?.name +
                              "'s " +
                              userLanguageStrings.Ride}
                    </Text>
                    {followInitials.length != 0 ? (
                        <View style={tailwind.style('flex-row gap-4px ml-8px')}>{followInitials}</View>
                    ) : null}
                </Button>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    followButtonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: 'white',
        zIndex: 1,
    },
});
