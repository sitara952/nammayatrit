import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import Divider from '@/typescript/designSystem/components/primitives/Divider.tsx';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import token from '@/typescript/designSystem/tokens/index.ts';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';
import Users from '@/typescript/components/svg/Users.tsx';
import { Icon } from '@/typescript/components/Icon.tsx';
import { getCurrency } from '@/typescript/utils/getCurrency.ts';
import dayjs from 'dayjs';
import Apartment from '../../assets/svg/symbols/Apartment.tsx';

import { RateCard } from '../../designSystem/components/RateCard';
import { InfoIcon } from '../../assets/svg/symbols/InfoIcon.tsx';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal.tsx';
import { priceAPIEntity } from '@/readOnly/api/types/PriceAPIEntity.gen.tsx';
import { estimateFares } from '@/api/apiTypes/SearchResults.gen.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import Clock from '@/typescript/components/svg/Clock.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import {
    selectIsPetRide,
    selectTripTypeSelection,
    selectSelectedPricingItems,
} from '@/typescript/state/client/search.ts';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity.tsx';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
export const BOOK_ANY = 'Book Any';

const convertUTCtoISC = (utcDate: string, format: string) => {
    return dayjs(utcDate).format(format);
};

export enum ScheduledRideType {
    Rental,
    Intercity,
}

type RideSummaryCardV2Props = {
    vehicleIconUrl: string | undefined;
    serviceTierName: string | undefined;
    serviceTierShortDesc: string | undefined;
    maxVehicleServiceTierSeatingCapacity: number | undefined;
    estimatedFareWithCurrency: priceAPIEntity | undefined;
    fareBreakup: estimateFares[] | undefined;
    startTimeUTC: string | null;
    returnTimeUTC: string | null;
    scheduledRideType: ScheduledRideType;
};

export const RideSummaryCardV2: React.FC<RideSummaryCardV2Props> = ({
    vehicleIconUrl,
    serviceTierName = '',
    serviceTierShortDesc = '',
    maxVehicleServiceTierSeatingCapacity,
    estimatedFareWithCurrency,
    fareBreakup,
    startTimeUTC,
    returnTimeUTC,
    scheduledRideType,
}) => {
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const dateAndTime = startTimeUTC ? startTimeUTC : new Date().toISOString();
    const isRoundTrip = returnTimeUTC ? true : false;
    const IntercityStr = isRoundTrip ? 'Intercity Roundtrip' : 'Intercity';
    const returnTimeUTC_ = returnTimeUTC;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [showRateCardModal, setShowRateCardModal] = useState(false);
    const handleOnRateCardPress = () => {
        if (fareBreakup && serviceTierName) {
            setShowRateCardModal(true);
        }
    };
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    return (
        <Animated.View style={tailwind.style('w-full my-2 bg-white border border-gray-100 rounded-2xl shadow-sm')}>
            {/* add the vehicle details section */}
            <View style={tailwind.style('w-full flex-row items-center p-4')}>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="vehicle image"
                    source={{ uri: vehicleIconUrl }}
                    style={tailwind.style('w-16 h-14 mx-2 ')}
                />
                <Animated.View style={tailwind.style('flex-1')}>
                    <Typography
                        type="subhead-1"
                        numberOfLines={1}
                        style={tailwind.style(`text-[${token?.text['text-highContrast']}]`)}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {`${serviceTierName}`}
                    </Typography>
                    <Animated.View style={tailwind.style('flex-row items-center gap-[7px]')}>
                        <Typography
                            numberOfLines={1}
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text['text-weak']}]`)}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {serviceTierShortDesc}
                        </Typography>
                        {maxVehicleServiceTierSeatingCapacity ? (
                            <>
                                <Animated.View
                                    style={tailwind.style(
                                        `bg-[${token?.text?.['text-lowContrast']}] w-[2px] h-[2px] rounded-full`,
                                    )}
                                />
                                <Animated.View
                                    style={tailwind.style(`flex-row items-center gap-[${token?.gap.spacing?.[6]}]`)}>
                                    <Icon icon={<Users />} color={token?.text?.['text-weak']} size={16} />
                                    <Typography
                                        type="body-1"
                                        style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {maxVehicleServiceTierSeatingCapacity?.toString() || ''}
                                    </Typography>
                                </Animated.View>
                            </>
                        ) : null}
                    </Animated.View>
                </Animated.View>
                <Animated.View style={tailwind.style(`flex-col gap-[${token?.gap.spacing[6]}] items-start`)}>
                    <Animated.View style={tailwind.style('flex-row gap-[2px] items-center mb-4')}>
                        {estimatedFareWithCurrency?.currency && (
                            <Typography
                                type="subhead-1-rupee"
                                style={tailwind.style(`text-[${token?.text?.['text-highContrast']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {getCurrency(estimatedFareWithCurrency?.currency)}
                            </Typography>
                        )}
                        <Typography
                            type="subhead-1"
                            style={tailwind.style(`text-[${token?.text?.['text-highContrast']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {Math.round(estimatedFareWithCurrency?.amount ?? 0).toString() || ''}
                        </Typography>
                        {fareBreakup && featureFlags.enableUserRateCard ? (
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID="ride_summary_rate_card"
                                onPress={() => handleOnRateCardPress()}>
                                <InfoIcon />
                            </TouchableOpacity>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </View>
            <Divider
                type="dashed"
                dividerColor={`${colors?.recovered?.greyMid}`}
                strokeDashArray="6 5"
                style={tailwind.style(`px-4`)}
                direction={undefined}
                labelPosition={undefined}
                offset={undefined}
                offsetBackground={undefined}
            />
            <Animated.View style={tailwind.style('flex-row items-center p-4 rounded-md justify-between')}>
                <Animated.View>
                    <Animated.View style={tailwind.style('flex-row items-center')}>
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Pickup + ': '}
                        </Typography>
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {convertUTCtoISC(dateAndTime, 'DD/MM/YYYY')}
                        </Typography>
                        <Animated.View
                            style={tailwind.style(
                                `bg-[${token?.text?.['text-weak']}] w-[2px] h-[2px] rounded-full mx-1`,
                            )}
                        />
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {convertUTCtoISC(dateAndTime, 'h:mm a')}
                        </Typography>
                    </Animated.View>
                    {returnTimeUTC_ && (
                        <Animated.View style={tailwind.style('flex-row items-center')}>
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Drop}
                                {': '}
                            </Typography>
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {convertUTCtoISC(returnTimeUTC_, 'DD/MM/YYYY')}
                            </Typography>
                            <Animated.View
                                style={tailwind.style(
                                    `bg-[${token?.text?.['text-weak']}] w-[2px] h-[2px] rounded-full mx-1`,
                                )}
                            />
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {convertUTCtoISC(returnTimeUTC_, 'h:mm a')}
                            </Typography>
                        </Animated.View>
                    )}
                </Animated.View>
                {scheduledRideType == ScheduledRideType.Rental ? (
                    <RentalCard />
                ) : (
                    <IntercityCard interCityStr={IntercityStr} />
                )}
            </Animated.View>
            <AnimatedModal
                visible={showRateCardModal}
                setVisible={setShowRateCardModal}
                contentStyle={{ backgroundColor: 'transparent' }}
                showCloseButton={true}>
                <RateCard
                    serviceTier={serviceTierName}
                    fareItems={fareBreakup ?? []}
                    onClose={() => setShowRateCardModal(false)}
                    isIntercityOrRental={true}
                    isRoundTrip={isRoundTrip}
                    isPetRide={isPetRide}
                    selectedTripType={selectedTripType}
                    businessDiscountInfo={
                        selectedPricingItems
                            .filter(item => (serviceTierName ? item.serviceTierName === serviceTierName : true))
                            .at(0)?.businessDiscountInfo
                    }
                />
            </AnimatedModal>
        </Animated.View>
    );
};

const IntercityCard = ({ interCityStr }: { interCityStr: string }) => {
    return (
        <View style={styles.intercityCard}>
            <Apartment height={16} width={16} />
            <Typography
                type="body-6"
                numberOfLines={2}
                style={styles.intercityCardText}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {interCityStr}
            </Typography>
        </View>
    );
};

const RentalCard = () => {
    return (
        <View>
            <View style={styles.rentalCard}>
                <Clock color={'#000'} />
                <Typography
                    type="body-6"
                    numberOfLines={2}
                    style={styles.rentalCardText}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {'Rental'}
                </Typography>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rentalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F5B63B',
        marginLeft: 'auto',
        maxWidth: 120,
    },
    rentalCardText: {
        color: 'black',
        marginHorizontal: 4,
    },
    intercityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#1D74F6',
        marginLeft: 'auto',
        maxWidth: 120,
    },
    intercityCardText: {
        color: 'white',
        marginHorizontal: 4,
    },
});
