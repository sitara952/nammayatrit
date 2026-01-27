import { Linking, StyleSheet } from 'react-native';
import { useContext, useMemo, useState } from 'react';
import { getCategoryName, getCategory } from '../../../assets/famousDestinations/FamoustDestData';
import { Card, CategoryType } from './Card';
import { tailwind } from '../../../tailwindTheme/tailwind';
import { FlatList } from 'react-native-gesture-handler';
import Tag from '../../../designSystem/components/primitives/Tag';
import Typography from '../../../designSystem/components/primitives/Typography';
import React, { memo } from 'react';
import { useAppSelector } from '../../../state/hooks';
import { location as LocationType } from '../../../../helpers/utils/Location/LocationTypes.gen';
import { getAddressFromComponents } from '../../../../helpers/utils/Location/LocationUtils.bs';
import { Icon } from '../../../components/Icon';
import FlagBuilding from '../../../components/svg/FlagBuilding';
import Event from '../../../assets/svg/miscellaneous/Events';
import Promotional from '../../../assets/svg/miscellaneous/Promotional';
import Videos from '../../../assets/svg/miscellaneous/Videos';
import Shopping from '../../../assets/svg/miscellaneous/Shopping';
import Eateries from '../../../assets/svg/miscellaneous/Eateries';
import PublicTransport from '../../../assets/svg/miscellaneous/PublicTransport';
import Beach from '../../../assets/svg/miscellaneous/Beach';
import Sports from '../../../assets/svg/miscellaneous/Sports';
import Office from '../../../assets/svg/miscellaneous/Office';
import ParkIcon from '../../../components/svg/ParkIcon';
import PlaneIcon from '../../../components/svg/PlaneIcon';
import colors from '../../../designSystem/colorPalette';
import {
    selectOperatingCity,
    selectCityConfig,
    selectSearchedSource,
    selectCurrentLocationCoords,
    selectBottomSheetStage,
} from '../../../state/client/session';
import { FamousDestProps } from '@/src-v2/systems/configs/types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated from 'react-native-reanimated';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useSearchUtils } from '@/typescript/utils/rideSearch';
import { MapContext } from '@/typescript/Maps/MapContext';

enum FamousDestType {
    // TODO : use dynamic actions
    Location,
    WebLink,
}

const MemoCard = memo(Card);

export const FamousSpots = () => {
    const city = useAppSelector(selectOperatingCity);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { searchForRides } = useSearchUtils();
    const famousDestinations: FamousDestProps[] = useAppSelector(state => selectCityConfig(state, 'explore_section'));
    const source = useAppSelector(selectSearchedSource);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const { mapRef } = useContext(MapContext);

    const categoryList = [
        { category: CategoryType.Heritage, color: '#f47171' },
        { category: CategoryType.Airport, color: '#1D74F6' },
        { category: CategoryType.Museum, color: `${colors?.recovered?.orangeMid}` },
        { category: CategoryType.Park, color: '#77bf47' },
        { category: CategoryType.SciencePark, color: '#77bf47' },
        { category: CategoryType.Events, color: undefined },
        { category: CategoryType.NammaVideos, color: undefined },
        { category: CategoryType.Videos, color: undefined },
        { category: CategoryType.Shopping, color: undefined },
        { category: CategoryType.Eateries, color: undefined },
        { category: CategoryType.PublicTransport, color: undefined },
        { category: CategoryType.Beach, color: undefined },
        { category: CategoryType.Sports, color: undefined },
        { category: CategoryType.Office, color: undefined },
    ];

    const emptyList = {
        [CategoryType.Heritage]: [],
        [CategoryType.Airport]: [],
        [CategoryType.Museum]: [],
        [CategoryType.Park]: [],
        [CategoryType.SciencePark]: [],
        [CategoryType.Promotional]: [],
        [CategoryType.Events]: [],
        [CategoryType.NammaVideos]: [],
        [CategoryType.Videos]: [],
        [CategoryType.Shopping]: [],
        [CategoryType.Eateries]: [],
        [CategoryType.PublicTransport]: [],
        [CategoryType.Beach]: [],
        [CategoryType.Sports]: [],
        [CategoryType.Office]: [],
    };

    const itemsMap = useMemo(() => {
        return famousDestinations.reduce<Record<CategoryType, FamousDestProps[]>>(
            (acc, item) => {
                const category = getCategory(item.category);
                return {
                    ...acc,
                    [category]: [...(acc[category] || []), item],
                };
            },
            { ...emptyList },
        );
    }, [famousDestinations]);

    const categories = useMemo(() => {
        return categoryList.filter(({ category }) => itemsMap[category]?.length > 0);
    }, [itemsMap, categoryList]);

    const [selectedCategory, setSelectedCategory] = useState(categories?.[0]?.category ?? CategoryType.Heritage);

    const currentItems = useMemo(() => {
        return itemsMap[selectedCategory] || [];
    }, [selectedCategory, itemsMap]);

    const handleFamousDestClick = (item: FamousDestProps, famousDestType: FamousDestType) => {
        switch (famousDestType) {
            case FamousDestType.Location: {
                if (!source) return;
                const newLocation: LocationType = {
                    title: item.name,
                    subtitle: item.address ? item.address : undefined,
                    lat: item.lat ? item.lat : undefined,
                    lng: item.lon ? item.lon : undefined,
                    specialLocation: undefined,
                    placeId: undefined,
                    tag: 'AUTOCOMPLETE',
                    addressComponents: getAddressFromComponents(item.address, undefined, undefined) ?? undefined,
                    serviceable: true,
                    serviceabilityCity: undefined,
                    formattedAddress: undefined,
                    locationType: undefined,
                    distanceFromCurrentLocation: undefined,
                    hotSpotInfo: undefined,
                };
                searchForRides(
                    true,
                    source,
                    newLocation,
                    mapRef,
                    currentLocationCoords,
                    bottomSheetStage,
                    undefined,
                    undefined,
                    false,
                );
                break;
            }
            case FamousDestType.WebLink: {
                const url = item.dynamic_action?.contents.url;
                if (url != undefined && url != '') Linking.openURL(url);
                break;
            }
            default:
        }
    };

    const handleOnClick = (item: FamousDestProps) => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        if (item.dynamic_action == undefined) {
            handleFamousDestClick(item, FamousDestType.Location);
        } else if (item.dynamic_action?.tag == 'WebLink') {
            handleFamousDestClick(item, FamousDestType.WebLink);
        } else {
            console.error('Handle famous spots click');
        }
    };

    const getIconColor = (isSelected: boolean, color: string | undefined) => {
        return isSelected == true ? 'white' : color;
    };
    const getCategoryIcon = (tag: CategoryType) => {
        switch (tag) {
            case CategoryType.Museum:
                return <FlagBuilding fill={undefined} />;
            case CategoryType.Airport:
                return <PlaneIcon fill={undefined} />;
            case CategoryType.Park:
                return <ParkIcon fill={undefined} />;
            case CategoryType.Heritage:
                return <FlagBuilding fill={undefined} />;
            case CategoryType.SciencePark:
                return <ParkIcon fill={undefined} />;
            case CategoryType.Promotional:
                return <Promotional fill={undefined} />;
            case CategoryType.Events:
                return <Event fill={undefined} />;
            case CategoryType.NammaVideos:
                return <Videos fill={undefined} />;
            case CategoryType.Videos:
                return <Videos fill={undefined} />;
            case CategoryType.Shopping:
                return <Shopping fill={undefined} />;
            case CategoryType.Eateries:
                return <Eateries fill={undefined} />;
            case CategoryType.PublicTransport:
                return <PublicTransport fill={undefined} />;
            case CategoryType.Beach:
                return <Beach fill={undefined} />;
            case CategoryType.Sports:
                return <Sports fill={undefined} />;
            case CategoryType.Office:
                return <Office fill={undefined} />;
            default:
                return <FlagBuilding fill={undefined} />;
        }
    };

    const handleRenderTag = (
        tag: { category: CategoryType; color: string | undefined },
        isLastIndex: boolean,
        isFirstIndex: boolean,
    ) => {
        return (
            <Tag
                testID="858a26ad-b82b-4c67-b19d-d6a760cdf728"
                size="md"
                key={tag.category}
                type="secondary"
                text={getCategoryName(tag.category, userLanguageStrings, city)}
                onPress={() => {
                    hapticEffect(HapticFeedbackTypes.selection, undefined);
                    setSelectedCategory(tag.category);
                }}
                icon={
                    <Icon
                        icon={getCategoryIcon(tag.category)}
                        color={getIconColor(tag.category == selectedCategory, tag.color)}
                        size={tag.category === CategoryType.Airport ? 22 : 16}
                    />
                }
                style={tailwind.style(
                    `${isFirstIndex ? 'ml-5' : 'ml-4'}
            border-[1px]
            border-transparent
            px-[16px]
            items-center
            mr-[${isLastIndex ? 20 : 0}]px

            `,
                )}
                selected={tag.category == selectedCategory}
            />
        );
    };

    const handleRenderCard = (card: FamousDestProps, isLastIndex: boolean, index: number) => {
        return (
            <MemoCard
                onClick={() => {
                    handleOnClick(card);
                }}
                key={index}
                imgSrc={card.imageUrl}
                title={card.name}
                subTitle={card.subTitle}
                description={card.description}
                category={getCategory(card.category)}
                style={[tailwind.style(`ml-20px mr-[${isLastIndex ? 20 : 0}]px`)]}
                borderRadius={undefined}
            />
        );
    };

    if (!famousDestinations || famousDestinations.length === 0) {
        return null;
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 32,
        },
    });

    return (
        <Animated.View style={styles.container}>
            <Typography
                type="callout-1"
                style={tailwind.style(`text-[${themeColors.Text_neutralHigh}] px-20px mb-5px  text-[#78747C]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Explore}
            </Typography>
            <FlatList
                overScrollMode="never"
                horizontal={true}
                data={categories}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyExtractor={(item, _) => item.category.toString()}
                renderItem={renderItemProps =>
                    handleRenderTag(
                        renderItemProps.item,
                        renderItemProps.index == categories.length - 1,
                        renderItemProps.index === 0,
                    )
                }
                style={tailwind.style('mt-[12px] mb-4')}
            />
            <FlatList
                overScrollMode="never"
                horizontal={true}
                data={currentItems}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyExtractor={(item, _) => item.imageUrl}
                renderItem={renderItemProps =>
                    handleRenderCard(
                        renderItemProps.item,
                        renderItemProps.index == currentItems.length - 1,
                        renderItemProps.index,
                    )
                }
            />
        </Animated.View>
    );
};
