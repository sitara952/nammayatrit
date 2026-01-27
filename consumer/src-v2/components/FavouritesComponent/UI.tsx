import { FC } from 'react';
import FavouriteItem from '@/typescript/screens/home/homeComponents/Favourites/FavouritItem';
import React from 'react';
import Animated from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { FlatList } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { FavFlowToUIProps, SavedLocTag } from './types';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

const FavouritesComponentUI: FC<FavFlowToUIProps> = ({
    transformedFavouriteDataList,
    userLanguageStrings,
    themeColors,
    showTitle,
    onFavouriteItemPress,
    initialLeftPadding,
    gap,
    favTagsStyle,
    isMultiModal,
}) => {
    const initialFav =
        transformedFavouriteDataList.some(
            item => item.savedLocType === SavedLocTag.ADD_HOME || item.savedLocType === SavedLocTag.ADD_WORK,
        ) && transformedFavouriteDataList.some(item => item.savedLocType === SavedLocTag.ADD_FAV);
    return (
        <Animated.View>
            {transformedFavouriteDataList.length > 0 && (
                <Animated.View style={{ marginLeft: initialLeftPadding }}>
                    {showTitle && (
                        <Typography
                            type="body-1"
                            style={[{ color: themeColors.Text_neutralHigh }, styles.tag]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Favourites}
                        </Typography>
                    )}
                </Animated.View>
            )}
            <FlatList
                horizontal={true}
                keyboardShouldPersistTaps="handled"
                data={transformedFavouriteDataList}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={tailwind.style('px-[20px]')}
                renderItem={renderItemProps => {
                    return (
                        <FavouriteItem
                            userLanguageStrings={userLanguageStrings}
                            locationDetails={renderItemProps.item}
                            index={renderItemProps.index}
                            handleOnClick={onFavouriteItemPress}
                            favTagsStyle={[favTagsStyle, { marginLeft: renderItemProps.index == 0 ? 0 : gap }]}
                            isMultiModal={isMultiModal}
                            isLastIndex={renderItemProps.index === transformedFavouriteDataList.length - 1}
                            initialFav={initialFav}
                        />
                    );
                }}
            />
        </Animated.View>
    );
};

export default FavouritesComponentUI;

const styles = StyleSheet.create({
    tag: {
        paddingBottom: 9,
    },
});
