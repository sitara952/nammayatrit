import React, { FC, useEffect } from 'react';
import '../utils/MMKV';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import { useRefsContext } from '../context/RefsContext';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '../../../src-v2/primitives/Button';
import { useConfigContext } from '../context/ConfigContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import Divider from '../designSystem/components/primitives/Divider';
import token from '../designSystem/tokens';
import { estimateFares } from '@/api/apiTypes/SearchResults.gen';
import { BookingId } from '../state/client/user';
import Animated from 'react-native-reanimated';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import InputGroupDirection from '../assets/svg/direction/InputGroupDirection';
const SVG_WIDTH = 34;

type Props = {
    closeModal: (() => void) | undefined;
    stops: { area: string | undefined; address: string | undefined; editable: boolean }[];
    originEditable: boolean;
    originTitle: string | undefined;
    originAddress: string | undefined;
    hideAccessibility: boolean | undefined;
    onEditPickupClick: (() => void) | undefined;
    onEditDestinationClick: (() => void) | undefined;
    isFollowRide: boolean;
    setShowTripDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCancellationReasonModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ScheduleRideSummaryProps = {
    bookingId: BookingId;
    fareBreakups: estimateFares[] | undefined;
};
const TripDetailsModal: React.FC<Props> = ({
    // closeModal = () => {},
    stops,
    originEditable,
    originTitle,
    originAddress,
    hideAccessibility = false,
    onEditPickupClick,
    onEditDestinationClick,
    isFollowRide = false,
    setShowTripDetailsModal,
}) => {
    const { tripDetailsRefFollowRide, tripDetailsRef } = useRefsContext();

    const onCancelPress = () => {
        if (isFollowRide) tripDetailsRefFollowRide.current?.dismiss();
        else {
            setShowTripDetailsModal(false);
            tripDetailsRef.current?.dismiss();
        }
        // closeModal();
    };
    const { bottom } = useSafeAreaInsets();
    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Trip Details popup', {
            queue: true,
        });
    }, []);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View
            style={{
                backgroundColor: colors?.white100,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                marginBottom: bottom,
            }}>
            <Typography
                type={'callout'}
                style={styles.TripDetails}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={true}
                accessibilityRole={undefined}
                accessibilityLabel={userLanguageStrings.EditTrip}>
                {userLanguageStrings.EditTrip}
            </Typography>
            <Divider
                direction="horizontal"
                type={undefined}
                style={undefined}
                labelPosition={undefined}
                offset={undefined}
                offsetBackground={undefined}
                dividerColor={undefined}
                strokeDashArray={undefined}></Divider>
            <Animated.View
                style={styles.View1}
                accessibilityElementsHidden={hideAccessibility}
                importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}>
                <Animated.View style={styles.InputBridge}>
                    {stops.length != 0 ? (
                        <InputGroupDirection
                            numStops={stops.length - 1}
                            heightMap={[85, 160, 243, 330]}
                            isMultimodal={false}
                        />
                    ) : null}
                </Animated.View>
                <Animated.View style={tailwind.style(stops.length != 0 ? `pl-[${SVG_WIDTH + 8}]` : '')}>
                    <StopInfo
                        key={`originAddress`}
                        title={originTitle}
                        address={originAddress}
                        editable={originEditable}
                        onEditClick={onEditPickupClick}
                        onlyPickup={stops.length == 0}
                    />
                    {stops.map((stop, index) => {
                        const isDestination = index === stops.length - 1;
                        return (
                            <View>
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
                                    key={index}
                                    title={stop.area}
                                    address={stop.address}
                                    editable={stop.editable}
                                    onEditClick={isDestination ? onEditDestinationClick : () => {}}
                                    onlyPickup={undefined}
                                />
                            </View>
                        );
                    })}
                </Animated.View>
                <Button
                    testID="trip_details_close"
                    type={'secondary'}
                    text="Close"
                    style={{
                        marginTop: 32,
                        justifyContent: 'center',
                        marginBottom: Platform.OS === 'ios' ? 20 : 0,
                    }}
                    onPress={onCancelPress}></Button>
            </Animated.View>
        </View>
    );
};

export default React.memo(TripDetailsModal);

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
        <Animated.View
            style={tailwind.style('flex flex-row justify-between w-full items-center')}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${title || ''} ${address || ''}`}>
            <Animated.View style={tailwind.style('flex-1')} accessible={false}>
                {onlyPickup ? (
                    <Typography
                        style={tailwind.style(`mb-10px text-[${themeColors.APP_THEME_COLOR}]`)}
                        type="body-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'pickup'}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Pickup}
                    </Typography>
                ) : null}
                {title ? (
                    <Typography
                        type="title-3"
                        style={{ fontSize: 15 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'title'}
                        accessibilityRole={undefined}>
                        {title}
                    </Typography>
                ) : null}
                {address ? (
                    <Typography
                        numberOfLines={1}
                        style={{ paddingTop: 1.5, color: token?.text?.['text-weak'], fontSize: 13 }}
                        type="callout"
                        isAnimate={undefined}
                        accessible={true}
                        accessibilityLabel={'address'}
                        accessibilityRole={undefined}>
                        {address}
                    </Typography>
                ) : null}
            </Animated.View>
            {editable ? (
                <Animated.View>
                    <TouchableOpacity
                        testID="trip_details_edit_location"
                        onPress={onEditClick}
                        style={tailwind.style('pl-4')}
                        accessible
                        accessibilityLabel="Click to edit location"
                        accessibilityRole={'button'}>
                        <Typography
                            accessible={false}
                            type="callout"
                            style={tailwind.style('text-[#306AFE]')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    TripDetails: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'AreaNormal-Extrabold',
        textAlign: 'center',
        paddingVertical: 16,
    },
    View1: { width: '100%', paddingRight: 20, paddingHorizontal: 15, marginTop: 28 },
    InputBridge: { position: 'absolute', left: 20, top: 3 },
});
