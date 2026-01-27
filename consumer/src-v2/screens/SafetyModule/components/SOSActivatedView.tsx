import Animated from 'react-native-reanimated';
import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import { ScrollView } from 'react-native-gesture-handler';
import Button from '../../../primitives/Button';
import { PointersView } from './PointersView';
import Tick from '../../../../src/typescript/components/svg/Tick';
import { SOSBodyView } from './SOSBodyView';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useSosCreatePostMutation } from '../../../../src/api/integrations/rtk/SosCreatePost';
import { useAppDispatch, useAppSelector } from '../../../../src/typescript/state/hooks';
import { RideId, selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { useSosMarkRideAsSafeSosIdPostMutation } from '../../../../src/api/integrations/rtk/SosMarkRideAsSafeSosIdPost';
import {
    activateSafetyTool,
    selectIsRideEnded,
    selectSosId,
    setSosId,
    setsosStage,
} from '../../../../src/typescript/state/client/sos';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingId } from '@/typescript/state/client/user';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { stopAudio } from '@/src-v2/helpers/audio/AudioModule';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { getSafetyCreatePostBody } from '../Flow';

export const SOSActivatedView = (props: { bookingId: BookingId | null }) => {
    const [sosCreatePost, { data: sosData }] = useSosCreatePostMutation();
    const [sosMarkRideSafe] = useSosMarkRideAsSafeSosIdPostMutation();
    const sosId = useAppSelector(selectSosId);
    const rideId: RideId | null = useAppSelector(state => selectRideIdWithBookingId(state, props.bookingId));
    const dispatch = useAppDispatch();

    const createSOS = useCallback(async () => {
        const sosRequestBody = await getSafetyCreatePostBody(rideId, 'SafetyFlow');
        sosCreatePost({ body: sosRequestBody });
    }, [rideId, sosCreatePost]);

    useFocusEffect(
        useCallback(() => {
            createSOS();
        }, []),
    );
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const isRideEnded = useAppSelector(selectIsRideEnded);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const markRideAsSafe = () => {
        if (sosId !== undefined)
            sosMarkRideSafe({
                body: { isMock: false, isRideEnded: isRideEnded },
                sosId: sosId,
            });
        dispatch(setsosStage('DeActivated'));
        stopAudio();
        navigation.goBack();
    };

    useEffect(() => {
        if (sosData?.sosId) {
            dispatch(setSosId(sosData?.sosId));
        }
    }, [sosData]);

    useEffect(() => {
        dispatch(activateSafetyTool(undefined));
    }, []);

    const sosInfoList = [
        userLanguageStrings.CallbackRequestedFromSafetyTeam,
        userLanguageStrings.EmergencyContactsNotified,
    ];
    return (
        <Animated.View style={tailwind.style('gap-[20px]  h-[full] flex-1')}>
            <Animated.View style={tailwind.style('px-[24px] gap-[20px]')}>
                <Typography
                    type="title-800"
                    style={tailwind.style('text-[#1E1E1E] text-center')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.EmergencySOSActivated}
                </Typography>
                <Animated.View>
                    {sosInfoList.map((desc, index) => {
                        return (
                            <PointersView
                                key={index}
                                pointerIcon={<Tick fill={undefined} />}
                                pointerColor={'#14171F'}
                                description={desc}
                            />
                        );
                    })}
                </Animated.View>
            </Animated.View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={tailwind.style('flex px-[16px] pb-[10px]')}>
                    <SOSBodyView bookingId={props.bookingId} />
                </Animated.View>
            </ScrollView>
            <Animated.View style={tailwind.style('flex absolute w-full bottom-[0px] px-[16px]')}>
                <Button
                    testID="safety_mark_ride_safe"
                    type="primary"
                    text={userLanguageStrings.MarkRideAsSafe}
                    onPress={() => {
                        const currentDate = new Date(Date.now());
                        const cleverTapParams = {
                            current_time: currentDate.toUTCString(),
                        };
                        logEvent(EventName.NY_USER_SOS_MARKED_SAFE, cleverTapParams);
                        markRideAsSafe();
                    }}
                />
            </Animated.View>
        </Animated.View>
    );
};
