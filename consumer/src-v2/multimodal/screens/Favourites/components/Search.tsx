import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { LocationSearchOptions } from '@/typescript/hooks/useLocationPredictions';
import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, TextInput } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ErrorComponent, ErrorComponentProps } from '@/typescript/designSystem/components/ErrorComponent';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SearchCell } from '@/src-v2/screens/Search/components/SearchCell';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { Header } from '@/src-v2/primitives/Header';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';

const Search = ({
    onChangeText = () => {},
    onClose = () => {},
    searchText,
    searchData,
    locationSearchStatus,
    onSearchResultPress = async () => {},
}: {
    onChangeText: (text: string) => void;
    onClose: () => void;
    searchText: string;
    searchData: location[];
    locationSearchStatus: LocationSearchOptions;
    onSearchResultPress: (item: location) => Promise<void>;
}) => {
    const configManager = useConfigContext();
    const startTypingImage = configManager.get('startTypingImage');
    const locationNotFound = configManager.get('locationNotFound');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const searchInputRef = useRef<TextInput>(null);

    const handleCardRenderItem = ({ item, index }: { item: location; index: number }) => {
        return (
            <SearchCell
                {...{ item, index, handleCardPress: onSearchResultPress }}
                isPending={locationSearchStatus === LocationSearchOptions.LOADING}
            />
        );
    };
    const { setAutoClearTimeout } = useAutoClearTimeout();
    useEffect(() => {
        setAutoClearTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
                searchInputRef.current.setSelection(0, 800);
            }
        }, 250);
    }, []);

    const errorComponentProps = useMemo((): ErrorComponentProps => {
        if (locationSearchStatus == LocationSearchOptions.EMPTY_INPUT) {
            return {
                asset: startTypingImage.value,
                title: userLanguageStrings.StartTyping,
                description: userLanguageStrings.Searchforaplacetokickoffyourdrive,
                height: '116',
                width: '108',
                accessible: false,
            };
        } else if (locationSearchStatus == LocationSearchOptions.LOCATIONS_NOT_FOUND) {
            return {
                asset: locationNotFound.value,
                title: userLanguageStrings.Locationnotfound,
                description: userLanguageStrings.Wecouldntfindanymatchesforyoursearch,
                height: '160',
                width: '120',
                accessible: true,
            };
        } else {
            return {
                asset: undefined,
                title: '',
                description: '',
                height: '',
                width: '',
                accessible: false,
            };
        }
    }, [locationSearchStatus, startTypingImage.value, locationNotFound.value]);

    const listEmptyComponent = useMemo(() => {
        return <ErrorComponent {...errorComponentProps} />;
    }, [errorComponentProps]);

    return (
        <Animated.View
            style={tailwind.style(`bg-[${homeSheetBg}] flex-1`)}
            entering={SlideInDown.duration(200)}
            exiting={SlideOutDown.duration(200)}>
            <Header title={userLanguageStrings.EnterFavouriteLocation} onBackPress={onClose} />
            <Animated.View style={tailwind.style('px-[16px] flex-1')}>
                <TextInput
                    accessibilityLabel="Text input field"
                    value={searchText}
                    ref={searchInputRef}
                    selectTextOnFocus={true}
                    style={[
                        tailwind.style(`font-areaNormal-extrabold `),
                        {
                            borderWidth: 1,
                            borderColor: colors.neutral300,
                            height: 50,
                            paddingHorizontal: 22,
                            borderRadius: 16,
                            color: colors.gray400,
                            fontSize: 14,
                            backgroundColor: colors.white,
                        },
                    ]}
                    placeholder={userLanguageStrings.Searchalocation}
                    placeholderTextColor={colors.gray300}
                    onChangeText={onChangeText}
                />

                <Animated.View style={tailwind.style('mt-[16px] flex-1')}>
                    <FlatList
                        scrollEnabled={true}
                        overScrollMode="never"
                        data={searchData}
                        renderItem={handleCardRenderItem}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        keyExtractor={(loc, index) => `${loc.placeId ?? (loc.lat ?? 0) + (loc.lng ?? 0)}-${index}`}
                        style={tailwind.style('flex-1')}
                        contentContainerStyle={tailwind.style('gap-[12px] pb-[100px]')}
                        ListEmptyComponent={listEmptyComponent}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                    />
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(Search);
