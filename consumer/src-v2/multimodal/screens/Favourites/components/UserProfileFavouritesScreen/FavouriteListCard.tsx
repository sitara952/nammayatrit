import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { Icon } from '@/typescript/components/Icon';
import { HomeIcon, OtherIcon, WorkIcon } from '../FavouritePill';
import Svg, { Circle } from 'react-native-svg';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { PlusIcon2 } from '@/typescript/assets/svg/symbols/PlusIcon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { TagType } from '../../Types';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { StyleSheet } from 'react-native';

export const OptionsIcon = () => {
    return (
        <Svg width={4} height={20} viewBox="0 0 4 20" fill="none">
            <Circle cx={2} cy={10} r={2} fill="#969696" />
            <Circle cx={2} cy={2} r={2} fill="#969696" />
            <Circle cx={2} cy={18} r={2} fill="#969696" />
        </Svg>
    );
};

const FavouriteListCard = ({
    type,
    title,
    address,
    onPress,
}: {
    type: TagType | 'Add';
    title: string;
    address: string;
    onPress: () => void;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const titleLogic = useMemo(() => {
        switch (type) {
            case 'Home':
                return userLanguageStrings.Home;
            case 'Work':
                return userLanguageStrings.Work;
            case 'Favourite':
                return title;
            case 'Add':
                return userLanguageStrings.AddFavourites;
        }
    }, [type, title, userLanguageStrings]);

    const iconLogic = useMemo(() => {
        switch (type) {
            case 'Home':
                return <Icon icon={<HomeIcon />} color={colors.blue800} size={20} />;

            case 'Work':
                return <Icon icon={<WorkIcon />} color={colors.brown500} size={20} />;

            case 'Favourite':
                return <Icon icon={<OtherIcon />} color={colors.red550} size={20} />;

            case 'Add':
                return (
                    <Icon
                        icon={
                            <PlusIcon2
                                fillColor={themeColors.add_favorite_text}
                                fillBoundary={themeColors.add_favorite_text}
                            />
                        }
                        size={18}
                    />
                );
        }
    }, [type, themeColors.add_favorite_text]);

    return (
        <Pressable
            testID="favourite-list-card"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={titleLogic + ' button'}
            {...handlers}>
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        backgroundColor: type !== 'Add' ? 'white' : themeColors.add_favorite_bg,
                        borderColor: colors.neutral300,
                    },
                    animatedStyle,
                ]}>
                <Animated.View style={styles.contentContainer}>
                    <Animated.View style={styles.iconContainer}>{iconLogic}</Animated.View>

                    <Animated.View style={styles.textContainer}>
                        <Animated.Text
                            style={[
                                styles.titleText,
                                tailwind.style('font-areaNormal-extrabold'),
                                {
                                    color: type !== 'Add' ? '#3B3A3C' : themeColors.add_favorite_text,
                                },
                            ]}
                            numberOfLines={1}>
                            {titleLogic}
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.addressText,
                                tailwind.style('font-areaNormal-bold'),
                                {
                                    color: type !== 'Add' ? '#7E7E7E' : themeColors.add_favorite_text,
                                },
                            ]}
                            numberOfLines={1}>
                            {address}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

export default FavouriteListCard;

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        width: '85%',
    },
    titleText: {
        fontSize: 15,
    },
    addressText: {
        fontSize: 14,
    },
    optionsButton: {
        width: 30,
        height: 20,
    },
});
