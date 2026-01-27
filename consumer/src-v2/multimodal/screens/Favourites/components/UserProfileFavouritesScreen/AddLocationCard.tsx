import Animated from 'react-native-reanimated';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import mt_ic_home from '@/typescript/assets/mt_ic_home.png';
import mt_ic_work from '@/typescript/assets/mt_ic_work.png';
import { Platform, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { PlusIcon2 } from '@/typescript/assets/svg/symbols/PlusIcon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';

const BorderSvg = () => {
    return (
        <Svg width="100%" height="100%" fill="none">
            <Rect x="0.5" y="0.5" width="99%" height="99%" rx={19.5} stroke="#D8D6D6" strokeDasharray="8 8" />
        </Svg>
    );
};

const AddLocationCard = ({
    type = 'home',
    onAddFavouritePress = () => {},
}: {
    type: 'home' | 'work' | 'work-collapsed';
    onAddFavouritePress: () => void;
}) => {
    const { handlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    if (type === 'work-collapsed') {
        return (
            <Pressable
                testID="add-work-card-button"
                onPress={onAddFavouritePress}
                {...handlers}
                accessibilityLabel="Add Work button"
                accessibilityRole="button">
                <Animated.View style={styles.collapsedBorderContainer}>
                    <BorderSvg />
                </Animated.View>
                <Animated.View style={styles.collapsedCardContainer}>
                    <Animated.View style={styles.collapsedIconContainer}>
                        <Icon icon={<PlusIcon2 fillColor={'#3B3A3C'} fillBoundary={'#3B3A3C'} />} size={18} />
                    </Animated.View>
                    <Animated.Text style={[styles.collapsedText, tailwind.style('font-areaNormal-bold')]}>
                        {userLanguageStrings.AddWork}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Animated.View style={styles.mainCardContainer}>
            <Animated.View style={styles.mainBorderContainer}>
                <BorderSvg />
            </Animated.View>
            <Animated.Image
                accessibilityLabel={type === 'home' ? 'home location image' : 'work location image'}
                accessible={true}
                source={type === 'home' ? mt_ic_home : mt_ic_work}
                style={styles.cardImage}
            />
            <Animated.Text style={[styles.cardTitle, tailwind.style('font-areaNormal-bold')]}>
                {type === 'home' ? userLanguageStrings.AddHome : userLanguageStrings.AddWork}
            </Animated.Text>
            <Animated.Text style={[styles.cardDescription, tailwind.style('font-areaNormal-bold')]}>
                {type === 'home'
                    ? userLanguageStrings.Addinghomeaddresshelpsdyoutofindcommutesmoreeasily
                    : userLanguageStrings.Addingyourworkaddressmakescommutingsimpler}
            </Animated.Text>
            <Pressable
                testID="add-location-card-button"
                onPress={onAddFavouritePress}
                style={[styles.buttonContainer, tailwind.style('font-areaNormal-bold')]}
                accessibilityLabel={
                    type === 'home'
                        ? 'Enter home location button' + ' button'
                        : 'Enter work location button' + ' button'
                }
                accessibilityRole="button"
                {...handlers}>
                <Animated.View
                    style={[styles.button, { backgroundColor: themeColors.where_you_going_bg }]}
                    accessible={false}>
                    <Icon
                        icon={
                            <PlusIcon2
                                fillColor={themeColors.favourites_confirm_button_text}
                                fillBoundary={themeColors.favourites_confirm_button_text}
                            />
                        }
                        size={16}
                    />
                    <Animated.Text
                        style={[
                            styles.buttonText,
                            tailwind.style('font-areaNormal-bold'),
                            { color: themeColors.favourites_confirm_button_text },
                            Platform.OS === 'android' && styles.buttonTextAndroid,
                        ]}>
                        {type === 'home'
                            ? userLanguageStrings.EnterHomeLocation
                            : userLanguageStrings.EnterWorkLocation}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default React.memo(AddLocationCard);

const styles = StyleSheet.create({
    collapsedBorderContainer: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 55,
    },
    collapsedCardContainer: {
        position: 'relative',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 5,
        backgroundColor: '#d1d5db',
    },
    collapsedIconContainer: {
        borderRadius: 8,
        padding: 1,
        position: 'relative',
        top: 1.2,
    },
    collapsedText: {
        fontFamily: 'areaNormal-extrabold',
        color: '#3B3A3C',
        fontSize: 14,
    },

    mainCardContainer: {
        paddingBottom: 35,
        position: 'relative',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainBorderContainer: {
        position: 'absolute',
        width: '100%',
        height: 296,
        top: 0,
        left: 0,
        overflow: 'hidden',
    },
    cardImage: {
        width: 137,
        height: 129,
    },
    cardTitle: {
        color: '#3B3A3C',
        fontSize: 14,
        textAlign: 'center',
    },
    cardDescription: {
        paddingTop: 8,
        color: '#656565',
        fontSize: 13,
        textAlign: 'center',
        width: 235,
    },
    buttonContainer: {
        marginTop: 20,
    },
    button: {
        borderRadius: 16,
        paddingHorizontal: 13,
        height: 47,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontFamily: 'areaNormal-bold',
        fontSize: 14,
    },
    buttonTextAndroid: {
        lineHeight: 19,
    },
});
