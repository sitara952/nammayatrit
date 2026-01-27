import Animated, { FadeIn } from 'react-native-reanimated';
import React, { useMemo } from 'react';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../../designSystem/tokens';
import { Icon } from '../../components/Icon';
import colors from '../colorPalette';
import Typography from './primitives/Typography';
import Divider from './primitives/Divider';
import Avatar from './primitives/Avatar';
import PassengerIcon from '../../assets/svg/symbols/PassengerIcon';
import StarFilled from '../../assets/svg/symbols/StarFilled';
import CarIcon from '../../components/svg/CarIcon';
import BikeIcon from '../../components/svg/BikeIcon';
import DefaultColorIcon from '../../components/svg/DefaultColorIcon';
import { StyleSheet } from 'react-native';
import { getVehicleNumber } from '../../screens/chat/utils';
import { getVehicleImage } from '../../utils/bookingUtils';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/typescript/state/hooks';

import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import Snowflake from '@/typescript/components/svg/Snowflake';
import classNames from 'classnames';
import AutoIcon from '@/typescript/assets/svg/symbols/AutoIcon';
import { selectAppConfig, selectFeatureFlags } from '../../state/client/session.ts';
import { RideId } from '@/typescript/state/client/booking.ts';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

type CardDriverTypes = {
    vehicleServiceType: ServiceTierType_serviceTierType | undefined;
    serviceTierName: string | undefined;
    isAirConditioned: boolean | undefined;
    avatarUri: string;
    rating: number | undefined;
    vehicleModel: string;
    vehicleColor: string;
    vehicleNumber: string;
    driverName: string;
    capacity: number;
    rideId: RideId | null;
};

const CardDriver = ({
    vehicleServiceType = 'AUTO_RICKSHAW',
    serviceTierName,
    isAirConditioned = false,
    avatarUri,
    rating,
    vehicleModel,
    rideId,
    vehicleColor,
    vehicleNumber,
    driverName,
    capacity,
}: CardDriverTypes) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const featureFlags = useAppSelector(selectFeatureFlags);
    const appConfig = useAppSelector(selectAppConfig);
    const handleDriverProfile = () => {
        if (featureFlags.showDriverProfile) {
            // navigation.navigate('driverProfile', {
            //     viewParam: 'driverprofile$$' + rideId,
            // });
            navigation.navigate('driverProfile', {
                rideId: rideId,
                vehicleServiceType: vehicleServiceType,
                driverId: null,
            });
        }
    };

    const getVehicleIcon = (vehicleServiceType: string) => {
        switch (vehicleServiceType) {
            case 'AUTO_RICKSHAW':
            case 'E_RICKSHAW':
                return <AutoIcon />;
            case 'BIKE':
            case 'DELIVERY_BIKE':
            case 'BIKE_PLUS':
                return <BikeIcon />;
            default:
                return <CarIcon />;
        }
    };

    const driverNameLengthThreshold = 14;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const vehicleImageStyle: Record<string, string> = {
        AUTO_RICKSHAW: 'bottom-[62px] right-[25px] w-[104px] h-[85px]',
        DELIVERY_BIKE: 'bottom-[58px] right-[25px] w-[90px] h-[100px]',
        BIKE: 'bottom-[58px] right-[0px] w-[160px] h-[100px]',
        BIKE_PLUS: 'bottom-[58px] right-[0px] w-[160px] h-[100px]',
        E_RICKSHAW: 'bottom-[62px] right-[25px] w-[104px] h-[85px]',
    };
    const defaultVehicleImageStyle = 'bottom-[58px] right-[25px] w-[125px] h-[81px]';

    const getNumberInFormat = useMemo(() => {
        return getVehicleNumber(vehicleNumber);
    }, [vehicleNumber]);

    return (
        <Animated.View
            entering={FadeIn.delay(100)}
            style={[
                tailwind.style(
                    `p-[${token?.spacing?.[16]}] rounded-[${token?.corner?.md}] bg-[${themeColors.Fill_neutralMin}] border border-[${themeColors.Fill_neutralLow}]`,
                ),
                styles.containerShadow,
            ]}>
            {vehicleServiceType && (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="vehicle image"
                    source={getVehicleImage(vehicleServiceType, vehicleModel)} // Use the utility function to get the image
                    style={tailwind.style(
                        classNames('absolute ', vehicleImageStyle[vehicleServiceType] || defaultVehicleImageStyle),
                    )}
                    resizeMode="contain"
                />
            )}
            <Pressable
                accessibilityRole="button"
                testID="bb075077-7986-4db6-9fb1-00d4975e52f0"
                onPress={handleDriverProfile}
                accessibilityLabel={`Driver: ${driverName}, Rating: ${rating ?? 'New'} button`}>
                <Animated.View style={tailwind.style(`w-[60%]`)}>
                    <Animated.View
                        style={tailwind.style(
                            `flex-row items-center gap-[${token?.gap?.spacing?.[10]}] mb-[${token?.gap?.spacing?.[16]}]`,
                        )}>
                        <Avatar
                            uri={avatarUri !== '' ? avatarUri : appConfig.assets.driverDefaultProfileUri}
                            type="md"
                            style={undefined}
                            isLink={true}
                        />
                        <Animated.View style={tailwind.style(`flex-col gap-[${token?.gap?.spacing?.[6]}]`)}>
                            <Typography
                                type="subhead-1"
                                style={tailwind.style(`text-[${token?.text?.['text-highContrast']}] w-[200px]`)}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {`${driverName.slice(0, driverNameLengthThreshold)} ${
                                    driverName.length > driverNameLengthThreshold ? '...' : ''
                                }`}
                            </Typography>
                            <Animated.View style={tailwind.style(`flex-row items-center gap-[${token?.spacing?.[6]}]`)}>
                                <StarFilled />
                                {rating !== undefined && (
                                    <Typography
                                        type="subhead-1"
                                        style={tailwind.style(`text-[${token?.text?.['text-base']}]`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {rating === 0 ? 'New' : rating.toString()}
                                    </Typography>
                                )}
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    <Divider
                        type="dashed"
                        direction={undefined}
                        style={undefined}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                        dividerColor={undefined}
                        strokeDashArray={undefined}
                    />
                </Animated.View>
            </Pressable>

            <Animated.View style={tailwind.style(`pt-[${token?.gap?.spacing?.[16]}] flex-row overflow-hidden`)}>
                <Animated.View style={tailwind.style(`flex-col flex-1 gap-[${token?.gap?.spacing?.[12]}]`)}>
                    <Animated.View style={tailwind.style(`flex-col gap-[${token?.gap?.spacing?.[6]}]`)}>
                        <Typography
                            type="subhead-1"
                            style={tailwind.style(`text-[${token?.text?.['text-bold']}]`)}
                            numberOfLines={1}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {vehicleModel}
                        </Typography>
                        <Animated.View
                            style={tailwind.style(`flex-row items-center gap-[${token?.gap?.spacing?.[2]}]`)}>
                            <Animated.View
                                style={tailwind.style(
                                    ` flex-row items-center gap-[${token?.gap?.spacing?.[2]}] pr-[${token?.gap?.spacing?.[12]}] `,
                                )}>
                                {vehicleServiceType !== 'BIKE' &&
                                vehicleServiceType !== 'BIKE_PLUS' &&
                                vehicleServiceType !== 'AUTO_RICKSHAW' &&
                                vehicleServiceType !== 'E_RICKSHAW' &&
                                vehicleServiceType !== 'DELIVERY_BIKE' ? (
                                    isAirConditioned ? (
                                        <Snowflake color="#1D74F6" height={15} width={undefined} />
                                    ) : (
                                        <Snowflake color="#B2B9C7" height={15} width={undefined} />
                                    )
                                ) : (
                                    <Icon icon={getVehicleIcon(vehicleServiceType)} size={16} />
                                )}
                                <Typography
                                    type="body-7"
                                    style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {`${serviceTierName}`}
                                </Typography>
                            </Animated.View>
                            <Animated.View
                                style={tailwind.style(`flex-row items-center gap-[${token?.gap?.spacing?.[2]}]`)}>
                                <Animated.View
                                    style={tailwind.style(
                                        `flex-row items-center gap-[${token?.gap?.spacing?.[6]}] pr-3 `,
                                    )}>
                                    <PassengerIcon />
                                    <Typography
                                        type="body-7"
                                        style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {`${capacity}`}
                                    </Typography>
                                </Animated.View>
                            </Animated.View>
                            <Animated.View>
                                <Icon icon={<DefaultColorIcon />} size={16} />
                            </Animated.View>
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-[${token?.text?.['text-weak']}] truncate`)}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {vehicleColor}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>

                <Animated.View style={tailwind.style('mt-auto absolute right-2 top-[10px]')}>
                    <Animated.View
                        style={tailwind.style(
                            'rounded-[3px] h-[26px] flex-row items-center justify-center border-[1.5px] border-[' +
                                `${themeColors.Text_neutralUltraHigh}` +
                                '] bg-[' +
                                `${colors?.recovered?.yellowMid}` +
                                '] px-[8px]',
                        )}>
                        <Typography
                            type="callout"
                            style={[
                                tailwind.style(
                                    'text-[' +
                                        `${themeColors.Text_neutralUltraHigh}` +
                                        '] text-[12px] font-areaNormal-regular',
                                ),
                                styles.vehicleNumberFont,
                            ]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {getNumberInFormat}
                        </Typography>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default CardDriver;

const styles = StyleSheet.create({
    vehicleNumberFont: {
        fontFamily: 'FE-Font',
    },
    containerShadow: {
        shadowColor: '' + `${colors?.recovered?.neutralMax}` + '08',
        shadowRadius: 4.5,
        shadowOpacity: 1.0,
        shadowOffset: { width: 0, height: 5.5 },
    },
});
