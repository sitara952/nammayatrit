import React, { FC, useState } from 'react';
import colors from '../../designSystem/colorPalette';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { ChildrenType, StyleType } from '../../types/CommonTypes';
import token from '@/typescript/designSystem/tokens';
import Typography from './primitives/Typography';
import { RateCard } from './RateCard';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectIsPetRide, selectSelectedPricingItems, selectTripTypeSelection } from '@/typescript/state/client/search';

import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { CurrencyText } from '@/typescript/components/CurrencyText';

import { fareBreakupAPIEntity } from '@/readOnly/api/types/FareBreakupAPIEntity.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Divider from './primitives/Divider';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import { Icon } from '@/typescript/components/Icon';
import { strings } from 'config-types';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import InputGroupDirection from '@/typescript/assets/svg/direction/InputGroupDirection';
import { TripMode } from '@/typescript/state/client/search';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';

const SVG_WIDTH = 34;

type CardRideDetailsProps = {
    stops: { area: string | undefined; address: string | undefined; editable: boolean }[];
    fare: string;
    originEditable: boolean;
    originTitle: string | undefined;
    originAddress: string | undefined;
    wrapperStyles: StyleType | undefined;
    footerContent: ChildrenType | undefined;
    isRideConfirmed: boolean;
    onEditPickupClick: (() => void) | undefined;
    onEditDestinationClick: (() => void) | undefined;
    onRateCardPress: (() => void) | undefined;
    serviceTierName: string | undefined;
    showFareDetails: boolean | undefined;
    estimatedFareBreakup: fareBreakupAPIEntity[] | undefined;
    hideAccessibility: boolean | undefined;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    isRoundTrip: boolean | undefined;
    isIntercityOrRentals: boolean | undefined;
    isRideWaitingScreen: boolean | undefined;
    userLanguageStrings: strings;
};

export const CardRideDetails: FC<CardRideDetailsProps> = ({
    stops,
    fare,
    originEditable,
    originTitle,
    originAddress,
    wrapperStyles,
    footerContent,
    isRideConfirmed,
    onEditPickupClick,
    onEditDestinationClick,
    serviceTierName,
    onRateCardPress = () => {},
    showFareDetails = true,
    hideAccessibility = false,
    setHideAccessibility,
    isRoundTrip = false,
    isIntercityOrRentals = false,
    isRideWaitingScreen = false,
    userLanguageStrings,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, null));

    const currentPricingItems = selectedPricingItems.filter(item =>
        serviceTierName ? item.serviceTierName === serviceTierName : true,
    );
    const featureFlags = useAppSelector(selectNewFeatureFlags);

    const [showRateCardModal, setShowRateCardModal] = useState(false);

    const onRateCardInfoPress = () => {
        if (setHideAccessibility) {
            setHideAccessibility(true);
        }
        setShowRateCardModal(true);
        onRateCardPress();
    };

    const canShowRateCard =
        featureFlags.enableUserRateCard &&
        currentPricingItems?.length > 0 &&
        selectedPricingItems?.[0]?.tripMode !== TripMode.RideOtp;

    return (
        <Animated.View
            layout={LinearTransition}
            style={[tailwind.style('px-4.5 bg-white pt-4', `rounded-[${token?.corner.md}]`), wrapperStyles]}>
            {showFareDetails && (
                <Animated.View
                    layout={LinearTransition}
                    accessibilityElementsHidden={hideAccessibility}
                    importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}>
                    {!isRideWaitingScreen && isRideConfirmed && (
                        <Animated.View style={tailwind.style('pb-3')}>
                            <Divider
                                type="dashed"
                                dividerColor={`${themeColors.Fill_neutralMid}`}
                                strokeDashArray="6 5"
                                direction={undefined}
                                style={undefined}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                            />
                        </Animated.View>
                    )}

                    <Animated.View layout={LinearTransition} style={tailwind.style('flex-row justify-between pr-1')}>
                        <Animated.View style={tailwind.style('flex-col items-start')} accessible={true}>
                            <Typography
                                type="subhead-1"
                                accessible={false}
                                style={undefined}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityLabel="Fare estimate"
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Fareestimate}
                            </Typography>
                            <Typography
                                accessible={false}
                                type="body-1"
                                style={tailwind.style(`text-[${token?.text?.['text-weak']}] pt-1.5`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityLabel="pay via cash or upi"
                                accessibilityRole={undefined}>
                                {userLanguageStrings.PayviacashorUPI}
                            </Typography>
                        </Animated.View>

                        <Animated.View style={tailwind.style(`flex-1 self-baseline items-end justify-end`)}>
                            <TouchableOpacity
                                testID="85c64f02-7df8-4ed8-8aff-2abd052992ce"
                                accessibilityRole="button"
                                onPress={canShowRateCard ? onRateCardInfoPress : undefined}
                                activeOpacity={0.5}
                                accessible={true}
                                accessibilityLabel={`Fare estimate ${fare}, click to see rate card`}
                                disabled={!canShowRateCard}
                                style={tailwind.style('flex flex-row items-center justify-end')}>
                                <CurrencyText
                                    textType="title-800"
                                    text={`${fare}`}
                                    currencyStyle={tailwind.style('font-inter-bold text-[20px]')}
                                    textStyle={tailwind.style(
                                        'text-[22px] font-areaNormal-extrabold leading-[26px] mt-1.5',
                                    )}
                                />

                                {canShowRateCard && (
                                    <Icon
                                        icon={<InfoIcon />}
                                        color={colors.recovered.blue}
                                        style={tailwind.style('ml-1')}
                                    />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    {!isRideWaitingScreen && (
                        <Animated.View style={tailwind.style('pt-3 pb-4')}>
                            <Divider
                                type="dashed"
                                dividerColor={`${themeColors.Fill_neutralMid}`}
                                strokeDashArray="6 5"
                                direction={undefined}
                                style={undefined}
                                labelPosition={undefined}
                                offset={undefined}
                                offsetBackground={undefined}
                            />
                        </Animated.View>
                    )}
                </Animated.View>
            )}
            {!isRideWaitingScreen && (
                <Animated.View
                    style={tailwind.style('pb-5 w-full')}
                    accessibilityElementsHidden={hideAccessibility}
                    importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}>
                    <Animated.View style={tailwind.style('absolute left-0')}>
                        {stops.length > 0 && (
                            <InputGroupDirection
                                numStops={stops.length - 1}
                                heightMap={[85, 160, 243, 330]}
                                isMultimodal={false}
                            />
                        )}
                    </Animated.View>
                    <Animated.View style={tailwind.style(stops.length > 0 ? `pl-[${SVG_WIDTH + 4}]` : '')}>
                        <StopInfo
                            title={originTitle}
                            address={originAddress}
                            editable={originEditable}
                            onEditClick={onEditPickupClick}
                            onlyPickup={stops.length == 0}
                        />
                        {stops.map((stop, index) => {
                            const isDestination = index === stops.length - 1;
                            return (
                                <React.Fragment key={index}>
                                    <Animated.View style={tailwind.style('w-full justify-center my-4')}>
                                        <Divider
                                            direction="horizontal"
                                            type={undefined}
                                            style={undefined}
                                            labelPosition={undefined}
                                            offset={undefined}
                                            offsetBackground={undefined}
                                            dividerColor={undefined}
                                            strokeDashArray={undefined}
                                        />
                                    </Animated.View>
                                    <StopInfo
                                        title={stop.area}
                                        address={stop.address}
                                        editable={stop.editable}
                                        onEditClick={isDestination ? onEditDestinationClick : () => {}}
                                        onlyPickup={undefined}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </Animated.View>
                </Animated.View>
            )}
            {footerContent}

            <AnimatedModal
                visible={showRateCardModal}
                setVisible={setShowRateCardModal}
                contentStyle={{ backgroundColor: 'transparent' }}
                showCloseButton={true}
                onClose={() => {
                    if (setHideAccessibility) {
                        setHideAccessibility(false);
                    }
                }}>
                <RateCard
                    serviceTier={serviceTierName ?? ''}
                    fareItems={currentPricingItems.at(0)?.fareBreakup ?? []}
                    onClose={() => setShowRateCardModal(false)}
                    isRoundTrip={isRoundTrip ?? showFareDetails}
                    isIntercityOrRental={isIntercityOrRentals ?? showFareDetails}
                    isPetRide={isPetRide}
                    selectedTripType={selectedTripType}
                    businessDiscountInfo={currentPricingItems.at(0)?.businessDiscountInfo}
                />
            </AnimatedModal>
        </Animated.View>
    );
};

type StopInfoProps = {
    title: string | undefined;
    address: string | undefined;
    editable: boolean;
    onEditClick: (() => void) | undefined;
    onlyPickup: boolean | undefined;
};
const StopInfo: FC<StopInfoProps> = ({ title, address, editable, onEditClick, onlyPickup = false }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={tailwind.style('flex flex-row justify-between w-full items-center')}>
            <Animated.View style={tailwind.style('flex-1')} accessible={true}>
                {onlyPickup && (
                    <Typography
                        style={tailwind.style(`mb-0px text-[${themeColors.APP_THEME_COLOR}]`)}
                        type="subhead-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Pickup}
                    </Typography>
                )}
                {title && (
                    <Typography
                        type="subhead-1"
                        style={{ fontSize: 15 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                )}
                {address && (
                    <Typography
                        numberOfLines={1}
                        style={tailwind.style('pt-1.5', `text-[${token?.text?.['text-weak']}]`)}
                        type="body-2"
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {address}
                    </Typography>
                )}
            </Animated.View>
            {editable && (
                <Animated.View>
                    <TouchableOpacity
                        testID="72b45f1b-b1ed-4dbc-bba1-1947d56f5efc"
                        onPress={onEditClick}
                        style={tailwind.style('pl-4')}
                        accessible
                        accessibilityLabel="Click to edit location"
                        accessibilityRole={'button'}>
                        <Typography
                            accessible={false}
                            type="callout"
                            style={tailwind.style('text-[' + `${themeColors.APP_THEME_COLOR}` + ']')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
};
