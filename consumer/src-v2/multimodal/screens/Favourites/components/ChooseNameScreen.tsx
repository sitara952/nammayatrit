import React, { useCallback, useState, useEffect, useMemo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { Pressable } from '@/src-v2/primitives/Pressable';
import FavouritePill from './FavouritePill';
import ConfirmButton from './ConfirmButton';
import { TagType } from '../Types';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { TrashIcon } from './FavouritesToastMessages';
import { setToastProps } from '@/typescript/state/client/session';
import { useAppDispatch } from '@/typescript/state/hooks';
import { Icon } from '@/typescript/components/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { StyleSheet } from 'react-native';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';

const shouldRenderPill = (
    pillType: 'Home' | 'Work',
    existingTags: string[],
    selectedTag: TagType | undefined,
    showAllFavouritePills: boolean,
): boolean => {
    if (showAllFavouritePills) {
        return true;
    } else {
        return !existingTags.includes(pillType) || selectedTag === pillType;
    }
};

export const DoubleActionScreen = ({
    onPrimaryAction,
    onSecondaryAction,
    title,
    subtitle,
    primaryButtonText,
    secondaryButtonText,
}: {
    onPrimaryAction: () => void;
    onSecondaryAction: () => void;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    secondaryButtonText: string;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const { handlers: cancelDeleteHandlers, animatedStyle: cancelDeleteAnimatedStyle } = useScaleAnimation();

    return (
        <>
            {title && (
                <Animated.Text style={[styles.doubleActionTitle, tailwind.style('font-areaNormal-extrabold')]}>
                    {title}
                </Animated.Text>
            )}
            {subtitle && (
                <Animated.Text style={[styles.doubleActionSubtitle, tailwind.style('font-areaNormal-extrabold')]}>
                    {subtitle}
                </Animated.Text>
            )}

            <Pressable
                testID="favourites-cancel-delete-button"
                onPress={onPrimaryAction}
                accessibilityLabel="Cancel button"
                accessibilityRole="button"
                {...cancelDeleteHandlers}>
                <Animated.View style={[styles.primaryButton, cancelDeleteAnimatedStyle]}>
                    <Animated.Text style={[styles.primaryButtonText, tailwind.style('font-areaNormal-extrabold')]}>
                        {primaryButtonText}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
            <Pressable
                testID="delete-confirm-button"
                onPress={onSecondaryAction}
                accessibilityLabel="Delete button"
                accessibilityRole="button"
                {...handlers}>
                <Animated.View style={[styles.secondaryButton, animatedStyle]}>
                    <Animated.Text style={[styles.secondaryButtonText, tailwind.style('font-areaNormal-extrabold')]}>
                        {secondaryButtonText}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </>
    );
};

export const ChooseNameScreenContent = ({
    location,
    tag,
    setTag,
    isEdit,
    existingTags,
    selectedTag,
    onChangeLocationPress,
    showAllFavouritePills,
}: {
    location: location;
    tag: TagType;
    setTag: (tag: TagType) => void;
    isEdit: boolean;
    existingTags: string[];
    selectedTag: TagType | undefined;
    onChangeLocationPress: () => void;
    showAllFavouritePills: boolean;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.Text style={[styles.locationLabel, tailwind.style('font-areaNormal-extrabold')]}>
                {userLanguageStrings.Location}
            </Animated.Text>
            <Pressable
                accessibilityLabel="Change Location button"
                accessibilityRole="button"
                style={styles.locationPressableContainer}
                testID="favourite-location-pressable"
                onPress={onChangeLocationPress}>
                <Animated.View style={styles.locationContainer}>
                    <Animated.Text
                        style={[styles.locationText, tailwind.style('font-areaNormal-extrabold')]}
                        numberOfLines={1}>
                        {(location?.title || '') + ', ' + (location?.subtitle || '')}
                    </Animated.Text>
                    <Animated.Text style={[styles.editText, tailwind.style('font-areaNormal-extrabold')]}>
                        {userLanguageStrings.Edit}
                    </Animated.Text>
                </Animated.View>
            </Pressable>

            <Animated.Text style={[styles.nameLabel, tailwind.style('font-areaNormal-extrabold')]}>
                {isEdit ? userLanguageStrings.Changename : userLanguageStrings.Chooseaname}
            </Animated.Text>
            {shouldRenderPill('Home', existingTags, selectedTag, showAllFavouritePills) ||
            shouldRenderPill('Work', existingTags, selectedTag, showAllFavouritePills) ? (
                <Animated.View style={styles.pillsContainer}>
                    {shouldRenderPill('Home', existingTags, selectedTag, showAllFavouritePills) && (
                        <FavouritePill
                            type="home"
                            selected={tag === 'Home'}
                            onPress={() => setTag('Home')}
                            name={undefined}
                            disabled={existingTags.includes('Home') && selectedTag !== 'Home'}
                        />
                    )}
                    {shouldRenderPill('Work', existingTags, selectedTag, showAllFavouritePills) && (
                        <FavouritePill
                            type="work"
                            selected={tag === 'Work'}
                            onPress={() => setTag('Work')}
                            name={undefined}
                            disabled={existingTags.includes('Work') && selectedTag !== 'Work'}
                        />
                    )}
                    <FavouritePill
                        type="other"
                        selected={tag === 'Favourite'}
                        onPress={() => setTag('Favourite')}
                        name={userLanguageStrings.Favorites}
                        disabled={false}
                    />
                </Animated.View>
            ) : (
                <Animated.View style={styles.pillsPlaceholder} />
            )}
        </>
    );
};

const ChooseNameScreen = ({
    onChangeLocationPress = () => {},
    onConfirmPress = () => {},
    location,
    existingTags,
    isEdit = false,
    selectedTag,
    selectedTagName,
    onDeletePress = () => {},
    headerContent = undefined,
    showAllFavouritePills = true, // if true this will only show the favourite that can be added
    currentBottomSheetRef,
}: {
    onChangeLocationPress: () => void;
    onConfirmPress: (location: location, tag: TagType, favouriteName: string | undefined) => void;
    location: location;
    existingTags: string[];
    isEdit: boolean;
    selectedTag: TagType | undefined;
    selectedTagName: string | undefined;
    onDeletePress: () => void;
    headerContent: React.ReactNode | undefined;
    showAllFavouritePills: boolean;
    currentBottomSheetRef: React.RefObject<BottomSheetModal | null> | undefined;
}) => {
    const { bottom } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const [favouriteName, setFavouriteName] = useState<string | undefined>(selectedTagName);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const defaultSelectedTag = useMemo(
        () =>
            selectedTag ??
            (!existingTags.includes('Home') ? 'Home' : !existingTags.includes('Work') ? 'Work' : 'Favourite'),
        [selectedTag, existingTags],
    );
    const [tag, setTag] = useState<TagType>(defaultSelectedTag);

    useEffect(() => {
        // Update the local tag state if defaultSelectedTag changes.
        // defaultSelectedTag itself is memoized and updates when selectedTag or existingTags change.
        setTag(defaultSelectedTag);
    }, [defaultSelectedTag]);

    function expandBottomSheet() {
        if (currentBottomSheetRef?.current) {
            requestAnimationFrame(() => {
                currentBottomSheetRef.current?.expand();
            });
        }
    }

    const isExistingTag = useMemo(
        () =>
            existingTags.includes(tag) ||
            (tag === 'Favourite' && (!favouriteName || existingTags.includes(favouriteName))),
        [existingTags, tag, favouriteName],
    );
    const dispatch = useAppDispatch();

    const localOnConfirmPress = useCallback(() => {
        onConfirmPress(location, tag, favouriteName);
    }, [location, tag, favouriteName]);

    return (
        <>
            {headerContent}
            <Animated.View
                style={[styles.mainContainer, { paddingBottom: bottom || 16 }]}
                entering={FadeIn.duration(100)}
                exiting={FadeOut.duration(100)}
                onLayout={expandBottomSheet}>
                <>
                    <ChooseNameScreenContent
                        location={location}
                        tag={tag}
                        setTag={setTag}
                        isEdit={isEdit}
                        existingTags={existingTags}
                        selectedTag={selectedTag}
                        onChangeLocationPress={onChangeLocationPress}
                        showAllFavouritePills={showAllFavouritePills}
                    />
                    {tag === 'Favourite' && (
                        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(100)}>
                            <BottomSheetTextInput
                                style={[
                                    styles.textInput,
                                    styles.textInputContainer,
                                    tailwind.style('font-areaNormal-extrabold'),
                                ]}
                                autoFocus={true}
                                placeholder={userLanguageStrings.EgMomsPlace}
                                onChangeText={setFavouriteName}
                                value={favouriteName}
                                placeholderTextColor={colors.gray560}
                            />
                        </Animated.View>
                    )}

                    <ConfirmButton
                        text={userLanguageStrings.Confirm}
                        disabled={isExistingTag}
                        onPress={() => {
                            if (isExistingTag) {
                                // error handling
                                dispatch(
                                    setToastProps({
                                        visible: true,
                                        message: userLanguageStrings.Favouritealreadyexists,
                                        backgroundColor: 'red',
                                        autoDismissAfter: 3500,
                                        logo: undefined,
                                        buttons: [],
                                        useSpannedToast: undefined,
                                        bottomSpanDescription: undefined,
                                        spannerType: undefined,
                                        dismissButton: undefined,
                                        onSpannedToastLoad: undefined,
                                        margin: undefined,
                                        customToast: undefined,
                                    }),
                                );
                            } else {
                                localOnConfirmPress();
                            }
                        }}
                    />

                    {isEdit && (
                        <Animated.View style={styles.deleteSection}>
                            <Animated.Text style={[styles.deleteText, tailwind.style('font-areaNormal-extrabold')]}>
                                {userLanguageStrings.Doyouwanttoremovethisfavouritelocation + ' ?'}
                            </Animated.Text>
                            <Pressable
                                accessibilityLabel="Delete button"
                                testID="delete-button"
                                accessibilityRole="button"
                                {...handlers}
                                onPress={onDeletePress}>
                                <Animated.View style={[styles.deleteButton, animatedStyle]}>
                                    <Icon icon={<TrashIcon />} size={16} color="white" />
                                    <Animated.Text
                                        style={[styles.deleteButtonText, tailwind.style('font-areaNormal-extrabold')]}>
                                        {userLanguageStrings.Delete}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    )}
                </>
            </Animated.View>
        </>
    );
};

export default React.memo(ChooseNameScreen);

const styles = StyleSheet.create({
    doubleActionTitle: {
        fontSize: 16,
        color: '#3C3C43',
        textAlign: 'center',
    },
    doubleActionSubtitle: {
        fontSize: 14,
        width: '90%',
        color: colors.gray665,
        paddingTop: 12,
        textAlign: 'center',
        marginHorizontal: 'auto',
        paddingBottom: 24,
        lineHeight: 24,
    },
    primaryButton: {
        borderRadius: 20,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray240,
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        color: colors.gray750,
    },
    secondaryButton: {
        borderRadius: 20,
        backgroundColor: colors.red600,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        color: 'white',
    },
    locationLabel: {
        fontSize: 13,
        color: colors.gray750,
    },
    locationPressableContainer: {
        marginTop: 12,
    },
    locationContainer: {
        borderRadius: 18,
        height: 50,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.gray240,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    locationText: {
        fontSize: 14,
        lineHeight: 16,
        color: colors.gray665,
        width: '89%',
    },
    editText: {
        fontSize: 14,
        lineHeight: 16,
        color: colors.blue800,
    },
    nameLabel: {
        fontSize: 13,
        color: colors.gray750,
        paddingTop: 16,
    },
    pillsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
        paddingBottom: 15,
    },
    pillsPlaceholder: {
        paddingBottom: 14,
    },
    mainContainer: {
        paddingHorizontal: 24,
        backgroundColor: homeSheetBg,
        flexShrink: 0, // Prevent shrinking
        flexGrow: 0, // Prevent growing
    },
    textInputContainer: {
        borderRadius: 18,
        paddingHorizontal: 22,
        height: 52,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    textInput: {
        height: 52,
        borderColor: colors.gray140,
        borderWidth: 1,
        fontSize: 14,
        color: colors.gray665,
        backgroundColor: colors.neutral100,
    },
    deleteSection: {
        paddingTop: 20,
        justifyContent: 'space-between',
        borderTopColor: colors.gray240,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
    },
    deleteText: {
        fontSize: 14,
        color: colors.gray665,
        lineHeight: 20,
        flex: 1,
    },
    deleteButton: {
        paddingHorizontal: 16,
        height: 40,
        backgroundColor: colors.red700,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray140,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    deleteButtonText: {
        fontSize: 12,
        color: 'white',
    },
});
