import { BottomSheetModal, BottomSheetView, BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React, { useState, useEffect } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import { TextInput } from 'react-native-gesture-handler';
import { SearchResultItem } from '../../Search/components/SearchSectionListItem/types';
import SearchContainer from '../../Search/components/SearchContainer';
import { SearchTarget } from '../../../utils/PublicTransportUtils';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { BottomSheetBackdrop } from '@/typescript/components/common/BottomSheetBackdrop';

interface BusOtpFailedSearchProps {
    recentsList: SearchResultItem[] | undefined;
    onRecentSearchPress?: (item: SearchResultItem) => void;
    suggestions: SearchResultItem[];
    loadingSuggestions: boolean;
    searchPublicTransport: (str: string, filterMode: SearchTarget) => void;
}

export const BusOtpFailedSearch = ({
    onRecentSearchPress,
    suggestions,
    loadingSuggestions,
    searchPublicTransport,
}: BusOtpFailedSearchProps) => {
    const { busOtpSearchBottomSheetRef } = useRefsContext();
    const { handlers: closeButtonHandlers, animatedStyle: closeButtonAnimatedStyle } = useScaleAnimation();
    const [searchText, setSearchText] = useState('');

    // Reset search text when component mounts (for fresh start on each wrong OTP)
    useEffect(() => {
        setSearchText('');
    }, []);

    const renderBackdrop = React.useCallback(
        (backdropProps: BottomSheetBackgroundProps) => (
            <BottomSheetBackdrop
                sheetRef={busOtpSearchBottomSheetRef}
                onHardwareBackPress={undefined}
                {...backdropProps}
                showBackdrop={true}
            />
        ),
        [busOtpSearchBottomSheetRef],
    );

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
        searchPublicTransport(text, 'routes');
    };

    const handleClose = () => {
        busOtpSearchBottomSheetRef.current?.dismiss();
    };

    return (
        <BottomSheetModal
            ref={busOtpSearchBottomSheetRef}
            style={tailwind.style('bg-[#F7F7F7] rounded-t-[36px] shadow-lg')}
            backdropComponent={renderBackdrop}>
            <BottomSheetView style={tailwind.style('bg-[#F7F7F7] pb-[20px]')}>
                <Animated.View style={tailwind.style('px-4 flex-row items-center justify-between')}>
                    <Pressable
                        testID="bus-otp-failed-search-close-button"
                        accessibilityRole="button"
                        accessibilityLabel="Close button"
                        accessibilityHint="Click here to close"
                        onPress={handleClose}
                        {...closeButtonHandlers}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    'bg-[#E6E6E6] h-[37px] w-[37px] items-center justify-center rounded-full',
                                ),
                                closeButtonAnimatedStyle,
                            ]}>
                            <Icon icon={<CrossIcon />} color="#313131" size={16} />
                        </Animated.View>
                    </Pressable>
                    {/* <Animated.View style={tailwind.style('w-[190px]')}>
                        <Animated.Text
                            style={tailwind.style('font-areaNormal-extrabold text-[12px] text-[#3B3A3C] text-center')}>
                            OTP needs time to refresh. Please Enter manually.
                        </Animated.Text>
                    </Animated.View> */}
                    <Animated.View style={tailwind.style('w-[37px] h-[37px]')} />
                </Animated.View>

                <Animated.View style={tailwind.style('pt-[15px] px-4')}>
                    <Animated.View
                        style={tailwind.style(
                            'h-[56px] rounded-[18px] bg-white flex-row items-center px-[18px] gap-[14px] border border-[#969696]',
                        )}>
                        <Icon icon={<MagnifyingGlass fill="#656565" />} color="#656565" size={20} />
                        <TextInput
                            placeholder="Enter Bus Number"
                            accessibilityRole="text"
                            accessibilityLabel="Enter Bus Number Input"
                            placeholderTextColor="#969696"
                            value={searchText}
                            onChangeText={handleSearchTextChange}
                            style={tailwind.style('font-areaNormal-extrabold text-[18px] text-[#969696] w-[90%]')}
                        />
                    </Animated.View>
                </Animated.View>

                {searchText === '' ? (
                    <Animated.View style={tailwind.style('')}>
                        <Animated.Text
                            style={tailwind.style(
                                'z-10 font-areaNormal-extrabold text-center text-[15px] text-[#3B3A3C] w-[333px] mx-auto pt-[29px] leading-[22px]',
                            )}>
                            This bus OTP has issues.{'\n'}Enter your bus number to get ticket!
                        </Animated.Text>
                        <Animated.View style={tailwind.style('flex-row items-end justify-end pb-[200px]')}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/bus-otp-fail.lottie')}
                                autoPlay
                                loop
                                style={tailwind.style('w-[400px] h-[400px] mt-[-20px]')}
                            />
                        </Animated.View>
                    </Animated.View>
                ) : (
                    <SearchContainer
                        dropLocation={searchText}
                        setDropLocation={setSearchText}
                        onSearchModalClose={() => {}}
                        handleSearchOnPress={undefined}
                        handleSearchOnSingleModePress={onRecentSearchPress}
                        searchResults={suggestions}
                        editTransitValues={[]}
                        onTransitSwitchChange={(_transit, _value) => {}}
                        onBusRoutePress={_value => {}}
                        onEditTransitConfirmPress={() => {}}
                        showEditTransitBtn={false}
                        isLoading={loadingSuggestions}
                        isMultimodal={false}
                    />
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
};
