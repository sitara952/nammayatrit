import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import Button from '@/src-v2/primitives/Button';
import InputGroupDirection from '@/typescript/assets/svg/direction/InputGroupDirection';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import GenericSearchModal from '@/typescript/components/common/GenericSearchModal';
import CustomiseRental from '@/typescript/components/CustomiseRental';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import RentalPolicy from '@/typescript/components/RentalPolicy';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { isNull } from 'lodash';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { RentalScreenViewProps } from './Types';
import { createAction } from '@/typescript/utils/common';
import DateTimePickerBottomPopup from '@/typescript/components/DateTimePickerBottomPopup';
import { OverLapBanner } from '@/typescript/screens/rideSummary/overlapBanner';
import Clock from '@/typescript/components/svg/Clock';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import dayjs from 'dayjs';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

export const RentalScreenView: React.FC<RentalScreenViewProps> = ({
    source,
    destinationLocationsTextInput,
    currentLocation,
    selectLocationType,
    dateTime,
    maxPossibleDate,
    minPossibleDate,
    dateTimePickerBottomSheetModalRef,
    popupOverlappingTime,
    handleInfoClick,
    onSearchCardClick,
    locationPlaceHolder,
    genericSearchBackPress,
    onLocateOnMapClick,
    rcsDispatch,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { top, bottom } = useSafeAreaInsets();
    const { circularSliderParentScroll } = useAnimatedContextValues(undefined);
    const { rentalPolicyModalRef, genericSearchModalRef } = useRefsContext();
    return (
        <HardwareBackpressHandler>
            <View style={tailwind.style(`flex-1 bg-[${themeColors.Fill_neutralUltraLow}] p-[12px] pt-[${top}]`)}>
                <DateTimePickerBottomPopup
                    dateTime={dateTime ?? new Date()}
                    setDateTime={(newDate: Date) => {
                        rcsDispatch(createAction('HANDLE_DATE_CHANGE', { newDate }));
                    }}
                    maxPossibleDate={maxPossibleDate}
                    minPossibleDate={minPossibleDate}
                    estimatedDuration={undefined}
                    dateTimePickerBottomSheetModalRef={dateTimePickerBottomSheetModalRef}
                />
                <OverLapBanner overLapBookingTime={popupOverlappingTime} />
                <View style={tailwind.style(`flex-wrap flex-row bg-[${themeColors.Fill_neutralUltraLow}]`)}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="rentals_back"
                        style={styles.backButton}
                        onPress={() => {
                            rcsDispatch(createAction('HANDLE_BACKPRESS', undefined));
                        }}>
                        <LeftArrow />
                    </TouchableOpacity>
                    <View style={tailwind.style(`flex-1`)} />
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="rentals_datetime_picker"
                        style={styles.timerButton}
                        onPress={() => {
                            rcsDispatch(createAction('CLOCK_CLICK', undefined));
                        }}>
                        <Clock />
                        <Typography
                            children={dateTime ? dayjs(dateTime).format('DD MMM, hh:mm A') : 'Now'}
                            type={'body'}
                            style={styles.timerText}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessible={undefined}
                            numberOfLines={undefined}
                            accessibilityRole={undefined}
                        />
                        <ChevronDown height={24} width={24} />
                    </TouchableOpacity>
                </View>
                <ScrollView scrollEnabled={circularSliderParentScroll.value} showsVerticalScrollIndicator={false}>
                    <View
                        style={tailwind.style(
                            `mt-[12px] mb-[12px] bg-[${token?.default?.secondary?.default}] rounded-[${token?.corner.md}] px-[${token?.spacing[16]}] py-[4] flex-row gap-[${token?.gap.spacing[12]}]`,
                        )}>
                        <InputGroupDirection isMultimodal={false} numStops={undefined} heightMap={undefined} />
                        <View style={tailwind.style('flex-1')}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID="rentals_source_location"
                                onPress={() => {
                                    rcsDispatch(createAction('SELECT_SOURCE_LOCATION', undefined));
                                }}>
                                {!isNull(source) ? (
                                    <Typography
                                        type="body-1"
                                        numberOfLines={1}
                                        style={[tailwind.style('text-[#515151]'), { paddingVertical: 15 }]}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {source
                                            ? `${source.title} ${source?.subtitle}`
                                            : userLanguageStrings.Whereareyougoing_QuestionMark}
                                    </Typography>
                                ) : (
                                    <Typography
                                        type="body-1"
                                        numberOfLines={1}
                                        style={[tailwind.style('text-[#515151]'), { paddingVertical: 15 }]}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {source}
                                    </Typography>
                                )}
                            </TouchableOpacity>
                            <View style={tailwind.style('py-[2px]')}>
                                <Divider
                                    type={undefined}
                                    direction={undefined}
                                    style={undefined}
                                    labelPosition={undefined}
                                    offset={undefined}
                                    offsetBackground={undefined}
                                    dividerColor={undefined}
                                    strokeDashArray={undefined}
                                />
                            </View>
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID="rentals_destination_location"
                                onPress={() => {
                                    rcsDispatch(createAction('SELECT_DESTINATION_LOCATION', undefined));
                                }}>
                                <Typography
                                    type="body-1"
                                    numberOfLines={1}
                                    style={[tailwind.style('text-[#515151]'), { paddingVertical: 15 }]}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {destinationLocationsTextInput
                                        ? destinationLocationsTextInput
                                        : userLanguageStrings.DestinationOptional}
                                </Typography>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <CustomiseRental onInfoClick={handleInfoClick} />
                </ScrollView>
                <Button
                    testID="rentals_continue"
                    text={userLanguageStrings.Continue}
                    type="primary"
                    style={tailwind.style(`my-[${bottom}px] justify-center`)}
                    onPress={() => {
                        rcsDispatch(createAction('CONTINUE_CLICKED', undefined));
                    }}
                />
                <PopUpModal
                    sheetRef={genericSearchModalRef}
                    snapPoints={['100%']}
                    showBackdrop={false}
                    onHardwareBackPress={undefined}
                    isScrollable={false}
                    enableDynamicSizing={false}
                    topInset={top - 10}>
                    <GenericSearchModal
                        lat={source ? source.lat : currentLocation?.lat}
                        lon={source ? source.lng : currentLocation?.lng}
                        onCardClick={onSearchCardClick}
                        placeHolderText={locationPlaceHolder(selectLocationType)}
                        onBackPress={genericSearchBackPress}
                        onLocateMapPress={onLocateOnMapClick}
                        locationType={selectLocationType}
                        searchedLocationText={undefined}
                    />
                </PopUpModal>
                <PopUpModal
                    sheetRef={rentalPolicyModalRef}
                    enableDynamicSizing={true}
                    showBackdrop={undefined}
                    onHardwareBackPress={undefined}
                    isScrollable={false}>
                    <RentalPolicy />
                </PopUpModal>
            </View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 11,
        backgroundColor: 'white',
        borderColor: '#E0E3E8',
        borderWidth: 1,
        borderRadius: 20,
    },
    timerButton: {
        paddingVertical: 8,
        paddingHorizontal: 11,
        backgroundColor: 'white',
        borderColor: '#E0E3E8',
        borderWidth: 1,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        color: '#14171F',
        marginLeft: 8,
    },
});
