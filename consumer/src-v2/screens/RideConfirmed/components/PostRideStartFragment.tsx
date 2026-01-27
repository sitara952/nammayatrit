import mtIcRideOngoingBg from '@/typescript/assets/mt_ic_ride_ongoing_bg.webp';
import mtIcBikeRideComplete from '@/typescript/assets/ny-service/mt_ic_bike_ride_complete.webp';
import mtIcCarRideComplete from '@/typescript/assets/ny-service/mt_ic_car_ride_complete.webp';
import mtIcAuto from '@/typescript/assets/ny-service/mt_ic_auto.webp';
import mtErickshawRideComplete from '@/typescript/assets/ny-service/ny_ic_e_rickshaw_ride_complete.webp';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import Button from '@/src-v2/primitives/Button';
import { Icon } from '@/typescript/components/Icon';
import { AutoFront } from '@/typescript/components/svg/AutoFront';
import { BikeFront } from '@/typescript/components/svg/BikeFront';
import { CarFront } from '@/typescript/components/svg/CarFront';
import HamburgerIcon from '@/typescript/components/svg/HamburgerIcon';
import { ShieldCheck } from '@/typescript/components/svg/ShieldCheck';
import colors from '@/typescript/designSystem/colorPalette';
import Tag from '@/typescript/designSystem/components/primitives/Tag';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { selectRideDetailsWithId } from '@/typescript/state/client/ride';

import { BookingId } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Resolver } from '@/typescript/utils/common';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React from 'react';
import { View, Image } from 'react-native';
import Animated, { withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { RideConfirmedScreenAction } from '../Types';
import { getPostRideStartFragmentStyles } from './PostRideStartFragment.styles';
import { selectBookingDetailsWithId, selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { bookingAPIDetails } from '@/readOnly/api/types/BookingAPIDetails.gen';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { capitalize } from 'lodash';
import { selectAppConfig } from '@/typescript/state/client/session';

const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
// import utc from 'dayjs/plugin/utc' // ES 2015

dayjs.extend(utc);
dayjs.extend(timezone);
export type PostRideStartFragmentProps = {
    vehicleServiceTierType: ServiceTierType_serviceTierType | undefined;
    bookingId: BookingId | null;
    rcsDispatch: Resolver<RideConfirmedScreenAction>;
};

const PostRideStartFragment_: React.FC<PostRideStartFragmentProps> = ({
    vehicleServiceTierType,
    bookingId,
    rcsDispatch,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { top, bottom } = useSafeAreaInsets();
    const styles = getPostRideStartFragmentStyles(themeColors, top, bottom);

    const transportAvatarUri = () => {
        switch (vehicleServiceTierType) {
            case 'AUTO_RICKSHAW':
                return mtIcAuto;
            case 'SEDAN':
            case 'AC_PRIORITY':
                return mtIcCarRideComplete;
            case 'BIKE':
            case 'DELIVERY_BIKE':
            case 'BIKE_PLUS':
                return mtIcBikeRideComplete;
            case 'E_RICKSHAW':
                return mtErickshawRideComplete;
            default:
                return mtIcCarRideComplete;
        }
    };

    const getTransportIcon = () => {
        switch (vehicleServiceTierType) {
            case 'BIKE':
            case 'DELIVERY_BIKE':
            case 'BIKE_PLUS':
                return (
                    <Icon icon={<BikeFront fill={undefined} />} size={22} color={colors.recovered.neutralUltraHigh} />
                );
            case 'AUTO_RICKSHAW':
            case 'E_RICKSHAW':
                return (
                    <Icon icon={<AutoFront fill={undefined} />} size={22} color={colors.recovered.neutralUltraHigh} />
                );
            case 'SEDAN':
                return (
                    <Icon icon={<CarFront fill={undefined} />} size={22} color={colors.recovered.neutralUltraHigh} />
                );
            default:
                return (
                    <Icon icon={<CarFront fill={undefined} />} size={22} color={colors.recovered.neutralUltraHigh} />
                );
        }
    };
    const appConfig = useAppSelector(selectAppConfig);

    const BookingDetailsButton = () => {
        const { top } = useSafeAreaInsets();
        return (
            <Animated.View style={tailwind.style('flex flex-row justify-between px-4', `pt-[${top + 12}]`)}>
                {appConfig.appType !== 'multimodal' && (
                    <Animated.View style={[tailwind.style('flex-row flex items-center')]}>
                        <Tag
                            testID="ride_confirmed_post_hamburger"
                            size="md"
                            key={'tag'}
                            type="secondary"
                            onPress={() => rcsDispatch({ type: 'HAMBURGER_TOGGLED', payload: undefined })}
                            icon={<Icon color={colors.recovered.greenHigh} icon={<HamburgerIcon />} size={16} />}
                        />
                    </Animated.View>
                )}
                <Tag
                    testID="ride_confirmed_post_booking_details"
                    type="secondary"
                    size="md"
                    onPress={() => {
                        rcsDispatch({ type: 'POST_RIDE_BOOKING_DETAILS_CLICKED', payload: undefined });
                    }}>
                    <View style={tailwind.style(`border-[1.25] rounded-1.25 border-[${themeColors?.Fill_orange}]`)} />
                    <Typography
                        type="body-6"
                        style={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings?.BookingDetails}
                    </Typography>
                </Tag>
            </Animated.View>
        );
    };

    const MainView = () => {
        const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
        const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId))?.bookingDetails;

        const getTripCategory = (bookingDetails: bookingAPIDetails | undefined): string => {
            if (!bookingDetails) return '';
            switch (bookingDetails.TAG) {
                case 'INTER_CITY':
                    return userLanguageStrings.Intercity.toLowerCase() + ' ';
                case 'RENTAL':
                    return userLanguageStrings.rental.toLowerCase() + ' ';
                default:
                    return '';
            }
        };
        return (
            <View>
                <Image
                    accessible={false}
                    resizeMode={'contain'}
                    style={[styles.vehicleImage]}
                    source={transportAvatarUri()}
                />
                <View style={tailwind.style('px-8')}>
                    <Typography
                        // type="title-800"
                        style={tailwind.style(
                            `text-[24px] font-semibold text-[${themeColors.Fill_neutralUltraHigh}] leading-[36px]`,
                        )}
                        type={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Your} {capitalize(getTripCategory(bookingDetails))}
                        <Animated.View>{getTransportIcon()}</Animated.View>{' '}
                        {userLanguageStrings.bookinghasbegunat + ' '}
                        {convertUTCtoIST(rideDetails?.rideStartTime || '2024-12-01T08:42:10Z', 'hh:mm A')}
                        {'.\n'}
                        {userLanguageStrings.Haveasafetrip}! {userLanguageStrings.Thankyou}!
                    </Typography>
                    {bookingDetails?.TAG === 'INTER_CITY' ||
                        (bookingDetails?.TAG === 'RENTAL' && (
                            <View style={tailwind.style(`bg-black px-4 mt-3 rounded-[24px] self-start flex-row`)}>
                                <Typography
                                    type="subhead-800"
                                    style={tailwind.style(`text-[16px] text-[#B2B9C7] leading-[36px] uppercase`)}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.EndOTP}
                                </Typography>
                                <Typography
                                    type="subhead-800"
                                    style={tailwind.style('text-[16px] text-white leading-[36px]')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {' • ' + (rideDetails?.endOtp || '-')}
                                </Typography>
                            </View>
                        ))}
                    {/* <Typography type="subhead-800" style={styles.centerRowSubText} accessibilityRole={undefined}>
          {userLanguageStrings?.HaveSafeJourney}
        </Typography> */}
                </View>
            </View>
        );
    };

    const SoSFooterButton = () => {
        const { bottom } = useSafeAreaInsets();
        return (
            <Animated.View style={tailwind.style('bg-white mx-6 rounded-[20px] px-6 py-6', `mb-[${bottom}px]`)}>
                <Typography
                    style={tailwind.style('text-[#313131] font-bold text-[18px]')}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Safety}
                </Typography>
                <Typography
                    style={tailwind.style('text-[#5B6777] text-[15px] font-semibold mt-2 leading-[22px]')}
                    type={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.IncaseyoufeelunsafepleasecheckthesafetytoolsorcallPolice}
                </Typography>
                <Button
                    testID="ride_confirmed_post_start_sos"
                    type="secondary"
                    size="lg"
                    style={tailwind.style('bg-[#313131] justify-center mt-4')}
                    onPress={() => {
                        logEvent(EventName.NY_IC_SAFETY_CENTER_CLICKED);
                        rcsDispatch({ type: 'POST_RIDE_SOS_CLICKED', payload: undefined });
                    }}>
                    <Icon
                        style={tailwind.style('mb-0.5')}
                        color={colors.primitive.white[10]}
                        icon={<ShieldCheck fill={undefined} />}
                        size={20}
                    />
                    <Typography
                        type="subhead-800"
                        style={tailwind.style('pl-2 text-white text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings?.SosCallPolice}
                    </Typography>
                </Button>
            </Animated.View>
        );
    };

    const CustomEnteringAnimation = () => {
        'worklet';
        const animations = {
            // your animations
            transform: [
                {
                    translateX: withDelay(100, withTiming(SCREEN_WIDTH, { duration: 1000 })),
                },
            ],
        };
        const initialValues = {
            transform: [{ translateX: 0 }],
        };

        return {
            initialValues,
            animations,
        };
    };

    return (
        <Animated.View
            style={[tailwind.style(`flex-1 justify-between bg-[${colors.primitive.gray[3]}] absolute w-full h-full`)]}>
            <Animated.Image
                accessible={false}
                source={mtIcRideOngoingBg}
                style={tailwind.style('absolute -bottom-2', `w-[${SCREEN_WIDTH}px] h-[${SCREEN_HEIGHT * 0.5}px]`)}
                resizeMode="contain"
            />
            <Animated.View
                entering={CustomEnteringAnimation}
                style={[tailwind.style('absolute h-full w-full bg-[#EBEBEB]')]}
            />
            <BookingDetailsButton />
            <MainView />
            <SoSFooterButton />
        </Animated.View>
    );
};

export const PostRideStartFragment = React.memo(PostRideStartFragment_, (prevProps, nextProps) => {
    // Avoid re-rendering when booking polling is in progress
    return (
        prevProps.vehicleServiceTierType === nextProps.vehicleServiceTierType,
        prevProps.bookingId === nextProps.bookingId
    );
});
