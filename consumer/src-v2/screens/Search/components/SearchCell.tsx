import {
    SearchInput,
    selectActiveInput,
    selectSeletedStopLocationsTextInput,
    selectStartLocationFromTextInput,
    selectCurrentLocationCoords,
    selectSearchedSource,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import React, { useMemo } from 'react';
import Animated, { FadeOut } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { Icon } from '@/typescript/components/Icon';
import { getSearchListIcon } from '../utils/SearchIconHelper';
import { Recents } from '@/typescript/components/svg/search/Recents';
import colors from '@/typescript/designSystem/colorPalette';
import CardSearch from '@/typescript/designSystem/components/CardSearch';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { FavoriteHeart } from '@/typescript/components/svg/FavoriteHeart';

type SearchCellProps = {
    item: location;
    index: number;
    isPending: boolean;
    handleCardPress: (item: location) => Promise<void>;
};
export const SearchCell = (props: SearchCellProps) => {
    const currentLocation = useAppSelector(selectCurrentLocationCoords);
    const { item, index, isPending, handleCardPress } = props;
    const activeInput = useAppSelector(selectActiveInput);
    const startLocationFromTextInput = useAppSelector(selectStartLocationFromTextInput);
    const stopLocationsTextInput = useAppSelector(selectSeletedStopLocationsTextInput);
    const sourceLocation = useAppSelector(selectSearchedSource);
    const appConfig = useAppSelector(selectAppConfig);
    const searchInput = activeInput === SearchInput.Source ? startLocationFromTextInput : stopLocationsTextInput;

    const getLocationIcon = useMemo(() => {
        switch (item.tag) {
            case 'RECENTS':
            case 'PRIORITIZE_RECENT':
                return (
                    <Icon color={colors?.recovered?.neutralUltraHigh} icon={<Recents fill={undefined} />} size={20} />
                );
            case 'PRIORITIZE_FAVOURITE':
                return <Icon color={colors?.recovered?.neutralUltraHigh} icon={<FavoriteHeart />} size={20} />;
            default:
                return (
                    <Icon
                        color={colors?.recovered?.neutralUltraHigh}
                        icon={getSearchListIcon(item.locationType ?? [], item.title ?? '')}
                        size={24}
                    />
                );
        }
    }, [item]);

    return (
        <Animated.View entering={undefined} exiting={FadeOut.duration(20)} key={item?.placeId}>
            <CardSearch
                accessibilityLabel={`${item?.title}, ${item?.subtitle}, ${item?.distanceFromCurrentLocation ?? ''}`}
                accessibilityHint="Selects this location"
                isFavouritesSearch={false}
                style={tailwind.style(
                    index === 0 ? 'pt-[8px] border-[#E0E3E8] border-[1px]' : 'border-[#E0E3E8] border-[1px]',
                )}
                prefix={getLocationIcon}
                title={item?.title ?? ''}
                description={item?.subtitle ?? ''}
                suffix={
                    item.tag !== 'RECENTS' &&
                    item?.distanceFromCurrentLocation &&
                    appConfig.uiConfig.showDistanceFromCurrentLocationInSearchResults ? (
                        <Typography
                            numberOfLines={1}
                            type="body-1"
                            style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                            isAnimate={undefined}
                            accessible={false}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>{`${item?.distanceFromCurrentLocation}`}</Typography>
                    ) : null
                }
                onPress={async () => {
                    handleCardPress(item);
                }}
                isLoading={isPending}
                disabled={isPending}
                showTime={undefined}
                isAnimate={undefined}
                location={undefined}
                badge={undefined}
                styles={undefined}
                searchTerm={searchInput}
                currentLocation={currentLocation}
                sourceLocation={sourceLocation}
                activeInput={activeInput}
            />
        </Animated.View>
    );
};
