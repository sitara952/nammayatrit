import { FC, useEffect } from 'react';
import colors from '../../designSystem/colorPalette';
import Typography from './primitives/Typography';
import { View, Dimensions, AccessibilityInfo, Platform, Image } from 'react-native';
import { isUndefined, map } from 'lodash';
import { getCurrencyApiType } from '../../utils/getCurrency';
import { estimateFares } from '../../../api/apiTypes/SearchResults.gen';

import { CurrencyText } from '@/typescript/components/CurrencyText';
import { tailwind } from '../../tailwindTheme/tailwind';
import { ThemeTokens } from 'config-types';
import { fareDetail, getEstimatesFares } from '@/typescript/utils/fareEntityHelper';

import { strings } from 'config-types';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated from 'react-native-reanimated';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import Button from '@/src-v2/primitives/Button';
import { fareBreakupAPIEntity } from '@/readOnly/api/types/FareBreakupAPIEntity.gen';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import { businessDiscountInfoAPIEntity } from '@/readOnly/api/types/BusinessDiscountInfoAPIEntity.gen';
import { isTimeBetweenUsingSecond } from '@/typescript/utils/time';
import sun from '@/typescript/assets/estimate_sun.webp';
import moon from '@/typescript/assets/estimate_moon.webp';

type rateCardType = 'day' | 'night';

export type RateCardProps = {
    serviceTier: string;
    fareItems: Array<estimateFares>;
    onClose: () => void;
    isIntercityOrRental: boolean;
    isRoundTrip: boolean;
    isPetRide: boolean;
    selectedTripType: 'PERSONAL' | 'BUSINESS' | undefined;
    businessDiscountInfo: businessDiscountInfoAPIEntity | undefined;
};

// Transform estimateFares to RateCardProps
const getFareEntities = (
    fareBreakup: estimateFares[],
    userLanguageStrings: strings,
    isIntercityORRental: boolean,
    isRoundTrip: boolean,
    isPetRide: boolean,
    selectedTripType: 'PERSONAL' | 'BUSINESS' | undefined,
    extraFareDetail: fareDetail[],
    businessDiscountInfo: businessDiscountInfoAPIEntity | undefined,
    showFareKeyList: string[],
): Array<fareDetail> => {
    const fareList = fareBreakup.map(v => {
        const ret: fareBreakupAPIEntity = {
            description: v.title,
            amountWithCurrency: {
                amount: v.priceWithCurrency.amount ?? 0,
                currency: getCurrencyApiType(v.priceWithCurrency.currency),
            },
            amount: v.priceWithCurrency.amount ?? 0,
        };
        return ret;
    });

    const extraInfo: fareDetail[] = [
        {
            title: '',
            key: '',
            amountText: '',
            extraDetail: isIntercityORRental
                ? userLanguageStrings.Totalfaremaychangeifthereisachangeindistanceandtime
                : userLanguageStrings.Totalfaremaychangeifthereisachangeinroute,
            extraOrder: undefined,
        },
        ...(isIntercityORRental
            ? [
                  {
                      title: '',
                      key: '',
                      amountText: '',
                      extraDetail: userLanguageStrings.TollParkingExtra,
                      extraOrder: undefined,
                  },
              ]
            : []),
        ...extraFareDetail,
    ];
    const fareEntityList = extraInfo.concat(
        getEstimatesFares(
            fareList,
            userLanguageStrings,
            isIntercityORRental,
            isRoundTrip,
            isPetRide,
            selectedTripType,
            undefined,
            businessDiscountInfo,
            showFareKeyList,
        ),
    );

    return fareEntityList;
};

const FareItemView: FC<{ item: fareDetail; themeColors: ThemeTokens; rateCardType: rateCardType }> = ({
    item,
    themeColors,
    rateCardType,
}) => {
    return (
        item.key && (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: 14,
                    width: '100%',
                }}
                accessible>
                <Typography
                    type="body-1"
                    style={{
                        color: rateCardType === 'night' ? 'white' : '#14171F',
                        fontWeight: '500',
                        fontSize: 14,
                        lineHeight: 20,
                    }}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {item.key}
                </Typography>

                <CurrencyText
                    textType="body-1"
                    text={item.amountText}
                    textStyle={tailwind.style(
                        `text-[${rateCardType === 'night' ? '#FFFFFF' : themeColors.Text_neutralMax}]`,
                    )}
                    currencyStyle={tailwind.style('font-inter-bold')}
                />
            </View>
        )
    );
};

const HeaderView: FC<{
    serviceTier: string;
    nightChargesStartTime: number | undefined;
    nightChargesEndTime: number | undefined;
    rateCardType: rateCardType;
}> = ({ serviceTier, nightChargesStartTime, nightChargesEndTime, rateCardType }) => {
    const appConfig = useAppSelector(selectAppConfig);
    const parseShiftString = (start: number, end: number): string => {
        if (start >= 0 && end >= 0) {
            const startHour = Math.floor(start / 3600);
            const endHour = Math.floor(end / 3600);

            const formatHour = (hour: number): string => {
                if (hour === 0) return '12 AM';
                if (hour === 12) return '12 PM';
                return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
            };

            const startTime = formatHour(startHour);
            const endTime = formatHour(endHour);
            return `(${startTime} - ${endTime})`;
        }
        return '';
    };

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const hasTimeCharges = nightChargesStartTime !== undefined && nightChargesEndTime !== undefined;

    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        flexDirection: 'column',
                    }}>
                    <Typography
                        accessible
                        type="subhead"
                        style={{
                            color: rateCardType === 'night' ? 'white' : '#2F2935',
                            fontFamily: Platform.OS === 'ios' ? 'AreaNormal-Bold' : 'AreaNormal-Extrabold',
                            fontSize: 16,
                            lineHeight: 24,
                        }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {(appConfig.uiConfig.rateCardConfig.rateCardTitle === 'normal'
                            ? userLanguageStrings.RateCard
                            : userLanguageStrings.FareInclusions) +
                            ' - ' +
                            serviceTier}
                    </Typography>

                    {hasTimeCharges ? (
                        <Typography
                            type="body-1"
                            style={{
                                color: rateCardType === 'night' ? 'white' : 'black',
                                fontWeight: '400',
                                fontSize: 12,
                                lineHeight: 16,
                            }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {rateCardType === 'night'
                                ? userLanguageStrings.NightCharges(
                                      parseShiftString(nightChargesStartTime, nightChargesEndTime),
                                  )
                                : userLanguageStrings.DaytimeCharges(
                                      parseShiftString(nightChargesEndTime, nightChargesStartTime),
                                  )}
                        </Typography>
                    ) : null}
                </View>
            </View>
            {hasTimeCharges && (
                <Image
                    source={rateCardType === 'night' ? moon : sun}
                    style={{ position: 'absolute', right: 0, top: 0 }}
                />
            )}
        </>
    );
};

const DashLineView: FC = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const getDashLenCount = (dashLen: number) => {
        const width = Dimensions.get('window').width;
        const viewWidth = width - 72;
        return Math.floor(viewWidth / dashLen);
    };

    return (
        <View
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 14,
                    marginBottom: 8,
                    justifyContent: 'space-between',
                },
            ]}>
            {[...Array(getDashLenCount(14))].map((_, index) => {
                return (
                    <View
                        style={{
                            width: 6,
                            height: 1,
                            backgroundColor: `${themeColors.Fill_neutralMid}`,
                            marginRight: 8,
                            flexDirection: 'row',
                        }}
                        key={index}
                    />
                );
            })}
        </View>
    );
};

const DescriptionView: FC<{ value: fareDetail; rateCardType: rateCardType }> = ({ value, rateCardType }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 14,
            }}>
            <Typography
                type="body-1"
                style={{
                    color: rateCardType === 'night' ? 'white' : `${themeColors.Text_neutralHigh}`,
                    fontSize: 12,
                    fontWeight: '600',
                }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {value.extraDetail}
            </Typography>
        </View>
    );
};

const BodyView: FC<{
    fareItems: Array<fareDetail>;
    rateCardType: rateCardType;
}> = ({ fareItems, rateCardType }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return (
        <View
            style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 12,
                backgroundColor: rateCardType === 'night' ? '#58565B' : `${themeColors.Fill_neutralMin}`,
                marginTop: 12,
                borderColor: rateCardType === 'night' ? '#FFFFFF2E' : '#E0E3E8',
                borderWidth: 1,
            }}>
            {map(fareItems, (item, index) => (
                <FareItemView
                    item={item}
                    themeColors={themeColors}
                    key={item.key || `fare-item-${index}`}
                    rateCardType={rateCardType}
                />
            ))}

            <DashLineView />

            {map(fareItems, (item, index) =>
                item.extraDetail != '' ? (
                    <DescriptionView
                        value={item}
                        key={item.key || `description-${index}`}
                        rateCardType={rateCardType}
                    />
                ) : null,
            )}
        </View>
    );
};

const GoItView: FC<{ onCrossPress: () => void; rateCardType: rateCardType }> = ({ onCrossPress, rateCardType }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Button
            type="primary"
            testID="c8ad495f-19ee-4bd7-ae22-e2ec513e0243"
            style={{
                alignItems: 'center',
                borderRadius: 16,
                marginTop: 24,
                justifyContent: 'center',
                paddingVertical: 12,
            }}
            onPress={onCrossPress}>
            <Typography
                type="subhead"
                style={{
                    color: rateCardType === 'night' ? 'white' : themeColors.SlideButton_Primary_Disabled_Text_Base,
                }}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Gotit}
            </Typography>
        </Button>
    );
};

export const RateCard: FC<RateCardProps> = props => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    const { serviceTier, fareItems, businessDiscountInfo } = props;

    const NightChargesStartTime = fareItems.find(item => {
        return item.title === 'NIGHT_SHIFT_START_TIME_IN_SECONDS';
    });
    const NightShiftEndTime = fareItems.find(item => {
        return item.title === 'NIGHT_SHIFT_END_TIME_IN_SECONDS';
    });

    const NIGHT_CHARGES_START_TIME = NightChargesStartTime && Number(NightChargesStartTime.priceWithCurrency.amount);
    const NIGHT_CHARGES_END_TIME = NightShiftEndTime && Number(NightShiftEndTime.priceWithCurrency.amount);

    const rateCardType: rateCardType =
        !isUndefined(NIGHT_CHARGES_START_TIME) &&
        !isUndefined(NIGHT_CHARGES_END_TIME) &&
        isTimeBetweenUsingSecond(NIGHT_CHARGES_START_TIME, NIGHT_CHARGES_END_TIME)
            ? 'night'
            : 'day';

    const fares = getFareEntities(
        fareItems,
        userLanguageStrings,
        props.isIntercityOrRental,
        props.isRoundTrip,
        props.isPetRide,
        props.selectedTripType,
        appConfig.uiConfig.extraFareDetail,
        businessDiscountInfo,
        appConfig.uiConfig.rateCardConfig.rateCardVisibleKeys,
    );
    const handleCloseClick = () => {
        props.onClose();
    };

    useEffect(() => {
        AccessibilityInfo.announceForAccessibility('Rate Card Opened');
        // setFocus(ref);
    }, []);

    const { bottom } = useSafeAreaInsets();
    return (
        <TouchableWithoutFeedback
            testID="d8f45c75-f155-428e-afe3-45df17faa097"
            accessible={false}
            accessibilityRole="button"
            accessibilityViewIsModal>
            <Animated.View
                accessible={false}
                style={[
                    {
                        backgroundColor: rateCardType === 'night' ? '#4A484D' : colors.primitive.gray[11],
                        paddingHorizontal: 16,
                        paddingTop: 20,
                        paddingBottom: bottom,
                        borderTopEndRadius: 24,
                        borderTopStartRadius: 24,
                        overflow: 'hidden',
                    },
                ]}>
                <HeaderView
                    serviceTier={serviceTier}
                    nightChargesStartTime={NIGHT_CHARGES_START_TIME}
                    nightChargesEndTime={NIGHT_CHARGES_END_TIME}
                    rateCardType={rateCardType}
                />
                <BodyView fareItems={fares} rateCardType={rateCardType} />
                <GoItView onCrossPress={handleCloseClick} rateCardType={rateCardType} />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
