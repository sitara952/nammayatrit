import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { strings, ThemeTokens } from 'config-types/dist/babyconfig';
import { StyleProp, ViewStyle } from 'react-native';

export interface FavouritesListPropsType {
    onFavouriteItemPress: (favProps: FavProps) => void;
    showTitle: boolean;
    favTagsStyle: StyleProp<ViewStyle> | undefined;
    initialLeftPadding: number | undefined;
    gap: number | undefined;
    isMultiModal: boolean;
}

export interface FavFlowToUIProps {
    transformedFavouriteDataList: FavProps[];
    userLanguageStrings: strings;
    themeColors: ThemeTokens;
    favTagsStyle: StyleProp<ViewStyle> | undefined;
    showTitle: boolean;
    savedLocList: savedReqLocationAPIEntity[] | undefined;
    onFavouriteItemPress: (favProps: FavProps) => void;
    initialLeftPadding: number | undefined;
    gap: number | undefined;
    isMultiModal: boolean;
}

export enum SavedLocTag {
    FAV,
    HOME,
    WORK,
    ADD_HOME,
    ADD_WORK,
    ADD_FAV,
}

export type FavProps = {
    area: string | undefined;
    areaCode: string | undefined;
    building: string | undefined;
    city: string | undefined;
    country: string | undefined;
    door: string | undefined;
    lat: number | undefined;
    lon: number | undefined;
    placeId: string | undefined;
    state: string | undefined;
    street: string | undefined;
    tag: string;
    ward: string | undefined;
    savedLocType: SavedLocTag | undefined;
    locationName: string | undefined;
    tagName: string | undefined;
};

export const priorityTags = ['home', 'work'];
