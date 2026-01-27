import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { FavProps, SavedLocTag, priorityTags } from './types';
import { strings } from 'config-types';

export const assignTag = (item: savedReqLocationAPIEntity, strings: strings): FavProps => {
    if (item.tag.toLowerCase() === 'home') {
        return { ...item, savedLocType: SavedLocTag.HOME, tagName: strings.Home };
    } else if (item.tag.toLowerCase() === 'work') {
        return { ...item, savedLocType: SavedLocTag.WORK, tagName: strings.Work };
    } else return { ...item, savedLocType: SavedLocTag.FAV, tagName: item.tag };
};

export const checkTagExists = (tagName: string, favList: FavProps[]) => {
    return favList?.filter(item => item.tag.toLowerCase() == tagName).length == 1;
};

export const transformSavedList = (favList: FavProps[]): FavProps[] => {
    const listWithoutPriorityAddress = favList?.filter(item => !priorityTags.includes(item.tag.toLowerCase()));
    const listWithPriortyTags = favList?.filter(item => priorityTags.includes(item.tag.toLowerCase()));
    const homeExists = checkTagExists('home', listWithPriortyTags);
    const workExists = checkTagExists('work', listWithPriortyTags);

    const home: FavProps[] = homeExists
        ? []
        : [
              {
                  tag: '',
                  savedLocType: SavedLocTag.ADD_HOME,
                  area: undefined,
                  areaCode: undefined,
                  building: undefined,
                  city: undefined,
                  country: undefined,
                  door: undefined,
                  lat: undefined,
                  lon: undefined,
                  placeId: undefined,
                  state: undefined,
                  street: undefined,
                  ward: undefined,
                  locationName: undefined,
                  tagName: undefined,
              },
          ];
    const work: FavProps[] = workExists
        ? []
        : [
              {
                  tag: '',
                  savedLocType: SavedLocTag.ADD_WORK,
                  area: undefined,
                  areaCode: undefined,
                  building: undefined,
                  city: undefined,
                  country: undefined,
                  door: undefined,
                  lat: undefined,
                  lon: undefined,
                  placeId: undefined,
                  state: undefined,
                  street: undefined,
                  ward: undefined,
                  locationName: undefined,
                  tagName: undefined,
              },
          ];
    const addFav: FavProps[] =
        (homeExists && workExists && listWithPriortyTags.length == 2) ||
        homeExists ||
        workExists ||
        listWithPriortyTags.length == 0
            ? [
                  {
                      tag: '',
                      savedLocType: SavedLocTag.ADD_FAV,
                      area: undefined,
                      areaCode: undefined,
                      building: undefined,
                      city: undefined,
                      country: undefined,
                      door: undefined,
                      lat: undefined,
                      lon: undefined,
                      placeId: undefined,
                      state: undefined,
                      street: undefined,
                      ward: undefined,
                      locationName: undefined,
                      tagName: undefined,
                  },
              ]
            : [];

    return listWithPriortyTags?.concat(listWithoutPriorityAddress).concat(home.concat(work).concat(addFav));
};
