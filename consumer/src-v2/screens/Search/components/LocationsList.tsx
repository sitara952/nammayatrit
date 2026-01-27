import { FC, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { LocationSearchOptions } from '@/typescript/hooks/useLocationPredictions';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ErrorComponent, ErrorComponentProps } from '@/typescript/designSystem/components/ErrorComponent';
import { SearchCell } from './SearchCell';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useAppSelector } from '@/typescript/state/hooks';
import { favItemToLocation } from '@/typescript/screens/home/homeComponents/Favourites/Favourites';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { SharedValue } from 'react-native-reanimated';
import { SavedLocTag } from '@/src-v2/components/FavouritesComponent/types';
import { FavProps } from '@/src-v2/components/FavouritesComponent/types';
import FavouritesComponentFlow from '@/src-v2/components/FavouritesComponent/Flow';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { FlatList } from 'react-native-gesture-handler';
import { selectAppConfig } from '@/typescript/state/client/session';

type HandleCardRenderItemProps = {
    item: location;
    index: number;
};

interface LocationListPropsType {
    searchData: location[];
    locationSearchStatus: LocationSearchOptions;
    scrollOffsetY: SharedValue<number> | undefined;
    showFav: boolean;
    favTagsStyle: ViewStyle | undefined;
    handleCardPress: (item: location) => Promise<void>;
}

const LocationList: FC<LocationListPropsType> = ({
    searchData,
    locationSearchStatus,
    showFav,
    favTagsStyle,
    handleCardPress,
}) => {
    const configManager = useConfigContext();
    const startTypingImage = configManager.get('startTypingImage');
    const locationNotFound = configManager.get('locationNotFound');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const { bottom } = useSafeAreaInsets();

    const handleCardRenderItem = ({ item, index }: HandleCardRenderItemProps) => {
        return (
            <SearchCell
                {...{ item, index, handleCardPress }}
                isPending={locationSearchStatus === LocationSearchOptions.LOADING}
            />
        );
    };

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
                height: '122',
                width: '93',
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

    const onFavoriteItemPress = (favProps: FavProps) => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        switch (favProps.savedLocType) {
            case SavedLocTag.ADD_HOME:
            case SavedLocTag.ADD_WORK:
            case SavedLocTag.ADD_FAV:
                navigation.navigate('addFavourite');
                return;
            default: {
                if (favProps?.lat === undefined || favProps?.lon === undefined) return;
                const locationObj = favItemToLocation(favProps);
                handleCardPress(locationObj);
            }
        }
    };

    const appConfig = useAppSelector(selectAppConfig);
    const isMultiModal = appConfig.appType === 'multimodal';

    // const handleOnScroll = useAnimatedScrollHandler({
    //     onScroll: event => {
    //         scrollOffsetY.value = event.contentOffset.y;
    //     },
    // });

    return (
        <View style={{ flexShrink: 1 }}>
            {showFav && (
                <View style={Styles.favoriteView}>
                    <FavouritesComponentFlow
                        onFavouriteItemPress={onFavoriteItemPress}
                        showTitle={false}
                        initialLeftPadding={0}
                        gap={8}
                        favTagsStyle={favTagsStyle}
                        isMultiModal={isMultiModal}
                    />
                </View>
            )}
            <FlatList
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={'on-drag'}
                initialNumToRender={7}
                maxToRenderPerBatch={7}
                windowSize={12}
                scrollEnabled={searchData?.length > 0}
                // onScroll={handleOnScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                // itemLayoutAnimation={LinearTransition.springify().damping(28).stiffness(240)}
                // layout={LinearTransition.springify().damping(28).stiffness(240)}
                data={searchData}
                keyExtractor={(item, index) => item?.placeId + index.toString()}
                contentContainerStyle={[Styles.containerStyle, { paddingBottom: bottom + 80 }]}
                ListEmptyComponent={listEmptyComponent}
                renderItem={handleCardRenderItem}
            />
        </View>
    );
};

const Styles = StyleSheet.create({
    favoriteView: {
        marginBottom: 16,
        marginLeft: 0,
    },
    containerStyle: {
        minHeight: Platform.OS === 'ios' ? '65%' : '75%',
        gap: 12,
        paddingHorizontal: 16,
        zIndex: -10,
    },
});

export { LocationList };
