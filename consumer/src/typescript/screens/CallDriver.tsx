import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import React from 'react';
import { Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '../components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Call from '../components/svg/Call';
import CloseCross from '../components/svg/CloseCross';
import Ingcognito from '../components/svg/Incognito';
import { useRefsContext } from '../context/RefsContext';
import Typography from '../designSystem/components/primitives/Typography';
import token from '../designSystem/tokens';
import { useAppSelector, useAppDispatch } from '../state/hooks';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { BookingId } from '@/typescript/state/client/user.ts';
import { setCustomerCallOptionClicked, RideId } from '@/typescript/state/client/booking.ts';
type CallDriverProps = {
    driverNumber: string | undefined;
    exoNumber: string | undefined;
    bookingId: BookingId | undefined;
    rideId: RideId | null;
    onClose: (() => void) | undefined;
};

const CallDriver = ({ driverNumber, exoNumber, bookingId, rideId, onClose }: CallDriverProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const { callDriverBottomsheetModalRef } = useRefsContext();
    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[20]}] pt-[29px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`pb-${token?.spacing?.[20]}`)}>
                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Typography
                            type="subhead-1"
                            style={[tailwind.style('text-[18px]')]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.CallDriver}
                        </Typography>
                    </Animated.View>

                    <Animated.View style={tailwind.style('items-center pr-4 mb-2 justify-center')}>
                        <Pressable
                            accessibilityRole="button"
                            testID="call_driver_close"
                            onPress={() => {
                                if (onClose) {
                                    onClose();
                                }
                                callDriverBottomsheetModalRef?.current?.dismiss();
                            }}
                            importantForAccessibility={'no-hide-descendants'}
                            accessibilityLabel={'Close button'}>
                            <Icon
                                icon={<CloseCross />}
                                size={34} // Adjusted size for better visibility
                            />
                        </Pressable>
                    </Animated.View>
                </Animated.View>
                {/* block */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={'Anonymous Call button'}
                    testID="call_driver_anonymous"
                    onPress={() => {
                        const cleverTapParams = {
                            trip_id: bookingId,
                            user_id: userToken,
                        };
                        logEvent(EventName.NY_USER_ANONYMOUS_CALL_CLICK, cleverTapParams);
                        if (bookingId) {
                            dispatch(
                                setCustomerCallOptionClicked({
                                    bookingId: bookingId,
                                    rideId: rideId || null,
                                    payload: true,
                                }),
                            );
                        }
                        Linking.openURL(`tel:${exoNumber}`);
                    }}>
                    <Animated.View style={tailwind.style('pt-4 flex flex-row')}>
                        <Animated.View
                            style={tailwind.style('items-center pl-1 pr-2 justify-center')}
                            importantForAccessibility={'no-hide-descendants'}>
                            <Icon icon={<Ingcognito />} size={34} />
                        </Animated.View>
                        <Animated.View>
                            <Animated.View style={tailwind.style('flex-row')}>
                                <Animated.View
                                    style={tailwind.style('flex-row items-center text-[14px] justify-between')}>
                                    <Typography
                                        type="subhead-1"
                                        style={undefined}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.AnonymousCall}
                                    </Typography>
                                </Animated.View>
                                <Animated.View
                                    style={tailwind.style(
                                        'flex-row items-center mx-2 px-1 border rounded-full border-[#14A255]  justify-between bg-[#14A255] text-white	',
                                    )}>
                                    <Typography
                                        type="subhead-1"
                                        style={[tailwind.style('text-white text-[10px]')]}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.Recommended}
                                    </Typography>
                                </Animated.View>
                            </Animated.View>

                            <Typography
                                type="body-1"
                                numberOfLines={5}
                                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}] text-[12px]	mr-16`)}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.YournumberwillnotbeshowntothedriverThecallwillbe}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                </Pressable>

                {/* border */}

                <Animated.View
                    style={tailwind.style(
                        'flex-row my-5 mx-1 bg-[#E0E3E8] h-[1px] items-center text-[14px] justify-between',
                    )}
                />

                {/* border */}
                <Pressable
                    accessibilityRole="button"
                    testID="call_driver_direct"
                    accessibilityLabel={'Direct Call button'}
                    onPress={() => {
                        const cleverTapParams = {
                            trip_id: bookingId,
                            user_id: userToken,
                        };
                        logEvent(EventName.NY_USER_DIRECT_CALL_CLICK, cleverTapParams);
                        if (bookingId) {
                            dispatch(
                                setCustomerCallOptionClicked({
                                    bookingId: bookingId,
                                    rideId: rideId || null,
                                    payload: true,
                                }),
                            );
                        }
                        Linking.openURL(`tel:${driverNumber}`);
                    }}>
                    <Animated.View style={tailwind.style('flex flex-row')}>
                        <Animated.View
                            style={tailwind.style('items-center pl-1 pr-2 justify-center')}
                            importantForAccessibility={'no-hide-descendants'}>
                            <Icon icon={<Call />} size={34} />
                        </Animated.View>
                        <Animated.View>
                            <Animated.View style={tailwind.style('flex-row items-center text-[14px] justify-between')}>
                                <Typography
                                    type="subhead-1"
                                    style={undefined}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.DirectCall}
                                </Typography>
                            </Animated.View>
                            <Typography
                                type="body-1"
                                numberOfLines={5}
                                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}] text-[12px] mr-16 `)}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.YournumberwillbevisibletothedriverUseifyouarenot}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};

export default CallDriver;
