import { Icon } from '@/typescript/components/Icon';
import { FlatList } from 'react-native';
import HomeIcon from '@/src-v2/multimodal/components/svg/Home';
import WorkIcon from '@/src-v2/multimodal/components/svg/Work';
import PlusIcon from '@/typescript/components/svg/PlusIcon';
import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
type FavoritesSectionProps = {
    handleOnPress: () => void;
    favoriteList:
        | {
              title: string;
              icon: React.ReactElement;
          }[]
        | undefined;
};

export const FavoritesSection = ({
    favoriteList = [
        {
            title: 'Home',
            icon: <HomeIcon />,
        },
        {
            title: 'Work',
            icon: <WorkIcon />,
        },
        {
            title: 'Add Favourites',
            icon: <PlusIcon />,
        },
    ],
    handleOnPress,
}: FavoritesSectionProps) => {
    const handleRenderItem = ({ item, index }: { item: (typeof favoriteList)[0]; index: number }) => {
        return <FavoriteItem {...{ item, index }} handleOnPress={handleOnPress} />;
    };

    return (
        <Animated.View style={tailwind.style('pt-6')}>
            <Animated.Text style={tailwind.style('font-areaNormal-extrabold text-[14px] text-[#969696] px-5')}>
                Favorites
            </Animated.Text>
            <FlatList
                accessible={true}
                accessibilityLabel="Favorite locations"
                accessibilityRole="list"
                showsHorizontalScrollIndicator={false}
                style={tailwind.style('pt-[14px] pb-5')}
                contentContainerStyle={tailwind.style('px-5')}
                horizontal
                data={favoriteList}
                renderItem={handleRenderItem}
            />
        </Animated.View>
    );
};

type FavoriteItemProps = {
    item: {
        title: string;
        icon: React.ReactElement;
    };
    index: number;
    handleOnPress: () => void;
};

const FavoriteItem = ({ item, index, handleOnPress }: FavoriteItemProps) => {
    return (
        <Animated.View>
            <Pressable
                accessible={true}
                accessibilityLabel={`${item.title} favorite location button`}
                testID={`02389a98-c7b6-436d-92c8-c38db9e25b6c`}
                onPress={handleOnPress}
                accessibilityRole="button"
                style={({ pressed }) => [
                    tailwind.style(
                        'py-[10px] justify-center rounded-[24px] border-[1px] border-[#F1F2F2]  px-4 active:bg-[]',
                        index !== 0 ? 'ml-2' : '',
                        pressed ? 'bg-[#F3F0F6]' : '',
                        item.title === 'Add Favourites' ? 'bg-[#F4F4F4] border-[#E6E6E6]' : 'bg-[#FFF]',
                    ),
                    item.title !== 'Add Favourites'
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
                ]}>
                <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                    <Icon
                        color={item.title === 'Add Favourites' ? '#E60634' : '#2F2F2F'}
                        size={20}
                        icon={item.icon}
                        style={tailwind.style(item.title === 'Add Favourites' ? 'pt-0.5' : '')}
                    />
                    {item?.title ? (
                        <Animated.Text
                            accessible={false}
                            numberOfLines={1}
                            style={tailwind.style('text-[#2F2F2F] max-w-[160px] pl-2 font-areaNormal-bold text-sm')}>
                            {item?.title}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};
