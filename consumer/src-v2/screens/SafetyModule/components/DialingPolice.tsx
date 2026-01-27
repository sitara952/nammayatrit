import { View, Image, Linking } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import Button from '../../../primitives/Button';
import Divider from '../../../../src/typescript/designSystem/components/primitives/Divider';
import { InfoIcon } from '../../../../src/typescript/assets/svg/symbols/InfoIcon';
import { useAppSelector, useAppDispatch } from '../../../../src/typescript/state/hooks';
import {
    selectBookedSourceWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import { selectRideDetailsWithId } from '@/typescript/state/client/ride';
import { setsosStage, setSosId, selectSosId } from '@/typescript/state/client/sos';
import { BookingId } from '@/typescript/state/client/user';
import { ScrollView } from 'react-native-gesture-handler';
import { useSosCreatePostMutation } from '@/api/integrations/rtk/SosCreatePost';
import { getSafetyCreatePostBody } from '../Flow';
import { selectAppConfig } from '@/typescript/state/client/session';

const policeHelpLineNumber = '112';

type DiallingPoliceProps = {
    bookingId: BookingId | null;
};

const DiallingPolice: React.FC<DiallingPoliceProps> = ({ bookingId }) => {
    const [callingPoliceIn, setCallingPoliceIn] = useState(3);
    const source = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const timerIdRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useAppDispatch();
    const appConfig = useAppSelector(selectAppConfig);
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const sosId = useAppSelector(selectSosId);
    const [sosCreatePost] = useSosCreatePostMutation();

    const startTimer = (duration: number, callback: (seconds: number) => void): NodeJS.Timeout => {
        let mutableTimeLeft = duration; // This let is necessary for closure state, also using recusrion causes drift which accumulates over time
        timerIdRef.current = setInterval(() => {
            mutableTimeLeft -= 1;
            callback(mutableTimeLeft);
            if (mutableTimeLeft <= 0 && timerIdRef.current) {
                clearInterval(timerIdRef.current);
                setCallingPoliceIn(0);
            }
        }, 1000);
        return timerIdRef.current;
    };

    const callPolice = async () => {
        if (timerIdRef.current) clearInterval(timerIdRef.current);
        // Call SOS API before dialing police
        if (sosId === undefined) {
            const sosReqBody = await getSafetyCreatePostBody(rideId, 'Police');
            sosCreatePost({ body: sosReqBody })
                .then(data => {
                    if (data.data?.sosId !== undefined) {
                        dispatch(setSosId(data?.data?.sosId));
                    }
                })
                .catch(err => console.error('Error in create sos api', err));
        }

        Linking.openURL(`tel:${policeHelpLineNumber}`);
        if (!bookingDetails?.sosStatus || bookingDetails?.sosStatus === 'Resolved')
            dispatch(setsosStage('DeActivated'));
        else if (bookingDetails?.sosStatus === 'Pending') dispatch(setsosStage('Activated'));
    };
    useEffect(() => {
        startTimer(3, async seconds => {
            if (seconds <= 0) {
                if (timerIdRef.current) {
                    clearInterval(timerIdRef.current);
                    setCallingPoliceIn(0);
                }

                // Call SOS API before dialing police
                if (sosId === undefined) {
                    const sosReqBody = await getSafetyCreatePostBody(rideId, 'Police');
                    sosCreatePost({ body: sosReqBody })
                        .then(data => {
                            if (data.data?.sosId !== undefined) {
                                dispatch(setSosId(data?.data?.sosId));
                            }
                        })
                        .catch(err => console.error('Error in create sos api', err));
                }

                Linking.openURL(`tel:${policeHelpLineNumber}`);
                if (!bookingDetails?.sosStatus || bookingDetails?.sosStatus === 'Resolved')
                    dispatch(setsosStage('DeActivated'));
                else if (bookingDetails?.sosStatus === 'Pending') dispatch(setsosStage('Activated'));
            }

            setCallingPoliceIn(seconds);
        });

        return () => {
            timerIdRef.current && clearInterval(timerIdRef.current);
        };
    }, []);

    return (
        <View style={tailwind.style(`flex-1 pt-[24px] px-[16px] bg-[#F8F9FB]`)}>
            <ScrollView style={tailwind.style(`flex-1`)}>
                <View style={tailwind.style(`rounded-lg bg-white p-[16px] border-[#F1F1F1] shadow-md`)}>
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#14171F]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Your Current Location{' '}
                    </Typography>
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#5B6777] mt-[2px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {source?.address ?? ''}
                    </Typography>
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#14171F] mt-[20px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Your Vehicle Info{' '}
                    </Typography>
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#5B6777] mt-[2px]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {rideDetails?.vehicleModel + ', ' + rideDetails?.vehicleNumber}
                    </Typography>
                    <Divider
                        type="dashed"
                        style={tailwind.style(`my-[20x]`)}
                        direction={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                    <View style={tailwind.style(`flex-row items-center justify-between`)}>
                        <InfoIcon />
                        <Typography
                            type="body-7"
                            style={tailwind.style(`text-[#5B6777] ml-[8px]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            Please give the operator your location - The app doesn't share the location automatically.{' '}
                        </Typography>
                    </View>
                </View>
            </ScrollView>
            <View style={tailwind.style(`flex-row items-center bg-[#ECECEC] rounded-[12px] p-[12px] `)}>
                <View style={tailwind.style(`flex-1 items-center`)}>
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#5B6777]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        Our Safety Partner:{' '}
                    </Typography>
                </View>
                <View style={tailwind.style(`flex-1 flex-row items-center justify-center gap-[8px]`)}>
                    {appConfig.assets.callPoliceLogoUri ? (
                        <Image
                            accessible={true}
                            accessibilityLabel="bengaluru police image"
                            source={{ uri: appConfig.assets.callPoliceLogoUri }}
                            style={tailwind.style(`w-[36px] h-[36px]`)}
                        />
                    ) : (
                        <></>
                    )}
                    <Typography
                        type="body-1"
                        style={tailwind.style(`text-[#5B6777]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {appConfig.textConfig.callPoliceText}
                    </Typography>
                </View>
            </View>
            <Button
                testID="605f73a1-e39e-45aa-80eb-4dea59ae0093"
                type="primary"
                text={`Dialing Police in ${callingPoliceIn.toString()}...`}
                textColor="#ffffff"
                onPress={callPolice}
                style={tailwind.style('text-[#5B6777] mb-[24px] justify-center mt-[25px')}
            />
        </View>
    );
};

export default DiallingPolice;
