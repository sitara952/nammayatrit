import React, { FC, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { Home } from '@/typescript/components/svg/Home';
import { strings } from 'config-types';
import { Icon } from '@/typescript/components/Icon';
import { PlusIcon2 } from '@/typescript/assets/svg/symbols/PlusIcon';
import { FavoriteHeart } from '@/typescript/components/svg/FavoriteHeart';
import { BriefCase } from '@/typescript/components/svg/BriefCase';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import TouchEffect from '../sharedRides/TouchEffect';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { SavedLocTag, FavProps } from '@/src-v2/components/FavouritesComponent/types';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import HomeIcon from '@/src-v2/multimodal/components/svg/Home';
import WorkIcon from '@/src-v2/multimodal/components/svg/Work';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { AddIcon, OtherIcon } from '@/src-v2/multimodal/screens/Favourites/components/FavouritePill';

const getTagName = (loc: FavProps, userLanguageStrings: strings, isMultiModal: boolean, initialFav: boolean) => {
    switch (loc?.savedLocType) {
        case SavedLocTag.ADD_HOME:
            return userLanguageStrings.AddHome;
        case SavedLocTag.ADD_WORK:
            return userLanguageStrings.AddWork;
        case SavedLocTag.ADD_FAV:
            return initialFav ? '' : isMultiModal ? userLanguageStrings.AddFavourites : userLanguageStrings.Add;
        default:
            return loc?.locationName ?? loc?.tagName;
    }
};

const getTagIcon = (loc: FavProps) => {
    if (
        loc?.savedLocType === SavedLocTag.ADD_HOME ||
        loc?.savedLocType === SavedLocTag.ADD_WORK ||
        loc?.savedLocType === SavedLocTag.ADD_FAV
    ) {
        return (
            <Animated.View
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 4,
                }}>
                <Icon icon={<PlusIcon2 fillColor={colors.black600} fillBoundary={colors.black600} />} size={11} />
            </Animated.View>
        );
    } else if (loc?.savedLocType === SavedLocTag.HOME) {
        return <Home fillColor={colors.blue800} />;
    } else if (loc?.savedLocType === SavedLocTag.WORK) {
        return <BriefCase fillColor={colors.brown500} />;
    } else {
        return <FavoriteHeart />;
    }
};

const isAddFav = (loc: FavProps) => {
    return (
        loc?.savedLocType === SavedLocTag.ADD_HOME ||
        loc?.savedLocType === SavedLocTag.ADD_WORK ||
        loc?.savedLocType === SavedLocTag.ADD_FAV
    );
};

// const getMultiModalTagIcon = (loc: FavProps) => {
//     if (
//         loc?.savedLocType === SavedLocTag.ADD_HOME ||
//         loc?.savedLocType === SavedLocTag.ADD_WORK ||
//         loc?.savedLocType === SavedLocTag.ADD_FAV
//     ) {
//         return <PlusIcon fillColor="#E60634" />;
//     } else if (loc?.savedLocType === SavedLocTag.HOME) {
//         return <HomeIcon />;
//     } else if (loc?.savedLocType === SavedLocTag.WORK) {
//         return <WorkIcon />;
//     } else {
//         return <LocationSpot />;
//     }
// };

interface FavouritesItemPropsType {
    userLanguageStrings: strings;
    locationDetails: FavProps;
    index: number;
    handleOnClick: (_: FavProps) => void;
    favTagsStyle: StyleProp<ViewStyle> | undefined;
    isLastIndex: boolean;
    isMultiModal: boolean;
    initialFav: boolean;
}

const MultiModalFavouritesItem: FC<FavouritesItemPropsType> = ({
    userLanguageStrings,
    locationDetails,
    index,
    isLastIndex,
    handleOnClick,
}) => {
    const tagName = getTagName(locationDetails, userLanguageStrings, true, false);

    const isAddingFav = useMemo(() => {
        return isAddFav(locationDetails);
    }, [locationDetails]);

    const tagIcon = useMemo(() => {
        if (
            locationDetails?.savedLocType === SavedLocTag.ADD_HOME ||
            locationDetails?.savedLocType === SavedLocTag.ADD_WORK ||
            locationDetails?.savedLocType === SavedLocTag.ADD_FAV
        ) {
            return <AddIcon />;
        } else if (locationDetails?.savedLocType === SavedLocTag.HOME) {
            return <HomeIcon />;
        } else if (locationDetails?.savedLocType === SavedLocTag.WORK) {
            return <WorkIcon />;
        } else {
            return <OtherIcon />;
        }
    }, [locationDetails]);

    return (
        <Animated.View>
            <Pressable
                testID="multi-modal-favourite-item"
                onPress={() => {
                    handleOnClick(locationDetails);
                }}
                style={({ pressed }) => [
                    tailwind.style(
                        'py-[10px] justify-center rounded-[20px] border-[1px] border-[#F1F2F2] px-4',
                        index !== 0 ? 'ml-2' : '',
                        isLastIndex ? 'mr-[10px]' : '',
                        pressed ? 'bg-[#F3F0F6]' : '',
                        isAddingFav ? 'bg-[#F4F4F4] border-[#E6E6E6]' : 'bg-[#FFF]',
                    ),
                    !isAddingFav
                        ? {
                              shadowColor: '#00000',
                              shadowRadius: 2,
                              shadowOpacity: 0.03,
                              shadowOffset: {
                                  width: 0,
                                  height: 2,
                              },
                          }
                        : '',
                ]}
                accessibilityLabel={tagName + ' button'}
                accessibilityRole="button">
                <Animated.View
                    style={tailwind.style(
                        `flex-row items-center justify-center gap-[8px] ${isAddingFav ? 'bg-[#F4F4F4]' : ''}`,
                    )}>
                    <Icon color={isAddingFav ? '#E60634' : '#414042'} size={16} icon={tagIcon} />
                    {tagName ? (
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[#3B3A3C] max-w-[160px] font-areaNormal-extrabold text-[13px]',
                            )}>
                            {tagName === 'Home'
                                ? userLanguageStrings.Home
                                : tagName === 'Work'
                                  ? userLanguageStrings.Work
                                  : tagName}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const FavouritesItem: FC<FavouritesItemPropsType> = ({
    userLanguageStrings,
    locationDetails,
    index,
    isLastIndex,
    handleOnClick,
    favTagsStyle,
    initialFav,
}) => {
    const isAddFavourite = locationDetails.savedLocType === SavedLocTag.ADD_FAV;
    return (
        <TouchEffect
            onPress={() => handleOnClick(locationDetails)}
            testID="home_favourite_item"
            effects={['ripple']}
            accessible={true}
            accessibilityLabel={
                isAddFav(locationDetails)
                    ? 'Add your ' +
                      (locationDetails.savedLocType === SavedLocTag.ADD_HOME
                          ? 'Home location'
                          : locationDetails.savedLocType === SavedLocTag.ADD_WORK
                            ? 'Work location'
                            : 'Favourite location')
                    : locationDetails.savedLocType === SavedLocTag.HOME
                      ? 'Your Home location Click here to book a ride'
                      : locationDetails.savedLocType === SavedLocTag.WORK
                        ? 'Your Work location Click here to book a ride'
                        : getTagName(locationDetails, userLanguageStrings, false, initialFav) +
                          ' Click here to book a ride'
            }
            style={[
                isAddFavourite && initialFav ? styles.plusIconContainer : styles.tag,
                isAddFav(locationDetails) && styles.inactiveTag,
                isLastIndex && styles.lastTag,
                index === 0 && styles.firstTag,
                favTagsStyle,
            ]}>
            <Icon
                icon={getTagIcon(locationDetails)}
                style={isAddFavourite && initialFav ? styles.plusIcon : styles.icon}
                size={18}
                accessible={false}
            />
            <Typography
                type="body-6"
                style={isAddFav(locationDetails) ? styles.inactiveText : { color: '#313131' }}
                numberOfLines={1}
                isAnimate={undefined}
                accessible={false}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {getTagName(locationDetails, userLanguageStrings, false, initialFav)}
            </Typography>
        </TouchEffect>
    );
};

const FavouriteItem: FC<FavouritesItemPropsType> = props => {
    if (props.isMultiModal) {
        return <MultiModalFavouritesItem {...props} />;
    }
    return <FavouritesItem {...props} />;
};

export default FavouriteItem;

const styles = StyleSheet.create({
    animatedView: {
        paddingVertical: 4,
    },
    tag: {
        borderRadius: 60,
        maxWidth: 224,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginHorizontal: 8,
        flexDirection: 'row',
        backgroundColor: 'white',
    },
    inactiveTag: {
        backgroundColor: '#FFFFFF',
    },
    tagInactive: {
        backgroundColor: '#EFEFEF',
        borderRadius: 60,
    },
    lastTag: {
        marginRight: 20,
        marginLeft: 8,
    },
    firstTag: {
        marginLeft: 20,
    },
    inactiveText: {
        color: '#313131',
        // fontWeight: 800,
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },
    plusIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 5,
    },
    plusIconContainer: {
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 11,
        marginHorizontal: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        backgroundColor: 'white',
    },
});
