import Animated from 'react-native-reanimated';
import React, { useRef, useState, useEffect } from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { TextInput } from 'react-native';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import SearchContainer from '../../Search/components/SearchContainer';
import { SearchResultItem } from '../../Search/components/SearchSectionListItem/types';
import { BackButton } from '@/src-v2/multimodal/components/common/BackButton';
import { useConfigContext } from '@/typescript/context/ConfigContext';

// Dummy search results data
const dummyData: SearchResultItem[] = [
    {
        title: 'Grand Central Terminal',
        subtitle: '89 E 42nd St, New York, NY 10017',
        placeId: 'place123',
        routeCode: undefined,
        stopCode: 'GCT',
        duration: '5 min',
        searchType: 'station',
        transitModes: [
            { mode: 'metro', duration: 300 },
            { mode: 'bus', duration: 600 },
        ],
        location: undefined,
    },
    {
        title: 'Times Square',
        subtitle: 'Manhattan, NY 10036',
        placeId: 'place456',
        routeCode: undefined,
        stopCode: 'TSQ',
        duration: '10 min',
        searchType: 'station',
        transitModes: [{ mode: 'metro', duration: 600 }],
        location: undefined,
    },
    {
        title: 'M1 Bus Route',
        subtitle: 'Uptown',
        placeId: 'gewgwe',
        routeCode: 'M1',
        stopCode: undefined,
        duration: '15 min',
        searchType: 'route',
        transitModes: [{ mode: 'bus', duration: 900 }],
        location: undefined,
    },
];

interface EditLocationProps {
    pickupLocation: string;
    dropoffLocation: string;
    onPickupLocationChange: (text: string) => void;
    onDropoffLocationChange: (text: string) => void;
    isPickupEditable: boolean;
    isDropoffEditable: boolean;
    onSearchResultPress: (item: SearchResultItem) => void;
    onClose: () => void;
}

const EditLocation = ({
    pickupLocation,
    dropoffLocation,
    onPickupLocationChange,
    onDropoffLocationChange,
    isPickupEditable = true,
    isDropoffEditable = true,
    onClose,
    onSearchResultPress,
}: EditLocationProps) => {
    const multimodalRideModalRef = useRef({ dismiss: () => {} });
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchResults(dummyData);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={tailwind.style('h-[600px]')}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between px-4 pt-4')}>
                <BackButton onPress={onClose} />
                <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold  text-[#969696]')}>
                    {userLanguageStrings.EditLocation}
                </Animated.Text>

                <Animated.View style={tailwind.style('w-[24px] h-[20px]')} />
            </Animated.View>

            <Animated.View style={tailwind.style('bg-white rounded-[16px] border border-[#F1F2F2] mt-[20px] mx-4')}>
                <TextInput
                    accessibilityLabel="Text input field"
                    autoFocus={true}
                    style={tailwind.style(
                        `text-[14px] border-b border-[${colors.CrossButton_bg}] font-areaNormal-extrabold  text-[#3B3A3C] h-[44px] mx-[26px]`,
                    )}
                    placeholder={userLanguageStrings.EnterPickupStop}
                    value={pickupLocation}
                    onChangeText={onPickupLocationChange}
                    editable={isPickupEditable}
                />
                <Animated.View style={tailwind.style('flex-row items-center px-[26px] gap-[5px]')}>
                    <Icon icon={<TransitArrowRight />} size={12} color="#838185" />

                    <TextInput
                        accessibilityLabel="Text input field"
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold  text-[#3B3A3C] h-[44px]')}
                        placeholder={userLanguageStrings.EnterDropoffStop}
                        value={dropoffLocation}
                        onChangeText={onDropoffLocationChange}
                        editable={isDropoffEditable}
                    />
                </Animated.View>
            </Animated.View>

            <Animated.View style={tailwind.style('mt-[14px]')}>
                <Animated.Text
                    style={tailwind.style('text-[14px] font-areaNormal-extrabold  text-[#969696] px-4 pb-4')}>
                    {userLanguageStrings.RecentSearches}
                </Animated.Text>
                <SearchContainer
                    dropLocation={''}
                    setDropLocation={() => {}}
                    onSearchModalClose={() => {
                        multimodalRideModalRef.current?.dismiss();
                    }}
                    handleSearchOnPress={undefined}
                    handleSearchOnSingleModePress={onSearchResultPress}
                    searchResults={searchResults}
                    editTransitValues={[]}
                    onTransitSwitchChange={(_transit, _value) => {}}
                    onBusRoutePress={_value => {}}
                    onEditTransitConfirmPress={() => {}}
                    showEditTransitBtn={false}
                    isLoading={searchResults.length === 0}
                    isMultimodal={false}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default EditLocation;
